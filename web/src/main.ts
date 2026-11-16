import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import { cellRing, fmtLatLon, loadDataset, type Dataset } from "./data.ts";
import { $, esc, slug } from "./dom.ts";
import { ICON, LIGHT_ICON, LOGO, UI } from "./icons.ts";
import { LANGS, detectLang, getLang, monthNames, num, setLang, t, tOpt, td, type Key, type Lang } from "./i18n.ts";
import {
  DESTINATIONS, MARS_BASE_SCALE, MISSIONS, PARTIAL_MIN, getMode, light, modeThreshold, parseModeQuery, pickMonth,
  resolveMode, scoreModeCellMonth, scoreModeYear, withModeQuery,
  type Destination, type Light, type Mission, type ModeGridScores, type ModeYear, type ResolvedPart,
} from "./modes.ts";
import { openOnboarding } from "./onboarding.ts";
import { MIN_COVERAGE, haversineKm, membership, topCandidates } from "./scoring.ts";
import type { PhotoCredit } from "./photo.ts";
import { initTips, onTipsChange, setTipsEnabled, tip, tipsEnabled } from "./tip.ts";
import { initSheet, type Sheet } from "./sheet.ts";
import { SUN_LIGHT_POSITION, sunlightTile } from "./sunlight.ts";
import type { Fact, Param } from "./types.ts";
import type { Feature, FeatureCollection } from "geojson";

const GIBS = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg";
const MIN_SHOW = PARTIAL_MIN;   // por debajo, la celda no se pinta (analogía rota)
const NEW_KM = 500;
const SITE_KM = 60;            // una celda: a esta distancia la ficha ofrece la foto del análogo documentado
const GIBS_NATIVE_ZOOM = 8;    // resolución nativa de Blue Marble en GIBS (GoogleMapsCompatible_Level8)
// Mapa de calor (morado → magenta → rosa → rojo claro): colores saturados que no se confunden con la
// nieve, el desierto ni el océano de la imagen base. Sale de los tokens CSS (--ramp-0..3): una sola fuente para
// mapa, leyenda y calendario. De 0,30 a 0,60 (parcial) se pinta tenue; desde 0,60 (análogo), con fuerza.
const RAMP_STOPS = [0.3, 0.6, 0.8, 1];
const OP_PARTIAL = 0.42, OP_ANALOG = 0.92;
// Copia de seguridad por si la hoja de estilos aún no está aplicada al leer el token.
const TOKEN_FALLBACK: Record<string, string> = {
  "--ramp-0": "#8C2981", "--ramp-1": "#C2338F", "--ramp-2": "#E8457A", "--ramp-3": "#FF7F8A",
  "--navy-950": "#000000", "--navy-900": "#06080E", "--amber-400": "#F0A23B", "--sky-400": "#5BC0DE", "--sand-50": "#FFF6E5",
  "--sand-200": "#F4D6B0", "--amber-600": "#D97706",
};
const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || TOKEN_FALLBACK[name] || "#000000";
const RAMP: [number, string][] = RAMP_STOPS.map((stop, k) => [stop, token(`--ramp-${k}`)]);
const hexRgb = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
const ui = (svg: string, cls = "ui") => `<span class="${cls}" aria-hidden="true">${svg}</span>`;
const LANG_KEY = "lumea.lang";

const state = {
  d: null as Destination | null, m: null as Mission | null, month: -1, selected: -1,
  picker: null as "dest" | "mission" | null, monthGrid: false,
};
let ds: Dataset;
let map: maplibregl.Map;
let parts: ResolvedPart[] = [];        // pruebas (perfiles) del modo activo, con sus pesos
let thr = 0.6;                         // umbral "análogo" del modo
let year: ModeYear | null = null;      // los 12 meses ya calculados
let scores: ModeGridScores | null = null; // vista del mes elegido (o mejor mes)
let mapReady = false;
let newCands: number[] = [];                 // candidatos del ranking marcados NUEVO
// ventana única de punto (sitio documentado, punto USGS o candidato nuevo): sigue al cursor
type PointRef = { kind: "site" | "usgs" | "cand"; id: number };
let pointPop: maplibregl.Popup | null = null;
let pointRef: PointRef | null = null;
let pointTimer: number | undefined;
let pointPinned = false;                     // abierta con clic/toque: no se cierra al salir del punto
const mobilePanel = window.matchMedia("(max-width: 860px)");

// capa USGS ya filtrada por scripts/build-usgs.mjs (data/usgs.json)
interface UsgsSite { name: string; type: string; lat: number; lon: number; body: string | null; reason: "tagged" | "environment" }
interface UsgsMatch { known: string; usgs: string; lat: number; lon: number; km: number }
interface UsgsLayer {
  source: { title: string; url: string };
  counts: { total: number; duplicate: number; offshore: number; matched: number; shown: number; hidden: number };
  matches: UsgsMatch[]; sites: UsgsSite[];
}
let usgs: UsgsLayer | null = null;
let sheet: Sheet | null = null;                  // hoja inferior del menú (solo teléfono)
const usgsMatch = new Map<string, UsgsMatch>();  // nombre del sitio documentado -> su registro en USGS
const cellIndex = new Map<number, number>();     // (fila, columna) de la rejilla -> celda
let photos: Record<string, PhotoCredit> = {};  // créditos de las fotos (img/sites/credits.json)

const target = () => ds.m.targets[parts[0].profile.target];
const src = (key: string) => ds.m.sources[key];
const srcLink = (key: string, text = t("source")) => {
  const s = src(key);
  return s ? `<a href="${s.url}" target="_blank" rel="noopener" ${tip(s.title)}>${esc(text)}</a>` : "";
};
/** Enlace a la fuente como icono (con su título en el tooltip y como nombre accesible). */
const srcIcon = (key: string) => {
  const s = src(key);
  return s ? `<a class="ext" href="${s.url}" target="_blank" rel="noopener" aria-label="${esc(s.title)}" ${tip(s.title)}>${UI.ext}</a>` : "";
};
const pshort = (id: string, fallback: string) => tOpt(`pshort.${id}`, td(fallback));
const profileTip = (p: ResolvedPart) => `${td(p.profile.label)} — ${t("nasa.gap")} ${td(p.profile.nasa_gap)}`;
const modeLabel = () => t("mode.label", { d: t(`dest.${state.d!}.name`), m: t(`mission.${state.m!}.name`) });
const fmtScore = (s: number) => (Number.isNaN(s) ? "–" : num(s, 2));
const minCoverage = () => ds.m.min_coverage ?? MIN_COVERAGE;

/** Color de la rampa para un score (misma interpolación lineal que la capa del mapa). */
function colorFor(s: number): number[] {
  const x = Math.min(1, Math.max(RAMP[0][0], s));
  let k = 0;
  while (k < RAMP.length - 2 && x > RAMP[k + 1][0]) k++;
  const [a, ca] = RAMP[k], [b, cb] = RAMP[k + 1];
  const f = (x - a) / (b - a), A = hexRgb(ca), B = hexRgb(cb);
  return A.map((v, i) => Math.round(v + (B[i] - v) * f));
}
/** Tinta legible (AA) sobre un color de la rampa: oscura sobre claros, clara sobre oscuros. */
function inkOn([r, g, b]: number[]): string {
  const lin = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.2 ? token("--navy-900") : token("--sand-50");
}

function cellName(c: number): string {
  return ds.m.names[`${ds.ci[c]}_${ds.cj[c]}`] ?? fmtLatLon(ds.lat[c], ds.lon[c]);
}

function nearestKnown(c: number) {
  let best = { km: Infinity, name: "" };
  for (const k of ds.m.known) {
    const km = haversineKm(ds.lat[c], ds.lon[c], k.lat, k.lon);
    if (km < best.km) best = { km, name: k.name };
  }
  return best;
}

function fmtVal(p: Param, x: number): string {
  if (Number.isNaN(x)) return t("nodata");
  const digits = p.unit === "0–1" ? 2 : Math.abs(x) < 10 ? 1 : 0;
  return `${num(x, digits)} ${td(p.unit)}`.trim();
}

