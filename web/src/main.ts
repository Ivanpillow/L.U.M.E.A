import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import { cellRing, fmtLatLon, loadDataset, type Dataset } from "./data.ts";
import { MIN_COVERAGE, haversineKm, membership, scoreCellMonth, scoreGrid, topCandidates, type GridScores } from "./scoring.ts";
import type { Fact, Param, Profile } from "./types.ts";
import type { Feature, FeatureCollection } from "geojson";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const GIBS = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg";
const MIN_SHOW = 0.25;
const NEW_KM = 500;
const RAMP: [number, string][] = [[0.25, "#3b0f70"], [0.45, "#8c2981"], [0.65, "#de4968"], [0.85, "#fe9f6d"], [1, "#fcfdbf"]];

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const state = { targetId: "", profileId: "", month: -1, weights: {} as Record<string, number>, selected: -1 };
let d: Dataset;
let map: maplibregl.Map;
let scores: GridScores;
let mapReady = false;

const profile = (): Profile => d.m.profiles.find((p) => p.id === state.profileId)!;
const target = () => d.m.targets[state.targetId];
const src = (key: string) => d.m.sources[key];
const srcLink = (key: string, text = "source") => {
  const s = src(key);
  return s ? `<a href="${s.url}" target="_blank" rel="noopener" title="${esc(s.title)}">${text}</a>` : "";
};

function colorFor(s: number): string {
  if (Number.isNaN(s)) return "";
  let c = RAMP[0][1];
  for (const [t, col] of RAMP) if (s >= t) c = col;
  return c;
}

function cellName(c: number): string {
  return d.m.names[`${d.ci[c]}_${d.cj[c]}`] ?? fmtLatLon(d.lat[c], d.lon[c]);
}

function nearestKnown(c: number) {
  let best = { km: Infinity, name: "" };
  for (const k of d.m.known) {
    const km = haversineKm(d.lat[c], d.lon[c], k.lat, k.lon);
    if (km < best.km) best = { km, name: k.name };
  }
  return best;
}

function fmtVal(p: Param, x: number): string {
  if (Number.isNaN(x)) return "no data";
  const digits = p.unit === "0–1" ? 2 : Math.abs(x) < 10 ? 1 : 0;
  return `${x.toFixed(digits)} ${p.unit}`.trim();
}

/** "± 12 %" con la incertidumbre que publica la propia fuente (ESA CCI), si existe. */
function uncText(p: Param, c: number, m: number): string {
  if (!p.unc_feature || !d.m.features[p.unc_feature]) return "";
  const u = d.get(p.unc_feature, c, m);
  return Number.isNaN(u) ? "" : ` ± ${u.toFixed(0)} ${p.unit}`;
}

// ------------------------------------------------------------------ sidebar
function renderTargets() {
  const el = $("#targets");
  el.innerHTML = Object.entries(d.m.targets).map(([id, t]) => `
    <button role="tab" data-id="${id}" aria-selected="${id === state.targetId}">
      ${t.body === "moon" ? "🌕 Moon" : "🔴 Mars"}<small>${esc(t.name.replace(/^NASA Moon Base — /, "Moon Base · "))}</small>
    </button>`).join("");
  el.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    state.targetId = b.dataset.id!;
    state.profileId = d.m.profiles.find((p) => p.target === state.targetId)!.id;
    resetWeights(); renderAll(); recompute();
  }));
  const t = target();
  $("#target-info").innerHTML = `<p>${esc(t.summary)}</p><ul>${t.facts.map((f: Fact) =>
    `<li><b>${esc(f.k)}:</b> ${esc(f.v)} ${srcLink(f.src, "↗")}</li>`).join("")}</ul>`;
}

function renderProfiles() {
  const el = $("#profiles");
  el.innerHTML = d.m.profiles.filter((p) => p.target === state.targetId).map((p) => `
    <button data-id="${p.id}" aria-pressed="${p.id === state.profileId}">
      <b>${esc(p.label)}</b><span>NASA gap: ${esc(p.nasa_gap)}</span>
    </button>`).join("");
  el.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    state.profileId = b.dataset.id!;
    resetWeights(); renderAll(); recompute();
  }));
}

