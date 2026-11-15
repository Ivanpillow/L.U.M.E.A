// Iconos de línea propios (SVG en línea, heredan el color del texto). Decorativos: aria-hidden.
const svg = (body: string) =>
  `<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

export const ICON = {
  // Luna: disco con cráteres y el polo sur marcado
  luna: svg(`<circle cx="24" cy="24" r="17"/><circle cx="17.5" cy="17" r="3.5"/><circle cx="29.5" cy="14.5" r="2"/><circle cx="30" cy="26" r="4.5"/><path d="M18 36.5c3.5 2.5 8.500 2.500 12 0" stroke-dasharray="1 3.500"/><path d="M24 41v4"/>`),
  // Marte: disco con casquete polar y relieve
  marte: svg(`<circle cx="24" cy="24" r="17"/><path d="M13.500 11c5 3.500 16 3.500 21 0"/><path d="M8 28c5-3 9 2.500 14 0s8-3.500 18-1"/><circle cx="18" cy="20" r="2"/><circle cx="31" cy="34" r="2.500"/>`),
  // Aterrizaje: módulo descendiendo sobre el suelo
  aterrizaje: svg(`<path d="M24 4v7M18 6.500v3.500M30 6.500v3.500"/><path d="M19 23v-6h10v6"/><path d="M16 23h16l3 8H13z"/><path d="M15 31l-4 9M33 31l4 9M8 40h6M34 40h6"/><path d="M21 31l-1.500 4h9L27 31"/>`),
  // Base: cúpula habitable con esclusa y antena
  base: svg(`<path d="M4 38h40"/><path d="M9 38a15 15 0 0 1 30 0"/><path d="M20.500 38v-6.500a3.500 3.500 0 0 1 7 0V38"/><path d="M13.500 28.500h21"/><path d="M39 23v-9M35.500 14.500a3.500 3.500 0 0 1 7 0"/>`),
} as const;

/** Semáforo: icono + texto siempre juntos (nunca solo color). */
const ui = (body: string) =>
  `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

/** Iconos pequeños de interfaz (16 px, mismo trazo). */
export const UI = {
  chevron: ui('<path d="M4 6l4 4 4-4"/>'),
  star: ui('<path d="M8 2.2l1.8 3.6 4 .6-2.9 2.8.7 3.9L8 11.2l-3.600 1.900.700-3.900L2.200 6.400l4-.600z"/>'),
  check: ui('<path d="M3.500 8.500l3 3 6-7"/>'),
  approx: ui('<path d="M3 6.500c1.600-1.600 3.300-1.600 5 0s3.400 1.600 5 0M3 10.500c1.600-1.600 3.300-1.600 5 0s3.400 1.600 5 0"/>'),
  cross: ui('<path d="M4 4l8 8M12 4l-8 8"/>'),
  minus: ui('<path d="M4 8h8"/>'),
  info: ui('<circle cx="8" cy="8" r="6.250"/><path d="M8 7.500v3.500M8 5v.010"/>'),
  gate: ui('<rect x="3.500" y="7" width="9" height="6.500" rx="1.500"/><path d="M5.500 7V5a2.500 2.500 0 0 1 5 0v2"/>'),
  peak: ui('<path d="M3 10.500l5-5.500 5 5.500"/>'),
  ext: ui('<path d="M6.500 3.500h-3v9h9v-3M9 3.500h3.500V7M12.500 3.500l-5 5"/>'),
  globe: ui('<circle cx="8" cy="8" r="6.250"/><path d="M1.750 8h12.500M8 1.750c2.200 2.100 2.200 10.400 0 12.500M8 1.750c-2.200 2.100-2.200 10.400 0 12.500"/>'),
  copy: ui('<rect x="5.500" y="5.500" width="8" height="8" rx="1.500"/><path d="M10.500 5.500v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"/>'),
  photo: ui('<rect x="2" y="3" width="12" height="10" rx="1.500"/><circle cx="5.750" cy="6.500" r="1.250"/><path d="M2.500 11.500l3.500-3 2.500 2 2-1.500 3 2.500"/>'),
  warn: ui('<path d="M8 2.500l6 10.500H2z"/><path d="M8 6.500v3M8 11.250v.010"/>'),
  swap: ui('<path d="M2.500 6h9.500l-2.500-2.500M13.500 10H4l2.500 2.500"/>'),
} as const;

/** Semáforo: icono + texto siempre juntos (nunca solo color). */
export const LIGHT_ICON = { strong: UI.check, partial: UI.approx, broken: UI.cross, nodata: UI.minus } as const;

/** Marca de Lumea: la Tierra (disco) con un creciente que la roza: un mundo que ensaya a otro. */
export const LOGO = `<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="14" fill="currentColor"/><circle cx="21" cy="12" r="9" fill="var(--logo-cut, #05070d)"/></svg>`;
