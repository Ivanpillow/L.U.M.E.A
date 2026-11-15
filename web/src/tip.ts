// Tooltip propio para todo elemento con [data-tip]: aparece al pasar el cursor, al enfocar con
// teclado y al tocar. Usa la Popover API para quedar por encima de los <dialog> modales.
import { esc } from "./dom.ts";

/** Atributos para un elemento con explicación emergente. */
export const tip = (text: string) => `data-tip="${esc(text)}"`;

export function initTips() {
  const box = document.createElement("div");
  box.id = "tip";
  box.setAttribute("role", "tooltip");
  const canPop = typeof box.showPopover === "function";
  if (canPop) box.setAttribute("popover", "manual"); else box.hidden = true;
  document.body.append(box);
  let cur: Element | null = null;

  const hide = () => {
    if (!cur) return;
    cur = null;
    if (canPop) { if (box.matches(":popover-open")) box.hidePopover(); } else box.hidden = true;
  };

  const show = (el: HTMLElement) => {
    if (el === cur) return;
    hide();
    cur = el;
    box.textContent = el.dataset.tip ?? "";
    if (canPop) box.showPopover(); else box.hidden = false;
    // colocar: encima del elemento si cabe; si no, debajo. Siempre dentro de la ventana.
    const r = el.getBoundingClientRect(), b = box.getBoundingClientRect(), gap = 8;
    const x = Math.min(Math.max(8, r.left + r.width / 2 - b.width / 2), window.innerWidth - b.width - 8);
    const above = r.top - b.height - gap;
    const y = above >= 8 ? above : Math.min(r.bottom + gap, window.innerHeight - b.height - 8);
    box.style.left = `${Math.round(x)}px`;
    box.style.top = `${Math.round(y)}px`;
  };

  const target = (e: Event) => (e.target instanceof Element ? e.target.closest<HTMLElement>("[data-tip]") : null);
  document.addEventListener("pointerover", (e) => { const el = target(e); if (el) show(el); else hide(); });
  document.addEventListener("focusin", (e) => { const el = target(e); if (el) show(el); else hide(); });
  document.addEventListener("pointerdown", (e) => { if (!target(e)) hide(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  document.addEventListener("scroll", hide, true);
  window.addEventListener("blur", hide);
}