function renderMonths() {
  const el = $("#months");
  el.innerHTML = `<button class="best" data-m="-1" aria-pressed="${state.month === -1}" title="Best month per cell">Best</button>` +
    MONTHS.map((m, k) => `<button data-m="${k}" aria-pressed="${state.month === k}" title="${m}">${m[0]}</button>`).join("");
  el.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    state.month = Number(b.dataset.m);
    renderMonths(); recompute();
  }));
  $("#month-note").textContent = state.month < 0
    ? "Each cell shows its best month. Pick a month to see when a place becomes analogous."
    : `${MONTHS[state.month]} climatology (2001–2025) and solar geometry.`;
}

function resetWeights() {
  state.weights = {};
  for (const p of profile().params) if (!p.gate) state.weights[p.id] = p.weight ?? 0;
}

function paramBadges(p: Param) {
  const comp = { D: "Direct: same physical quantity", R: "Relative: Earth extreme (percentile)", N: "Not reproducible on Earth" }[p.comparability];
  return `<span class="badge ${p.comparability}" title="${comp}">${p.comparability}</span>` +
    (p.proxy ? `<span class="badge proxy" title="Indirect indicator: measures a related quantity">proxy</span>` : "") +
    (p.verified ? "" : `<span class="badge proxy" title="Threshold still pending a primary source">unverified</span>`);
}

function renderWeights() {
  const el = $("#weights");
  el.innerHTML = profile().params.map((p) => p.gate
    ? `<div class="req" title="${esc(p.why)}">Required: ${esc(p.label)} ${paramBadges(p)}</div>`
    : `<div class="w"><label for="w-${p.id}" title="${esc(p.why)}">${esc(p.label)} ${paramBadges(p)}</label>
        <output id="o-${p.id}">${state.weights[p.id].toFixed(2)}</output>
        <input id="w-${p.id}" type="range" min="0" max="1" step="0.05" value="${state.weights[p.id]}" /></div>`).join("");
  let t: number | undefined;
  el.querySelectorAll<HTMLInputElement>("input").forEach((inp) => inp.addEventListener("input", () => {
    const id = inp.id.slice(2);
    state.weights[id] = Number(inp.value);
    $(`#o-${id}`).textContent = Number(inp.value).toFixed(2);
    clearTimeout(t); t = window.setTimeout(recompute, 120);
  }));
}

function renderCandidates() {
  const prof = profile();
  const minCov = d.m.min_coverage ?? MIN_COVERAGE;
  const top = topCandidates(scores.score, d.lat, d.lon, 12, d.m.nms_km, scores.coverage, minCov);
  $("#cand-hint").textContent = `≥ ${d.m.nms_km} km apart · data coverage ≥ ${(minCov * 100).toFixed(0)}%`;
  $("#cands").innerHTML = top.map((c, r) => {
    const nk = nearestKnown(c);
    const nov = nk.km > NEW_KM ? `<span class="badge new" title="Farther than ${NEW_KM} km from any known analog in our baseline">NEW</span>` : `near ${esc(nk.name)}`;
    const when = `${scores.months[c]} mo ≥ ${prof.analog_threshold}`;
    return `<li><button data-c="${c}"><span class="rk">${r + 1}</span><span class="nm">${esc(cellName(c))}</span>
      <span class="sc">${scores.score[c].toFixed(2)}</span><span class="sub">${when} · ${nov}</span></button></li>`;
  }).join("") || `<li class="note">No cell reaches the display threshold for this month.</li>`;
  $("#cands").querySelectorAll<HTMLButtonElement>("button").forEach((b) => b.addEventListener("click", () => {
    const c = Number(b.dataset.c);
    map.flyTo({ center: [d.lon[c], d.lat[c]], zoom: Math.max(map.getZoom(), 3.2) });
    select(c);
  }));
}

function renderLegend() {
  $("#legend").innerHTML = `Analog score · ${esc(profile().label)}<div class="bar"></div>
    <div class="ticks"><span>${MIN_SHOW}</span><span>0.5</span><span>0.75</span><span>1</span></div>
    <div>Cells below ${MIN_SHOW} hidden · ○ known analog</div>`;
}

function renderAll() {
  renderTargets(); renderProfiles(); renderMonths(); renderWeights(); renderLegend();
}

// ------------------------------------------------------------------ card
function select(c: number) {
  state.selected = c;
  if (mapReady) map.setFilter("sel", ["==", ["id"], c]);
  renderCard(c);
}

