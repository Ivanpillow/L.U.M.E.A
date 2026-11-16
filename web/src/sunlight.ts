// Iluminación escénica fija; no representa la hora ni el mes de los datos científicos.
// La misma dirección alimenta la superficie y la dispersión atmosférica de MapLibre.
const RAD = Math.PI / 180;
export const SUN = { lng: -35, lat: 25 } as const;
const sunX = Math.sin(SUN.lng * RAD) * Math.cos(SUN.lat * RAD);
const sunY = Math.sin(SUN.lat * RAD);
const sunZ = Math.cos(SUN.lng * RAD) * Math.cos(SUN.lat * RAD);
export const SUN_LIGHT_POSITION: [number, number, number] = [
  1.5, (Math.atan2(sunX, -sunY) / RAD + 360) % 360, Math.acos(-sunZ) / RAD,
];

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Producto normal · sol: la luz sigue la esfera al girar, sin gradientes de pantalla. */
export function solarIncidence(lng: number, lat: number): number {
  return Math.sin(lat * RAD) * sunY
    + Math.cos(lat * RAD) * Math.cos(SUN.lat * RAD) * Math.cos((lng - SUN.lng) * RAD);
}

/** Sombras azul profundo y un rebote cálido tenue, conservando la textura de Blue Marble. */
export function sunlightColor(incidence: number): [number, number, number, number] {
  const shadow = 0.46 * (1 - smoothstep(-0.3, 0.85, incidence));
  const warmth = 0.045 * smoothstep(-0.15, 0.1, incidence) * (1 - smoothstep(0.15, 0.75, incidence))
    + 0.022 * smoothstep(0.3, 1, incidence);
  const alpha = warmth + shadow * (1 - warmth);
  const mix = (dark: number, warm: number) => Math.round((warm * warmth + dark * shadow * (1 - warmth)) / alpha);
  return [mix(5, 255), mix(12, 181), mix(27, 104), Math.round(alpha * 255)];
}

/** Teselas locales pequeñas: sin descargas, animación continua ni una segunda escena 3D. */
export async function sunlightTile(z: number, x: number, y: number, signal: AbortSignal): Promise<ArrayBuffer> {
  signal.throwIfAborted();
  const size = 128, scale = 2 ** z;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Sunlight canvas is unavailable");
  const pixels = ctx.createImageData(size, size);
  for (let row = 0; row < size; row++) {
    const mercatorY = (y + (row + 0.5) / size) / scale;
    const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * mercatorY))) / RAD;
    for (let col = 0; col < size; col++) {
      const lng = (x + (col + 0.5) / size) / scale * 360 - 180;
      pixels.data.set(sunlightColor(solarIncidence(lng, lat)), (row * size + col) * 4);
    }
  }
  ctx.putImageData(pixels, 0, 0);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
    (value) => value ? resolve(value) : reject(new Error("Sunlight tile encoding failed")), "image/png",
  ));
  signal.throwIfAborted();
  return blob.arrayBuffer();
}
