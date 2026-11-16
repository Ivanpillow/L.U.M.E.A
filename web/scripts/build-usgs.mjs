// Filtra la capa USGS "Known Terrestrial Analog Sites for Planetary Science" (doi:10.5066/P9J72921)
// y escribe web/public/data/usgs.json con SOLO los puntos que suman al desafío.
//
//   node scripts/build-usgs.mjs [ruta/TerrestrialAnalogs.dbf]      (npm run usgs -- <ruta>)
//
// La capa trae 192 registros y 190 son estructuras de impacto sin cuerpo análogo asignado: un cráter
// es un análogo de FORMA, y Lumea mide ENTORNO (luz, frío, hielo, pendiente, polvo). Regla de decisión:
//   1. COINCIDE  — está a ≤ 20 km de uno de los análogos ya documentados: no se pinta otro punto;
//                  ese sitio pasa a usar la coordenada de USGS.
//   2. SE MUESTRA — USGS le asigna un cuerpo (Luna/Marte), o su celda es análoga (score ≥ umbral)
//                  en algún modo: ahí coinciden la forma (USGS) y el entorno (Lumea).
//   3. SE OCULTA — todo lo demás (entorno no análogo, duplicados, bajo el mar).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbfPath = process.argv[2] ?? path.join(web, "..", "data", "raw", "usgs_analogs", "TerrestrialAnalogs.dbf");
const MATCH_KM = 20;
const imp = (f) => import(pathToFileURL(path.join(web, "src", f)).href);
const { MODES, resolveMode, modeThreshold, scoreModeYear } = await imp("modes.ts");

// ---- datos de Lumea (mismo decodificado que src/data.ts)
const m = JSON.parse(fs.readFileSync(path.join(web, "public/data/manifest.json"), "utf8"));
const bin = fs.readFileSync(path.join(web, "public/data/cells.bin"));
const buf = bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength);
const n = m.n;
const ci = new Uint16Array(buf.slice(0, 2 * n)), cj = new Uint16Array(buf.slice(2 * n, 4 * n));
const lat = new Float32Array(n), lon = new Float32Array(n);
for (let c = 0; c < n; c++) { lat[c] = -90 + m.grid.dlat * ci[c]; lon[c] = -180 + m.grid.dlon * cj[c]; }
const f = {}, monthly = {};
for (const [name, meta] of Object.entries(m.features)) {
  const len = meta.monthly ? 12 * n : n;
  const q = new Uint8Array(buf, meta.offset, len);
  const out = new Float32Array(len);
  for (let k = 0; k < len; k++) out[k] = q[k] === 255 ? NaN : meta.lo + q[k] * meta.scale;
  f[name] = out; monthly[name] = meta.monthly;
}
const get = (feature, cell, month) => (monthly[feature] ? f[feature][month * n + cell] : f[feature][cell]);
const years = MODES.map((mode) => {
  const parts = resolveMode(mode, m.profiles), thr = modeThreshold(parts);
  return { key: `${mode.d}.${mode.m}`, thr, best: scoreModeYear(n, get, parts, thr).best };
});

const km = (a, b, c, d) => {
  const p = Math.PI / 180;
  const h = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};
function cellAt(la, lo) {
  let bi = -1, bd = Infinity;
  for (let c = 0; c < n; c++) {
    if (Math.abs(lat[c] - la) > 0.6) continue;
    const d = km(la, lo, lat[c], lon[c]);
    if (d < bd) { bd = d; bi = c; }
  }
  return bd <= 45 ? bi : -1;
}

// ---- dBASE: Name C254, AnalogType C254, Lat F13, Lon F13, AnalogBody C50
const d = fs.readFileSync(dbfPath);
const nrec = d.readUInt32LE(4), hl = d.readUInt16LE(8), rl = d.readUInt16LE(10);
const rows = [];
for (let i = 0; i < nrec; i++) {
  const r = d.subarray(hl + i * rl, hl + (i + 1) * rl);
  rows.push({
    name: r.subarray(1, 255).toString("utf8").trim(), type: r.subarray(255, 509).toString("utf8").trim(),
    lat: parseFloat(r.subarray(509, 522).toString()), lon: parseFloat(r.subarray(522, 535).toString()),
    body: r.subarray(535, 585).toString("utf8").trim().toLowerCase(),
  });
}

const seen = new Set();
const sites = [], matches = [];
const counts = { total: rows.length, duplicate: 0, offshore: 0, matched: 0, shown: 0, hidden: 0 };
for (const r of rows) {
  const dupKey = `${r.name}|${r.type}`;
  if (seen.has(dupKey)) { counts.duplicate++; continue; }
  seen.add(dupKey);
  let near = null, nd = Infinity;
  for (const k of m.known) { const x = km(r.lat, r.lon, k.lat, k.lon); if (x < nd) { nd = x; near = k.name; } }
  if (nd <= MATCH_KM) {
    counts.matched++;
    matches.push({ known: near, usgs: r.name, lat: +r.lat.toFixed(4), lon: +r.lon.toFixed(4), km: Math.round(nd) });
    continue;
  }
  const c = cellAt(r.lat, r.lon);
  if (c < 0 && !r.body) { counts.offshore++; continue; }
  const scores = {};
  let analog = false;
  for (const y of years) {
    const s = c >= 0 ? y.best[c] : NaN;
    scores[y.key] = Number.isFinite(s) ? +s.toFixed(2) : null;
    if (s >= y.thr) analog = true;
  }
  if (!r.body && !analog) { counts.hidden++; continue; }
  counts.shown++;
  sites.push({
    name: r.name, type: r.type, lat: +r.lat.toFixed(4), lon: +r.lon.toFixed(4),
    body: r.body || null, reason: r.body ? "tagged" : "environment", scores,
  });
}
sites.sort((a, b) => a.name.localeCompare(b.name));

const out = {
  generated: new Date().toISOString().slice(0, 10),
  source: {
    title: "USGS — Known Terrestrial Analog Sites for Planetary Science",
    url: "https://doi.org/10.5066/P9J72921",
    license: "Public domain (U.S. Geological Survey)",
  },
  rule: { match_km: MATCH_KM, analog_threshold: years[0].thr },
  counts, matches, sites,
};
fs.writeFileSync(path.join(web, "public/data/usgs.json"), JSON.stringify(out, null, 1) + "\n");
console.log(counts);
console.log("coinciden:", matches.map((x) => `${x.usgs} -> ${x.known} (${x.km} km)`).join(" | "));
console.log("se muestran:", sites.map((s) => `${s.name} [${s.reason}]`).join(" | "));
