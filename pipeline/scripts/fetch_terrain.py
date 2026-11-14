"""Descarga teselas de elevación globales (AWS Terrain Tiles, formato Terrarium)
y las agrega a la rejilla POWER: relieve, desviación estándar, pendiente regional
y fracción de tierra.

Fuente: AWS Open Data "Terrain Tiles" (Mapzen/Tilezen). Mezcla SRTM (NASA),
GMTED2010 (USGS), ETOPO1 (NOAA) y otras. Acceso anónimo, sin login.
  https://registry.opendata.aws/terrain-tiles/
Decodificación Terrarium: elev_m = R*256 + G + B/256 - 32768

Límite declarado: Web Mercator solo cubre |lat| <= 85.05°. Más allá, NaN.
Zoom 5 => ~4.9 km/px en el ecuador: la "pendiente" es REGIONAL (línea base
~5 km), no la pendiente de aterrizaje a 100 m. Para eso hay que hacer el zoom
local (ver fetch_local_dem.py).

Uso:  python pipeline/scripts/fetch_terrain.py [--zoom 5]
"""
from __future__ import annotations

import argparse
import io
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "pipeline"))
from analog import grid  # noqa: E402

URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
EARTH_CIRC = 40075016.686


def fetch_tile(z: int, x: int, y: int, cache: Path) -> np.ndarray:
    path = cache / f"{z}_{x}_{y}.png"
    if not path.exists():
        req = urllib.request.Request(URL.format(z=z, x=x, y=y), headers={"User-Agent": "analog-engine/0.1"})
        with urllib.request.urlopen(req, timeout=60) as r:
            path.write_bytes(r.read())
    rgb = np.asarray(Image.open(io.BytesIO(path.read_bytes())).convert("RGB"), dtype=np.float32)
    return rgb[..., 0] * 256.0 + rgb[..., 1] + rgb[..., 2] / 256.0 - 32768.0


def build_mosaic(z: int, cache: Path) -> np.ndarray:
    n = 2**z
    mosaic = np.zeros((n * 256, n * 256), dtype=np.float32)
    jobs = [(x, y) for x in range(n) for y in range(n)]

    def work(xy):
        x, y = xy
        return x, y, fetch_tile(z, x, y, cache)

    with ThreadPoolExecutor(max_workers=8) as ex:
        for k, (x, y, tile) in enumerate(ex.map(work, jobs), 1):
            mosaic[y * 256:(y + 1) * 256, x * 256:(x + 1) * 256] = tile
            if k % 128 == 0:
                print(f"  teselas {k}/{len(jobs)}", flush=True)
    return mosaic


def aggregate(mosaic: np.ndarray, z: int) -> dict[str, np.ndarray]:
    size = mosaic.shape[0]
    # Centro de cada píxel en Web Mercator -> lat/lon
    py = (np.arange(size) + 0.5) / size
    px = (np.arange(size) + 0.5) / size
    lat_row = np.degrees(np.arctan(np.sinh(np.pi * (1 - 2 * py))))
    lon_col = px * 360.0 - 180.0

    # Pendiente: gradiente con tamaño de píxel real (Mercator es conforme: dx = dy)
    pix_m = EARTH_CIRC * np.cos(np.radians(lat_row)) / size  # por fila
    gy, gx = np.gradient(mosaic)
    slope = np.degrees(np.arctan(np.hypot(gx, gy) / pix_m[:, None]))

    LAT = np.broadcast_to(lat_row[:, None], mosaic.shape)
    LON = np.broadcast_to(lon_col[None, :], mosaic.shape)
    i, j = grid.cell_index(LAT, LON)
    flat = (i * grid.NLON + j).ravel()
    ncell = grid.NLAT * grid.NLON

    elev = mosaic.ravel().astype(np.float64)
    land = (elev > 0).astype(np.float64)
    cnt = np.bincount(flat, minlength=ncell)
    with np.errstate(invalid="ignore", divide="ignore"):
        land_frac = np.bincount(flat, land, ncell) / cnt
        # Estadísticas solo sobre píxeles de tierra
        lw = land
        nl = np.bincount(flat, lw, ncell)
        mean = np.bincount(flat, elev * lw, ncell) / nl
        sq = np.bincount(flat, elev * elev * lw, ncell) / nl
        std = np.sqrt(np.maximum(sq - mean * mean, 0))
        smean = np.bincount(flat, slope.ravel() * lw, ncell) / nl

    # max/min por celda (solo tierra)
    emax = np.full(ncell, -np.inf)
    emin = np.full(ncell, np.inf)
    m = land > 0
    np.maximum.at(emax, flat[m], elev[m])
    np.minimum.at(emin, flat[m], elev[m])
    relief = np.where(np.isfinite(emax) & np.isfinite(emin), emax - emin, np.nan)

    # p90 de pendiente aproximado: media + 1.28*sd (evita ordenar 67M valores)
    s2 = np.bincount(flat, (slope.ravel() ** 2) * lw, ncell) / nl
    ssd = np.sqrt(np.maximum(s2 - smean * smean, 0))
    slope_p90 = smean + 1.2816 * ssd

    shape = (grid.NLAT, grid.NLON)
    out = {
        "land_frac": land_frac, "elev_mean_m": mean, "elev_std_m": std,
        "relief_m": relief, "slope_mean_deg": smean, "slope_p90_deg": slope_p90,
    }
    out = {k: np.where(cnt > 0, v, np.nan).reshape(shape) for k, v in out.items()}
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--zoom", type=int, default=5)
    a = ap.parse_args()
    cache = ROOT / "data" / "raw" / "terrain" / f"z{a.zoom}"
    cache.mkdir(parents=True, exist_ok=True)
    print(f"Descargando teselas z{a.zoom} ...", flush=True)
    mosaic = build_mosaic(a.zoom, cache)
    print("Agregando a la rejilla POWER ...", flush=True)
    feats = aggregate(mosaic, a.zoom)
    out = ROOT / "data" / "processed" / "terrain_grid.npz"
    np.savez_compressed(out, **feats)
    land = np.nansum(feats["land_frac"] >= 0.5)
    print(f"OK -> {out}  celdas con tierra (>=50%): {int(land)}")


if __name__ == "__main__":
    main()