function renderCard(c: number) {
  const prof = profile(), t = target();
  const monthScores = MONTHS.map((_, m) => scoreCellMonth(d.get, prof.params, state.weights, c, m));
  const showM = state.month >= 0 ? state.month : Math.max(0, scores.bestMonth[c]);
  const sNow = monthScores[showM];
  const nk = nearestKnown(c);
  const rows = prof.params.map((p) => {
    const x = d.get(p.feature, c, showM);
    return { p, x, s: membership(x, p.fn, p.args) };
  });
  const row = (r: { p: Param; x: number; s: number }) => `<div class="row">
      <span>${r.p.gate ? "Required: " : ""}${esc(r.p.label)} ${paramBadges(r.p)}</span>
      <span class="val">${fmtVal(r.p, r.x)}${uncText(r.p, c, showM)} · ${Number.isNaN(r.s) ? "–" : r.s.toFixed(2)}</span>
      <div class="meter"><i style="width:${Number.isNaN(r.s) ? 0 : r.s * 100}%"></i></div>
      <span class="why">${esc(r.p.why)} ${srcLink(r.p.src)}</span></div>`;
  const group = (cls: string, title: string, list: typeof rows) =>
    list.length ? `<h4 class="${cls}">${title}</h4>${list.map(row).join("")}` : "";
  const ok = rows.filter((r) => r.s >= 0.7), mid = rows.filter((r) => r.s > 0.3 && r.s < 0.7);
  const no = rows.filter((r) => r.s <= 0.3);
  const missing = rows.filter((r) => Number.isNaN(r.s));
  const analogMonths = monthScores.map((s, m) => (s.score >= prof.analog_threshold ? MONTHS[m] : "")).filter(Boolean);
  const novelty = nk.km > NEW_KM
    ? `<span class="badge new">NEW</span> ${Math.round(nk.km).toLocaleString("en")} km from the nearest known analog in our baseline (${esc(nk.name)})`
    : `Known analog nearby: ${esc(nk.name)} (${Math.round(nk.km)} km)`;
  const card = $("#card");
  card.hidden = false;
  card.innerHTML = `<button class="close" aria-label="Close">×</button>
    <h3>${esc(cellName(c))}</h3>
    <div class="coords">${cellName(c) === fmtLatLon(d.lat[c], d.lon[c]) ? "Unnamed cell" : fmtLatLon(d.lat[c], d.lon[c])} · cell ≈ 55 × ${Math.round(69 * Math.cos(d.lat[c] * Math.PI / 180))} km</div>
    <div class="big"><b>${Number.isNaN(sNow.score) ? "–" : sNow.score.toFixed(2)}</b>
      <span>${esc(prof.label)} · ${MONTHS[showM]}${state.month < 0 ? " (best month)" : ""}<br>
      <span class="note">Data coverage ${(sNow.coverage * 100).toFixed(0)}%</span></span></div>
    <div class="note">${novelty}</div>
    <h4>Analog calendar</h4>
    <div class="cal">${monthScores.map((s, m) => Number.isNaN(s.score)
      ? `<div class="nan" title="${MONTHS[m]}: no data">${MONTHS[m][0]}</div>`
      : `<div style="background:${colorFor(Math.max(s.score, 0.25))};opacity:${s.score < MIN_SHOW ? 0.35 : 1}" title="${MONTHS[m]}: ${s.score.toFixed(2)}">${MONTHS[m][0]}</div>`).join("")}</div>
    <p class="note">${analogMonths.length ? `Analogous (≥ ${prof.analog_threshold}) in: ${analogMonths.join(", ")}` : `Never reaches ${prof.analog_threshold} in any month.`}</p>
    ${group("ok", "Strong analogy", ok)}
    ${group("mid", "Partial analogy", mid)}
    ${group("no", "Where the analogy breaks", no)}
    ${group("never", "No data here (lowers confidence, not the score)", missing)}
    <h4 class="never">Never analog on Earth</h4>
    ${t.never_analog.map((f) => `<div class="row"><span>${esc(f.k)} <span class="badge N">N</span></span><span class="why">${esc(f.v)} ${srcLink(f.src)}</span></div>`).join("")}
    ${t.body === "moon" ? `<p class="note">Next step (multi-scale): zoom to a 30 m DEM to test NASA's landing limits — slope &lt; 10° over 100 m and &lt; 20° over 2 km for EVA ${srcLink("artemis_req")}.</p>` : ""}`;
  card.querySelector(".close")!.addEventListener("click", () => {
    card.hidden = true; state.selected = -1; if (mapReady) map.setFilter("sel", ["==", ["id"], -1]);
  });
}

