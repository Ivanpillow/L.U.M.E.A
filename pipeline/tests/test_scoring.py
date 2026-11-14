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
