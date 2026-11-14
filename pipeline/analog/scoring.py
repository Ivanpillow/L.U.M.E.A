"""Motor de puntuación (implementación de REFERENCIA).

La web (web/src/scoring.ts) implementa exactamente las mismas funciones; los
tests de pipeline/tests/ fijan el comportamiento.

Modelo
------
Para cada celda c y mes m:

    s_p(c,m) ∈ [0,1]   función de pertenencia del parámetro p (rampa o banda)
    base(c,m) = Σ_p w_p · s_p / Σ_p w_p        (solo parámetros con dato)
    gate(c,m) = Π_g s_g                         (parámetros "puerta")
    score(c,m) = base · gate
    coverage(c) = Σ w_p disponibles / Σ w_p

Un dato faltante NO cuenta como 0: reduce la cobertura (confianza).
Resumen anual: best = max_m score; months_analog = #{m : score ≥ umbral}.
"""
from __future__ import annotations

import numpy as np


def membership(x, fn: str, params):
    """Funciones de pertenencia. NaN se propaga (dato faltante)."""
    x = np.asarray(x, dtype=np.float64)
    with np.errstate(invalid="ignore", divide="ignore"):
        if fn == "ramp_up":        # 0 en <= lo, 1 en >= hi
            lo, hi = params
            y = (x - lo) / (hi - lo)
        elif fn == "ramp_down":    # 1 en <= lo, 0 en >= hi
            lo, hi = params
            y = (hi - x) / (hi - lo)
        elif fn == "band":         # trapecio a < b <= c < d
            a, b, c, d = params
            y = np.minimum((x - a) / (b - a), (d - x) / (d - c))
        else:
            raise ValueError(f"función desconocida: {fn}")
    y = np.clip(y, 0.0, 1.0)
    return np.where(np.isnan(x), np.nan, y)


def score_profile(features: dict[str, np.ndarray], profile: dict):
    """features[name] -> array (12, N) si es mensual o (N,) si es estático.
    Devuelve dict con score (12,N), best (N), months_analog (N), coverage (N)
    y per_param {id: (12,N)}."""
    n = next(iter(features.values())).shape[-1]
    num = np.zeros((12, n))
    den = np.zeros((12, n))
    wsum = 0.0
    gate = np.ones((12, n))
    per_param = {}
    for p in profile["params"]:
        x = features[p["feature"]]
        if x.ndim == 1:
            x = np.broadcast_to(x, (12, n))
        s = membership(x, p["fn"], p["args"])
        per_param[p["id"]] = s
        if p.get("gate"):
            gate = gate * np.where(np.isnan(s), 1.0, s)  # puerta sin dato = neutra, pero baja cobertura
            continue
        w = float(p["weight"])
        wsum += w
        ok = ~np.isnan(s)
        num += np.where(ok, w * s, 0.0)
        den += np.where(ok, w, 0.0)
    with np.errstate(invalid="ignore", divide="ignore"):
        base = np.where(den > 0, num / den, np.nan)
    score = base * gate
    coverage = np.nanmean(den, axis=0) / wsum if wsum else np.ones(n)
    thr = profile.get("analog_threshold", 0.6)
    best = np.nanmax(np.where(np.isnan(score), -1, score), axis=0)
    best = np.where(best < 0, np.nan, best)
    months = np.sum(np.nan_to_num(score) >= thr, axis=0)
    return {"score": score, "best": best, "months_analog": months,
            "coverage": coverage, "per_param": per_param}


def haversine_km(lat1, lon1, lat2, lon2):
    r = 6371.0088
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dphi = p2 - p1
    dl = np.radians(lon2) - np.radians(lon1)
    a = np.sin(dphi / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dl / 2) ** 2
    return 2 * r * np.arcsin(np.sqrt(np.clip(a, 0, 1)))
