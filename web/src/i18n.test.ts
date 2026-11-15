// Ningún texto a medias: ES y EN tienen las mismas claves y los datos visibles tienen traducción.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dataEs, detectLang, keysOf, monthNames, num, setLang, t, td } from "./i18n.ts";
import type { Manifest } from "./types.ts";

const manifest = JSON.parse(readFileSync(new URL("../public/data/manifest.json", import.meta.url), "utf8")) as Manifest;

test("ES and EN have exactly the same keys, none empty", () => {
  assert.deepEqual(keysOf("en").sort(), keysOf("es").sort());
  for (const l of ["es", "en"] as const) {
    setLang(l);
    for (const k of keysOf(l)) assert.ok(t(k as Parameters<typeof t>[0]).trim().length > 0, `${l}:${k}`);
  }
});

test("placeholders match between languages", () => {
  const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");
  for (const k of keysOf("es")) {
    setLang("es"); const a = vars(t(k as Parameters<typeof t>[0]));
    setLang("en"); const b = vars(t(k as Parameters<typeof t>[0]));
    assert.equal(a, b, k);
  }
});

test("every data string shown in the UI has a Spanish translation", () => {
  const shown = new Set<string>();
  for (const p of manifest.profiles) {
    shown.add(p.label); shown.add(p.nasa_gap);
    for (const q of p.params) { shown.add(q.label); shown.add(q.why); shown.add(q.unit); }
  }
  for (const tg of Object.values(manifest.targets)) {
    shown.add(tg.name); shown.add(tg.summary);
    for (const f of [...tg.facts, ...tg.never_analog]) { shown.add(f.k); shown.add(f.v); }
  }
  for (const k of manifest.known) shown.add(k.use);
  // solo exigimos traducción a lo que contiene palabras (no a "0.38 g", "°C", "m/s"…)
  const missing = [...shown].filter((s) => /[A-Za-z]{3,}/.test(s) && dataEs[s] === undefined);
  assert.deepEqual(missing, []);
});

test("every profile has a short name in both languages", () => {
  for (const l of ["es", "en"] as const)
    for (const p of manifest.profiles) assert.ok(keysOf(l).includes(`pshort.${p.id}`), `${l}:${p.id}`);
});

test("td, number and month formatting follow the language", () => {
  setLang("es");
  assert.equal(td("Gravity"), "Gravedad");
  assert.equal(td("not in the data"), "not in the data");
  assert.equal(num(0.5, 2), "0,50");
  assert.equal(monthNames().length, 12);
  assert.equal(monthNames()[0], "Ene");
  assert.equal(t("onb.step", { n: 2 }), "Paso 2 de 2");
  setLang("en");
  assert.equal(td("Gravity"), "Gravity");
  assert.equal(num(0.5, 2), "0.50");
  assert.equal(monthNames()[0], "Jan");
});

test("language detection: URL > stored > Spanish", () => {
  assert.equal(detectLang("?lang=en", "es"), "en");
  assert.equal(detectLang("?d=luna", "en"), "en");
  assert.equal(detectLang("", null), "es");
  assert.equal(detectLang("?lang=fr", null), "es");
});
