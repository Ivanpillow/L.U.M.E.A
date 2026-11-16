import { test } from "node:test";
import assert from "node:assert/strict";
import { SUN, SUN_LIGHT_POSITION, solarIncidence, sunlightColor } from "./sunlight.ts";

test("solar geometry: noon, midnight and the terminator on a sphere", () => {
  assert.ok(Math.abs(solarIncidence(SUN.lng, SUN.lat) - 1) < 1e-12);
  assert.ok(Math.abs(solarIncidence(SUN.lng + 180, -SUN.lat) + 1) < 1e-12);
  assert.ok(Math.abs(solarIncidence(SUN.lng + 90, 0)) < 1e-12);
});

test("illumination wraps at the antimeridian and converges at both poles", () => {
  for (const lat of [-85, -40, 0, 40, 85]) {
    assert.ok(Math.abs(solarIncidence(-180, lat) - solarIncidence(180, lat)) < 1e-12);
    assert.deepEqual(sunlightColor(solarIncidence(-180, lat)), sunlightColor(solarIncidence(180, lat)));
  }
  for (const lat of [-90, 90]) {
    assert.ok(Math.abs(solarIncidence(-120, lat) - solarIncidence(75, lat)) < 1e-12);
  }
});

test("MapLibre atmosphere and surface use the same solar direction", () => {
  const [, azimuth, polar] = SUN_LIGHT_POSITION, rad = Math.PI / 180;
  // MapLibre sphericalToCartesian followed by draw_sky's direction inversion.
  const direction = [
    -Math.cos((azimuth + 90) * rad) * Math.sin(polar * rad),
    -Math.sin((azimuth + 90) * rad) * Math.sin(polar * rad),
    -Math.cos(polar * rad),
  ];
  const expected = [
    Math.sin(SUN.lng * rad) * Math.cos(SUN.lat * rad),
    Math.sin(SUN.lat * rad), Math.cos(SUN.lng * rad) * Math.cos(SUN.lat * rad),
  ];
  direction.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-12));
});

test("lighting preserves texture with a smooth transition and bounded opacity", () => {
  const day = sunlightColor(1), night = sunlightColor(-1);
  assert.ok(day[0] > day[2], "warm daylight");
  assert.ok(night[2] > night[0], "blue ambient shadow");
  assert.ok(day[3] < night[3]);
  let previous = sunlightColor(-1);
  for (let i = -999; i <= 1000; i++) {
    const color = sunlightColor(i / 1000);
    assert.ok(color.every((v) => Number.isFinite(v) && v >= 0 && v <= 255));
    assert.ok(color[3] < 128, "base image remains visible even on the dark side");
    color.forEach((v, k) => assert.ok(Math.abs(v - previous[k]) <= 2, "no abrupt colour boundary"));
    previous = color;
  }
});
