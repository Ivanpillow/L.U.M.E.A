// Descarga una imagen satelital true-color de cada análogo documentado desde NASA Worldview Snapshots
// (GIBS) y escribe web/public/img/sites/<slug>.jpg + credits.json (fuente, fecha, capa, licencia).
//
//   Uso:  npm run photos            (desde web/)
//         npm run photos -- --force (vuelve a descargar las que ya existen)
//
// Fuente principal: compuesto anual Landsat WELD (30 m, sin nubes). Si el sitio queda fuera de su
// cobertura (imagen negra), se usa Blue Marble Next Generation (MODIS, 500 m) con un encuadre mayor.
// Sin dependencias: Node >= 20 (fetch y zlib integrados). NO usa Google Earth/Maps.
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { inflateSync } from "node:zlib";

const ROOT = new URL("../", import.meta.url);
const OUT = new URL("public/img/sites/", ROOT);
const API = "https://wvs.earthdata.nasa.gov/api/v1/snapshot";
const W = 960, H = 640;
const FORCE = process.argv.includes("--force");

const LAYERS = [
  { id: "Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual", time: "2000-12-01",
    title: "Landsat WELD Corrected Reflectance, True Color (annual composite Dec 1999 – Nov 2000)",
    sensor: "Landsat 5 TM / Landsat 7 ETM+", resolution_m: 30, widthKm: 60 },
  { id: "BlueMarble_NextGeneration", time: "2004-08-01",
    title: "Blue Marble: Next Generation (cloud-free MODIS composite, 2004)",
    sensor: "Terra MODIS", resolution_m: 500, widthKm: 480 },
];
// Sitios pequeños: encuadre más cerrado, sin bajar de la resolución nativa (960 px × 30 m ≈ 29 km).
const CLOSE_UP = ["Meteor Crater", "Cinder Lake crater field", "Mars Desert Research Station",
  "Black Point Lava Flow (D-RATS)", "Pavilion Lake (PLRP)", "Rio Tinto"];

export const slug = (name) => name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function bbox(lat, lon, widthKm) {
  const halfLat = (widthKm * H / W) / 111.32 / 2;
  const halfLon = widthKm / (111.32 * Math.cos(lat * Math.PI / 180)) / 2;
  const r = (x) => Math.round(x * 1e4) / 1e4;
  return [r(Math.max(-90, lat - halfLat)), r(lon - halfLon), r(Math.min(90, lat + halfLat)), r(lon + halfLon)];
}

function url(layer, box, format, w, h) {
  const q = new URLSearchParams({ REQUEST: "GetSnapshot", TIME: layer.time, BBOX: box.join(","), CRS: "EPSG:4326",
    LAYERS: layer.id, WRAP: "none", FORMAT: format, WIDTH: String(w), HEIGHT: String(h) });
  return `${API}?${q}`;
}

async function get(u) {
  for (let attempt = 1; ; attempt++) {
    const r = await fetch(u);
    if (r.ok && (r.headers.get("content-type") ?? "").startsWith("image/")) return Buffer.from(await r.arrayBuffer());
    if (attempt >= 3) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 120)}`);
    await new Promise((res) => setTimeout(res, 1500 * attempt));
  }
}

/** Decodificador PNG mínimo (8 bits, RGB/RGBA/gris) para medir cuánta imagen está vacía (negra). */
function emptyFraction(png) {
  let pos = 8, width = 0, height = 0, colorType = 0;
  const idat = [];
  while (pos < png.length) {
    const len = png.readUInt32BE(pos), type = png.toString("ascii", pos + 4, pos + 8);
    const data = png.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") { width = data.readUInt32BE(0); height = data.readUInt32BE(4); colorType = data[9]; }
    if (type === "IDAT") idat.push(data);
    pos += 12 + len;
  }
  const bpp = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!bpp) throw new Error(`PNG color type ${colorType} no soportado`);
  const raw = inflateSync(Buffer.concat(idat)), stride = width * bpp;
  const img = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? img[y * stride + x - bpp] : 0, b = y ? img[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y ? img[(y - 1) * stride + x - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const pred = f === 0 ? 0 : f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      img[y * stride + x] = (line[x] + pred) & 255;
    }
  }
  let empty = 0;
  const ch = Math.min(3, bpp);
  for (let i = 0; i < width * height; i++) {
    let sum = 0;
    for (let k = 0; k < ch; k++) sum += img[i * bpp + k];
    if (sum / ch < 8 || (bpp === 4 && img[i * bpp + 3] === 0)) empty++;
  }
  return empty / (width * height);
}

const manifest = JSON.parse(await readFile(new URL("public/data/manifest.json", ROOT), "utf8"));
await mkdir(OUT, { recursive: true });
const sites = {}, missing = [];

// puntos de la capa USGS que la app muestra (ver scripts/build-usgs.mjs), si ya se generó usgs.json
let usgs = [];
try { usgs = JSON.parse(await readFile(new URL("public/data/usgs.json", ROOT), "utf8")).sites; } catch { /* sin capa USGS */ }

for (const site of [...manifest.known, ...usgs]) {
  const id = slug(site.name), file = `${id}.jpg`;
  let done = null;
  for (const layer of LAYERS) {
    const widthKm = layer.resolution_m === 30 && CLOSE_UP.includes(site.name) ? 29 : layer.widthKm;
    const box = bbox(site.lat, site.lon, widthKm);
    try {
      const empty = emptyFraction(await get(url(layer, box, "image/png", 96, 64)));
      if (empty > 0.5) { console.log(`  ${site.name}: ${layer.id} vacía al ${(empty * 100).toFixed(0)} % -> siguiente capa`); continue; }
      let exists = false;
      try { await access(new URL(file, OUT)); exists = true; } catch { /* no existe */ }
      const full = url(layer, box, "image/jpeg", W, H);
      if (!exists || FORCE) await writeFile(new URL(file, OUT), await get(full));
      done = { name: site.name, file, source: "NASA Worldview Snapshots (NASA GIBS / EOSDIS)", layer: layer.id,
        layer_title: layer.title, sensor: layer.sensor, date: layer.time, resolution_m: layer.resolution_m,
        width_km: widthKm, bbox: box, center: [site.lat, site.lon], empty_fraction: Math.round(empty * 100) / 100,
        license: "Public domain: NASA/USGS imagery is not copyrighted. Credit requested: NASA Worldview.",
        url: full };
      console.log(`OK ${site.name} <- ${layer.id} (${widthKm} km, vacío ${(empty * 100).toFixed(0)} %)`);
      break;
    } catch (err) {
      console.log(`  ${site.name}: ${layer.id} falló (${err.message})`);
    }
  }
  if (done) sites[id] = done; else missing.push(site.name);
}

await writeFile(new URL("credits.json", OUT), JSON.stringify({
  generated: new Date().toISOString().slice(0, 10),
  note: "Site coordinates are approximate (see pipeline/config/known_analogs.yaml); images are centred on them.",
  sites, missing,
}, null, 2) + "\n");
console.log(`\n${Object.keys(sites).length} fotos, ${missing.length} sin foto válida${missing.length ? ": " + missing.join("; ") : ""}`);
