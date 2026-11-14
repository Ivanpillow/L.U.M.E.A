import type { Manifest } from "./types.ts";

export interface Dataset {
  m: Manifest;
  n: number;
  ci: Uint16Array;
  cj: Uint16Array;
  lat: Float32Array;
  lon: Float32Array;
  /** feature -> valores decodificados; mensual: [mes * n + celda] */
  f: Record<string, Float32Array>;
  get: (feature: string, cell: number, month: number) => number;
}

export async function loadDataset(base = "data/"): Promise<Dataset> {
  const [m, buf] = await Promise.all([
    fetch(base + "manifest.json").then((r) => r.json() as Promise<Manifest>),
    fetch(base + "cells.bin").then((r) => r.arrayBuffer()),
  ]);
  const n = m.n;
  const ci = new Uint16Array(buf.slice(0, 2 * n));
  const cj = new Uint16Array(buf.slice(2 * n, 4 * n));
  const lat = new Float32Array(n), lon = new Float32Array(n);
  for (let c = 0; c < n; c++) {
    lat[c] = -90 + m.grid.dlat * ci[c];
    lon[c] = -180 + m.grid.dlon * cj[c];
  }
  const f: Record<string, Float32Array> = {};
  for (const [name, meta] of Object.entries(m.features)) {
    const len = meta.monthly ? 12 * n : n;
    const q = new Uint8Array(buf, meta.offset, len);
    const out = new Float32Array(len);
    for (let k = 0; k < len; k++) out[k] = q[k] === 255 ? NaN : meta.lo + q[k] * meta.scale;
    f[name] = out;
  }
  const monthly: Record<string, boolean> = {};
  for (const [name, meta] of Object.entries(m.features)) monthly[name] = meta.monthly;
  const get = (feature: string, cell: number, month: number) =>
    monthly[feature] ? f[feature][month * n + cell] : f[feature][cell];
  return { m, n, ci, cj, lat, lon, f, get };
}

export function cellRing(d: Dataset, c: number): number[][] {
  const { dlat, dlon } = d.m.grid;
  const s = Math.max(d.lat[c] - dlat / 2, -90), nn = Math.min(d.lat[c] + dlat / 2, 90);
  const w = d.lon[c] - dlon / 2, e = d.lon[c] + dlon / 2;
  return [[w, s], [e, s], [e, nn], [w, nn], [w, s]];
}

export function fmtLatLon(lat: number, lon: number): string {
  return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
}
