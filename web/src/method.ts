// Modal "Método, límites y fuentes": casi a pantalla completa, con índice lateral fijo y scrollspy.
// Se carga en diferido (import dinámico) la primera vez que se abre.
import { closeOnBackdrop, esc } from "./dom.ts";
import type { Dataset } from "./data.ts";
import { UI } from "./icons.ts";
import { num, t, td, type Key } from "./i18n.ts";
import { MARS_BASE_SCALE } from "./modes.ts";
import { MIN_COVERAGE } from "./scoring.ts";
import { tip } from "./tip.ts";

const SECTIONS = ["what", "model", "val", "limits", "sources", "ai", "team"] as const;
let wired = false;
let spy: IntersectionObserver | null = null;

export function openMethod(ds: Dataset, section?: string) {
  const dlg = document.querySelector("#method") as HTMLDialogElement;
  const pct = (x: number | null | undefined, digits: number) => (x == null ? "–" : num(x, digits));
  const f = num(MARS_BASE_SCALE, 1);
  const cov = num((ds.m.min_coverage ?? MIN_COVERAGE) * 100);
  const thr = num(ds.m.profiles[0]?.analog_threshold ?? 0.6, 2);
  const ns = ds.m.profiles.map((p) => p.validation?.n_known ?? 0).filter((n) => n > 0);
  const badge = (cls: string, text: string, why: string) => `<span class="badge ${cls}" tabindex="0" ${tip(why)}>${esc(text)}</span>`;
  const val = ds.m.profiles.map((p) => p.validation ? `<tr><td>${esc(td(p.label))}</td>
      <td>${pct(p.validation.known_median_pct, 0)} (n = ${p.validation.n_known})</td>
      <td>${pct(p.validation.tropics_pct, 1)} %</td><td>${pct(p.validation.analog_land_pct, 1)} %</td>
      <td>${num(p.validation.jaccard, 2)}</td></tr>` : "").join("");
  const formula = (label: Key, code: string) => `<li><span>${esc(t(label))}</span><code>${code}</code></li>`;
  const step = (h: Key, p: Key, vars?: Record<string, string | number>) => `<h5>${esc(t(h))}</h5><p>${t(p, vars)}</p>`;
  const li = (keys: Key[], vars?: Record<string, string | number>) => keys.map((k) => `<li>${t(k, vars)}</li>`).join("");

  dlg.setAttribute("aria-labelledby", "method-title");
  dlg.innerHTML = `<div class="method-shell">
  <header class="method-head">
    <h3 id="method-title">${esc(t("method.title"))}</h3>
    <button type="button" class="close" aria-label="${esc(t("method.close"))}">${UI.cross}</button>
  </header>
  <nav class="method-nav" aria-label="${esc(t("method.nav"))}">
    ${SECTIONS.map((s) => `<a href="#m-${s}" data-sec="m-${s}">${esc(t(`method.s.${s}`))}</a>`).join("")}
  </nav>
  <div class="method-body" tabindex="0">
    <section id="m-what"><h4>${esc(t("method.s.what"))}</h4>
      <p>${t("method.intro")}</p>
      <p>${t("method.what.2")}</p>
      <p>${esc(t("method.modes.p", { f }))}</p>
    </section>

    <section id="m-model"><h4>${esc(t("method.s.model"))}</h4>
      ${step("method.f.member.h", "method.f.member.p")}
      <ul class="formulas">
        ${formula("method.f.up", "s = clamp((x − a) / (b − a), 0, 1)")}
        ${formula("method.f.down", "s = clamp((b − x) / (b − a), 0, 1)")}
        ${formula("method.f.band", "s = clamp(min((x − a) / (b − a), (d − x) / (d − c)), 0, 1)")}
      </ul>
      ${step("method.f.mean.h", "method.f.mean.p")}
      ${step("method.f.gate.h", "method.f.gate.p")}
      ${step("method.f.cov.h", "method.f.cov.p", { cov })}
      ${step("method.f.pct.h", "method.f.pct.p")}
      ${step("method.f.mode.h", "method.f.mode.p", { thr })}
      <h5>${esc(t("method.comp.h"))}</h5>
      <ul><li>${badge("D", "D", t("comp.D"))} ${esc(t("method.comp.D"))}</li>
      <li>${badge("R", "R", t("comp.R"))} ${esc(t("method.comp.R"))}</li>
      <li>${badge("N", "N", t("comp.N"))} ${esc(t("method.comp.N"))}</li>
      <li>${badge("proxy", t("badge.proxy"), t("badge.proxy.title"))} ${esc(t("method.comp.proxy"))}
        ${badge("proxy", t("badge.unverified"), t("badge.unverified.title"))} ${esc(t("method.comp.unverified"))}</li></ul>
    </section>

    <section id="m-val"><h4>${esc(t("method.val.h"))}</h4>
      <div class="table-wrap"><table><tr><th>${esc(t("method.val.th.profile"))}</th><th>${esc(t("method.val.th.known"))}</th>
        <th>${esc(t("method.val.th.tropics"))}</th><th>${esc(t("method.val.th.land"))}</th><th>${esc(t("method.val.th.jaccard"))}</th></tr>${val}</table></div>
      <p>${t("method.val.def")}</p>
      <p class="note">${esc(t("method.val.note"))}</p>
    </section>

    <section id="m-limits"><h4>${esc(t("method.s.limits"))}</h4>
      <h5>${esc(t("method.limits.h"))}</h5>
      <ul>${li(["method.limits.1", "method.limits.2", "method.limits.3", "method.limits.4", "method.limits.5", "method.limits.6"])}
        <li>${t("method.limits.7", { n: ds.m.known.length })}${ds.m.known_verified ? "" : t("method.limits.7.usgs")}.</li></ul>
      <h5>${esc(t("method.bias.h"))}</h5>
      <ul>${li(["method.bias.1", "method.bias.2", "method.bias.3", "method.bias.4", "method.bias.5", "method.bias.6",
        "method.bias.7", "method.bias.8", "method.bias.9"], { f, nmin: Math.min(...ns), nmax: Math.max(...ns) })}</ul>
    </section>

    <section id="m-sources"><h4>${esc(t("method.s.sources"))}</h4>
      <ul>${Object.values(ds.m.sources).map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join("")}
        ${li(["method.sources.basemap", "method.sources.coast", "method.sources.photos", "method.sources.names", "method.sources.fonts"])}</ul>
    </section>

    <section id="m-ai"><h4>${esc(t("method.s.ai"))}</h4>
      <p>${esc(t("method.ai.p"))}</p>
    </section>

    <section id="m-team"><h4>${esc(t("method.s.team"))}</h4>
      <p>${esc(t("method.team.p"))}</p>
      <p class="note">${esc(t("method.team.pending"))}</p>
    </section>
  </div></div>`;

  const body = dlg.querySelector<HTMLElement>(".method-body")!;
  const links = [...dlg.querySelectorAll<HTMLAnchorElement>(".method-nav a")];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const go = (id: string, smooth: boolean) =>
    dlg.querySelector(`#${id}`)?.scrollIntoView({ block: "start", behavior: smooth && !reduced ? "smooth" : "auto" });
  const mark = (id: string) => links.forEach((a) => {
    if (a.dataset.sec === id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
  });
  links.forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); go(a.dataset.sec!, true); mark(a.dataset.sec!); }));

  // scrollspy: resalta en el índice la sección que ocupa la parte alta del panel de lectura
  spy?.disconnect();
  spy = new IntersectionObserver((entries) => {
    const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (top) mark(top.target.id);
  }, { root: body, rootMargin: "0px 0px -65% 0px", threshold: 0 });
  dlg.querySelectorAll(".method-body > section").forEach((s) => spy!.observe(s));

  dlg.querySelector(".close")!.addEventListener("click", () => dlg.close());
  if (!wired) { closeOnBackdrop(dlg, () => dlg.close()); wired = true; }
  dlg.showModal();
  mark(section ?? "m-what");
  if (section) go(section, false); else body.scrollTop = 0;
}
