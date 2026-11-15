// Modos = destino × misión. Un modo combina perfiles existentes con pesos iguales ENTRE perfiles.
// No toca scoring.ts (espejo de scoring.py): solo promedia sus resultados, mes a mes.
import { scoreCellMonth, type CellMonthScore, type FeatureGetter, type GridScores } from "./scoring.ts";
import type { Param, Profile } from "./types.ts";

export type Destination = "luna" | "marte";
export type Mission = "aterrizaje" | "base";

export const DESTINATIONS: Destination[] = ["luna", "marte"];
export const MISSIONS: Mission[] = ["aterrizaje", "base"];

export interface ModePart {
  profile: string;
  /** multiplicador sobre el peso por defecto de un criterio (se declara en la UI) */
  scale?: Record<string, number>;
}

export interface ModeDef { d: Destination; m: Mission; parts: ModePart[] }

/** Factor declarado en la UI para Marte·Base: más peso al hielo del suelo y al frío. */
export const MARS_BASE_SCALE = 1.5;

export const MODES: ModeDef[] = [
  { d: "luna", m: "aterrizaje", parts: [
    { profile: "moon_lowsun_nav" }, { profile: "moon_polar_mobility" }, { profile: "moon_dust_regolith" }] },
  { d: "luna", m: "base", parts: [
    { profile: "moon_night_survival" }, { profile: "moon_volatiles" },
    { profile: "moon_polar_mobility" }, { profile: "moon_dust_regolith" }] },
  { d: "marte", m: "aterrizaje", parts: [{ profile: "mars_ice_landing" }] },
  { d: "marte", m: "base", parts: [
    { profile: "mars_ice_landing", scale: { groundice: MARS_BASE_SCALE, cold: MARS_BASE_SCALE } }] },
];

export function getMode(d: Destination, m: Mission): ModeDef {
  return MODES.find((x) => x.d === d && x.m === m)!;
}

/** Lee ?d=luna&m=base. Devuelve null si falta alguno o no es válido (=> mostrar onboarding). */
export function parseModeQuery(search: string): { d: Destination; m: Mission } | null {
  const q = new URLSearchParams(search);
  const d = q.get("d") as Destination | null, m = q.get("m") as Mission | null;
  return d && m && DESTINATIONS.includes(d) && MISSIONS.includes(m) ? { d, m } : null;
}

/** Devuelve el query string con el modo puesto, conservando el resto de parámetros. */
export function withModeQuery(search: string, d: Destination, m: Mission): string {
  const q = new URLSearchParams(search);
  q.set("d", d); q.set("m", m);
  return `?${q.toString()}`;
}

/** Un perfil ya resuelto dentro de un modo: sus criterios y los pesos activos. */
export interface ResolvedPart { profile: Profile; params: Param[]; weights: Record<string, number> }

export function defaultWeights(profile: Profile, scale: Record<string, number> = {}): Record<string, number> {
  const w: Record<string, number> = {};
  for (const p of profile.params) if (!p.gate) w[p.id] = Math.min(1, (p.weight ?? 0) * (scale[p.id] ?? 1));
  return w;
}

export function resolveMode(mode: ModeDef, profiles: Profile[]): ResolvedPart[] {
  return mode.parts.map((part) => {
    const profile = profiles.find((p) => p.id === part.profile);
    if (!profile) throw new Error(`Perfil desconocido en el modo: ${part.profile}`);
    return { profile, params: profile.params, weights: defaultWeights(profile, part.scale) };
  });
}

/** Umbral "análogo" del modo: media de los umbrales de sus perfiles. */
export function modeThreshold(parts: ResolvedPart[]): number {
  return parts.reduce((s, p) => s + p.profile.analog_threshold, 0) / parts.length;
}

export interface ModeCellMonthScore extends CellMonthScore { parts: CellMonthScore[] }

/** Score del modo = media simple de los scores de sus perfiles (los que tienen dato).
 *  Cobertura = media de las coberturas de TODOS los perfiles (uno sin dato cuenta 0). */
export function scoreModeCellMonth(get: FeatureGetter, parts: ResolvedPart[], cell: number, month: number): ModeCellMonthScore {
  const each = parts.map((p) => scoreCellMonth(get, p.params, p.weights, cell, month));
  let sum = 0, n = 0, cov = 0;
  for (const r of each) {
    if (!Number.isNaN(r.score)) { sum += r.score; n++; cov += r.coverage; }
  }
  return { score: n > 0 ? sum / n : NaN, coverage: cov / parts.length, parts: each };
}

export interface ModeGridScores extends GridScores {
  /** nº de celdas con score >= umbral en cada mes (0..11): alimenta el selector de meses */
  analogCellsByMonth: Uint32Array;
}

/** El año entero de un modo: se calcula una vez y cambiar de mes es instantáneo. */
export interface ModeYear {
  byMonth: Float32Array[];   // 12 arrays: score combinado de cada celda en cada mes
  best: Float32Array;        // mejor score del año (NaN sin dato)
  bestMonth: Int8Array;
  months: Uint8Array;
  coverage: Float32Array;
  analogCellsByMonth: Uint32Array;
  /** nº de celdas análogas en al menos un mes */
  analogCellsAnyMonth: number;
}

export function scoreModeYear(n: number, get: FeatureGetter, parts: ResolvedPart[], threshold: number): ModeYear {
  const byMonth = Array.from({ length: 12 }, () => new Float32Array(n));
  const best = new Float32Array(n);
  const bestMonth = new Int8Array(n);
  const months = new Uint8Array(n);
  const coverage = new Float32Array(n);
  const analogCellsByMonth = new Uint32Array(12);
  let analogCellsAnyMonth = 0;
  for (let c = 0; c < n; c++) {
    let b = -1, bm = -1, cnt = 0, cov = 0;
    for (let m = 0; m < 12; m++) {
      const r = scoreModeCellMonth(get, parts, c, m);
      const s = r.score;
      byMonth[m][c] = s;
      cov += r.coverage / 12;
      if (!Number.isNaN(s)) {
        if (s > b) { b = s; bm = m; }
        if (s >= threshold) { cnt++; analogCellsByMonth[m]++; }
      }
    }
    best[c] = bm < 0 ? NaN : b;
    bestMonth[c] = bm;
    months[c] = cnt;
    coverage[c] = cov;
    if (cnt > 0) analogCellsAnyMonth++;
  }
  return { byMonth, best, bestMonth, months, coverage, analogCellsByMonth, analogCellsAnyMonth };
}

/** Vista de un mes (0..11) o del mejor mes (-1) sobre un año ya calculado. */
export function pickMonth(year: ModeYear, month: number): ModeGridScores {
  return {
    score: month < 0 ? year.best : year.byMonth[month],
    bestMonth: year.bestMonth, months: year.months, coverage: year.coverage,
    analogCellsByMonth: year.analogCellsByMonth,
  };
}

/** Igual que scoring.scoreGrid pero con el score combinado. month = 0..11, o -1 para "mejor mes". */
export function scoreModeGrid(n: number, get: FeatureGetter, parts: ResolvedPart[], threshold: number, month: number): ModeGridScores {
  return pickMonth(scoreModeYear(n, get, parts, threshold), month);
}

/** Semáforo: analogía fuerte / parcial / rota. Siempre se pinta con icono + texto, nunca solo color. */
export type Light = "strong" | "partial" | "broken" | "nodata";
export const PARTIAL_MIN = 0.3;

export function light(score: number, strongMin: number): Light {
  if (Number.isNaN(score)) return "nodata";
  return score >= strongMin ? "strong" : score >= PARTIAL_MIN ? "partial" : "broken";
}
