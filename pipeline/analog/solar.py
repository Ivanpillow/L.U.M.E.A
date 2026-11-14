"""Geometría solar analítica para el "calendario análogo".

Idea: en la región del Polo Sur lunar (a <= 6° del polo, requisito de Artemis,
NTRS 20250009323) con una inclinación del eje de ~1.54° (NASA Science, South
Pole Illumination Map), el Sol nunca sube más de ~6 + 1.54 ≈ 7.5° sobre el
horizonte. En la Tierra esa geometría de "luz rasante" solo ocurre en ciertas
latitudes y en ciertos meses. Este módulo cuenta, para cada latitud y mes:

  * lowsun_days:      días en que el Sol sale pero su altura máxima (mediodía) <= 7.5°
  * polarnight_days:  días en que el Sol no sale (altura de mediodía <= 0°)

Aproximaciones (declaradas): declinación de Cooper (1969); se ignoran la
refracción (~0.57°) y el semidiámetro solar (~0.27°), que adelantan unos días
la salida del Sol cerca del círculo polar. La topografía local (horizonte) se
ignora a esta escala.
"""
from __future__ import annotations

import numpy as np

MOON_SPIN_TILT_DEG = 1.54          # NASA Science, South Pole Illumination Map
ARTEMIS_POLAR_LAT_LIMIT_DEG = 6.0  # NTRS 20250009323: "Land within 6 deg latitude of the South Pole"
LUNAR_MAX_SUN_ELEV_DEG = ARTEMIS_POLAR_LAT_LIMIT_DEG + MOON_SPIN_TILT_DEG  # ≈ 7.54°

# Día del año del primer día de cada mes (año no bisiesto) y duración
MONTH_START = np.array([1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335])
MONTH_LEN = np.array([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])


def declination_deg(doy):
    """Declinación solar (Cooper 1969): δ = 23.45° · sin(360° · (284 + n) / 365)."""
    doy = np.asarray(doy, dtype=np.float64)
    return 23.45 * np.sin(np.radians(360.0 * (284.0 + doy) / 365.0))


def noon_elevation_deg(lat_deg, doy):
    """Altura del Sol al mediodía solar: 90° − |φ − δ| (negativa = no sale)."""
    lat = np.asarray(lat_deg, dtype=np.float64)
    return 90.0 - np.abs(lat - declination_deg(doy))


def monthly_light_regime(lat_deg, max_elev_deg: float = LUNAR_MAX_SUN_ELEV_DEG):
    """Para un array de latitudes devuelve (lowsun_days, polarnight_days),
    cada uno de forma (12, len(lat))."""
    lat = np.atleast_1d(np.asarray(lat_deg, dtype=np.float64))
    doy = np.arange(1, 366)
    h = noon_elevation_deg(lat[None, :], doy[:, None])  # (365, nlat)
    low = (h > 0.0) & (h <= max_elev_deg)
    night = h <= 0.0
    month_of_day = np.searchsorted(MONTH_START, doy, side="right") - 1
    lowsun = np.zeros((12, lat.size))
    pnight = np.zeros((12, lat.size))
    for m in range(12):
        sel = month_of_day == m
        lowsun[m] = low[sel].sum(axis=0)
        pnight[m] = night[sel].sum(axis=0)
    return lowsun, pnight