/** "± 12 %" con la incertidumbre que publica la propia fuente (ESA CCI), si existe. */
function uncText(p: Param, c: number, m: number): string {
  if (!p.unc_feature || !ds.m.features[p.unc_feature]) return "";
  const u = ds.get(p.unc_feature, c, m);
  return Number.isNaN(u) ? "" : ` ± ${num(u)} ${td(p.unit)}`;
}

// ------------------------------------------------------------------ símbolos propios (con explicación al pasar el cursor)
/** Semáforo: icono + texto (nunca solo color) y su regla en el tooltip. */
function lightChip(l: Light, strongMin: number, long = false): string {
  const text = t(long ? `light.${l}` : `light.${l}.short`);
  const why = t(`light.${l}.tip`, { thr: num(strongMin, 2), mid: num(PARTIAL_MIN, 2) });
  return `<span class="light ${l}" tabindex="0" ${tip(why)}>${LIGHT_ICON[l]}${esc(text)}</span>`;
}

const badge = (cls: string, text: string, why: string, focusable = true) =>
  `<span class="badge ${cls}"${focusable ? ' tabindex="0"' : ""} ${tip(why)}>${esc(text)}</span>`;

function paramBadges(p: Param, focusable = true) {
  return badge(p.comparability, p.comparability, t(`comp.${p.comparability}`), focusable) +
    (p.proxy ? badge("proxy", t("badge.proxy"), t("badge.proxy.title"), focusable) : "") +
    (p.verified ? "" : badge("proxy", t("badge.unverified"), t("badge.unverified.title"), focusable));
}

// ------------------------------------------------------------------ textos estáticos e idioma
function applyStatic() {
  document.documentElement.lang = getLang();
  document.title = t("app.title");
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("app.description"));
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => (el.innerHTML = t(el.dataset.i18n as Key)));
  document.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((el) =>
    el.setAttribute("aria-label", t(el.dataset.i18nAria as Key)));
  document.querySelectorAll<HTMLElement>("[data-i18n-tip]").forEach((el) => (el.dataset.tip = t(el.dataset.i18nTip as Key)));
  $("#logo").innerHTML = LOGO;
  $("#btn-method").innerHTML = UI.info;
  $("#btn-continents").innerHTML = UI.globe;
  renderContinents();
  const el = $("#lang");
  el.setAttribute("aria-label", t("lang.label"));
  el.innerHTML = LANGS.map((l) =>
    `<button type="button" data-lang="${l}" aria-pressed="${l === getLang()}">${l.toUpperCase()}</button>`).join("");
  el.querySelectorAll<HTMLButtonElement>("button").forEach((b) =>
    b.addEventListener("click", () => changeLang(b.dataset.lang as Lang)));
}

function changeLang(l: Lang) {
  if (l === getLang()) return;
  setLang(l);
  try { localStorage.setItem(LANG_KEY, l); } catch { /* modo privado: sin persistencia */ }
  const q = new URLSearchParams(location.search);
  q.set("lang", l);
  history.replaceState(null, "", `?${q.toString()}${location.hash}`);
  applyStatic();
  if (!ds || !state.d) return;
  renderAll();
  closePoint();
  if (state.selected >= 0) renderCard(state.selected);
}

// ------------------------------------------------------------------ 2–3. selectores de destino y misión
function renderPickers() {
  const cur = {
    dest: { icon: ICON[state.d!], label: t("side.dest"), name: t(`dest.${state.d!}.name`), sub: t(`dest.${state.d!}.sub`) },
    mission: { icon: ICON[state.m!], label: t("side.mission"), name: t(`mission.${state.m!}.name`), sub: "" },
  };
  for (const kind of ["dest", "mission"] as const) {
    const b = $<HTMLButtonElement>(`#pick-${kind}`), c = cur[kind];
    b.setAttribute("aria-expanded", String(state.picker === kind));
    b.innerHTML = `<span class="ico">${c.icon}</span>
      <span class="txt"><small>${esc(c.label)}</small><b>${esc(c.name)}</b></span>${ui(UI.chevron, "caret")}`;
  }
  const panel = $("#pick-panel");
  panel.hidden = state.picker === null;
  if (state.picker === null) { panel.innerHTML = ""; return; }
  const f = num(MARS_BASE_SCALE, 1);
  const opts = state.picker === "dest"
    ? DESTINATIONS.map((d) => ({ v: d as string, icon: ICON[d], name: t(`dest.${d}.name`), sub: t(`dest.${d}.sub`), what: t(`dest.${d}.what`), on: d === state.d }))
    : MISSIONS.map((m) => ({ v: m as string, icon: ICON[m], name: t(`mission.${m}.name`), sub: "", what: t(`mode.${state.d!}.${m}.what`, { f }), on: m === state.m }));
  panel.setAttribute("aria-label", cur[state.picker].label);
  panel.innerHTML = opts.map((o) => `
    <button type="button" class="pick-opt" data-v="${o.v}" aria-pressed="${o.on}">
      <span class="ico">${o.icon}</span>
      <span class="txt"><b>${esc(o.name)}${o.sub ? ` <small>${esc(o.sub)}</small>` : ""}</b><span>${esc(o.what)}</span></span>
    </button>`).join("");
  const kind = state.picker;
  panel.querySelectorAll<HTMLButtonElement>("button").forEach((b) => b.addEventListener("click", () => {
    state.picker = null;
    if (kind === "dest") setMode(b.dataset.v as Destination, state.m!);
    else setMode(state.d!, b.dataset.v as Mission);
    $(`#pick-${kind}`).focus();
  }));
}

function togglePicker(kind: "dest" | "mission") {
  state.picker = state.picker === kind ? null : kind;
  renderPickers();
  if (state.picker) ($("#pick-panel").querySelector<HTMLElement>('[aria-pressed="true"]') ?? $("#pick-panel button"))?.focus();
}

// ------------------------------------------------------------------ 4. meses
function renderMonths() {
  const MN = monthNames("long"), SH = monthNames();
  const flat = isFlat();
  $("#when").hidden = flat;
  $("#month-note").classList.toggle("flat", flat);
  if (flat) {   // nada que elegir: se dice en una línea en vez de mostrar 12 meses iguales
    $("#month-grid").hidden = true;
    $("#month-grid").innerHTML = "";
    $("#month-note").innerHTML = `${ui(UI.info)}<span>${esc(t("month.flat"))}</span>`;
    return;
  }
  const best = $<HTMLButtonElement>("#month-best"), pick = $<HTMLButtonElement>("#month-pick");
  best.setAttribute("aria-pressed", String(state.month < 0));
  best.innerHTML = `${ui(UI.star)}${esc(t("month.best.btn"))}`;
  best.dataset.tip = t("month.best.title");
  pick.setAttribute("aria-expanded", String(state.monthGrid));
  pick.setAttribute("aria-pressed", String(state.month >= 0));
  pick.innerHTML = `${esc(state.month < 0 ? t("month.pick") : MN[state.month])}${ui(UI.chevron, "caret")}`;
  $("#month-note").textContent = state.month < 0 ? t("month.note.best") : t("month.note.one", { month: MN[state.month].toLowerCase() });

  const grid = $("#month-grid");
  grid.hidden = !state.monthGrid;
  if (!state.monthGrid || !year) { grid.innerHTML = ""; return; }
  const counts = Array.from(year.analogCellsByMonth), max = Math.max(1, ...counts);
  const top = Math.min(...counts) === max ? -1 : counts.indexOf(max);
  grid.innerHTML = `<p class="note">${esc(t("month.grid.hint", { thr: num(thr, 2) }))}</p><div class="mgrid" role="group" aria-label="${esc(t("month.pick"))}">` +
    SH.map((m, k) => `<button type="button" data-m="${k}" aria-pressed="${state.month === k}"
        aria-label="${esc(t("month.cell.tip", { month: MN[k], n: num(counts[k]), thr: num(thr, 2) }))}"
        ${tip(t(k === top && counts[k] > 0 ? "month.cell.top" : "month.cell.tip", { month: MN[k], n: num(counts[k]), thr: num(thr, 2) }))}>
        <b>${m}${k === top && counts[k] > 0 ? ui(UI.peak, "topm") : ""}</b><span class="cnt">${num(counts[k])}</span>
        <span class="mbar" aria-hidden="true"><i style="transform:scaleX(${counts[k] / max})"></i></span></button>`).join("") + "</div>";
  grid.querySelectorAll<HTMLButtonElement>("button").forEach((b) => b.addEventListener("click", () => {
    setMonth(Number(b.dataset.m));
    grid.querySelector<HTMLElement>(`[data-m="${state.month}"]`)?.focus();
  }));
}