// ------------------------------------------------------------------ method
function renderMethod() {
  const dlg = $<HTMLDialogElement>("#method");
  const val = d.m.profiles.map((p) => p.validation ? `<tr><td>${esc(p.label)}</td>
      <td>${p.validation.known_median_pct?.toFixed(0) ?? "–"} (n=${p.validation.n_known})</td>
      <td>${p.validation.tropics_pct?.toFixed(1) ?? "–"}%</td><td>${p.validation.analog_land_pct?.toFixed(1) ?? "–"}%</td><td>${p.validation.jaccard.toFixed(2)}</td></tr>` : "").join("");
  dlg.innerHTML = `<h3>Method, limits &amp; sources</h3>
  <p><b>Proving Grounds</b> turns NASA's own Moon Base capability gaps (2026) into <i>test profiles</i>, and searches every land cell on Earth for places — and months — that reproduce the physical conditions each test needs.</p>
  <h4>Model</h4>
  <p>Each criterion maps a measured value to a 0–1 membership <code>s</code> (ramp or band). For cell <i>c</i> and month <i>m</i>:
  <code>score = (Σ w·s / Σ w) × Π s<sub>required</sub></code>. Missing data lowers <i>coverage</i>, never the score; cells below ${((d.m.min_coverage ?? MIN_COVERAGE) * 100).toFixed(0)}% coverage are kept off the candidate ranking. Percentile thresholds (pXX) are weighted by cell area, so small high-latitude cells do not over-count the poles. The calendar repeats this for each month.</p>
  <h4>Comparability</h4>
  <ul><li><span class="badge D">D</span> Direct — same physical quantity, comparable in value (e.g., Sun elevation, albedo).</li>
  <li><span class="badge R">R</span> Relative — Earth cannot reach Moon/Mars values; we rank Earth's extremes (percentiles).</li>
  <li><span class="badge N">N</span> Never analog — gravity, vacuum/thin CO₂ air, radiation. Shown on every site card.</li>
  <li><span class="badge proxy">proxy</span> Indirect indicator (e.g., desert climate as a stand-in for bare ground). <span class="badge proxy">unverified</span> threshold still pending a primary source.</li></ul>
  <h4>Validation (percentile 100 = best)</h4>
  <table><tr><th>Profile</th><th>Documented analogs (positives), median pct.</th><th>Humid tropics flagged analog (neg. control, ideal 0%)</th><th>Share of Earth's land area flagged analog</th><th>Analog-set stability (Jaccard), ±20% weights</th></tr>${val}</table>
  <h4>Limits</h4>
  <ul>
    <li>Cells are 0.5° × 0.625° (~55 × 69 km at the equator): screening, not site certification. Small craters and lava tubes are not resolved.</li>
    <li>Slope is regional (~5 km pixels), not the 100 m landing slope — that needs the local 30 m zoom.</li>
    <li>Terrain tiles stop at 85°: the Antarctic interior has climate but no relief.</li>
    <li>Temperature is 2 m air temperature (MERRA-2 reanalysis), not surface temperature.</li>
    <li>Earth's sky scatters light into shadows; lunar shadows are pitch-black. The lighting analogy is geometric, not radiometric.</li>
    <li>Bare-ground criteria use a climate proxy (flagged <span class="badge proxy">proxy</span>). Permafrost comes from ESA CCI Permafrost v5.0 (2023, 1 km) with ESA's published per-pixel uncertainty (shown as ±). That product only maps the permafrost domain (25–85° N, 60–85° S): warm land with no ESA pixel (mean air temp &gt; +3 °C) is set to 0 %; cold land with no ESA pixel (e.g., high Andes) is "no data".</li>
    <li>Known-analog baseline: ${d.m.known.length} curated sites with approximate coordinates${d.m.known_verified ? "" : " (to be replaced by the USGS layer, doi:10.5066/P9J72921)"}.</li>
  </ul>
  <h4>Data &amp; sources</h4>
  <ul>${Object.values(d.m.sources).map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join("")}
    <li>Basemap: NASA GIBS / Worldview — Blue Marble Shaded Relief &amp; Bathymetry.</li>
    <li>Place names: © OpenStreetMap contributors (Nominatim).</li></ul>
  <h4>Use of AI</h4>
  <p class="note">An AI coding assistant helped with source lookup and boilerplate code. Scientific choices and claims are reviewed by the team and traced to the sources above.</p>
  <p><button class="btn" id="close-method">Close</button></p>`;
  dlg.querySelector("#close-method")!.addEventListener("click", () => dlg.close());
  dlg.showModal();
}

