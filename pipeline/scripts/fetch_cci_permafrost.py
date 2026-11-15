"""ESA CCI Permafrost v5.0 (2023) -> fracción de permafrost por celda de la rejilla POWER.

Sustituye el proxy "temperatura media anual < -2 °C" por un producto satelital oficial
(MODIS LST + modelo CryoGrid, 1 km). Se baja directo del archivo público de CEDA (sin
registro, sin toolbox): dos NetCDF de 12 MB + 0.5 MB en lat/lon WGS84 a 0.01°.

Productos (cita obligatoria, ver licencia en el README de cada carpeta):
  Hemisferio Norte (25–85° N)  doi:10.5285/d235665772ec4b558e9a89ac85595e71
  Antártida      (60–85° S)    doi:10.5285/25447c253cbe435b937347756fe47146

Salida: data/processed/permafrost_grid.npz con
  pfr_pct      media de PFR (% del área con permafrost) en la celda, NaN = sin dato
  pfr_unc_pct  media de PFR_uncertainty (% , incertidumbre que publica la ESA)
  valid_frac   fracción de píxeles de 1 km con dato dentro de la celda
Fuera de la extensión del producto (60° S–25° N) no hay dato: queda NaN y la web lo
cuenta como "No data" (baja la cobertura, no el score). No se inventa un 0.

Uso:  python pipeline/scripts/fetch_cci_permafrost.py
"""
from __future__ import annotations

import sys
import urllib.request
from pathlib import Path

import h5py
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "pipeline"))
from analog import grid  # noqa: E402

RAW = ROOT / "data" / "raw" / "cci_permafrost"
OUT = ROOT / "data" / "processed" / "permafrost_grid.npz"
BASE = "https://dap.ceda.ac.uk/neodc/esacci/permafrost/data/permafrost_extent/L4/area4/pp/v05.0"
YEAR = 2023  # último año publicado de v5.0
FILES = {
    "northern_hemisphere": f"ESACCI-PERMAFROST-L4-PFR-MODISLST_CRYOGRID-AREA4_PP-{YEAR}-fv05.0.nc",
    "Antarctica": f"ESACCI-PERMAFROST-L4-PFR-MODISLST_CRYOGRID-AREA27_PP-{YEAR}-fv05.0.nc",
}
DOIS = ["10.5285/d235665772ec4b558e9a89ac85595e71", "10.5285/25447c253cbe435b937347756fe47146"]
MIN_VALID = 0.2  # menos de 20 % de píxeles con dato (mar, lagos, hielo) -> celda sin dato
FILL = 255
CHUNK = 250


def download():
    RAW.mkdir(parents=True, exist_ok=True)
    for region, name in FILES.items():
        dst = RAW / name
        if not dst.exists():
            url = f"{BASE}/{region}/{YEAR}/{name}"
            print("descargando", url)
            urllib.request.urlretrieve(url, dst)
    return [RAW / n for n in FILES.values()]


def aggregate(paths):
    n = grid.NLAT * grid.NLON
    s_pfr, s_unc, n_ok, n_all = (np.zeros(n) for _ in range(4))
    for path in paths:
        with h5py.File(path, "r") as h:
            lat, lon = h["lat"][:], h["lon"][:]
            _, jcol = grid.cell_index(np.zeros_like(lon), lon)
            pfr, unc = h["PFR"], h["PFR_uncertainty"]
            for r0 in range(0, lat.size, CHUNK):
                r1 = min(r0 + CHUNK, lat.size)
                irow, _ = grid.cell_index(lat[r0:r1], np.zeros(r1 - r0))
                key = (irow[:, None] * grid.NLON + jcol[None, :]).ravel()
                p = pfr[0, r0:r1, :].ravel()
                u = unc[0, r0:r1, :].ravel()
                ok = p != FILL
                n_all += np.bincount(key, minlength=n)
                n_ok += np.bincount(key[ok], minlength=n)
                s_pfr += np.bincount(key[ok], weights=p[ok].astype(np.float64), minlength=n)
                uok = ok & (u != FILL)
                s_unc += np.bincount(key[uok], weights=u[uok].astype(np.float64), minlength=n)
    with np.errstate(invalid="ignore", divide="ignore"):
        valid = np.where(n_all > 0, n_ok / n_all, 0.0)
        pfr = np.where(valid >= MIN_VALID, s_pfr / n_ok, np.nan)
        unc = np.where(valid >= MIN_VALID, s_unc / n_ok, np.nan)
    shape = (grid.NLAT, grid.NLON)
    return pfr.reshape(shape), unc.reshape(shape), valid.reshape(shape)


def main():
    pfr, unc, valid = aggregate(download())
    OUT.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(OUT, pfr_pct=pfr.astype(np.float32), pfr_unc_pct=unc.astype(np.float32),
                        valid_frac=valid.astype(np.float32), year=YEAR, dois=np.array(DOIS))
    has = np.isfinite(pfr)
    print(f"celdas con dato: {has.sum()}  con PFR>=50 %: {(pfr >= 50).sum()}  "
          f"incertidumbre media: {np.nanmean(unc):.1f} %  -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