/** Modo cuyos criterios son todos anuales: el mapa es idéntico los 12 meses. */
const isFlat = () => parts.every((p) => p.params.every((q) => !ds.m.features[q.feature]?.monthly));

function setMonth(m: number) {
  state.month = m;
  refresh(true);
}

// ------------------------------------------------------------------ 5. qué estás viendo
function renderWhat() {
  if (!scores) return;
  const f = num(MARS_BASE_SCALE, 1), tg = target(), MN = monthNames("long");
  // la cifra principal sale del mismo mapa que se está viendo
  let analog = 0, areaAnalog = 0, areaAll = 0;
  for (let c = 0; c < ds.n; c++) {
    const w = Math.cos(ds.lat[c] * Math.PI / 180);
    areaAll += w;
    if (scores.score[c] >= thr) { analog++; areaAnalog += w; }
  }
  const when = state.month < 0 ? t("what.month.best") : t("what.month.one", { month: MN[state.month].toLowerCase() });
  const sub = isFlat() ? t("what.stat.flat", { thr: num(thr, 2) }) : `${t("what.stat.thr", { thr: num(thr, 2) })} · ${when}`;
  $("#what").innerHTML = `
    <p class="lead">${esc(t(`mode.${state.d!}.${state.m!}.what`, { f }))}</p>
    <div class="stat" tabindex="0" ${tip(t("what.stat.tip", { thr: num(thr, 2) }))}><b>${num(analog)}</b>
      <span>${esc(t("what.stat", { pct: num(100 * areaAnalog / areaAll, 1) }))}<small>${esc(sub)}</small></span></div>
    <ul class="how">
      <li><i class="sw cell" aria-hidden="true"></i><span>${t("what.how.cell", { dest: t(`what.dest.${state.d!}`) })}</span></li>
      <li><i class="sw grad" aria-hidden="true"></i><span>${t("what.how.color", { thr: num(thr, 2) })}</span></li>
      <li>${ui(UI.info, "sw")}<span>${t("what.how.click")}</span></li>
    </ul>
    <h3 class="sub">${esc(parts.length > 1 ? t("mode.combines", { n: parts.length }) : t("mode.single"))}</h3>
    <ul class="chips">${parts.map((p) => `<li tabindex="0" ${tip(profileTip(p))}>${esc(pshort(p.profile.id, p.profile.label))}</li>`).join("")}</ul>
    <details class="about">
      <summary><span class="ico">${ICON[state.d!]}</span><span class="txt"><b>${esc(td(tg.name))}</b><small>${esc(t("dest.about"))}</small></span></summary>
      <div class="about-body"><p>${esc(td(tg.summary))}</p>
      <ul>${tg.facts.map((x: Fact) => `<li><b>${esc(td(x.k))}:</b> ${esc(td(x.v))} ${srcIcon(x.src)}</li>`).join("")}</ul></div>
    </details>`;
}

// ------------------------------------------------------------------ 6. especificaciones (cobertura, validación y estabilidad por separado)
function renderSpecs() {
  if (!year) return;
  const minCov = minCoverage();
  let low = 0;
  for (let c = 0; c < ds.n; c++) if (year.coverage[c] < minCov - 1e-6) low++;
  const how = (section: string) => `<button type="button" class="link" data-method="${section}">${esc(t("specs.method"))}</button>`;
  const pct = (x: number | null | undefined, digits: number) => (x == null ? "–" : num(x, digits));
  const perTest = (line: (p: ResolvedPart) => string) => parts.map((p) => p.profile.validation
    ? `<li><b tabindex="0" ${tip(profileTip(p))}>${esc(pshort(p.profile.id, p.profile.label))}</b> ${line(p)} ${srcIcon(p.profile.gap_src)}</li>` : "").join("");
  $("#specs-body").innerHTML = `
    <div class="spec"><h3>${esc(t("specs.coverage.h"))}</h3>
      <ul><li>${esc(t("specs.coverage.grid", { n: num(ds.n) }))}</li>
      <li>${esc(t("specs.coverage.analog", { n: num(year.analogCellsAnyMonth), pct: num(100 * year.analogCellsAnyMonth / ds.n, 1), thr: num(thr, 2) }))}</li>
      <li>${esc(t("specs.coverage.low", { n: num(low), cov: num(minCov * 100) }))}</li></ul>
      <p class="links">${how("m-model")} · ${srcLink("power", t("specs.src.power"))} · ${srcLink("terrain", t("specs.src.terrain"))}</p></div>
    <div class="spec"><h3>${esc(t("specs.validation.h"))}</h3>
      <ul>${perTest((p) => `${esc(t("specs.val.known", { pct: pct(p.profile.validation!.known_median_pct, 0), n: p.profile.validation!.n_known }))}
        ${esc(t("specs.val.tropics", { pct: pct(p.profile.validation!.tropics_pct, 1) }))}`)}</ul>
      ${state.d === "marte" && state.m === "base" ? `<p class="note">${esc(t("mode.marsbase.note", { f: num(MARS_BASE_SCALE, 1) }))}</p>` : ""}
      <p class="links">${how("m-val")} · <button type="button" class="link" data-method="m-limits">${esc(t("specs.src.list", { n: ds.m.known.length }))}</button></p></div>
    <div class="spec"><h3>${esc(t("specs.stability.h"))}</h3>
      <ul>${perTest((p) => `${esc(t("specs.stab.jaccard", { j: num(p.profile.validation!.jaccard, 2) }))}
        ${esc(t("specs.stab.land", { pct: pct(p.profile.validation!.analog_land_pct, 1) }))}`)}</ul>
      <p class="links">${how("m-val")}</p></div>
    <p class="note">${esc(t("method.val.note"))}</p>`;
  $("#specs-body").querySelectorAll<HTMLButtonElement>("[data-method]").forEach((b) =>
    b.addEventListener("click", () => openMethod(b.dataset.method)));
}

// ------------------------------------------------------------------ 7. ranking
function renderCandidates() {
  if (!scores) return;
  const sc = scores;
  const top = topCandidates(sc.score, ds.lat, ds.lon, 12, ds.m.nms_km, sc.coverage, minCoverage());
  newCands = top.filter((c) => nearestKnown(c).km > NEW_KM);
  syncCandidateLayer();
  $("#cand-hint").textContent = t("cands.hint", { km: ds.m.nms_km, cov: num(minCoverage() * 100) });
  $("#cands").innerHTML = top.map((c, r) => {
    const nk = nearestKnown(c);
    const nov = nk.km > NEW_KM
      ? `<span class="badge new" ${tip(t("badge.new.title", { km: NEW_KM }))}>${esc(t("badge.new"))}</span>`
      : `<span ${tip(t("card.near", { name: nk.name, km: num(Math.round(nk.km)) }))}>${esc(t("cands.near", { name: nk.name }))}</span>`;
    const when = `<span ${tip(t("tip.months", { thr: num(thr, 2) }))}>${esc(t("cands.months", { n: sc.months[c], thr: num(thr, 2) }))}</span>`;
    return `<li><button type="button" data-c="${c}"><span class="rk">${r + 1}</span><span class="nm">${esc(cellName(c))}</span>
      <span class="sc" ${tip(t("tip.score"))}>${fmtScore(sc.score[c])}</span><span class="sub">${when} · ${nov}</span></button></li>`;
  }).join("") || `<li class="note">${esc(t("cands.none"))}</li>`;
  $("#cands").querySelectorAll<HTMLButtonElement>("button").forEach((b) => b.addEventListener("click", () => {
    const c = Number(b.dataset.c);
    map.flyTo({ center: [ds.lon[c], ds.lat[c]], zoom: Math.max(map.getZoom(), 3.2) });
    select(c);
  }));
}

