"""Rejilla de análisis común: la rejilla nativa de NASA POWER / MERRA-2.

Usar la misma rejilla que la fuente climática evita remuestrear el clima
(una fuente de error menos que declarar). Cada celda está centrada en un
punto MERRA-2:

    lat = -90 + 0.5 * i      (i = 0..360)
    lon = -180 + 0.625 * j   (j = 0..575)

Una celda mide ~55 km x ~69 km en el ecuador (menos en longitud hacia los polos).
"""
from __future__ import annotations

import numpy as np

DLAT = 0.5
DLON = 0.625
NLAT = 361
NLON = 576


def cell_index(lat, lon):
    """Índices (i, j) de la celda que contiene (lat, lon). Acepta arrays."""
    lat = np.asarray(lat, dtype=np.float64)
    lon = np.asarray(lon, dtype=np.float64)
    i = np.clip(np.rint((lat + 90.0) / DLAT).astype(np.int64), 0, NLAT - 1)
    j = np.rint((lon + 180.0) / DLON).astype(np.int64) % NLON
    return i, j


def cell_center(i, j):
    """Centro (lat, lon) de la celda (i, j)."""
    return -90.0 + DLAT * np.asarray(i), -180.0 + DLON * np.asarray(j)


def cell_id(i, j) -> str:
    return f"{int(i)}_{int(j)}"


def cell_polygon(i, j):
    """Anillo [lon, lat] de la celda para GeoJSON (cerrado)."""
    lat, lon = cell_center(i, j)
    s, n = max(lat - DLAT / 2, -90.0), min(lat + DLAT / 2, 90.0)
    w, e = lon - DLON / 2, lon + DLON / 2
    return [[w, s], [e, s], [e, n], [w, n], [w, s]]
