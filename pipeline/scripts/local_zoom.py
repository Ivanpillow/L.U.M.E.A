"""Zoom local (embudo multiescala): comprueba en un candidato los requisitos de
aterrizaje lunar publicados por NASA (NTRS 20250009323):

    pendiente de aterrizaje  < 10°  sobre 100 m
    pendiente para EVA       < 20°  sobre 2 km

Usa AWS Terrain Tiles a zoom 12 (~38 m/px en el ecuador, menos a latitudes
altas). OJO: la fuente subyacente varía por región (SRTM 30 m entre 60°N y
56°S; fuera de ahí, otros DEM de menor resolución). Para la entrega final,
repetir con Copernicus DEM GLO-30 o SRTMGL1 (Earthdata) y citarlo.

Uso:  python pipeline/scripts/local_zoom.py --lat 78.2 --lon 15.6 --radius-km 10 --name svalbard
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "pipeline" / "scripts"))
from fetch_terrain import EARTH_CIRC, fetch_tile  # noqa: E402


def lonlat_to_tile(lon, lat, z):
    n = 2**z
    x = (lon + 180.0) / 360.0 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def block_mean(a, k):
    h, w = (a.shape[0] // k) * k, (a.shape[1] // k) * k
    return a[:h, :w].reshape(h // k, k, w // k, k).mean(axis=(1, 3))


def slope_deg(dem, pix_m):
    gy, gx = np.gradient(dem, pix_m)
    return np.degrees(np.arctan(np.hypot(gx, gy)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lat", type=float, required=True)
    ap.add_argument("--lon", type=float, required=True)
    ap.add_argument("--radius-km", type=float, default=10.0)
    ap.add_argument("--name", default="site")
    ap.add_argument("--zoom", type=int, default=12)
    a = ap.parse_args()
    z = a.zoom
    dlat = a.radius_km / 111.32
    dlon = a.radius_km / (111.32 * math.cos(math.radians(a.lat)))
    x0, y0 = lonlat_to_tile(a.lon - dlon, a.lat + dlat, z)
    x1, y1 = lonlat_to_tile(a.lon + dlon, a.lat - dlat, z)
    xs, ys = range(int(x0), int(x1) + 1), range(int(y0), int(y1) + 1)
    cache = ROOT / "data" / "raw" / "terrain" / f"z{z}"
    cache.mkdir(parents=True, exist_ok=True)
    rows = [np.hstack([fetch_tile(z, x, y, cache) for x in xs]) for y in ys]
    dem = np.vstack(rows)
    # recorte a la ventana pedida
    px0, py0 = int((x0 - int(x0)) * 256), int((y0 - int(y0)) * 256)
    px1 = int((x1 - int(x0)) * 256)
    py1 = int((y1 - int(y0)) * 256)
    dem = dem[py0:py1, px0:px1]
    pix = EARTH_CIRC * math.cos(math.radians(a.lat)) / (256 * 2**z)

    k100 = max(1, round(100 / pix))
    k2k = max(1, round(2000 / pix))
    s100 = slope_deg(block_mean(dem, k100), pix * k100)
    s2k = slope_deg(block_mean(dem, k2k), pix * k2k)
    land = dem > 0
    out = {
        "name": a.name, "lat": a.lat, "lon": a.lon, "radius_km": a.radius_km,
        "pixel_m": round(pix, 1), "land_fraction": round(float(land.mean()), 3),
        "relief_m": round(float(dem.max() - dem.min()), 1),
        "slope100_p50_deg": round(float(np.percentile(s100, 50)), 2),
        "slope100_p90_deg": round(float(np.percentile(s100, 90)), 2),
        "pct_area_landing_ok_lt10deg_100m": round(float((s100 < 10).mean() * 100), 1),
        "slope2km_p90_deg": round(float(np.percentile(s2k, 90)), 2),
        "pct_area_eva_ok_lt20deg_2km": round(float((s2k < 20).mean() * 100), 1),
        "source": "AWS Terrain Tiles z%d (SRTM/GMTED/ETOPO mix; verify footprint)" % z,
        "nasa_requirements": "NTRS 20250009323: landing slope <10 deg over 100 m; EVA <20 deg over 2 km",
    }
    dst = ROOT / "data" / "processed" / "local"
    dst.mkdir(parents=True, exist_ok=True)
    (dst / f"{a.name}.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