// ------------------------------------------------------------------ 8. modo avanzado: pesos por prueba y criterio
function renderWeights() {
  const el = $("#weights");
  el.innerHTML = parts.map((part, i) => `<fieldset class="wgroup">
    <legend>${esc(td(part.profile.label))}</legend>` + part.params.map((p) => p.gate
    ? `<div class="req" tabindex="0" ${tip(`${t("adv.gate.tip")} ${td(p.why)}`)}>${ui(UI.gate)}${esc(t("param.required"))} ${esc(td(p.label))} ${paramBadges(p, false)}</div>`
    : `<div class="w"><label for="w-${i}-${p.id}" ${tip(td(p.why))}>${esc(td(p.label))}</label><span class="bdg">${paramBadges(p)}</span>
        <output id="o-${i}-${p.id}" ${tip(t("adv.weight.tip"))}>${num(part.weights[p.id], 2)}</output>
        <input id="w-${i}-${p.id}" data-part="${i}" data-id="${p.id}" type="range" min="0" max="1" step="0.05" value="${part.weights[p.id]}" /></div>`).join("") + "</fieldset>").join("");
  let timer: number | undefined;
  el.querySelectorAll<HTMLInputElement>("input").forEach((inp) => inp.addEventListener("input", () => {
    const i = Number(inp.dataset.part), id = inp.dataset.id!;
    parts[i].weights[id] = Number(inp.value);
    $(`#o-${i}-${id}`).textContent = num(Number(inp.value), 2);
    clearTimeout(timer); timer = window.setTimeout(recompute, 120);
  }));
}

function renderLegend() {
  const cut = Math.round((thr - MIN_SHOW) / (1 - MIN_SHOW) * 100);
  const hasUsgs = !!usgs?.sites.length, hasMatch = usgsMatch.size > 0;
  $("#legend").innerHTML = `<b>${esc(t("legend.title", { mode: modeLabel() }))}</b>
    <div class="bar"><i style="flex:0 0 ${cut}%;opacity:.5;background:linear-gradient(90deg, ${RAMP[0][1]}, ${RAMP[1][1]})"></i><i style="flex:1;background:linear-gradient(90deg, ${RAMP[1][1]}, ${RAMP[2][1]} 50%, ${RAMP[3][1]})"></i></div>
    <div class="zones"><span style="flex:0 0 ${cut}%">${esc(t("legend.partial"))}</span><span>${esc(t("legend.analog"))}</span></div>
    <div class="ticks"><span style="flex:0 0 ${cut}%">${num(MIN_SHOW, 2)}</span><span>${num(thr, 2)}</span><span>1</span></div>
    <div>${esc(t("legend.note", { min: num(MIN_SHOW, 2) }))}</div>
    <div class="keys"><span><i class="dot site"></i>${esc(t("legend.site"))}</span>
      ${hasMatch ? `<span><i class="dot site usgs"></i>${esc(t("legend.site.usgs"))}</span>` : ""}
      ${hasUsgs ? `<span><i class="dot usgs"></i>${esc(t("legend.usgs"))}</span>` : ""}
      <span><i class="dot cand"></i>${esc(t("legend.cand"))}</span></div>`;
}

function renderAll() {
  renderPickers(); renderMonths(); renderWhat(); renderSpecs(); renderCandidates(); renderWeights(); renderLegend();
}

// ------------------------------------------------------------------ ficha de celda
function select(c: number) {
  state.selected = c;
  sheet?.set("min");   // teléfono: la ficha manda; el menú se recoge del todo
  if (mapReady) map.setFilter("sel", ["==", ["id"], c]);
  renderCard(c);
}

