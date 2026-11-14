"""Descarga climatologías mensuales de NASA POWER (2001-2025, MERRA-2/CERES)
para todas las cajas de 10°x10° que contienen tierra.

API: https://power.larc.nasa.gov/docs/services/api/temporal/climatology/
Restricción verificada (2026-11-14): 1 parámetro por petición regional.
No requiere login.

Requiere haber corrido antes fetch_terrain.py (usa su máscara de tierra para no
pedir cajas oceánicas).

Uso:  python pipeline/scripts/fetch_power.py
"""
from __future__ import annotations

import json
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "pipeline"))
from analog import grid  # noqa: E402

PARAMS = [
    "T2M",             # temperatura media del aire a 2 m (°C)
    "T2M_MIN",         # mínima horaria del periodo (°C)
    "T2M_MAX",         # máxima horaria del periodo (°C)
    # T2M_RANGE NO se pide: en climatología es max-min del PERIODO (mensual),
    # no el rango diurno; se deriva como T2M_MAX - T2M_MIN.
    "PRECTOTCORR",     # precipitación corregida MERRA-2 (mm/día)
    "ALLSKY_SRF_ALB",  # albedo de superficie (0-1)
    "WS10M",           # viento a 10 m (m/s)
]
MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "ANN"]
URL = ("https://power.larc.nasa.gov/api/temporal/climatology/regional?parameters={p}"
       "&community=RE&longitude-min={w}&longitude-max={e}&latitude-min={s}&latitude-max={n}&format=JSON")


def land_boxes():
    terr = np.load(ROOT / "data" / "processed" / "terrain_grid.npz")
    land = np.nan_to_num(terr["land_frac"]) > 0
    lat, lon = grid.cell_center(*np.meshgrid(np.arange(grid.NLAT), np.arange(grid.NLON), indexing="ij"))
    boxes = []
    for s in range(-90, 90, 10):
        for w in range(-180, 180, 10):
            m = (lat >= s) & (lat <= s + 10) & (lon >= w) & (lon <= w + 10)
            # Polos (>85°) no tienen teselas: se piden siempre (Antártida)
            if (land[m] & (np.nan_to_num(terr["land_frac"])[m] >= 0.3)).any() or s == -90:
                boxes.append((s, w))
    return boxes


def fetch(param, s, w, cache: Path):
    path = cache / f"{param}_{s}_{w}.json"
    if path.exists():
        return path
    url = URL.format(p=param, w=w, e=w + 10, s=s, n=s + 10)
    for attempt in range(10):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "analog-engine/0.1"})
            with urllib.request.urlopen(req, timeout=120) as r:
                path.write_bytes(r.read())
            return path
        except Exception as exc:  # noqa: BLE001  (429 = rate limit de POWER)
            wait = min(120, 5 * 2**attempt)
            print(f"  reintento {param} {s},{w}: {exc} (espera {wait}s)", flush=True)
            time.sleep(wait)
    print(f"  FALLÓ definitivamente {param} {s},{w}: la celda quedará NaN", flush=True)
    return None


# Parámetros solares de CERES: vienen en una rejilla de 1° (centros en x.5°), más gruesa
# que la de MERRA-2. Se remuestrean por vecino más cercano (cada celda toma el valor de la
# celda de 1° que contiene su centro). Verificado el 2026-11-14 con las coordenadas de la API.
ONE_DEG = {"ALLSKY_SRF_ALB"}


def assemble(cache: Path):
    data = {p: np.full((len(MONTHS), grid.NLAT, grid.NLON), np.nan, dtype=np.float32) for p in PARAMS}
    coarse = {p: np.full((len(MONTHS), 180, 360), np.nan, dtype=np.float32) for p in ONE_DEG}
    for f in cache.glob("*.json"):
        param = f.name.rsplit("_", 2)[0]  # "T2M_MIN_-20_10.json" -> "T2M_MIN"
        if param not in PARAMS:
            continue
        d = json.loads(f.read_text(encoding="utf-8"))
        for feat in d.get("features", []):
            lon, lat = feat["geometry"]["coordinates"][:2]
            if param in ONE_DEG:
                i, j = int(np.floor(lat)) + 90, int(np.floor(lon)) + 180
                i, j = min(max(i, 0), 179), j % 360
                target = coarse[param]
            else:
                i, j = grid.cell_index(lat, lon)
                target = data[param]
            vals = feat["properties"]["parameter"][param]
            for k, mth in enumerate(MONTHS):
                v = vals.get(mth)
                if v is not None and v != -999.0:
                    target[k, i, j] = v
    lat_c, lon_c = grid.cell_center(np.arange(grid.NLAT), np.arange(grid.NLON))
    ci = np.clip(np.floor(lat_c).astype(int) + 90, 0, 179)
    cj = (np.floor(lon_c).astype(int) + 180) % 360
    for p, arr in coarse.items():
        data[p] = arr[:, ci[:, None], cj[None, :]]
    return data


def main():
    cache = ROOT / "data" / "raw" / "power"
    cache.mkdir(parents=True, exist_ok=True)
    boxes = land_boxes()
    jobs = [(p, s, w) for p in PARAMS for (s, w) in boxes]
    print(f"{len(boxes)} cajas con tierra x {len(PARAMS)} parámetros = {len(jobs)} peticiones", flush=True)
    with ThreadPoolExecutor(max_workers=2) as ex:
        for k, _ in enumerate(ex.map(lambda j: fetch(*j, cache), jobs), 1):
            if k % 50 == 0:
                print(f"  {k}/{len(jobs)}", flush=True)
    data = assemble(cache)
    out = ROOT / "data" / "processed" / "power_grid.npz"
    np.savez_compressed(out, months=np.array(MONTHS), **data)
    print(f"OK -> {out}")


if __name__ == "__main__":
    main()
