"""Construye las features por celda, puntúa los perfiles (referencia Python),
valida contra los análogos conocidos y exporta los datos para la web.

Entradas:  data/processed/terrain_grid.npz, data/processed/power_grid.npz,
           pipeline/config/profiles.yaml, pipeline/config/known_analogs.yaml
Salidas:   web/public/data/manifest.json + web/public/data/cells.bin
           data/processed/validation_report.md

Uso:  python pipeline/scripts/build_web_data.py [--geocode]
  --geocode  nombra los mejores candidatos con Nominatim (OSM), 1 petición/s,
             con caché en data/processed/geocode_cache.json
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

import numpy as np
import yaml

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "pipeline"))
from analog import grid, scoring, solar  # noqa: E402

PROC = ROOT / "data" / "processed"
WEB_DATA = ROOT / "web" / "public" / "data"
MONTHLY = ["lowsun_days", "polarnight_days", "tmin_c", "t2m_c", "trange_c", "albedo"]
STATIC = ["relief_m", "slope_p90_deg", "elev_mean_m", "maat_c", "precip_ann_mm",
          "tmin_ann_c", "albedo_ann", "albedo_min", "wind_ann"]
UNITS = {"lowsun_days": "days", "polarnight_days": "days", "tmin_c": "°C", "t2m_c": "°C",
         "trange_c": "°C", "albedo": "", "relief_m": "m", "slope_p90_deg": "°",
         "elev_mean_m": "m", "maat_c": "°C", "precip_ann_mm": "mm/yr", "tmin_ann_c": "°C",
         "albedo_ann": "", "albedo_min": "", "wind_ann": "m/s"}
NMS_KM = 300.0


# ---------------------------------------------------------------- features
def build_features():
    terr = np.load(PROC / "terrain_grid.npz")
    pw = np.load(PROC / "power_grid.npz")
    lat2d, lon2d = grid.cell_center(*np.meshgrid(np.arange(grid.NLAT), np.arange(grid.NLON), indexing="ij"))

    t2m = pw["T2M"]  # (13, NLAT, NLON); índice 12 = ANN
    has_power = np.isfinite(t2m[12])
    land = np.nan_to_num(terr["land_frac"]) >= 0.5
    beyond_mercator = np.abs(lat2d) > 85.05  # sin teselas: se confía en POWER (Antártida)
    sel = has_power & (land | (beyond_mercator & (lat2d < 0)))
    ii, jj = np.nonzero(sel)
    lat = lat2d[ii, jj]

    def m(name):  # mensual (12, N)
        return pw[name][:12, ii, jj].astype(np.float64)

    def ann(name):
        a = pw[name][12, ii, jj].astype(np.float64)
        return np.where(np.isfinite(a), a, np.nanmean(m(name), axis=0))

    lowsun_lat, pnight_lat = solar.monthly_light_regime(lat2d[:, 0])  # (12, NLAT)
    alb = m("ALLSKY_SRF_ALB")
    with np.errstate(all="ignore"):
        feats = {
            "lowsun_days": lowsun_lat[:, ii],
            "polarnight_days": pnight_lat[:, ii],
            "tmin_c": m("T2M_MIN"),
            "t2m_c": m("T2M"),
            "trange_c": m("T2M_MAX") - m("T2M_MIN"),
            "albedo": alb,
            "relief_m": terr["relief_m"][ii, jj],
            "slope_p90_deg": terr["slope_p90_deg"][ii, jj],
            "elev_mean_m": terr["elev_mean_m"][ii, jj],
            "maat_c": ann("T2M"),
            "precip_ann_mm": ann("PRECTOTCORR") * 365.25,
            "tmin_ann_c": ann("T2M_MIN"),
            "albedo_ann": np.nanmean(alb, axis=0),
            "albedo_min": np.nanmin(alb, axis=0),  # estación sin nieve = albedo del suelo
            "wind_ann": ann("WS10M"),
        }
    return ii, jj, feats


def resolve_args(profiles, feats):
    """Sustituye 'pXX' por el percentil terrestre (sobre celdas de tierra y meses)."""
    resolved = json.loads(json.dumps(profiles))
    for prof in resolved:
        for p in prof["params"]:
            vals = feats[p["feature"]]
            out = []
            for a in p["args"]:
                if isinstance(a, str) and a.startswith("p"):
                    out.append(float(np.nanpercentile(vals, float(a[1:]))))
                else:
                    out.append(float(a))
            p["args_raw"] = p["args"]
            p["args"] = out
    return resolved


# ---------------------------------------------------------------- candidatos
def nms(order, lat, lon, k=15, min_km=NMS_KM):
    picked = []
    for idx in order:
        if all(scoring.haversine_km(lat[idx], lon[idx], lat[p], lon[p]) > min_km for p in picked):
            picked.append(idx)
            if len(picked) >= k:
                break
    return picked


def geocode(lat, lon, cache):
    key = f"{lat:.2f},{lon:.2f}"
    if lat < -60:  # Nominatim no nombra el interior antártico
        return "Antarctica"
    if key in cache and cache[key]:
        return cache[key]
    url = "https://nominatim.openstreetmap.org/reverse?" + urllib.parse.urlencode(
        {"lat": lat, "lon": lon, "zoom": 6, "format": "jsonv2", "accept-language": "en"})
    req = urllib.request.Request(url, headers={"User-Agent": "ProvingGrounds-SpaceApps2026-prototype/0.1"})
    name = None
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            d = json.loads(r.read().decode("utf-8"))
        a = d.get("address", {})
        parts = [a.get("state") or a.get("region") or a.get("county") or a.get("archipelago"), a.get("country")]
        name = ", ".join(p for p in parts if p) or d.get("display_name")
    except Exception as exc:  # noqa: BLE001
        print(f"  geocode falló {key}: {exc}")
    time.sleep(1.1)  # política de uso de Nominatim: máx. 1 req/s
    cache[key] = name
    return name


# ---------------------------------------------------------------- export
def quantize(arr):
    a = np.asarray(arr, dtype=np.float64)
    fin = np.isfinite(a)
    lo = float(np.nanmin(a)) if fin.any() else 0.0
    hi = float(np.nanmax(a)) if fin.any() else 1.0
    scale = (hi - lo) / 254.0 if hi > lo else 1.0
    q = np.where(fin, np.clip(np.rint((a - lo) / scale), 0, 254), 255).astype(np.uint8)
    return q, lo, scale


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--geocode", action="store_true")
    args = ap.parse_args()

    cfg = yaml.safe_load((ROOT / "pipeline" / "config" / "profiles.yaml").read_text(encoding="utf-8"))
    known = yaml.safe_load((ROOT / "pipeline" / "config" / "known_analogs.yaml").read_text(encoding="utf-8"))
    ii, jj, feats = build_features()
    lat, lon = grid.cell_center(ii, jj)
    n = ii.size
    print(f"celdas de tierra: {n}")

    profiles = resolve_args(cfg["profiles"], feats)

    # Distancia de cada celda al análogo conocido más cercano (novedad)
    ks = known["sites"]
    klat = np.array([s["lat"] for s in ks]); klon = np.array([s["lon"] for s in ks])
    dist_known = np.min(scoring.haversine_km(lat[:, None], lon[:, None], klat[None, :], klon[None, :]), axis=1)

    report = [f"# Reporte de validación ({date.today().isoformat()})", "",
              f"Celdas de tierra puntuadas: **{n}**. Rejilla: POWER/MERRA-2 0.5° × 0.625°.", ""]
    cache_path = PROC / "geocode_cache.json"
    cache = json.loads(cache_path.read_text(encoding="utf-8")) if cache_path.exists() else {}
    names = {}
    rng = np.random.default_rng(42)
    tropics = (np.abs(lat) < 10) & (feats["precip_ann_mm"] > 2000)

    for prof in profiles:
        out = scoring.score_profile(feats, prof)
        best = out["best"]
        # Percentil = % de celdas con score ESTRICTAMENTE menor (los empates no inflan el rango)
        sorted_b = np.sort(np.nan_to_num(best, nan=-1))
        rank_pct = np.searchsorted(sorted_b, np.nan_to_num(best, nan=-1), side="left") / n * 100
        order = np.argsort(-np.nan_to_num(best, nan=-1))
        top = nms(order, lat, lon, k=15)
        prof["default_top"] = [f"{ii[t]}_{jj[t]}" for t in top]

        # Validación: positivos = análogos conocidos cuyo uso documentado coincide con el perfil
        rows = []
        for s in ks:
            if prof["id"] not in s.get("validates", []):
                continue
            d = scoring.haversine_km(s["lat"], s["lon"], lat, lon)
            c = int(np.argmin(d))
            if d[c] > 150:
                continue
            rows.append((s["name"], rank_pct[c], best[c]))
        med = float(np.median([r[1] for r in rows])) if rows else float("nan")
        thr0 = prof.get("analog_threshold", 0.6)
        # Control negativo: % de celdas de trópico húmedo que entran al conjunto análogo (falsos positivos)
        neg = float(np.mean(np.nan_to_num(best[tropics]) >= thr0) * 100) if tropics.any() else float("nan")

        # Sensibilidad: pesos ±20 % (50 réplicas). Jaccard del CONJUNTO ANÁLOGO
        # (best >= umbral): robusto a empates, a diferencia de un top-k.
        thr = prof.get("analog_threshold", 0.6)
        base_set = set(np.nonzero(np.nan_to_num(best) >= thr)[0].tolist())
        jac = []
        for _ in range(50):
            p2 = json.loads(json.dumps(prof))
            for p in p2["params"]:
                if not p.get("gate"):
                    p["weight"] = p["weight"] * rng.uniform(0.8, 1.2)
            b2 = scoring.score_profile(feats, p2)["best"]
            s2 = set(np.nonzero(np.nan_to_num(b2) >= thr)[0].tolist())
            union = base_set | s2
            jac.append(len(base_set & s2) / len(union) if union else 1.0)

        prof["validation"] = {"known_median_pct": None if np.isnan(med) else round(med, 1),
                               "tropics_pct": None if np.isnan(neg) else round(neg, 1),
                               "jaccard": round(float(np.mean(jac)), 3), "n_known": len(rows),
                               "n_analog_cells": len(base_set)}
        report += [f"## {prof['label']} (`{prof['id']}`)", "",
                   f"- Percentil mediano de los positivos conocidos (n={len(rows)}): **{med:.1f}** (100 = mejor)",
                   f"- Control negativo: % de celdas de trópico húmedo (precip > 2000 mm/año) en el conjunto análogo: **{neg:.1f} %** (ideal 0)",
                   f"- Celdas en el conjunto análogo (best ≥ {thr}): **{len(base_set)}**",
                   f"- Estabilidad del conjunto análogo con pesos ±20 % (Jaccard medio, 50 réplicas): **{np.mean(jac):.2f}**",
                   "", "| Análogo conocido | Percentil | Score |", "|---|---|---|"]
        report += [f"| {r[0]} | {r[1]:.1f} | {r[2]:.2f} |" for r in rows]
        report += ["", "Top candidatos (supresión de no-máximos a 300 km):", "",
                   "| # | Celda | Lat, Lon | Score | Meses análogos | Dist. a análogo conocido (km) | Lugar |",
                   "|---|---|---|---|---|---|---|"]
        for r, t in enumerate(top, 1):
            nm = geocode(lat[t], lon[t], cache) if args.geocode else None
            if nm:
                names[f"{ii[t]}_{jj[t]}"] = nm
            report.append(f"| {r} | {ii[t]}_{jj[t]} | {lat[t]:.2f}, {lon[t]:.2f} | {best[t]:.2f} | "
                          f"{int(out['months_analog'][t])} | {dist_known[t]:.0f} | {nm or ''} |")
        report.append("")
        print(f"{prof['id']}: positivos p{med:.1f}, FP tropicos {neg:.1f}%, conjunto {len(base_set)} celdas, jaccard {np.mean(jac):.2f}")

    report += ["## Registro de calibración (honestidad metodológica)", "",
               "v0 (2026-11-14) falló en dos perfiles: la pendiente regional (píxel ~5 km, mediana terrestre 0.8°) "
               "se usó como 'terreno llano' con umbrales p50–p90 y excluía desiertos llanos; y el albedo ANUAL "
               "incluía la nieve invernal del Ártico. v1: la pendiente regional solo excluye montañas (p75–p98), "
               "el albedo de suelo usa la estación sin nieve (mínimo mensual) y la aridez usa la definición de "
               "desierto de USGS/Meigs (1953): < 250 mm/año árido, 250–500 semiárido.", "",
               "**Riesgo de circularidad:** los mismos positivos sirvieron para diagnosticar y validar. "
               "Validación independiente pendiente: la capa USGS (doi:10.5066/P9J72921) como conjunto de prueba.", ""]
    cache_path.write_text(json.dumps(cache, indent=1, ensure_ascii=False), encoding="utf-8")
    (PROC / "validation_report.md").write_text("\n".join(report), encoding="utf-8")

    # ---- binario: [i uint16 N][j uint16 N][features uint8 ...]
    WEB_DATA.mkdir(parents=True, exist_ok=True)
    blobs = [ii.astype(np.uint16).tobytes(), jj.astype(np.uint16).tobytes()]
    offset = 4 * n
    fmeta = {}
    for name in MONTHLY + STATIC:
        arr = feats[name]
        q, lo, scale = quantize(arr)
        b = q.tobytes()
        fmeta[name] = {"offset": offset, "monthly": name in MONTHLY, "lo": lo, "scale": scale,
                       "unit": UNITS[name]}
        blobs.append(b)
        offset += len(b)
    (WEB_DATA / "cells.bin").write_bytes(b"".join(blobs))

    manifest = {
        "generated": date.today().isoformat(),
        "grid": {"dlat": grid.DLAT, "dlon": grid.DLON, "nlat": grid.NLAT, "nlon": grid.NLON},
        "n": int(n), "features": fmeta, "profiles": profiles, "targets": cfg["targets"],
        "sources": cfg["sources"], "known": ks, "known_verified": bool(known.get("verified")),
        "names": names, "nms_km": NMS_KM,
    }
    def clean(o):  # JSON estricto: NaN/inf -> null (la web lo trata como dato faltante)
        if isinstance(o, float) and not np.isfinite(o):
            return None
        if isinstance(o, dict):
            return {k: clean(v) for k, v in o.items()}
        if isinstance(o, list):
            return [clean(v) for v in o]
        return o

    (WEB_DATA / "manifest.json").write_text(json.dumps(clean(manifest), ensure_ascii=False, allow_nan=False),
                                            encoding="utf-8")
    size = (WEB_DATA / "cells.bin").stat().st_size / 1e6
    print(f"OK -> {WEB_DATA}  cells.bin {size:.1f} MB  + validation_report.md")


if __name__ == "__main__":
    main()
