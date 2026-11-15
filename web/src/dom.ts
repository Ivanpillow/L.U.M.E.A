export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector(sel) as T;

export const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Cierra un <dialog> al hacer clic en el fondo (fuera del contenido). */
export function closeOnBackdrop(dlg: HTMLDialogElement, onClose: () => void) {
  dlg.addEventListener("click", (e) => { if (e.target === dlg) onClose(); });
}

/** Identificador de archivo de un sitio (igual que scripts/fetch-site-photos.mjs). */
export const slug = (name: string) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