function renderCard(c: number) {
  if (!scores) return;
  const MN = monthNames(), ML = monthNames("long"), tg = target();
  const monthScores = MN.map((_, m) => scoreModeCellMonth(ds.get, parts, c, m));
  const showM = state.month >= 0 ? state.month : Math.max(0, scores.bestMonth[c]);
  const now = monthScores[showM];
  const nk = nearestKnown(c);
  const named = cellName(c) !== fmtLatLon(ds.lat[c], ds.lon[c]);
  const list = (items: string[]) => new Intl.ListFormat(getLang(), { style: "long", type: "conjunction" }).format(items);

  // ---- datos de cada criterio en el mes mostrado
  type Row = { p: Param; x: number; s: number; w: number };
  const rowsByTest: Row[][] = parts.map((part) => part.params.map((p) => {
    const x = ds.get(p.feature, c, showM);
    return { p, x, s: membership(x, p.fn, p.args), w: p.gate ? 1 : part.weights[p.id] ?? 0 };
  }));
  /** criterios sin repetir (un mismo dato puede servir a varias pruebas), los de más peso primero */
  const uniq = (rows: Row[]) => {
    const seen = new Set<string>();
    return [...rows].sort((a, b) => b.w - a.w).filter((r) => (seen.has(r.p.label) ? false : (seen.add(r.p.label), true)));
  };
  const counted = rowsByTest.flat().filter((r) => r.w > 0);
  const strong = uniq(counted.filter((r) => r.s >= 0.7)).slice(0, 4);
  const broken = uniq(counted.filter((r) => r.s <= 0.3)).slice(0, 4);
  const missing = uniq(counted.filter((r) => Number.isNaN(r.s)));
  const crit = (r: Row) => `<li tabindex="0" ${tip(td(r.p.why))}>${esc(td(r.p.label))}</li>`;

  // ---- semáforo por prueba y resumen en una frase
  const tests = parts.map((part, i) => ({
    part, i, s: now.parts[i].score, l: light(now.parts[i].score, part.profile.analog_threshold),
    name: pshort(part.profile.id, part.profile.label),
  }));
  const bits = (["strong", "partial", "broken", "nodata"] as const)
    .map((l) => ({ l, names: tests.filter((x) => x.l === l).map((x) => x.name) }))
    .filter((g) => g.names.length).map((g) => t(`card.sum.${g.l}`, { list: list(g.names) })).join("; ");
  const sentence = bits ? `${bits[0].toUpperCase()}${bits.slice(1)}.` : "";
  const lights = tests.map((x) => `<li>${lightChip(x.l, x.part.profile.analog_threshold)}
      <span class="nm" tabindex="0" ${tip(profileTip(x.part))}>${esc(x.name)}</span>
      <span class="sc" ${tip(t("tip.score.test"))}>${fmtScore(x.s)}</span></li>`).join("");

  // ---- qué cambiar o probar: todo sale de los datos de esta celda
  const valid = monthScores.map((s, m) => ({ s: s.score, m })).filter((x) => !Number.isNaN(x.s));
  const next: string[] = [];
  if (valid.length) {
    const best = valid.reduce((a, b) => (b.s > a.s ? b : a)), worst = valid.reduce((a, b) => (b.s < a.s ? b : a));
    const nAnalog = valid.filter((x) => x.s >= thr).length;
    if (best.m !== showM && best.s - now.score >= 0.01)
      next.push(t("card.try.month", { month: ML[best.m].toLowerCase(), a: fmtScore(now.score), b: fmtScore(best.s) }));
    else if (nAnalog === 0) next.push(t("card.try.never", { thr: num(thr, 2) }));
    else if (best.s - worst.s < 0.01) next.push(t("card.try.flat"));
    else next.push(t("card.try.span", { n: nAnalog, month: ML[worst.m].toLowerCase(), score: fmtScore(worst.s) }));
  }
  const weak = tests.filter((x) => !Number.isNaN(x.s)).sort((a, b) => a.s - b.s)[0];
  if (weak) {
    const drag = rowsByTest[weak.i].filter((r) => !Number.isNaN(r.s) && r.w > 0).sort((a, b) => a.s - b.s)[0];
    if (drag && drag.s < 0.7) next.push(parts.length > 1
      ? t("card.try.weak", { test: weak.name, score: fmtScore(weak.s), crit: td(drag.p.label) })
      : t("card.try.weak1", { crit: td(drag.p.label), score: fmtScore(drag.s) }));
  }
  if (missing.length) next.push(t("card.try.missing", { list: list(missing.map((r) => td(r.p.label))) }));

  // ---- detalle (números y fuentes), detrás de "Ver detalle"
  const row = (r: Row) => `<div class="row">
      <span>${r.p.gate ? `${esc(t("param.required"))} ` : ""}${esc(td(r.p.label))} ${paramBadges(r.p)}</span>
      <span class="val">${fmtVal(r.p, r.x)}${uncText(r.p, c, showM)} · ${fmtScore(r.s)}</span>
      <div class="meter"><i style="transform:scaleX(${Number.isNaN(r.s) ? 0 : r.s})"></i></div>
      <span class="why">${esc(td(r.p.why))} ${srcLink(r.p.src)}</span></div>`;
  const GROUP_ICON: Record<string, string> = { ok: UI.check, mid: UI.approx, no: UI.cross, never: UI.minus };
  const group = (cls: string, key: Key, rows: Row[]) =>
    rows.length ? `<h5 class="${cls}">${GROUP_ICON[cls] ?? ""}${esc(t(key))}</h5>${rows.map(row).join("")}` : "";
  const details = tests.map((x) => {
    const rows = rowsByTest[x.i];
    return `<details class="pdetail"${parts.length === 1 ? " open" : ""}>
      <summary><span class="nm">${esc(td(x.part.profile.label))}</span>${lightChip(x.l, x.part.profile.analog_threshold)}</summary>
      <p class="note">${esc(t("nasa.gap"))} ${esc(td(x.part.profile.nasa_gap))} ${srcLink(x.part.profile.gap_src)}</p>
      ${group("ok", "card.group.ok", rows.filter((r) => r.s >= 0.7))}
      ${group("mid", "card.group.mid", rows.filter((r) => r.s > 0.3 && r.s < 0.7))}
      ${group("no", "card.group.no", rows.filter((r) => r.s <= 0.3))}
      ${group("never", "card.group.missing", rows.filter((r) => Number.isNaN(r.s)))}
    </details>`;
  }).join("");

  const calCell = (s: number, name: string) => {
    const rgb = colorFor(s);
    return `<div style="background:rgb(${rgb.join(" ")});color:${inkOn(rgb)};opacity:${s < MIN_SHOW ? 0.3 : s < thr ? 0.6 : 1}" ${tip(`${name}: ${fmtScore(s)}`)}>${name[0]}</div>`;
  };
  const analogMonths = monthScores.map((s, m) => (s.score >= thr ? MN[m] : "")).filter(Boolean);
  const novelty = nk.km > NEW_KM
    ? `${badge("new", t("badge.new"), t("badge.new.title", { km: NEW_KM }))} ${esc(t("card.new", { km: num(Math.round(nk.km)), name: nk.name }))}`
    : esc(t("card.near", { name: nk.name, km: num(Math.round(nk.km)) }));
  const coords = `${ds.lat[c].toFixed(3)}, ${ds.lon[c].toFixed(3)}`;
  const siteHere = nk.km <= SITE_KM ? ds.m.known.findIndex((k) => k.name === nk.name) : -1;

  const card = $("#card");
  card.hidden = false;
  card.innerHTML = `<button type="button" class="close" aria-label="${esc(t("card.close"))}">${UI.cross}</button>
    <h3>${esc(cellName(c))}</h3>
    <div class="coords"><span>${named ? `${fmtLatLon(ds.lat[c], ds.lon[c])} · ` : ""}${esc(t("card.cell", { km: Math.round(69 * Math.cos(ds.lat[c] * Math.PI / 180)) }))}</span>
      <button type="button" class="copy" data-coords="${coords}" aria-label="${esc(t("card.copy"))}: ${coords}" ${tip(t("card.copy"))}>${UI.copy}<span>${coords}</span></button></div>
    <div class="big"><b ${tip(t("tip.score"))}>${fmtScore(now.score)}</b>
      <span>${lightChip(light(now.score, thr), thr, true)}<br>${esc(modeLabel())} · ${MN[showM]}${state.month < 0 ? ` ${esc(t("card.best"))}` : ""}<br>
      <span class="note" tabindex="0" ${tip(t("tip.coverage"))}>${esc(t("card.coverage", { pct: num(now.coverage * 100) }))}</span></span></div>
    <p class="sum">${esc(sentence)}</p>
    <ul class="lights" aria-label="${esc(t("card.lights"))}">${lights}</ul>
    <div class="cal" role="group" aria-label="${esc(t("card.calendar"))}">${monthScores.map((s, m) => Number.isNaN(s.score)
      ? `<div class="nan" ${tip(t("card.month.nodata", { month: MN[m] }))}>${MN[m][0]}</div>`
      : calCell(s.score, MN[m])).join("")}</div>
    <p class="note">${esc(analogMonths.length ? t("card.analog.in", { thr: num(thr, 2), months: analogMonths.join(", ") }) : t("card.analog.never", { thr: num(thr, 2) }))}</p>
    ${siteHere >= 0 ? photoButton(siteHere, true) : ""}
    <div class="blocks">
      <section class="blk yes"><h4>${UI.check}${esc(t("card.yes"))}</h4>
        <ul>${strong.map(crit).join("") || `<li class="none">${esc(t("card.yes.none"))}</li>`}</ul></section>
      <section class="blk no"><h4>${UI.warn}${esc(t("card.no"))}</h4>
        <ul>${broken.map(crit).join("") || `<li class="none">${esc(t("card.no.none"))}</li>`}
        <li class="none">${esc(t("card.never.short", { list: list(tg.never_analog.map((f) => td(f.k).toLowerCase())) }))}</li></ul></section>
      <section class="blk next"><h4>${UI.swap}${esc(t("card.next.h"))}</h4>
        <ul>${next.map((x) => `<li>${esc(x)}</li>`).join("")}
        ${tg.body === "moon" ? `<li>${t("card.next")} ${srcLink("artemis_req")}.</li>` : ""}</ul></section>
    </div>
    <details class="more"><summary>${esc(t("card.more"))}</summary>
      <p class="note">${novelty}</p>
      <p class="note">${esc(t("light.rule", { thr: num(thr, 2), mid: num(PARTIAL_MIN, 2) }))}</p>
      ${details}
      <h4 class="never">${esc(t("card.never"))}</h4>
      ${tg.never_analog.map((f) => `<div class="row"><span>${esc(td(f.k))} ${badge("N", "N", t("comp.N"))}</span><span class="why">${esc(td(f.v))} ${srcLink(f.src)}</span></div>`).join("")}
    </details>`;
  const scroller = document.createElement("div");
  scroller.className = "card-scroll";
  card.append(scroller);
  [...card.children].filter((child) => child !== scroller && !child.classList.contains("close"))
    .forEach((child) => scroller.append(child));
  card.querySelector(".close")!.addEventListener("click", () => {
    card.hidden = true; state.selected = -1; if (mapReady) map.setFilter("sel", ["==", ["id"], -1]);
  });
  card.querySelector<HTMLButtonElement>(".copy")!.addEventListener("click", async (e) => {
    const b = e.currentTarget as HTMLButtonElement;
    try {
      await navigator.clipboard.writeText(b.dataset.coords!);
      b.classList.add("done");
      b.dataset.tip = t("card.copied", { coords: b.dataset.coords! });
    } catch {
      b.dataset.tip = t("card.copy.fail", { coords: b.dataset.coords! });
    }
    b.querySelector("span")!.textContent = b.dataset.tip!;
  });
  card.querySelector<HTMLButtonElement>("[data-photo]")?.addEventListener("click", () => openPhoto({ kind: "site", id: siteHere }));
}

// ------------------------------------------------------------------ puntos del mapa: una sola ventana que sigue al cursor
interface PointInfo {
  name: string; lat: number; lon: number; dot: string; kind: string; desc: string; coordsNote: string;
  photo?: PhotoCredit; cell: number;
}

