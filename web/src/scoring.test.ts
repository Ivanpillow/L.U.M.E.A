// Mismos casos que pipeline/tests/test_scoring.py: garantizan que web y Python coinciden.
import { test } from "node:test";
import assert from "node:assert/strict";
import { membership, scoreCellMonth, scoreGrid, haversineKm } from "./scoring.ts";
import type { Param } from "./types.ts";

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test("ramps and band", () => {
  [0, 0, 0.5, 1].forEach((v, k) => close(membership([0, 5, 10, 20][k], "ramp_up", [5, 15]), v));
  [1, 1, 0.5, 0].forEach((v, k) => close(membership([0, 5, 10, 20][k], "ramp_down", [5, 15]), v));
  [0, 0.5, 1, 0.5, 0].forEach((v, k) =>
    close(membership([0.1, 0.15, 0.25, 0.35, 0.5][k], "band", [0.1, 0.2, 0.3, 0.4]), v));
  assert.ok(Number.isNaN(membership(NaN, "ramp_up", [0, 1])));
});

const P = (id: string, feature: string, extra: Partial<Param>): Param => ({
  id, feature, fn: "ramp_up", args: [0, 1], args_raw: [0, 1], comparability: "R", dimension: "x",
  label: id, unit: "", src: "", verified: true, why: "", ...extra,
});
const params = [P("a", "fa", { weight: 1 }), P("b", "fb", { weight: 3 }), P("g", "fg", { gate: true })];

test("weighted mean, gate and coverage", () => {
  const f: Record<string, number[]> = { fa: [1, 0], fb: [0, 1], fg: [1, 1] };
  const get = (name: string, c: number) => f[name][c];
  close(scoreCellMonth(get, params, {}, 0, 0).score, 0.25);
  close(scoreCellMonth(get, params, {}, 1, 0).score, 0.75);
  f.fg = [0.5, 0];
  close(scoreCellMonth(get, params, {}, 0, 0).score, 0.125);
  close(scoreCellMonth(get, params, {}, 1, 0).score, 0);
  const g2 = (name: string) => ({ fa: NaN, fb: 1, fg: 1 } as Record<string, number>)[name];
  const r = scoreCellMonth(g2, params, {}, 0, 0);
  close(r.score, 1); close(r.coverage, 0.75);
});

test("calendar counts months", () => {
  const get = (name: string, _c: number, m: number) => (name === "fg" ? ([0, 1, 11].includes(m) ? 1 : 0) : 1);
  const out = scoreGrid(1, get, params, {}, 0.6, -1);
  assert.equal(out.months[0], 3);
});

test("haversine", () => assert.ok(Math.abs(haversineKm(0, 0, 0, 1) - 111.2) < 0.5));
