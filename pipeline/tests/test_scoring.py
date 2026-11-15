import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from analog import scoring  # noqa: E402


def test_ramp_up_and_down():
    x = np.array([0.0, 5.0, 10.0, 20.0])
    assert np.allclose(scoring.membership(x, "ramp_up", [5, 15]), [0, 0, 0.5, 1])
    assert np.allclose(scoring.membership(x, "ramp_down", [5, 15]), [1, 1, 0.5, 0])


def test_band():
    x = np.array([0.1, 0.15, 0.25, 0.35, 0.5])
    y = scoring.membership(x, "band", [0.1, 0.2, 0.3, 0.4])
    assert np.allclose(y, [0, 0.5, 1, 0.5, 0])


def test_nan_propagates_as_missing():
    y = scoring.membership(np.array([np.nan, 1.0]), "ramp_up", [0, 1])
    assert np.isnan(y[0]) and y[1] == 1


PROFILE = {
    "analog_threshold": 0.6,
    "params": [
        {"id": "a", "feature": "fa", "fn": "ramp_up", "args": [0, 1], "weight": 1},
        {"id": "b", "feature": "fb", "fn": "ramp_up", "args": [0, 1], "weight": 3},
        {"id": "g", "feature": "fg", "fn": "ramp_up", "args": [0, 1], "gate": True},
    ],
}


def _feats(fa, fb, fg):
    n = len(fa)
    return {"fa": np.array(fa, float), "fb": np.array(fb, float),
            "fg": np.broadcast_to(np.array(fg, float), (12, n)).copy()}


def test_weighted_mean_and_gate():
    out = scoring.score_profile(_feats([1, 0], [0, 1], [1, 1]), PROFILE)
    assert np.allclose(out["best"], [0.25, 0.75])
    out = scoring.score_profile(_feats([1, 0], [0, 1], [0.5, 0]), PROFILE)
    assert np.allclose(out["best"], [0.125, 0.0])


def test_missing_reduces_coverage_not_score():
    out = scoring.score_profile(_feats([np.nan], [1], [1]), PROFILE)
    assert np.allclose(out["best"], [1.0])
    assert np.allclose(out["coverage"], [0.75])


def test_calendar_counts_months():
    fg = np.zeros((12, 1)); fg[[0, 1, 11]] = 1
    feats = {"fa": np.array([1.0]), "fb": np.array([1.0]), "fg": fg}
    out = scoring.score_profile(feats, PROFILE)
    assert out["months_analog"][0] == 3


def test_haversine():
    assert abs(scoring.haversine_km(0, 0, 0, 1) - 111.2) < 0.5


# ---- sesgo de área y cobertura mínima (2026-11-15)
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from analog import grid  # noqa: E402


def test_cell_area_shrinks_with_latitude_and_sums_to_sphere():
    i = np.arange(grid.NLAT)
    a = grid.cell_area_km2(i)
    eq, lat70 = a[grid.cell_index(0, 0)[0]], a[grid.cell_index(70, 0)[0]]
    assert abs(lat70 / eq - np.cos(np.radians(70))) < 0.01
    total = a.sum() * grid.NLON
    assert abs(total / (4 * np.pi * grid.EARTH_RADIUS_KM ** 2) - 1) < 1e-9


def test_weighted_percentile_uniform_and_weighted():
    v = np.arange(1, 101, dtype=float)
    assert scoring.weighted_percentile(v, 50, np.ones(100)) == 50
    # Si las 50 celdas pequeñas (valores 51-100) pesan 1/3, la mediana por ÁREA baja
    w = np.r_[np.ones(50), np.full(50, 1 / 3)]
    assert scoring.weighted_percentile(v, 50, w) < 50
    # NaN se ignora; los pesos se difunden a features mensuales (12, N)
    m = np.tile(np.r_[np.nan, 1.0, 2.0, 3.0], (12, 1))
    assert scoring.weighted_percentile(m, 100, np.ones(4)) == 3.0


def test_weighted_rank_pct():
    s = np.array([0.1, 0.5, 0.9, np.nan])
    r = scoring.weighted_rank_pct(s, np.array([1.0, 1.0, 2.0, 0.0]))
    assert np.allclose(r, [0.0, 25.0, 50.0, 0.0])


def test_eligible_min_coverage():
    out = scoring.score_profile(_feats([np.nan, 1], [1, np.nan], [1, 1]), PROFILE)
    assert np.allclose(out["coverage"], [0.75, 0.25])
    assert scoring.eligible(out["coverage"]).tolist() == [True, False]


# ---- ESA CCI Permafrost: regla de huecos (2026-11-15)
def test_permafrost_gap_rule(tmp_path, monkeypatch):
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "bwd", Path(__file__).resolve().parents[1] / "scripts" / "build_web_data.py")
    bwd = importlib.util.module_from_spec(spec); spec.loader.exec_module(bwd)
    pfr = np.full((grid.NLAT, grid.NLON), np.nan, np.float32); pfr[0, 0] = 80
    unc = np.full_like(pfr, np.nan); unc[0, 0] = 12
    np.savez(tmp_path / "permafrost_grid.npz", pfr_pct=pfr, pfr_unc_pct=unc)
    monkeypatch.setattr(bwd, "PROC", tmp_path)
    ii, jj = np.array([0, 1, 2]), np.array([0, 0, 0])
    out = bwd.permafrost_features(ii, jj, np.array([-20.0, 15.0, -5.0]))
    p = out["permafrost_pct"]
    assert p[0] == 80 and out["permafrost_unc_pct"][0] == 12   # dato ESA
    assert p[1] == 0                                          # cálido sin píxel -> 0 %
    assert np.isnan(p[2])                                     # frío sin píxel -> sin dato
