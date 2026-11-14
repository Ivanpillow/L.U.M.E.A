# Proving Grounds

**Find where — and *when* — Earth can rehearse NASA's Moon Base and Mars.**
NASA Space Apps Challenge 2026 · *Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars*.

NASA will build a Moon Base in the lunar South Pole region (Ignition, March 2026), and its Phase 1 is about
*"experiment and test capabilities"*. Proving Grounds turns NASA's published Moon Base capability gaps
(precision landing in shadow, surviving the cold and dark, extreme-slope mobility, frozen volatiles, dust and regolith)
and Mars human-landing needs (SWIM ice zones) into **test profiles**. It then scores every land cell on Earth,
**month by month**, against the physical conditions each test needs.

What makes it different:
1. **Gap-driven.** Profiles come from NASA's 2026 Moon Base gaps, not from visual likeness.
2. **Analog calendar (4D).** Analogy depends on *when*. For example, grazing sunlight (noon Sun ≤ 7.5°, like ≤ 6° from the lunar pole with a 1.54° spin-axis tilt) happens on Earth only at some latitudes and in some months.
3. **Analogy Break Card.** Every criterion is labelled **D** (direct), **R** (relative Earth extreme) or **N** (never reproducible: gravity, vacuum, radiation). Each site shows what matches, what breaks, and what never will.
4. **Multi-scale funnel.** Global screening at ~55 km cells, then a local 30 m zoom against NASA's landing limits (slope < 10° over 100 m, < 20° over 2 km for EVA).

## Run it

```bash
python -m venv .venv && .venv/Scripts/python -m pip install numpy pillow pyyaml pytest   # Windows paths
.venv/Scripts/python pipeline/scripts/fetch_terrain.py --zoom 5      # AWS Terrain Tiles -> terrain_grid.npz
.venv/Scripts/python pipeline/scripts/fetch_power.py                 # NASA POWER climatology (~2,300 requests, ~20 min)
.venv/Scripts/python pipeline/scripts/build_web_data.py --geocode    # features, scores, validation, web data
.venv/Scripts/python -m pytest pipeline/tests
cd web && npm install && npm test && npm run dev
```

Local zoom against NASA's landing slope limits:

```bash
.venv/Scripts/python pipeline/scripts/local_zoom.py --lat 75.38 --lon -89.68 --radius-km 10 --name haughton
```

## Layout

| Path | What it holds |
|---|---|
| `pipeline/analog/` | Grid, analytic solar geometry, reference scoring engine |
| `pipeline/config/profiles.yaml` | Targets, test profiles, thresholds and **sources** (single source of truth) |
| `pipeline/config/known_analogs.yaml` | Known-analog baseline (approximate coordinates; replace with the USGS layer) |
| `pipeline/scripts/` | Data download, feature build and export, local zoom |
| `web/` | Static app (Vite + TypeScript + MapLibre GL globe). Scoring mirrors the Python engine; both have tests |
| `data/processed/validation_report.md` | Recall of known analogs, negative control and weight sensitivity |
| `Investigaciones/` | Research notes and verified sources (Spanish) |

## Data (NASA first)

- NASA POWER Climatology API v2.10.1, MERRA-2/CERES 2001–2025: <https://power.larc.nasa.gov/docs/>
- AWS Terrain Tiles (SRTM, GMTED2010, ETOPO1): <https://registry.opendata.aws/terrain-tiles/>
- NASA GIBS / Worldview, Blue Marble basemap: <https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api>
- NASA NSSDC Moon and Mars fact sheets
- NASA (2026) *Moon Base User's Guide*; NTRS 20250009323 (Artemis landing requirements); NASA Release 24-136 (nine South Pole regions); Morgan et al. 2021 (SWIM)

## Limits (stated, not hidden)

The ~55 km cells are for screening only. Slope is regional until the local zoom. The Antarctic interior has no relief data above 85°S.
Temperatures are 2 m air temperatures, and Earth cannot reach lunar values, so they are compared as relative extremes.
Lighting matches geometrically but not radiometrically: Earth's sky lights up shadows.
Bare-ground and permafrost criteria are climate proxies and are flagged as such.

## Use of AI

An AI coding assistant helped with source lookup and boilerplate code. The team reviews every scientific choice, and each claim is traced to a cited source.