/** Celda de la rejilla que contiene (o toca) una coordenada; -1 si cae fuera de tierra firme. */
function cellAt(lat: number, lon: number): number {
  const { dlat, dlon } = ds.m.grid, nlon = Math.round(360 / dlon);
  const i0 = Math.round((lat + 90) / dlat), j0 = Math.round((lon + 180) / dlon);
  let best = -1, bd = Infinity;
  for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
    const c = cellIndex.get((i0 + di) * 4096 + ((j0 + dj + nlon) % nlon));
    if (c === undefined) continue;
    const d = haversineKm(lat, lon, ds.lat[c], ds.lon[c]);
    if (d < bd) { bd = d; best = c; }
  }
  return bd <= 45 ? best : -1;
}

/** Posición con la que se pinta un análogo documentado: la de USGS si la capa lo incluye. */
function sitePos(i: number) {
  const k = ds.m.known[i], mt = usgsMatch.get(k.name);
  return mt ? { lat: mt.lat, lon: mt.lon, usgs: true } : { lat: k.lat, lon: k.lon, usgs: false };
}

const bodyName = (b: string | null) => t(b === "moon" ? "body.moon" : b === "mars" ? "body.mars" : "body.both");
const usgsType = (type: string) => tOpt(`usgs.type.${slug(type)}`, type);

function pointInfo(ref: PointRef): PointInfo {
  if (ref.kind === "site") {
    const k = ds.m.known[ref.id], pos = sitePos(ref.id);
    return { name: k.name, lat: pos.lat, lon: pos.lon, dot: pos.usgs ? "site usgs" : "site", kind: t("known.kind"),
      desc: t("known.popup", { body: bodyName(k.body), use: td(k.use) }),
      coordsNote: pos.usgs ? t("known.usgs") : t("known.approx"), photo: photos[slug(k.name)], cell: cellAt(pos.lat, pos.lon) };
  }
  if (ref.kind === "usgs") {
    const u = usgs!.sites[ref.id];
    return { name: u.name, lat: u.lat, lon: u.lon, dot: "usgs", kind: t("usgs.kind"),
      desc: u.reason === "tagged" ? t("usgs.tagged", { type: usgsType(u.type), body: bodyName(u.body) }) : t("usgs.env", { type: usgsType(u.type) }),
      coordsNote: t("usgs.coords"), photo: photos[slug(u.name)], cell: cellAt(u.lat, u.lon) };
  }
  const c = ref.id, nk = nearestKnown(c);
  return { name: cellName(c), lat: ds.lat[c], lon: ds.lon[c], dot: "cand", kind: t("cand.kind"),
    desc: t("card.new", { km: num(Math.round(nk.km)), name: nk.name }), coordsNote: "", cell: c };
}

function pointHtml(p: PointInfo): string {
  const s = p.cell >= 0 && scores ? scores.score[p.cell] : NaN;
  const photo = p.photo ? `<button type="button" class="pp-photo" aria-label="${esc(t("card.photo", { name: p.name }))}">
      <img src="img/sites/${esc(p.photo.file)}" alt="" width="300" height="200" loading="lazy" decoding="async" />
      <span class="zoom">${UI.photo}${esc(t("photo.enlarge"))}</span></button>
    <p class="pp-credit">${esc(t("photo.credit"))} ${esc(p.photo.source)} · ${esc(p.photo.sensor)}</p>` : "";
  const sector = p.cell < 0 ? `<p class="approx">${esc(t("point.nocell"))}</p>` : `
    <div class="pp-sector"><span>${esc(t("point.sector", { mode: modeLabel() }))}</span><b ${tip(t("tip.score"))}>${fmtScore(s)}</b>${lightChip(light(s, thr), thr)}</div>
    <button type="button" class="btn pp-details">${esc(t("point.details"))}${ui(UI.chevron, "go")}</button>`;
  return `<div class="pp">${photo}<div class="pp-body">
    <b class="pp-name">${esc(p.name)}</b>
    <span class="pp-kind"><i class="dot ${p.dot}"></i>${esc(p.kind)}</span>
    <p>${esc(p.desc)}</p>${p.coordsNote ? `<p class="approx">${esc(p.coordsNote)}</p>` : ""}
    ${sector}</div></div>`;
}

/** Abre la ventana de un punto. Al pasar el cursor se cierra sola cuando el cursor sale del punto y de la ventana. */
function showPoint(ref: PointRef, pinned = false) {
  window.clearTimeout(pointTimer);
  if (pinned) sheet?.set("min");
  if (pinned) pointPinned = true;
  const p = pointInfo(ref);
  if (pointRef && pointRef.kind === ref.kind && pointRef.id === ref.id && pointPop?.isOpen()) return;
  closePoint();
  pointPinned = pinned;
  pointRef = ref;
  pointPop = new maplibregl.Popup({ offset: 14, closeButton: false, closeOnClick: false, maxWidth: "304px", className: "point-pop" })
    .setLngLat([p.lon, p.lat]).setHTML(pointHtml(p)).addTo(map);
  const el = pointPop.getElement();
  el.addEventListener("mouseenter", () => window.clearTimeout(pointTimer));
  el.addEventListener("mouseleave", () => schedulePointClose(true));
  el.querySelector(".pp-photo")?.addEventListener("click", () => openPhoto(ref));
  el.querySelector(".pp-details")?.addEventListener("click", () => {
    closePoint();
    map.flyTo({ center: [p.lon, p.lat], zoom: Math.max(map.getZoom(), 3.2) });
    select(p.cell);
  });
}

/** Cierre con un pequeño margen, para poder cruzar del punto a la ventana sin que desaparezca. */
function schedulePointClose(force = false) {
  if (pointPinned && !force) return;
  window.clearTimeout(pointTimer);
  pointTimer = window.setTimeout(() => {
    if (document.querySelector("dialog.photo[open]")) return;   // el visor está abierto: la ventana espera
    closePoint();
  }, 260);
}

function closePoint() {
  window.clearTimeout(pointTimer);
  pointPop?.remove();
  pointPop = null; pointRef = null; pointPinned = false;
}

// ------------------------------------------------------------------ fotos (carga diferida)
const photoOf = (i: number): PhotoCredit | undefined => photos[slug(ds.m.known[i].name)];

function photoButton(i: number, withName = false): string {
  if (!photoOf(i)) return "";
  const label = withName ? t("card.photo", { name: ds.m.known[i].name }) : t("photo.open");
  return `<button type="button" class="btn small photo-btn" data-photo="${i}">${UI.photo}<span>${esc(label)}</span></button>`;
}

async function openPhoto(ref: PointRef) {
  const p = pointInfo(ref);
  if (p.photo) (await import("./photo.ts")).openPhoto(p.name, p.photo, p.coordsNote);
}

// ------------------------------------------------------------------ método (carga diferida)
async function openMethod(section?: string) {
  (await import("./method.ts")).openMethod(ds, section);
}

// ------------------------------------------------------------------ mapa
function cellsGeoJSON(): FeatureCollection {
  const features: Feature[] = [];
  for (let c = 0; c < ds.n; c++) {
    features.push({ type: "Feature", id: c, properties: {}, geometry: { type: "Polygon", coordinates: [cellRing(ds, c)] } });
  }
  return { type: "FeatureCollection", features };
}

// Puntos como capas del mapa (no elementos HTML): al vivir sobre el globo, solo se pintan en el
// hemisferio que mira la cámara y nunca se ven "a través" de la Tierra.
function sitesGeoJSON(): FeatureCollection {
  return { type: "FeatureCollection", features: ds.m.known.map((_, i) => {
    const pos = sitePos(i);
    return { type: "Feature", id: i, properties: { u: pos.usgs ? 1 : 0 }, geometry: { type: "Point", coordinates: [pos.lon, pos.lat] } };
  }) };
}

function usgsGeoJSON(): FeatureCollection {
  return { type: "FeatureCollection", features: (usgs?.sites ?? []).map((u, i) => ({
    type: "Feature", id: i, properties: {}, geometry: { type: "Point", coordinates: [u.lon, u.lat] } })) };
}

