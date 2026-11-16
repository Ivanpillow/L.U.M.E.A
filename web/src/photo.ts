// Visor de fotos de los análogos documentados. Se carga en diferido (import dinámico) y la imagen
// solo se descarga al abrir el visor. El crédito va siempre visible bajo la foto.
import { closeOnBackdrop, esc } from "./dom.ts";
import { UI } from "./icons.ts";
import { t } from "./i18n.ts";

export interface PhotoCredit {
  name: string;
  file: string;
  source: string;
  layer: string;
  layer_title: string;
  sensor: string;
  date: string;
  resolution_m: number;
  width_km: number;
  license: string;
  url: string;
}

/** `coordsNote`: de dónde sale la coordenada en la que se centra la imagen (aproximada o capa USGS). */
export function openPhoto(name: string, p: PhotoCredit, coordsNote: string) {
  const dlg = document.createElement("dialog");
  dlg.className = "photo";
  dlg.setAttribute("aria-labelledby", "photo-title");
  dlg.innerHTML = `<button type="button" class="close" aria-label="${esc(t("photo.close"))}">${UI.cross}</button>
    <figure class="photo-in">
    <img src="img/sites/${esc(p.file)}" alt="${esc(t("photo.alt", { name }))}" width="960" height="640" decoding="async" />
    <figcaption>
      <b id="photo-title">${esc(name)}</b>
      <span>${esc(t("photo.frame", { km: p.width_km, res: p.resolution_m }))} · ${esc(coordsNote)}</span>
      <span class="credit">${esc(t("photo.credit"))} <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.source)}</a> ·
        ${esc(p.layer_title)} · ${esc(p.sensor)} · ${esc(t("photo.license"))}</span>
    </figcaption></figure>`;
  document.body.append(dlg);
  const close = () => { dlg.close(); dlg.remove(); };
  dlg.querySelector(".close")!.addEventListener("click", close);
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); }); // Esc
  closeOnBackdrop(dlg, close);
  dlg.showModal();
}
