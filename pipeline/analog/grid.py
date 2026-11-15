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


EARTH_RADIUS_KM = 6371.0088


def cell_area_km2(i):
    """Área (km²) de las celdas de la fila i, en una esfera.

    En una rejilla lat/lon regular el área cae como cos(lat): a 70° una celda mide
    ~1/3 de una ecuatorial. Los percentiles y los conteos deben ponderarse por esta
    área; si no, las regiones polares pesan de más (hay más celdas por km²).
    """
    lat = -90.0 + DLAT * np.asarray(i, dtype=np.float64)
    s = np.radians(np.clip(lat - DLAT / 2, -90.0, 90.0))
    n = np.radians(np.clip(lat + DLAT / 2, -90.0, 90.0))
    return EARTH_RADIUS_KM ** 2 * np.radians(DLON) * (np.sin(n) - np.sin(s))


def cell_id(i, j) -> str:
    return f"{int(i)}_{int(j)}"


def cell_polygon(i, j):
    """Anillo [lon, lat] de la celda para GeoJSON (cerrado)."""
    lat, lon = cell_center(i, j)
    s, n = max(lat - DLAT / 2, -90.0), min(lat + DLAT / 2, 90.0)
    w, e = lon - DLON / 2, lon + DLON / 2
    return [[w, s], [e, s], [e, n], [w, n], [w, s]]