/** Capa USGS ya filtrada (scripts/build-usgs.mjs). Archivo pequeño, cargado después del mapa. */
async function loadUsgs() {
  try {
    const j = await fetch("data/usgs.json").then((r) => (r.ok ? r.json() as Promise<UsgsLayer> : null));
    if (!j) return;
    usgs = j;
    for (const mt of j.matches) usgsMatch.set(mt.known, mt);
    (map.getSource("usgs") as maplibregl.GeoJSONSource | undefined)?.setData(usgsGeoJSON());
    (map.getSource("sites") as maplibregl.GeoJSONSource | undefined)?.setData(sitesGeoJSON());
    if (state.d) renderLegend();
  } catch { /* capa complementaria: sin ella la app sigue igual */ }
}

function candidatesGeoJSON(): FeatureCollection {
  return { type: "FeatureCollection", features: newCands.map((c) => ({
    type: "Feature", id: c, properties: {}, geometry: { type: "Point", coordinates: [ds.lon[c], ds.lat[c]] } })) };
}

function syncCandidateLayer() {
  if (!mapReady) return;
  (map.getSource("cand-new") as maplibregl.GeoJSONSource | undefined)?.setData(candidatesGeoJSON());
}

// Vistas de "Ir a continente": centro [lon, lat] y zoom en escritorio.
const CONTINENTS: { id: "af" | "na" | "sa" | "an" | "as" | "eu" | "oc"; center: [number, number]; zoom: number }[] = [
  { id: "af", center: [20, 2], zoom: 2.6 }, { id: "na", center: [-100, 45], zoom: 2.4 },
  { id: "sa", center: [-60, -20], zoom: 2.6 }, { id: "an", center: [20, -82], zoom: 2.3 },
  { id: "as", center: [95, 45], zoom: 2.2 }, { id: "eu", center: [15, 52], zoom: 3 },
  { id: "oc", center: [140, -25], zoom: 2.8 },
];

function setContinentMenu(open: boolean) {
  const btn = $("#btn-continents"), menu = $("#continents");
  btn.setAttribute("aria-expanded", String(open));
  menu.hidden = !open;
  if (open) menu.querySelector<HTMLElement>("button")?.focus();
}

function renderContinents() {
  const menu = $("#continents");
  menu.innerHTML = CONTINENTS.map((c) =>
    `<button type="button" role="menuitem" data-id="${c.id}">${esc(t(`cont.${c.id}`))}</button>`).join("");
  menu.querySelectorAll<HTMLButtonElement>("button").forEach((b) => b.addEventListener("click", () => {
    const c = CONTINENTS.find((x) => x.id === b.dataset.id)!;
    setContinentMenu(false);
    $("#btn-continents").focus();
    // MapLibre omite la animación si la persona pidió menos movimiento (prefers-reduced-motion)
    map.flyTo({ center: c.center, zoom: c.zoom - (window.innerWidth < 860 ? 1.3 : 0), duration: 1600 });
  }));
}

