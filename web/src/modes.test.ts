// El modo combinado debe coincidir con la media de sus perfiles, mes a mes, con los DATOS REALES.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { scoreCellMonth, scoreGrid } from "./scoring.ts";
import {
  DESTINATIONS, MARS_BASE_SCALE, MISSIONS, MODES, defaultWeights, getMode, light, modeThreshold,
  parseModeQuery, pickMonth, resolveMode, scoreModeCellMonth, scoreModeGrid, scoreModeYear, withModeQuery,
} from "./modes.ts";
import type { Manifest, Param, Profile } from "./types.ts";

const manifest = JSON.parse(readFileSync(new URL("../public/data/manifest.json", import.meta.url), "utf8")) as Manifest;
const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

// Generador determinista: valores sintéticos reproducibles dentro del rango real de cada feature
// (lo, escala de 8 bits del manifest), con huecos (NaN) incluidos.
function fakeGetter(seed: number) {
  return (feature: string, cell: number, month: number) => {
    let h = seed;
    for (const ch of `${feature}|${cell}|${month}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    const u = ((h >>> 0) % 10000) / 10000;
    const meta = manifest.features[feature];
    return u < 0.08 ? NaN : meta.lo + u * 254 * meta.scale;
  };
}

test("every destination × mission has a mode whose profiles exist in the data", () => {
  for (const d of DESTINATIONS) for (const m of MISSIONS) {
    const parts = resolveMode(getMode(d, m), manifest.profiles);
    assert.ok(parts.length >= 1);
    for (const p of parts) assert.equal(p.profile.target.startsWith(d === "luna" ? "moon" : "mars"), true);
  }
  assert.equal(MODES.length, 4);
});

test("modes are the agreed profile combinations", () => {
  const ids = (d: "luna" | "marte", m: "aterrizaje" | "base") => getMode(d, m).parts.map((p) => p.profile);
  assert.deepEqual(ids("luna", "aterrizaje"), ["moon_lowsun_nav", "moon_polar_mobility", "moon_dust_regolith"]);
  assert.deepEqual(ids("luna", "base"), ["moon_night_survival", "moon_volatiles", "moon_polar_mobility", "moon_dust_regolith"]);
  assert.deepEqual(ids("marte", "aterrizaje"), ["mars_ice_landing"]);
  assert.deepEqual(ids("marte", "base"), ["mars_ice_landing"]);
});

test("combined score equals the mean of its profiles, month by month", () => {
  const get = fakeGetter(2166136261);
  for (const mode of MODES) {
    const parts = resolveMode(mode, manifest.profiles);
    for (let c = 0; c < 40; c++) for (let m = 0; m < 12; m++) {
      const each = parts.map((p) => scoreCellMonth(get, p.params, p.weights, c, m));
      const valid = each.filter((r) => !Number.isNaN(r.score));
      const r = scoreModeCellMonth(get, parts, c, m);
      if (valid.length === 0) assert.ok(Number.isNaN(r.score));
      else close(r.score, valid.reduce((s, x) => s + x.score, 0) / valid.length);
      close(r.coverage, valid.reduce((s, x) => s + x.coverage, 0) / parts.length);
      assert.equal(r.parts.length, parts.length);
    }
  }
});

test("a single-profile mode with default weights is exactly that profile", () => {
  const get = fakeGetter(7);
  const parts = resolveMode(getMode("marte", "aterrizaje"), manifest.profiles);
  const prof = parts[0].profile;
  const a = scoreModeGrid(60, get, parts, prof.analog_threshold, -1);
  const b = scoreGrid(60, get, prof.params, defaultWeights(prof), prof.analog_threshold, -1);
  assert.deepEqual(Array.from(a.score), Array.from(b.score));
  assert.deepEqual(Array.from(a.bestMonth), Array.from(b.bestMonth));
  assert.deepEqual(Array.from(a.months), Array.from(b.months));
  assert.deepEqual(Array.from(a.coverage), Array.from(b.coverage));
});

test("Mars·Base only re-weights ice and cold, by the declared factor", () => {
  const land = resolveMode(getMode("marte", "aterrizaje"), manifest.profiles)[0];
  const base = resolveMode(getMode("marte", "base"), manifest.profiles)[0];
  for (const id of Object.keys(land.weights)) {
    const f = id === "groundice" || id === "cold" ? MARS_BASE_SCALE : 1;
    close(base.weights[id], land.weights[id] * f);
  }
  assert.deepEqual(base.params, land.params); // mismos criterios y umbrales
});

test("grid: per-month analog counts match the per-cell calendar", () => {
  const get = fakeGetter(99);
  const parts = resolveMode(getMode("luna", "base"), manifest.profiles);
  const thr = modeThreshold(parts);
  close(thr, 0.6);
  const best = scoreModeGrid(50, get, parts, thr, -1);
  assert.equal(best.analogCellsByMonth.reduce((s, x) => s + x, 0), best.months.reduce((s, x) => s + x, 0));
  for (let m = 0; m < 12; m++) {
    const g = scoreModeGrid(50, get, parts, thr, m);
    let cnt = 0;
    for (let c = 0; c < 50; c++) {
      const s = scoreModeCellMonth(get, parts, c, m).score;
      if (Number.isNaN(s)) assert.ok(Number.isNaN(g.score[c])); else close(g.score[c], s, 1e-6);
      if (s >= thr) cnt++;
      assert.ok(Number.isNaN(best.score[c]) || best.score[c] >= (Number.isNaN(s) ? -1 : s) - 1e-6);
    }
    assert.equal(g.analogCellsByMonth[m], cnt);
  }
});

test("a profile without data lowers coverage, not the combined score", () => {
  const P = (id: string, feature: string): Param => ({
    id, feature, fn: "ramp_up", args: [0, 1], args_raw: [0, 1], weight: 1, comparability: "R", dimension: "x",
    label: id, unit: "", src: "", verified: true, why: "",
  });
  const prof = (id: string, feature: string): Profile => ({
    id, target: "t", label: id, nasa_gap: "", gap_src: "", analog_threshold: 0.6, params: [P("a", feature)], default_top: [],
  });
  const parts = [prof("p1", "f1"), prof("p2", "f2")].map((profile) =>
    ({ profile, params: profile.params, weights: defaultWeights(profile) }));
  const r = scoreModeCellMonth((f) => (f === "f1" ? 0.8 : NaN), parts, 0, 0);
  close(r.score, 0.8); close(r.coverage, 0.5);
  const none = scoreModeCellMonth(() => NaN, parts, 0, 0);
  assert.ok(Number.isNaN(none.score)); close(none.coverage, 0);
});

test("traffic light thresholds", () => {
  assert.equal(light(0.6, 0.6), "strong");
  assert.equal(light(0.59, 0.6), "partial");
  assert.equal(light(0.3, 0.6), "partial");
  assert.equal(light(0.29, 0.6), "broken");
  assert.equal(light(NaN, 0.6), "nodata");
});

test("mode <-> URL", () => {
  assert.deepEqual(parseModeQuery("?d=luna&m=base"), { d: "luna", m: "base" });
  assert.equal(parseModeQuery("?d=luna"), null);
  assert.equal(parseModeQuery("?d=venus&m=base"), null);
  assert.equal(parseModeQuery(""), null);
  assert.equal(withModeQuery("?lang=en&d=luna&m=base", "marte", "aterrizaje"), "?lang=en&d=marte&m=aterrizaje");
  assert.deepEqual(parseModeQuery(withModeQuery("", "marte", "base")), { d: "marte", m: "base" });
});

test("year cache: picking a month equals scoring that month directly", () => {
  const get = fakeGetter(31);
  const parts = resolveMode(getMode("luna", "aterrizaje"), manifest.profiles);
  const thr = modeThreshold(parts);
  const year = scoreModeYear(40, get, parts, thr);
  for (const month of [-1, 0, 5, 11]) {
    const a = pickMonth(year, month), b = scoreModeGrid(40, get, parts, thr, month);
    assert.deepEqual(Array.from(a.score), Array.from(b.score));
  }
  for (let c = 0; c < 40; c++) for (let m = 0; m < 12; m++) {
    const s = scoreModeCellMonth(get, parts, c, m).score;
    if (Number.isNaN(s)) assert.ok(Number.isNaN(year.byMonth[m][c])); else close(year.byMonth[m][c], s, 1e-6);
  }
  assert.equal(year.analogCellsAnyMonth, Array.from(year.months).filter((x) => x > 0).length);
});
