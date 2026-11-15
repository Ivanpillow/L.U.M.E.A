// Onboarding en 2 pasos: destino -> misión. Dos clics y el mapa ya tiene resultados.
// Usa <dialog>.showModal(): foco atrapado dentro y Esc nativos.
import { closeOnBackdrop, esc } from "./dom.ts";
import { ICON, UI } from "./icons.ts";
import { LANGS, getLang, num, t, tOpt, type Lang } from "./i18n.ts";
import { DESTINATIONS, MARS_BASE_SCALE, MISSIONS, MODES, getMode, type Destination, type Mission } from "./modes.ts";

export interface ModeChoice { d: Destination; m: Mission }
export const DEFAULT_MODE: ModeChoice = { d: "luna", m: "aterrizaje" };

/** Resuelve con el modo elegido. Esc / clic fuera / "Saltar" => modo actual o, si no hay, el de por defecto. */
export function openOnboarding(current: ModeChoice | null, onLang: (l: Lang) => void): Promise<ModeChoice> {
  return new Promise((resolve) => {
    const dlg = document.createElement("dialog");
    dlg.className = "onb";
    dlg.setAttribute("aria-labelledby", "onb-title");
    document.body.append(dlg);

    let step: 1 | 2 = 1;
    let dest: Destination = current?.d ?? DEFAULT_MODE.d;

    const finish = (c: ModeChoice) => { dlg.close(); dlg.remove(); resolve(c); };
    const dismiss = () => finish(current ?? DEFAULT_MODE);
    const names = (ids: string[]) => ids.map((id) => tOpt(`pshort.${id}`, id)).join(" · ");
    const loads = (ids: string[]) =>
      t(ids.length === 1 ? "onb.loads.profile" : "onb.loads.profiles", { n: ids.length, list: names(ids) });
    const destProfiles = (d: Destination) =>
      [...new Set(MODES.filter((x) => x.d === d).flatMap((x) => x.parts.map((p) => p.profile)))];

    const option = (value: string, icon: string, name: string, sub: string, what: string, load: string, on: boolean) => `
      <button type="button" class="onb-opt" data-v="${value}" aria-pressed="${on}">
        <span class="ico">${icon}</span>
        <span class="ttl">${esc(name)}${sub ? ` <small>${esc(sub)}</small>` : ""}</span>
        <span class="what">${esc(what)}</span>
        <span class="loads"><b>${esc(t("onb.loads"))}</b> ${esc(load)}</span>
      </button>`;

    function render() {
      const opts = step === 1
        ? DESTINATIONS.map((d) => option(d, ICON[d], t(`dest.${d}.name`), t(`dest.${d}.sub`), t(`dest.${d}.what`),
            loads(destProfiles(d)), current?.d === d))
        : MISSIONS.map((m) => option(m, ICON[m], t(`mission.${m}.name`), "",
            t(`mode.${dest}.${m}.what`, { f: num(MARS_BASE_SCALE, 1) }),
            loads(getMode(dest, m).parts.map((p) => p.profile)), current?.d === dest && current.m === m));
      dlg.innerHTML = `<div class="onb-in" data-step="${step}">
        <header class="onb-head">
          <span class="onb-step" aria-live="polite">${esc(t("onb.step", { n: step }))}${step === 2 ? ` · ${esc(t(`dest.${dest}.name`))}` : ""}</span>
          <span class="onb-dots" aria-hidden="true"><i class="on"></i><i class="${step === 2 ? "on" : ""}"></i></span>
          <span class="lang" role="group" aria-label="${esc(t("lang.label"))}">${LANGS.map((l) =>
            `<button type="button" data-lang="${l}" aria-pressed="${l === getLang()}">${l.toUpperCase()}</button>`).join("")}</span>
        </header>
        <h2 id="onb-title">${esc(t(step === 1 ? "onb.q1" : "onb.q2"))}</h2>
        <p class="onb-sub">${esc(t(step === 1 ? "onb.q1.sub" : "onb.q2.sub"))}</p>
        <div class="onb-opts">${opts.join("")}</div>
        <footer class="onb-foot">
          ${step === 2 ? `<button type="button" class="link back" data-act="back"><span class="ui" aria-hidden="true">${UI.chevron}</span>${esc(t("onb.back"))}</button>` : "<span></span>"}
          <button type="button" class="link" data-act="skip">${esc(t(current ? "onb.cancel" : "onb.skip"))}</button>
        </footer></div>`;

      dlg.querySelectorAll<HTMLButtonElement>(".onb-opt").forEach((b) => b.addEventListener("click", () => {
        if (step === 1) { dest = b.dataset.v as Destination; step = 2; render(); }
        else finish({ d: dest, m: b.dataset.v as Mission });
      }));
      dlg.querySelector('[data-act="back"]')?.addEventListener("click", () => { step = 1; render(); });
      dlg.querySelector('[data-act="skip"]')!.addEventListener("click", dismiss);
      dlg.querySelectorAll<HTMLButtonElement>("[data-lang]").forEach((b) => b.addEventListener("click", () => {
        onLang(b.dataset.lang as Lang); render();
      }));
      // Fitts + teclado: el foco cae en la opción ya elegida o en la primera.
      (dlg.querySelector<HTMLElement>('.onb-opt[aria-pressed="true"]') ?? dlg.querySelector<HTMLElement>(".onb-opt"))?.focus();
    }

    dlg.addEventListener("cancel", (e) => { e.preventDefault(); dismiss(); }); // Esc
    closeOnBackdrop(dlg, dismiss);
    dlg.showModal();
    render();
  });
}