function buildMap() {
  maplibregl.addProtocol("lumea-sunlight", async ({ url }, controller) => {
    const match = /^lumea-sunlight:\/\/(\d+)\/(\d+)\/(\d+)$/.exec(url);
    if (!match) throw new Error("Invalid sunlight tile");
    return { data: await sunlightTile(Number(match[1]), Number(match[2]), Number(match[3]), controller.signal) };
  });
  map = new maplibregl.Map({
    container: "map",
    style: {
      version: 8,
      projection: { type: "globe" },
      sources: {
        // Blue Marble es la capa GIBS sin nubes y sin huecos de mayor resolución (nivel 8, 500 m/px).
        // En pantallas de alta densidad se piden teselas un nivel más finas para que no se vea borrosa.
        gibs: { type: "raster", tiles: [GIBS], tileSize: window.devicePixelRatio > 1 ? 128 : 256, maxzoom: GIBS_NATIVE_ZOOM,
          attribution: "<a href='https://earthdata.nasa.gov/gibs'>NASA GIBS</a> · Blue Marble · <a href='https://www.naturalearthdata.com/'>Natural Earth</a>" },
        sunlight: { type: "raster", tiles: ["lumea-sunlight://{z}/{x}/{y}"], tileSize: 128, maxzoom: 3 },
      },
      layers: [
        { id: "bg", type: "background", paint: { "background-color": "#02040A" } },
        // color natural de Blue Marble (antes se apagaba): la Tierra se ve como una foto, no como un dibujo
        { id: "gibs", type: "raster", source: "gibs", paint: { "raster-saturation": -0.04, "raster-brightness-max": 0.98, "raster-contrast": 0.06 } },
        // El sombreado se proyecta sobre la Tierra, debajo de los datos para preservar sus colores.
        { id: "sunlight", type: "raster", source: "sunlight", maxzoom: 6, paint: {
          "raster-opacity": ["interpolate", ["linear"], ["zoom"], 0, 1, 3, 0.85, 5, 0.2, 6, 0],
          "raster-fade-duration": 0,
        } },
      ],
      // Dispersión tenue: el halo acompaña la luz sin cubrir la superficie de blanco.
      sky: {
        "sky-color": "#06101F", "horizon-color": "#739AB5", "fog-color": "#182B40",
        "sky-horizon-blend": 0.15,
        "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 0.28, 2, 0.24, 4, 0.1, 6, 0],
      },
      light: { anchor: "map", position: SUN_LIGHT_POSITION },
    },
    // en pantallas estrechas el globo entero debe caber para ver resultados sin mover el mapa
    center: [15, 55], zoom: window.innerWidth < 860 ? 0.6 : 1.6,
    maxZoom: GIBS_NATIVE_ZOOM, // nunca se amplía la imagen más allá de su resolución nativa
    attributionControl: { compact: true },
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.on("load", () => {
    map.addSource("cells", { type: "geojson", data: cellsGeoJSON(), tolerance: 0 });
    const s: maplibregl.ExpressionSpecification = ["coalesce", ["feature-state", "s"], 0];
    map.addLayer({ id: "cells", type: "fill", source: "cells", paint: {
      "fill-color": ["interpolate", ["linear"], s, ...RAMP.flat()] as unknown as maplibregl.ExpressionSpecification,
      "fill-opacity": ["case", [">=", s, thr], OP_ANALOG, [">=", s, MIN_SHOW], OP_PARTIAL, 0],
      "fill-antialias": false,   // sin bordes de celda: el calor se lee como una mancha continua
    } });
    map.addLayer({ id: "sel", type: "line", source: "cells", filter: ["==", ["id"], -1],
      paint: { "line-color": token("--sky-400"), "line-width": 2.5 } });

    // Tres tipos de punto, todos opacos y con sombra: candidato nuevo = anillo ámbar hueco;
    // punto USGS en entorno análogo = cielo macizo; análogo documentado = arena macizo
    // (con aro cielo si su coordenada viene de la capa USGS).
    map.addSource("cand-new", { type: "geojson", data: candidatesGeoJSON() });
    map.addSource("usgs", { type: "geojson", data: usgsGeoJSON() });
    map.addSource("sites", { type: "geojson", data: sitesGeoJSON() });
    for (const source of ["cand-new", "usgs", "sites"]) map.addLayer({ id: `${source}-shadow`, type: "circle", source, paint: {
      "circle-radius": 11, "circle-color": "#000000", "circle-blur": 0.7, "circle-opacity": 0.75, "circle-translate": [0, 2] } });
    map.addLayer({ id: "cand-new", type: "circle", source: "cand-new", paint: {
      "circle-radius": 7.5, "circle-color": token("--navy-900"),
      "circle-stroke-color": token("--amber-400"), "circle-stroke-width": 3 } });
    map.addLayer({ id: "usgs", type: "circle", source: "usgs", paint: {
      "circle-radius": 5.5, "circle-color": token("--sky-400"),
      "circle-stroke-color": token("--navy-900"), "circle-stroke-width": 2 } });
    map.addLayer({ id: "sites", type: "circle", source: "sites", paint: {
      "circle-radius": 5.5, "circle-color": token("--sand-200"),
      "circle-stroke-color": ["case", ["==", ["get", "u"], 1], token("--sky-400"), token("--navy-900")], "circle-stroke-width": 2 } });

    // Una sola ventana por punto: aparece al pasar el cursor y se queda mientras el cursor esté
    // sobre el punto o sobre ella. El clic (o el toque) la fija hasta tocar fuera.
    const POINT_LAYERS = ["sites", "usgs", "cand-new"];
    const refOf = (f: maplibregl.MapGeoJSONFeature): PointRef | null => typeof f.id !== "number" ? null
      : { kind: f.layer.id === "sites" ? "site" : f.layer.id === "usgs" ? "usgs" : "cand", id: f.id };
    for (const layer of POINT_LAYERS) {
      // con las descripciones apagadas (o en el teléfono), la ventana del punto solo se abre con clic/toque
      map.on("mousemove", layer, (e) => { if (!tipsEnabled() || mobilePanel.matches) return; const r = e.features?.[0] ? refOf(e.features[0]) : null; if (r) showPoint(r); });
      map.on("mouseleave", layer, () => schedulePointClose());
    }
    for (const layer of [...POINT_LAYERS, "cells"]) {
      map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
    }
    map.on("click", (e) => {
      const hit = map.queryRenderedFeatures(e.point, { layers: [...POINT_LAYERS, "cells"] });
      const pt = hit.find((f) => f.layer.id !== "cells");
      const r = pt ? refOf(pt) : null;
      if (r) { showPoint(r, true); return; }
      closePoint();
      const id = hit.find((f) => f.layer.id === "cells")?.id;
      if (typeof id === "number" && scores) select(id);
      else if (sheet?.snap() === "max") sheet.set("mid");   // toque en el mar o en el espacio: el menú baja a la mitad
    });

    mapReady = true;
    paint();
    $("#loading").hidden = true;
    loadCoastlines();
    loadUsgs();
  });
}

/** Contornos de continentes (Natural Earth 1:50m, dominio público): capa sutil, cargada en diferido. */
async function loadCoastlines() {
  try {
    const coast = await fetch("data/coast50m.json").then((r) => r.json());
    map.addSource("coast", { type: "geojson", data: coast });
    map.addLayer({ id: "coast", type: "line", source: "coast", paint: {
      "line-color": "#FFFFFF", "line-opacity": 0.28,
      "line-width": ["interpolate", ["linear"], ["zoom"], 0, 0.5, 6, 1.2],
    } }, "cells");
  } catch { /* capa decorativa: si falla la descarga, el mapa sigue funcionando */ }
}

function paint() {
  if (!mapReady || !scores) return;
  const s: maplibregl.ExpressionSpecification = ["coalesce", ["feature-state", "s"], 0];
  // el umbral del modo decide qué se ve tenue (parcial) y qué con fuerza (análogo)
  map.setPaintProperty("cells", "fill-opacity", ["case", [">=", s, thr], OP_ANALOG, [">=", s, MIN_SHOW], OP_PARTIAL, 0]);
  for (let c = 0; c < ds.n; c++) {
    const v = scores.score[c];
    map.setFeatureState({ source: "cells", id: c }, { s: Number.isNaN(v) ? 0 : v });
  }
}

/** Recalcula los 12 meses (cambió el modo o un peso). */
function recompute() {
  year = scoreModeYear(ds.n, ds.get, parts, thr);
  refresh(false);
}

/** Cambia de mes sobre el año ya calculado: instantáneo. `pulse` anima el relevo en el mapa. */
function refresh(pulse: boolean) {
  if (!year) return;
  scores = pickMonth(year, state.month);
  const el = $("#map");
  if (pulse) el.classList.add("updating");
  paint();
  if (pulse) window.setTimeout(() => el.classList.remove("updating"), 60); // el fundido de vuelta lo hace la transición CSS
  renderMonths(); renderWhat(); renderSpecs(); renderCandidates(); renderLegend();
  if (state.selected >= 0) renderCard(state.selected);
}

// ------------------------------------------------------------------ modo
function setMode(d: Destination, m: Mission) {
  state.d = d; state.m = m;
  parts = resolveMode(getMode(d, m), ds.m.profiles);
  thr = modeThreshold(parts);
  history.replaceState(null, "", withModeQuery(location.search, d, m) + location.hash); // compartible
  $("#app").classList.add("has-mode");
  if (isFlat()) { state.month = -1; state.monthGrid = false; }
  closePoint();
  renderPickers(); renderWeights();
  recompute();
}

// ------------------------------------------------------------------ init
function wire() {
  $("#pick-dest").addEventListener("click", () => togglePicker("dest"));
  $("#pick-mission").addEventListener("click", () => togglePicker("mission"));
  $("#month-best").addEventListener("click", () => setMonth(-1));
  $("#month-pick").addEventListener("click", () => { state.monthGrid = !state.monthGrid; renderMonths(); });
  $("#reset").addEventListener("click", () => {
    parts = resolveMode(getMode(state.d!, state.m!), ds.m.profiles);
    renderWeights(); recompute();
  });
  $("#btn-method").addEventListener("click", () => openMethod());
  const tipsBtn = $<HTMLButtonElement>("#tips-toggle");
  const syncTips = (on: boolean) => tipsBtn.setAttribute("aria-checked", String(on));
  syncTips(tipsEnabled());
  tipsBtn.addEventListener("click", () => setTipsEnabled(!tipsEnabled()));
  onTipsChange((on) => { syncTips(on); if (!on) schedulePointClose(true); });
  $("#btn-continents").addEventListener("click", () => setContinentMenu($("#continents").hidden));
  // Jakob: Esc y clic fuera cierran el desplegable de destino/misión
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePoint();
    if (e.key === "Escape" && state.picker) { const k = state.picker; state.picker = null; renderPickers(); $(`#pick-${k}`).focus(); }
    if (e.key === "Escape" && !$("#continents").hidden) { setContinentMenu(false); $("#btn-continents").focus(); }
  });
  document.addEventListener("pointerdown", (e) => {
    if (state.picker && !(e.target as Element).closest(".pickers")) { state.picker = null; renderPickers(); }
    if (!$("#continents").hidden && !(e.target as Element).closest("#continents, #btn-continents")) setContinentMenu(false);
  });
}

async function init() {
  let stored: string | null = null;
  try { stored = localStorage.getItem(LANG_KEY); } catch { /* sin almacenamiento */ }
  setLang(detectLang(location.search, stored));
  applyStatic();
  initTips();

  const data = loadDataset(); // se descarga mientras la persona elige
  // créditos de las fotos: archivo pequeño; las imágenes solo se piden al abrir el visor
  fetch("img/sites/credits.json").then((r) => (r.ok ? r.json() : null))
    .then((j) => { if (j?.sites) photos = j.sites; }).catch(() => { /* sin fotos: la app sigue igual */ });
  const fromUrl = parseModeQuery(location.search);
  const choice = fromUrl ? Promise.resolve(fromUrl) : openOnboarding(null, changeLang);
  try {
    ds = await data;
  } catch (err) {
    $("#loading").textContent = t("loading.error");
    throw err;
  }
  for (let c = 0; c < ds.n; c++) cellIndex.set(ds.ci[c] * 4096 + ds.cj[c], c);
  wire();
  buildMap();
  sheet = initSheet($("#panel"), $("#panel-scroll"), {
    limit: () => $("#when-sec"),
    minVisible: () => $("#panel-toggle").offsetHeight,
    // el globo se centra en la parte del mapa que deja libre la hoja
    onChange: (_s, visible) => { map.easeTo({ padding: { top: 0, bottom: Math.round(visible * 0.85), left: 0, right: 0 }, duration: 500 }); },
  });
  $("#loading").classList.add("mini"); // datos listos: el panel ya se puede usar mientras termina el mapa
  const c = await choice;
  setMode(c.d, c.m);
}

// Gancho de depuración, solo en desarrollo local: permite comprobar el mapa desde la consola.
if (["localhost", "127.0.0.1"].includes(location.hostname)) {
  (globalThis as { __lumea?: unknown }).__lumea = { map: () => map, select, showPoint, closePoint, openPhoto, usgs: () => usgs };
}

init();
