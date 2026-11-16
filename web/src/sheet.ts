// Menú lateral como hoja inferior en el teléfono (≤ 860 px), con tres alturas: mínima, media y completa.
// - Empieza en la media, para poder usar el mapa a la vez.
// - Al desplazar hacia abajo, el contenido se mueve hasta que «Cuándo» llega al borde superior de la
//   hoja; desde ahí, el mismo gesto estira la hoja hasta la altura completa (a la altura del zoom).
// - Arrastrar hacia abajo con el contenido arriba la encoge: a la media o a la mínima.
// - El dedo arrastra la hoja 1:1; al soltar, se asienta en la altura más cercana teniendo en cuenta la
//   velocidad, con una curva suave (no un salto).
export type Snap = "min" | "mid" | "max";

const TOP = 60;            // borde superior de la hoja abierta del todo: la altura de los botones de zoom
const MID = 0.5;           // la altura media ocupa la mitad de la pantalla

export interface Sheet { set(s: Snap): void; snap(): Snap; active(): boolean }

export function initSheet(panel: HTMLElement, scroller: HTMLElement, opts: {
  limit: () => HTMLElement | null;           // elemento que, al llegar arriba, hace crecer la hoja
  minVisible: () => number;                  // alto visible en la altura mínima
  onChange?: (s: Snap, visible: number) => void;
}): Sheet {
  const mq = matchMedia("(max-width: 860px)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let snap: Snap = "mid";
  let y = 0;

  const H = () => window.innerHeight - TOP;
  const posOf = (s: Snap) => s === "max" ? 0 : s === "mid" ? Math.max(0, H() - Math.round(window.innerHeight * MID)) : Math.max(0, H() - opts.minVisible());
  const limitTop = () => {
    const el = opts.limit();
    // posición de «Cuándo» dentro del contenido desplazable
    return el ? Math.max(0, el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 8) : 0;
  };

  function place(v: number, animate: boolean) {
    y = v;
    panel.style.transition = animate && !reduced.matches ? "" : "none";
    panel.style.transform = `translate3d(0, ${Math.round(v)}px, 0)`;
  }

  function set(s: Snap) {
    if (!mq.matches) return;
    snap = s;
    panel.dataset.snap = s;
    if (s !== "max") scroller.scrollTo({ top: 0, behavior: reduced.matches ? "auto" : "smooth" });
    place(posOf(s), true);
    opts.onChange?.(s, H() - posOf(s));
  }

  function settle(velocity: number) {
    // proyecta el movimiento 160 ms hacia delante y elige la altura más cercana a ese punto
    const projected = y + velocity * 160;
    const order: Snap[] = ["max", "mid", "min"];
    const best = order.reduce((a, b) => (Math.abs(posOf(b) - projected) < Math.abs(posOf(a) - projected) ? b : a));
    set(best);
  }

  function reset() {
    if (mq.matches) { panel.classList.add("sheet"); set(snap); }
    else { panel.classList.remove("sheet"); panel.style.transform = ""; panel.style.transition = ""; delete panel.dataset.snap; }
  }

  // ---- gestos táctiles
  let lastY = 0, lastT = 0, vel = 0, moved = false, tracking = false;
  panel.addEventListener("touchstart", (e) => {
    if (!mq.matches || e.touches.length !== 1) return;
    if ((e.target as Element).closest('input[type="range"], .mgrid, .method-nav')) { tracking = false; return; }
    tracking = true; moved = false;
    lastY = e.touches[0].clientY; lastT = performance.now(); vel = 0;
  }, { passive: true });

  panel.addEventListener("touchmove", (e) => {
    if (!tracking || !mq.matches) return;
    const cy = e.touches[0].clientY, now = performance.now();
    const dy = cy - lastY;                       // > 0: el dedo baja
    const dt = Math.max(1, now - lastT);
    lastY = cy; lastT = now;
    let handled = false;
    if (dy < 0 && y > 0) {
      // el dedo sube con la hoja sin abrir del todo: primero el contenido hasta «Cuándo», luego la hoja
      let rest = -dy;
      const lim = limitTop();
      if (scroller.scrollTop < lim) { const use = Math.min(lim - scroller.scrollTop, rest); scroller.scrollTop += use; rest -= use; }
      if (rest > 0) place(Math.max(0, y - rest), false);
      handled = true;
    } else if (dy > 0 && (scroller.scrollTop <= 0 || y > 0)) {
      // el dedo baja: si el contenido aún no está arriba del todo (hoja media), primero se recoge
      let rest = dy;
      if (y > 0 && scroller.scrollTop > 0) { const use = Math.min(scroller.scrollTop, rest); scroller.scrollTop -= use; rest -= use; }
      if (rest > 0) place(Math.min(posOf("min"), y + rest), false);
      handled = true;
    }
    if (handled) {
      moved = true;
      vel = 0.8 * (dy / dt) + 0.2 * vel;
      if (e.cancelable) e.preventDefault();
    }
  }, { passive: false });

  const end = () => {
    if (!tracking) return;
    tracking = false;
    if (moved) settle(vel);
  };
  panel.addEventListener("touchend", end);
  panel.addEventListener("touchcancel", end);

  // ---- asa: arrastre con ratón o lápiz (y toque en el asa para alternar)
  const grip = panel.querySelector<HTMLElement>(".panel-handle");
  if (grip) {
    let startY = 0, startPos = 0, dragging = false, gMoved = false, gLastY = 0, gLastT = 0, gVel = 0;
    grip.addEventListener("pointerdown", (e) => {
      if (!mq.matches || e.pointerType === "touch") return;
      dragging = true; gMoved = false; startY = gLastY = e.clientY; startPos = y; gLastT = performance.now(); gVel = 0;
      grip.setPointerCapture(e.pointerId);
    });
    grip.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const now = performance.now();
      gVel = (e.clientY - gLastY) / Math.max(1, now - gLastT); gLastY = e.clientY; gLastT = now;
      if (Math.abs(e.clientY - startY) > 3) gMoved = true;
      place(Math.min(posOf("min"), Math.max(0, startPos + e.clientY - startY)), false);
    });
    grip.addEventListener("pointerup", () => {
      if (!dragging) return;
      dragging = false;
      if (gMoved) settle(gVel);
    });
    grip.addEventListener("click", () => {
      if (gMoved) { gMoved = false; return; }
      set(snap === "max" ? "mid" : snap === "mid" ? "max" : "mid");
    });
  }

  // ---- rueda (pantallas estrechas con ratón o trackpad)
  panel.addEventListener("wheel", (e) => {
    if (!mq.matches) return;
    if (e.deltaY > 0 && snap !== "max") {
      e.preventDefault();
      if (scroller.scrollTop < limitTop()) scroller.scrollTop = Math.min(limitTop(), scroller.scrollTop + e.deltaY);
      else set("max");
    } else if (e.deltaY < 0 && snap === "max" && scroller.scrollTop <= 0) {
      e.preventDefault(); set("mid");
    }
  }, { passive: false });

  mq.addEventListener("change", reset);
  window.addEventListener("resize", () => { if (mq.matches) place(posOf(snap), false); });
  reset();
  return { set, snap: () => snap, active: () => mq.matches };
}