// ------------------------------------------------------------------ map
function cellsGeoJSON(): FeatureCollection {
  const features: Feature[] = [];
  for (let c = 0; c < d.n; c++) {
    features.push({ type: "Feature", id: c, properties: {}, geometry: { type: "Polygon", coordinates: [cellRing(d, c)] } });
  }
  return { type: "FeatureCollection", features };
}

function buildMap() {
  map = new maplibregl.Map({
    container: "map",
    style: {
      version: 8,
      projection: { type: "globe" },
      sources: {
        gibs: { type: "raster", tiles: [GIBS], tileSize: 256, maxzoom: 8,
          attribution: "Imagery: <a href='https://earthdata.nasa.gov/gibs'>NASA GIBS</a> Blue Marble" },
      },
      layers: [
        { id: "bg", type: "background", paint: { "background-color": "#05070d" } },
        { id: "gibs", type: "raster", source: "gibs", paint: { "raster-saturation": -0.35, "raster-brightness-max": 0.75 } },
      ],
    },
    center: [15, 55], zoom: 1.6, attributionControl: { compact: true },
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.on("load", () => {
    map.addSource("cells", { type: "geojson", data: cellsGeoJSON(), tolerance: 0 });
    const s: maplibregl.ExpressionSpecification = ["coalesce", ["feature-state", "s"], 0];
    map.addLayer({ id: "cells", type: "fill", source: "cells", paint: {
      "fill-color": ["interpolate", ["linear"], s, ...RAMP.flat()] as unknown as maplibregl.ExpressionSpecification,
      "fill-opacity": ["case", [">=", s, MIN_SHOW], 0.82, 0],
    } });
    map.addLayer({ id: "sel", type: "line", source: "cells", filter: ["==", ["id"], -1],
      paint: { "line-color": "#ffffff", "line-width": 2 } });
    for (const k of d.m.known) {
      const el = document.createElement("div");
      el.className = "known-marker";
      el.title = `Known analog: ${k.name}`;
      new maplibregl.Marker({ element: el }).setLngLat([k.lon, k.lat])
        .setPopup(new maplibregl.Popup({ offset: 10, closeButton: false })
          .setHTML(`<b>${esc(k.name)}</b><br>Known analog (${k.body}) · ${esc(k.use)}<br><span style="color:#8d98ad">Approx. location</span>`))
        .addTo(map);
    }
    map.on("click", "cells", (e) => { const id = e.features?.[0]?.id; if (typeof id === "number") select(id); });
    map.on("mouseenter", "cells", () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", "cells", () => (map.getCanvas().style.cursor = ""));
    mapReady = true;
    paint();
    $("#loading").hidden = true;
  });
}

function paint() {
  if (!mapReady) return;
  for (let c = 0; c < d.n; c++) {
    const v = scores.score[c];
    map.setFeatureState({ source: "cells", id: c }, { s: Number.isNaN(v) ? 0 : v });
  }
}

function recompute() {
  const prof = profile();
  scores = scoreGrid(d.n, d.get, prof.params, state.weights, prof.analog_threshold, state.month);
  paint();
  renderCandidates();
  renderLegend();
  if (state.selected >= 0) renderCard(state.selected);
}

// ------------------------------------------------------------------ init
async function init() {
  try {
    d = await loadDataset();
  } catch (err) {
    $("#loading").textContent = "Could not load data. Run the pipeline first (see README).";
    throw err;
  }
  state.targetId = Object.keys(d.m.targets)[0];
  state.profileId = d.m.profiles.find((p) => p.target === state.targetId)!.id;
  resetWeights();
  renderAll();
  const prof = profile();
  scores = scoreGrid(d.n, d.get, prof.params, state.weights, prof.analog_threshold, state.month);
  renderCandidates();
  $("#reset").addEventListener("click", () => { resetWeights(); renderWeights(); recompute(); });
  $("#btn-method").addEventListener("click", renderMethod);
  buildMap();
}

init();
