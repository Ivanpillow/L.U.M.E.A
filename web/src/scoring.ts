// Espejo exacto de pipeline/analog/scoring.py (la referencia). Si cambias uno, cambia el otro
// y corre ambos tests: `pytest pipeline/tests` y `npm test`.
import type { Fn, Param } from "./types.ts";

export function membership(x: number, fn: Fn, a: number[]): number {
  if (Number.isNaN(x) || a.some((v) => v == null)) return NaN; // umbral sin resolver = dato faltante
  const ramp = (num: number, den: number) => (den === 0 ? (num >= 0 ? 1 : 0) : num / den);
  let y: number;
  if (fn === "ramp_up") y = ramp(x - a[0], a[1] - a[0]);
  else if (fn === "ramp_down") y = ramp(a[1] - x, a[1] - a[0]);
  else y = Math.min(ramp(x - a[0], a[1] - a[0]), ramp(a[3] - x, a[3] - a[2]));
  return y < 0 ? 0 : y > 1 ? 1 : y;
}

/** Acceso a una feature: valor de la celda c en el mes m (m se ignora si es estática). */
export type FeatureGetter = (feature: string, cell: number, month: number) => number;

export interface CellMonthScore { score: number; coverage: number }

export function scoreCellMonth(get: FeatureGetter, params: Param[], weights: Record<string, number>,
                               cell: number, month: number): CellMonthScore {
  let num = 0, den = 0, wsum = 0, gate = 1;
  for (const p of params) {
    const s = membership(get(p.feature, cell, month), p.fn, p.args);
    if (p.gate) {
      if (!Number.isNaN(s)) gate *= s;
      continue;
    }
    const w = weights[p.id] ?? p.weight ?? 0;
    wsum += w;
    if (!Number.isNaN(s)) { num += w * s; den += w; }
  }
  const base = den > 0 ? num / den : NaN;
  return { score: base * gate, coverage: wsum > 0 ? den / wsum : 1 };
}

export interface GridScores {
  score: Float32Array;     // score del mes pedido o el mejor mes
  bestMonth: Int8Array;    // mes del mejor score (-1 sin dato)
  months: Uint8Array;      // nº de meses con score >= umbral
}

/** month = 0..11 o -1 para "mejor mes del año". */
export function scoreGrid(n: number, get: FeatureGetter, params: Param[], weights: Record<string, number>,
                          threshold: number, month: number): GridScores {
  const score = new Float32Array(n);
  const bestMonth = new Int8Array(n);
  const months = new Uint8Array(n);
  for (let c = 0; c < n; c++) {
    let best = -1, bm = -1, cnt = 0, sel = NaN;
    for (let m = 0; m < 12; m++) {
      const s = scoreCellMonth(get, params, weights, c, m).score;
      if (!Number.isNaN(s)) {
        if (s > best) { best = s; bm = m; }
        if (s >= threshold) cnt++;
      }
      if (m === month) sel = s;
    }
    score[c] = month < 0 ? (bm < 0 ? NaN : best) : sel;
    bestMonth[c] = bm;
    months[c] = cnt;
  }
  return { score, bestMonth, months };
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = 6371.0088, rad = Math.PI / 180;
  const dphi = (lat2 - lat1) * rad, dl = (lon2 - lon1) * rad;
  const a = Math.sin(dphi / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dl / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
}

/** Supresión de no-máximos: mejores celdas separadas al menos minKm. */
export function topCandidates(score: Float32Array, lat: Float32Array, lon: Float32Array,
                              k: number, minKm: number): number[] {
  const idx = Array.from(score.keys()).filter((i) => !Number.isNaN(score[i]));
  idx.sort((a, b) => score[b] - score[a]);
  const picked: number[] = [];
  for (const i of idx) {
    if (picked.every((p) => haversineKm(lat[i], lon[i], lat[p], lon[p]) > minKm)) {
      picked.push(i);
      if (picked.length >= k) break;
    }
  }
  return picked;
}
