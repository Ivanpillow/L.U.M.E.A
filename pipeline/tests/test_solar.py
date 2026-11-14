import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from analog import solar  # noqa: E402


def test_lunar_max_sun_elevation_is_about_7_5_deg():
    assert abs(solar.LUNAR_MAX_SUN_ELEV_DEG - 7.54) < 1e-9


def test_declination_extremes_near_solstices():
    assert solar.declination_deg(172) > 23.3      # ~21 jun
    assert solar.declination_deg(355) < -23.3     # ~21 dic
    assert abs(solar.declination_deg(81)) < 1.0   # ~22 mar (equinoccio)


def test_equator_never_has_low_sun_or_polar_night():
    low, night = solar.monthly_light_regime([0.0])
    assert low.sum() == 0 and night.sum() == 0


def test_tropics_never_low_sun():
    low, night = solar.monthly_light_regime([35.0, -35.0])
    assert low.sum() == 0 and night.sum() == 0


def test_arctic_low_sun_only_in_cold_season():
    low, night = solar.monthly_light_regime([75.0])
    low = low[:, 0]
    # En verano boreal (may-ago) el Sol está alto: cero días de luz rasante
    assert low[4:8].sum() == 0
    # Alrededor de los equinoccios de otoño y primavera sí hay luz rasante
    assert low[9] > 0 or low[1] > 0
    # Y hay noche polar en diciembre
    assert night[11, 0] > 20


def test_month_days_add_up():
    low, night = solar.monthly_light_regime([80.0])
    assert np.all(low + night <= solar.MONTH_LEN[:, None])
