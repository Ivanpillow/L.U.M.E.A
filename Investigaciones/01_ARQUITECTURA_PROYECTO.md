# Arquitectura del proyecto: descubrimiento de análogos terrestres de la Luna y Marte

**Reto:** NASA Space Apps Challenge 2026: identificar y caracterizar análogos terrestres para futuras bases lunares y sitios de aterrizaje en Marte.
**Objetivo final:** una solución web para descubrir, comparar y explicar terrenos análogos.
**Estado de este documento:** borrador de arquitectura v0.1 (2026-11-14). Los datos marcados con **(verificar)** deben confirmarse en la fuente original antes de citarlos en la entrega.

---

## 0. Resumen ejecutivo (para explicar el proyecto en 30 segundos)

> Construimos un **motor de similitud planetaria**. Toma un sitio objetivo **real** de la Luna o de Marte (por ejemplo, una región candidata de Artemis III o una zona de exploración humana en Marte) y lo describe con **parámetros físicos medibles en datos abiertos**. Después busca en **toda la Tierra** las celdas que mejor se parecen **en cada dimensión** (topografía, mineralogía, térmica, hielo, polvo, subsuelo y operaciones). La web muestra un mapa global de similitud, explica **qué coincide y qué falla** de cada candidato y resalta los **análogos poco estudiados** con un índice de novedad.

Tres ideas diferencian la propuesta:
1. **La analogía depende del propósito.** Un buen análogo para probar la movilidad de un rover no es el mismo que para buscar biofirmas. El usuario elige un *perfil de uso* y el ranking cambia.
2. **Se dice explícitamente dónde falla la analogía.** Cada candidato tiene un perfil por dimensión y no solo un número. Además, se declaran las condiciones que la Tierra no puede reproducir (gravedad, vacío, radiación y presión).
3. **Novedad medible.** Se premian los sitios con alta similitud y poca literatura científica asociada, que es justo lo que pide el reto: no solo redescubrir Atacama.

---

## 1. Corrección del entendimiento inicial (importante)

Entendías que hay que investigar *"cuáles ya han sido determinados como sitios de aterrizaje oficiales alrededor del mundo"*. Hay que separar **tres catálogos distintos**:

| # | Catálogo | ¿Dónde está? | ¿Para qué sirve en el proyecto? |
|---|---|---|---|
| A | **Sitios objetivo** (aterrizaje y bases candidatas) | **En la Luna y en Marte**, no en la Tierra | Definen el **perfil objetivo**: es *lo que buscamos imitar* |
| B | **Análogos terrestres conocidos** | En la Tierra | **Línea base y validación**: el modelo debe puntuarlos alto. El reto pide explícitamente *no limitarse a ellos* |
| C | **Candidatos nuevos** | En la Tierra | Es el **producto** del proyecto: lo que descubrimos |

En la Tierra no existen "sitios de aterrizaje oficiales" para la Luna o Marte. Lo que existe son **sitios análogos usados por misiones de entrenamiento y prueba** (catálogo B).

### 1.1 Catálogo A: sitios objetivo documentados

**Luna (polo sur, Artemis III):** NASA publicó en octubre de 2024 nueve regiones candidatas: Peak near Cabeus B, Haworth, Malapert Massif, Mons Mouton Plateau, Mons Mouton, Nobile Rim 1, Nobile Rim 2, de Gerlache Rim 2 y Slater Plain. Sustituyeron la lista de 13 regiones de agosto de 2022. **(Verificar si hubo actualizaciones en 2025-2026.)**
- Criterios publicados: iluminación prolongada, comunicación directa con la Tierra, pendiente baja, proximidad a regiones en sombra permanente (PSR) y valor científico.
- Sitios lunares históricos también útiles como objetivo: Apollo 11-17 y Chang'e 3/4/5/6 (con datos de muestras *in situ*).

**Marte:**
- Sitios robóticos con datos de superficie: Jezero (Mars 2020), Gale (MSL), Oxia Planum (ExoMars Rosalind Franklin), Elysium Planitia (InSight), Utopia Planitia (Zhurong / Viking 2) y Meridiani Planum (Opportunity).
- Zonas de exploración humana: *First Landing Site/Exploration Zone Workshop* (NASA/LPI, 2015), con unas 47 zonas propuestas de unos 100 km de radio **(verificar el número exacto)**.
- Mapeo de hielo para aterrizaje humano: **SWIM** (*Subsurface Water Ice Mapping*, NASA/JPL/PSI). Zonas favorecidas: Arcadia Planitia y Deuteronilus Mensae.

### 1.2 Catálogo B: análogos terrestres conocidos (línea base)

| Fuente | Qué contiene | Uso |
|---|---|---|
| **USGS: *Known Terrestrial Analog Sites for Planetary Science*** (Hunter, 2020; DOI 10.5066/P9J72921; CC0) | Capa de puntos con cráteres de impacto, dunas, volcanes, etc. | **Fuente principal y descargable** para la validación |
| **ESA/Open University: *Catalogue of Planetary Analogues*** (Preston et al., ~2011) | Sitios en los siete continentes, evaluados para objetivos de la Luna y Marte | Atributos cualitativos por sitio |
| **Europlanet Planetary Field Analogues** | Cinco sitios muy bien caracterizados | Validación de alta calidad |
| **Misiones análogas de NASA** | D-RATS (Black Point Lava Flow, AZ), HMP (cráter Haughton, isla Devon), BASALT y FINESSE (Craters of the Moon, ID; Hawái), PLRP (Pavilion Lake), HI-SEAS (Mauna Loa) | Etiquetas de "uso real" |
| **Otros** | ESA PANGAEA (Lanzarote, Ries, Bletterbach), Mars Desert Research Station (Utah), Río Tinto (España), Pilbara (Australia), Valles Secos de McMurdo | Validación |
| **Earth Impact Database** (PASSC, Univ. of New Brunswick) | Unas 190-200 estructuras de impacto confirmadas | Dimensión "cráteres" en la Tierra |
| **Simulantes de regolito** (JSC-1A, LHS-1, MGS-1, etc.) | Su origen geográfico (ceniza o basalto de lugares concretos) | Evidencia de analogía de materiales |

> **Regla de diseño:** el catálogo B **no es el objetivo**. Se usa para (1) validar el modelo (recall) y (2) calcular la novedad (distancia a los análogos conocidos).

---

## 2. Marco conceptual: cómo se define "análogo" de forma medible

### 2.1 Unidad de análisis y escala
- **Celda hexagonal H3** como unidad común de comparación en los tres cuerpos.
  - Global en la Tierra: resolución H3 4 (~1 770 km² por celda, ~50-90 mil celdas de tierra firme). Cabe en el navegador.
  - Zoom regional: resolución H3 6-7 (~36 km² / ~5 km²) solo en regiones de interés.
- **El sitio objetivo se describe a la misma escala**: la misma ventana espacial (por ejemplo, 10 km o 100 km de radio) en la Luna o Marte que en la Tierra. Esto atiende la consideración del reto: *"un cráter, un valle… puede ofrecer una correspondencia más precisa"*.

### 2.2 Tres niveles de comparabilidad (se etiqueta en cada parámetro)
| Nivel | Significado | Ejemplos |
|---|---|---|
| **D: Directa** | Misma magnitud física y comparable en valor absoluto | Pendiente, rugosidad, densidad de cráteres, inercia térmica, albedo, presencia de un mineral |
| **R: Relativa** | Mismo concepto, magnitudes inalcanzables en la Tierra | Rango térmico diurno, aridez, temperatura mínima. Se compara como **extremo relativo** (percentil global terrestre) |
| **N: No análoga** | La Tierra no puede reproducirla | Gravedad, vacío, presión atmosférica, radiación en superficie y química atmosférica. **Se declara siempre en la ficha del sitio** |

### 2.3 Dimensiones (alineadas 1:1 con el texto del reto)
1. Topografía y terreno
2. Geología, mineralogía y materiales de superficie
3. Temperatura, iluminación y extremos ambientales
4. Agua, hielo y permafrost (recursos)
5. Polvo, viento, erosión y procesos atmosféricos y de superficie
6. Biología, habitabilidad y biofirmas
7. Cuevas, tubos de lava y subsuelo
8. Condiciones operacionales (aterrizaje, movilidad, logística y construcción)

---

## 3. Catálogo de parámetros (buscables y justificables)

Cada parámetro tiene: definición física, dato en la Tierra, dato equivalente en la Luna y en Marte, comparabilidad y justificación. **El prompt maestro (archivo 02) sirve para verificar y completar esta tabla con URLs, DOIs y licencias.**

### 3.1 Topografía y terreno
| ID | Parámetro | Tierra | Luna | Marte | Comp. | Justificación |
|---|---|---|---|---|---|---|
| T1 | Elevación / relieve local (máx − mín en la ventana) | Copernicus DEM GLO-30 (global, 30 m); NASADEM (30 m, solo 60°N-56°S); ArcticDEM / REMA (polar, 2 m) | LOLA LDEM; SLDEM2015 (LOLA+Kaguya, ~60 m, ±60°); DEMs polares LOLA (hasta ~5 m/px) | MOLA MEGDR (~463 m); HRSC+MOLA blended (200 m); CTX/HiRISE DTM (local) | D (el relieve) | El relieve define los riesgos de aterrizaje y la movilidad |
| T2 | Pendiente (media y p95) | Derivada de T1 | Derivada de T1 | Derivada de T1 | D | Restricción de aterrizaje: umbral típico ≤8-10° en la Luna **(verificar el requisito HLS)** |
| T3 | Rugosidad (TRI o desviación estándar de la pendiente) | Derivada de T1 | Derivada de T1 | Derivada de T1; rugosidad MOLA (Kreslavsky & Head) | D | Movilidad de rovers y seguridad de aterrizaje |
| T4 | Densidad de cráteres (n/km², por rango de diámetro) | Earth Impact Database (escasa: tendrá valor 0 casi siempre) | Robbins (2018), ~1.3 M cráteres ≥1-2 km | Robbins & Hynek (2012), ~384 k cráteres ≥1 km | D (escasa en la Tierra) | Morfología de impacto, edad relativa y entrenamiento en cráteres |
| T5 | Abundancia de rocas / bloques | Proxy: retrodispersión SAR (Sentinel-1 C; NISAR L/S si hay datos) + textura óptica | Diviner rock abundance (Bandfield 2011); Mini-RF CPR | Rock abundance TES/THEMIS (Nowicki & Christensen 2007) | R (proxy en la Tierra) | Peligro de aterrizaje y tracción |

### 3.2 Geología, mineralogía y materiales
| ID | Parámetro | Tierra | Luna | Marte | Comp. | Justificación |
|---|---|---|---|---|---|---|
| G1 | Litología dominante (clase) | GLiM (Hartmann & Moosdorf 2012); Macrostrat; OneGeology | USGS Unified Geologic Map of the Moon (2020, 1:5M) | USGS Geologic Map of Mars (Tanaka et al. 2014, SIM 3292) | D (clase) | Basalto ↔ maria/llanuras; anortosita ↔ tierras altas lunares; sedimentario ↔ Gale/Jezero |
| G2 | Minerales clave (presencia/abundancia: hematita, goethita, yeso, caolinita, montmorillonita, calcita…) | **EMIT** (ISS, espectrómetro de imagen; 10 minerales de fuentes de polvo en regiones áridas); ASTER L1T SWIR (archivo) | M3 (Chandrayaan-1), Kaguya MI/SP, Clementine | **CRISM** (MRO), OMEGA (Mars Express), TES; catálogo de minerales hidratados (Carter 2013); cloruros (Osterloo 2010) | D | Las arcillas y sulfatos marcianos indican agua pasada; es la analogía más fuerte para astrobiología |
| G3 | Sílice / emisividad TIR | ASTER GED (100 m, 5 bandas TIR) | Diviner (Christiansen Feature) | TES / THEMIS | D | Composición félsica vs. máfica |
| G4 | Química elemental (FeO, TiO₂, Th) | Geoquímica de rocas (EarthChem/GEOROC) **local** | Lunar Prospector GRS; LROC WAC TiO₂ | Mars Odyssey GRS | D (escasa en la Tierra) | Materiales para ISRU (ilmenita → oxígeno) |
| G5 | Tamaño de grano / textura del suelo | SoilGrids (ISRIC, 250 m: arena/limo/arcilla) | Muestras Apollo/Luna/Chang'e + inercia térmica | Inercia térmica (ver E3) | R | Comportamiento del regolito, excavación y construcción |

### 3.3 Temperatura, iluminación y extremos ambientales
| ID | Parámetro | Tierra | Luna | Marte | Comp. | Justificación |
|---|---|---|---|---|---|---|
| E1 | Temperatura de superficie (mín, máx, media) | MODIS LST (MOD11A2/MOD21, 1 km); ECOSTRESS (70 m) | Diviner (temperaturas globales, máximas y mínimas) | Mars Climate Database (MCD, LMD/ESA); TES/THEMIS | R | Diseño térmico de equipos |
| E2 | Rango térmico diurno (ΔT día-noche) | MODIS día − noche | Diviner | MCD | R (percentil) | Estrés térmico cíclico en equipos |
| E3 | **Inercia térmica** | Inercia térmica aparente (ATI) desde MODIS/ASTER día/noche + albedo | Diviner H-parameter / inercia térmica (Hayne et al. 2017) | THEMIS (~100 m); TES (Putzig & Mellon 2007) | **D** | **Puente clave entre cuerpos**: indica el tamaño de grano y la consolidación (arena suelta vs. roca) |
| E4 | Albedo | MODIS MCD43A3 | Diviner / LROC WAC | TES albedo | D | Balance térmico, polvo y contraste visual para navegación |
| E5 | Insolación / UV | NASA POWER; OMI/TROPOMI UV | Mapas de iluminación LOLA (% del tiempo iluminado, Mazarico 2011) | MCD (insolación, UV) | R | Energía solar y degradación por UV |
| E6 | Aridez | CGIAR Global Aridity Index v3 (Zomer 2022); precipitación GPM IMERG; SMAP (humedad del suelo) | — (seco absoluto) | Vapor de agua atmosférico (MCD, TES) | R (percentil) | Preservación, habitabilidad y procesos sin agua líquida |

### 3.4 Agua, hielo y recursos
| ID | Parámetro | Tierra | Luna | Marte | Comp. | Justificación |
|---|---|---|---|---|---|---|
| W1 | Permafrost / hielo en el subsuelo | ESA CCI Permafrost; mapa circumártico del NSIDC (Brown et al.) | Neutrones: LP-NS, LRO LEND; exposiciones de hielo M3 (Li et al. 2018) | **SWIM** (consistencia de hielo); Odyssey GRS/NS (WEH); SHARAD; MARSIS; escarpes de hielo (Dundas 2018) | R | ISRU de agua: criterio n.º 1 para el aterrizaje humano en Marte |
| W2 | Trampas frías / sombra permanente | Proxy: valles polares sombreados (DEM + modelo solar) | Catálogo PSR; Diviner T máx <110 K | — (casquetes polares) | R | Analogía de las operaciones en PSR (iluminación, frío y navegación) |
| W3 | Glaciares / hielo cubierto de detritos | RGI v7; GLIMS; ICESat-2 | — | Glaciares cubiertos de detritos (Deuteronilus); SHARAD | D (morfología) | Recursos y morfología glaciar |
| W4 | Evaporitas / salares (agua pasada) | Landsat/Sentinel-2 + EMIT (yeso); lagos salados | — | Cloruros (Osterloo 2010); sulfatos CRISM | D | Registro de agua antigua y habitabilidad |

### 3.5 Polvo, viento y erosión
| ID | Parámetro | Tierra | Luna | Marte | Comp. | Justificación |
|---|---|---|---|---|---|---|
| P1 | Carga de polvo atmosférico | MODIS/VIIRS AOD Deep Blue; MERRA-2 (dust); CALIPSO/CALIOP (archivo hasta 2023) | — (exosfera; polvo electrostático: **la analogía falla**) | Opacidad de polvo (MCD, TES/THEMIS); Mars Dust Activity Database (MARCI) | R | Paneles solares, sellos, visibilidad y salud |
| P2 | Velocidad del viento / régimen eólico | ERA5; MERRA-2 | — | MCD | R | Tormentas, transporte de sedimento y operaciones |
| P3 | Campos de dunas | Clasificación sobre Landsat/Sentinel-2; ESA WorldCover (suelo desnudo) | — | **MGD3** (Mars Global Digital Dune Database, USGS) | D (morfología) | Movilidad (atasco de rovers) y procesos eólicos |
| P4 | Erosión / meteorización | Proxy: NDVI + aridez + litología | Meteorización espacial (no análoga) | Tasas derivadas de cráteres | R | Preservación de la superficie |

### 3.6 Biología y habitabilidad
| ID | Parámetro | Tierra | Luna | Marte | Comp. | Justificación |
|---|---|---|---|---|---|---|
| B1 | Ausencia de vegetación | MODIS NDVI/EVI (MOD13); Sentinel-2 | — | — | R | Condición necesaria, **no suficiente**, para la analogía |
| B2 | Ambientes extremófilos (salinidad, acidez, hidrotermal) | GBIF (registros); literatura; EMIT/ASTER (alteración hidrotermal) | — | Minerales de alteración hidrotermal (CRISM) | D (químico) | Estrategias de búsqueda de biofirmas |
| B3 | Potencial de preservación de biofirmas | Combinación de aridez, evaporitas, arcillas y radiación UV | — | Arcillas y sílice opalina (CRISM) | R | Ciencia de Mars Sample Return |

### 3.7 Cuevas, tubos de lava y subsuelo
| ID | Parámetro | Tierra | Luna | Marte | Comp. | Justificación |
|---|---|---|---|---|---|---|
| C1 | Vulcanismo basáltico joven (proxy de tubos de lava) | Smithsonian Global Volcanism Program; GLiM (basalto); edad | Atlas de pozos lunares (LROC/ASU, >200 pozos); GRAIL (vacíos) | **MGC3** (Mars Global Cave Candidate Catalog, USGS, >1 000 candidatos) | D (proceso) | Refugio de radiación para bases |
| C2 | Cuevas y tubos conocidos | **No hay un catálogo global**: bases nacionales y literatura. Se declara como **brecha de datos** | — | — | — | Honestidad metodológica (criterio de validez) |

### 3.8 Condiciones operacionales
| ID | Parámetro | Tierra | Luna | Marte | Comp. | Justificación |
|---|---|---|---|---|---|---|
| O1 | Accesibilidad (distancia a carreteras o aeropuertos) | OpenStreetMap | — | — | (solo la Tierra) | Viabilidad de usar el análogo para pruebas |
| O2 | Densidad de población | NASA SEDAC GPW v4; GHSL (JRC) | — | — | (solo la Tierra) | Aislamiento, permisos e interferencias |
| O3 | Áreas protegidas | WDPA (Protected Planet) | — | — | (solo la Tierra) | Restricciones legales para las pruebas |
| O4 | Cobertura del suelo | ESA WorldCover (10 m); MODIS MCD12Q1 | — | — | (solo la Tierra) | Filtro: suelo desnudo, roca o hielo |
| O5 | Visibilidad de la Tierra / comunicaciones | — | Mapas de visibilidad de la Tierra (LOLA) | Ventanas de relé orbital | N | Se declara como limitación |

### 3.9 Siempre no análogas (se muestran en cada ficha)
Gravedad (Luna 0.166 g, Marte 0.38 g), vacío lunar, presión marciana (~0.6 kPa), radiación en superficie (sin magnetosfera), química atmosférica (CO₂ en Marte) y regolito lunar con meteorización espacial y carga electrostática.

---

## 4. Metodología de puntuación

### 4.1 Pipeline
1. **Perfil objetivo**: se calculan los parámetros del sitio de la Luna o Marte en una ventana de radio R.
2. **Matriz terrestre**: los mismos parámetros por celda H3 en la Tierra.
3. **Transformación** por parámetro: log para distribuciones sesgadas, percentiles para los parámetros "R" y codificación one-hot o de similitud para los categóricos.
4. **Similitud por parámetro**: `s_p = exp(-((f(e_p) - f(t_p)) / σ_p)^2)`, con σ_p justificado (por ejemplo, la variabilidad interna del propio sitio objetivo).
5. **Puntuación por dimensión**: `D_k = Σ w_p·s_p / Σ w_p`, solo con los parámetros disponibles. **Un dato faltante no cuenta como 0**: se lleva la cobertura como *confianza*.
6. **Puntuación global** según el perfil de uso: `AnalogScore = Σ W_k·D_k`.
7. **Filtros duros** opcionales (por ejemplo, NDVI < 0.1 y suelo desnudo).
8. **Novedad**: `N = 1 − normalizar(densidad de literatura)`, combinada con la distancia al análogo conocido más cercano (catálogo B). La literatura se cuenta con la API de OpenAlex o NASA ADS (consultas por topónimo).
9. **Puntuación de descubrimiento**: `Discovery = AnalogScore × N^α` (α ajustable).
10. **Explicación**: parámetros con `s_p ≥ 0.7` = "coincide"; con `s_p ≤ 0.3` = "falla"; más la lista fija de no análogas.

### 4.2 Perfiles de uso (pesos W_k)
| Perfil | Topo | Geo | Térmica | Hielo | Polvo | Bio | Subsuelo |
|---|---|---|---|---|---|---|---|
| Movilidad de rovers y aterrizaje | 0.40 | 0.15 | 0.10 | 0.05 | 0.25 | 0 | 0.05 |
| ISRU de agua (base) | 0.15 | 0.15 | 0.15 | 0.45 | 0.05 | 0 | 0.05 |
| Astrobiología (Marte) | 0.05 | 0.40 | 0.10 | 0.10 | 0.05 | 0.30 | 0 |
| Hábitat en tubos de lava | 0.15 | 0.20 | 0.10 | 0.05 | 0.05 | 0 | 0.45 |
| Entrenamiento geológico de astronautas | 0.25 | 0.45 | 0.05 | 0.05 | 0.05 | 0.05 | 0.10 |

*Los pesos son iniciales y deben justificarse en la presentación. El usuario los ajusta con controles deslizantes.*

### 4.3 Validación (criterio de validez de los jueces)
- **Recall@k**: con el perfil de Marte, ¿qué percentil ocupan Atacama, los Valles Secos, Haughton, Río Tinto y Pilbara? Meta: estar dentro del 5 % superior.
- **Prueba de cordura lunar**: el perfil lunar debe favorecer campos de lava basáltica, macizos de anortosita y estructuras de impacto.
- **Sensibilidad**: ¿se mantiene estable el top-20 al variar los pesos ±20 %?
- **Sesgos declarados**: la Tierra tiene pocos cráteres; el DEM polar tiene otra fuente; no hay catálogo global de cuevas.

---

## 5. Arquitectura de la solución web

```
┌──────────────────────── PIPELINE OFFLINE (Python) ───────────────────────┐
│ Ingesta Tierra:  Google Earth Engine / NASA Earthdata (earthaccess, CMR-  │
│                  STAC) / Copernicus / OSM                                 │
│ Ingesta Luna/Marte: PDS Geosciences Node (ODE), USGS Astropedia,          │
│                  NASA Solar System Treks (Moon/Mars Trek)                 │
│        │                                                                  │
│        ▼                                                                  │
│ Features por celda H3  ──►  features_earth.parquet  /  targets.json       │
│        │                                                                  │
│        ▼                                                                  │
│ Scoring + validación   ──►  scores_<perfil>.parquet, validation_report.md │
│ Novedad (OpenAlex)     ──►  novelty.parquet                               │
└───────────────────────────────┬──────────────────────────────────────────┘
                                ▼ (archivos estáticos)
┌──────────────────────────── FRONTEND (web) ──────────────────────────────┐
│ Vite + React + MapLibre GL + deck.gl (H3HexagonLayer)                     │
│ • Vista dividida: Tierra ↔ Luna/Marte (teselas WMTS de Moon/Mars Trek)    │
│ • Selector de sitio objetivo + perfil de uso + pesos (recálculo en el     │
│   navegador)                                                              │
│ • Ranking de candidatos (score, confianza, novedad)                       │
│ • Ficha del sitio: radar por dimensión, "coincide / falla / no análoga",  │
│   imágenes comparadas, fuentes y citas                                    │
│ • Capa de análogos conocidos (USGS) para contraste                        │
│ • Página "Metodología y datos" (citas obligatorias en Space Apps)         │
└──────────────────────────────────────────────────────────────────────────┘
```

**Decisión clave para el hackathon: sin backend.** Las features se precalculan y el navegador recalcula los scores con los pesos del usuario. Con unas 80 mil celdas × 25 features, son pocos MB (Parquet o JSON comprimido, o DuckDB-WASM). Se puede publicar en GitHub Pages, Netlify o Vercel. Si hace falta zoom regional (res 6-7), se sirve por región o como teselas PMTiles.

### 5.1 Estructura del repositorio
```
NasaSpaceApp/
├─ Investigaciones/            # este documento, el prompt y los hallazgos
├─ pipeline/
│  ├─ config/parameters.yaml   # catálogo de la sección 3 (fuente de verdad)
│  ├─ config/targets.yaml      # sitios objetivo (Luna/Marte) con coordenadas y radio
│  ├─ config/profiles.yaml     # pesos de la sección 4.2
│  ├─ ingest/earth/            # scripts GEE / earthaccess
│  ├─ ingest/planetary/        # descarga de PDS, USGS y Trek
│  ├─ features/                # agregación por H3
│  ├─ scoring/                 # similitud, novedad, explicación
│  └─ validate/                # recall@k, sensibilidad
├─ data/raw/ (en .gitignore)  data/processed/
├─ web/                        # app Vite
│  └─ public/data/             # parquet/json precalculados
└─ README.md                   # incluye la tabla de fuentes y citas
```

### 5.2 Modelo de datos
```jsonc
// parameters.yaml → una entrada
{ "id": "E3", "dimension": "termica", "name": "Inercia térmica",
  "unit": "J m-2 K-1 s-1/2", "comparability": "D",
  "earth":  { "dataset": "MODIS MOD11A2 + MCD43A3 (ATI)", "res_m": 1000, "access": "GEE: MODIS/061/MOD11A2" },
  "moon":   { "dataset": "Diviner H-parameter (Hayne 2017)", "access": "PDS" },
  "mars":   { "dataset": "THEMIS TI mosaic / TES (Putzig & Mellon 2007)", "access": "USGS Astropedia" },
  "transform": "log", "sigma_rule": "std_within_target_window",
  "justification_refs": ["doi:..."], "verified": false }

// features_earth.parquet → una fila por celda
{ "h3": "84...", "lat": 0, "lon": 0, "T2_slope_p95": 0, "E3_ti": 0, "G2_hematite": 0, ..., "coverage": 0.85 }

// targets.json → un sitio objetivo
{ "id": "mars_jezero", "body": "mars", "lat": 18.38, "lon": 77.58, "radius_km": 10,
  "features": { "T2_slope_p95": 0, "E3_ti": 0 }, "source_refs": [] }
```

---

## 6. Plan de ejecución: **LUNA PRIMERO** (decidido el 2026-11-14; hackathon del 14-15 de noviembre de 2026, ventana de ~48 h)

Marte queda como fase 2. El pipeline es el mismo: solo cambia `targets.yaml` y se agregan columnas.

### 6.1 Por qué la Luna cambia el enfoque (y lo que hay que decir en la presentación)
La Luna **no tiene atmósfera, agua líquida, viento ni biología**. Eso elimina casi por completo las dimensiones de polvo atmosférico, biología y erosión, y obliga a basar la analogía en cuatro ejes:
1. **Terreno** (pendiente, rugosidad, relieve, cráteres): comparabilidad **D**. Es el eje más fuerte.
2. **Materiales** (anortosita de las tierras altas en el polo sur; basalto en los maria; regolito fino y anguloso ↔ ceniza volcánica o tefra): **D/R**.
3. **Térmica e iluminación** (inercia térmica, albedo, **sol rasante**, sombras largas y trampas frías): **D/R**.
4. **Hielo en el subsuelo / trampas frías** ↔ permafrost y valles polares sombreados: **R**.

**Fallos fijos de la analogía lunar (van en todas las fichas):** vacío; 1/6 g; radiación sin magnetosfera; regolito con meteorización espacial y carga electrostática (no hay equivalente en la Tierra); temperaturas en PSR de ~25-40 K **(verificar con Diviner)**; ausencia de erosión, de modo que en la Tierra los cráteres se degradan y en la Luna se conservan.

> **Ángulo de originalidad:** en el polo sur lunar el Sol nunca sube más de ~1.5° (la oblicuidad lunar es ~1.54°). En la Tierra ningún lugar lo replica todo el año, pero en latitudes muy altas hay meses con el Sol por debajo de 5°. El parámetro **E5b "fracción del año con elevación solar < X°"** se **calcula astronómicamente**, no requiere ningún dataset y es comparable de forma relativa. Junto con el relieve (sombras largas), permite encontrar análogos de **navegación con iluminación rasante**, uno de los mayores riesgos operacionales de Artemis.

### 6.2 Sitios objetivo del MVP lunar (las coordenadas exactas se verifican con P2)
| ID | Sitio | Por qué | Perfil principal |
|---|---|---|---|
| `moon_malapert` | Malapert Massif (región candidata de Artemis III), ~86°S **(aprox.)** | Macizo de alta iluminación con línea de vista a la Tierra; morfología distinta a un borde de cráter | Aterrizaje/movilidad + iluminación rasante |
| `moon_haworth` | Haworth (región candidata de Artemis III), ~87°S **(aprox.)** | Cerca de un PSR grande: hielo y trampas frías | ISRU de hielo |
| `moon_degerlache2` | de Gerlache Rim 2 (región candidata de Artemis III) | Borde de cráter cerca del eje Shackleton-de Gerlache; terreno de borde con pendientes | Entrenamiento geológico + movilidad |
| `moon_mtp` | Pozo de Mare Tranquillitatis, ~8.3°N 33.2°E **(aprox.)** | Pozo en basalto de mare, posible acceso a un tubo de lava; datos de Apollo 11 cerca (verdad de campo) | Hábitat en tubos de lava |

*Opcional, si hay tiempo: Apollo 15 / Hadley Rille, por el canal de lava y las muestras.*

### 6.3 Parámetros del MVP lunar (12)
| ID | Parámetro | Tierra | Luna (producto concreto) | Comp. |
|---|---|---|---|---|
| T1 | Relieve local | Copernicus GLO-30 (+ REMA/ArcticDEM en los polos) | **LOLA LDEM_80S_20MPP_ADJ** (80-90°S, 20 m; Barker et al. 2021, DOI 10.1016/j.pss.2020.105119); 5 m/px en 87-90°S; SLDEM2015 para el pozo de Tranquillitatis | D |
| T2 | Pendiente p50/p95 | Derivada | Derivada; existe pendiente de 5 m en PGDA | D |
| T3 | Rugosidad | Derivada (TRI) | Derivada + **Large-Scale Roughness of the Lunar Poles** (PGDA 98; DOI 10.60903/gsfcpgda-lola-poles) | D |
| T4 | Presencia/densidad de estructuras de impacto | Earth Impact Database | Robbins 2018 | D (escasa en la Tierra; se usa como bonificación, no como requisito) |
| G1 | Litología: anortosita / basalto / tefra | GLiM + Macrostrat (la anortosita no es una clase de GLiM: **brecha**, completar con mapas de anortositas publicados) | USGS Unified Geologic Map of the Moon (2020) | D (clase) |
| G3 | Emisividad / composición TIR | ASTER GED | Diviner Christiansen Feature | D |
| E3 | Inercia térmica | ATI desde MODIS | Diviner H-parameter (Hayne 2017) | D |
| E4 | Albedo | MODIS MCD43A3 | LROC WAC / Diviner | D |
| E5b | Fracción del año con Sol < 5° (con horizonte del DEM opcional) | Calculado (efemérides solares + latitud) | Mapas de iluminación LOLA (PGDA) | R |
| E2 | Rango térmico diurno (percentil) | MODIS LST día − noche | Diviner | R |
| W1 | Permafrost / hielo en el subsuelo | ESA CCI Permafrost | Mapa PSR LOLA (**LPSR_80S_20MPP_ADJ**, 506 349 PSR) + LEND/LP-NS + hielo M3 (Li 2018) | R |
| B1/O4 | Filtro: sin vegetación y suelo desnudo, roca o hielo | MODIS NDVI + ESA WorldCover | — | filtro |

Las operacionales O1-O3 (acceso, población y áreas protegidas) se muestran en la ficha, pero **no entran al score de analogía**. Sirven para la viabilidad del sitio como lugar de pruebas.

### 6.4 Perfiles de uso lunares (reemplazan a la tabla 4.2 para el MVP)
| Perfil | Terreno (T1-T4) | Materiales (G1, G3) | Térmica (E2-E4) | Iluminación (E5b) | Hielo (W1) |
|---|---|---|---|---|---|
| Aterrizaje y movilidad polar | 0.50 | 0.10 | 0.15 | 0.20 | 0.05 |
| ISRU de hielo en trampas frías | 0.20 | 0.05 | 0.20 | 0.15 | 0.40 |
| Navegación con iluminación rasante | 0.35 | 0.05 | 0.10 | 0.45 | 0.05 |
| Entrenamiento geológico (anortosita e impacto) | 0.25 | 0.55 | 0.10 | 0.05 | 0.05 |
| Hábitat en tubos de lava (pozo MTP) | 0.30 | 0.45 (basalto joven + GVP) | 0.20 | 0 | 0.05 |

### 6.5 Validación lunar
Los análogos lunares conocidos deben quedar arriba en su perfil correspondiente:
- Black Point Lava Flow / D-RATS y Craters of the Moon / BASALT-FINESSE → tubos de lava y basalto.
- Haughton (isla Devon) / HMP y Meteor Crater → impacto.
- Valles Secos de McMurdo y Svalbard → polar, iluminación y frío.
- Macizos de anortosita usados en simulantes de tierras altas → materiales.

Métrica: percentil de cada uno en su perfil (meta: top 5 %).

### 6.6 Cronograma (48 h)
| Bloque | Horas | Entregable |
|---|---|---|
| 1. Investigación: P2 (sitios lunares), P3 (análogos), P1 solo con los 12 parámetros de 6.3 | 0-5 | `targets.yaml`, `known_analogs.geojson`, `parameters.yaml` |
| 2. Perfiles objetivo lunares: recortes de LDEM 20 m + PSR + rugosidad PGDA, Diviner y mapa geológico USGS | 3-14 | `targets.json` (4 sitios) |
| 3. Matriz terrestre en GEE: GLO-30 → pendiente/rugosidad, MODIS LST/albedo/NDVI, WorldCover, ASTER GED, permafrost; agregada a H3 res 4 | 3-16 | `features_earth.parquet` |
| 4. E5b iluminación (Python: efemérides por celda) + GLiM/anortositas | 8-16 | columnas añadidas |
| 5. Scoring, validación y novedad (OpenAlex) | 16-24 | `scores_*.parquet`, `validation_report.md` |
| 6. Web (desde la hora 4 con datos simulados): mapa H3, vista dividida con Moon Trek, ranking, ficha y controles de pesos | 4-36 | App desplegada |
| 7. 1-2 casos "sorpresa" a fondo con P4 | 24-40 | Fichas + narrativa |
| 8. Video, diapositivas, citas y README | 36-46 | Entrega |

**Roles sugeridos:** (1) GEE / datos terrestres, (2) datos lunares (PGDA/PDS), (3) scoring y validación, (4) frontend, (5) narrativa y citas.

> **Atención con las proyecciones:** los productos polares LOLA vienen en estereográfica polar (metros). Hay que reproyectarlos a lat/lon lunar o calcular las métricas en la proyección nativa y solo agregar el resultado. **Nunca calcules pendiente sobre un raster en grados.** Lo mismo aplica a GLO-30 en la Tierra: calcula la pendiente con `ee.Terrain.slope`, que maneja la escala.

### 6.7 Hipótesis "sorpresa" lunares (a validar con los datos, no a asumir)
- **Macizos de anortosita en latitudes altas** (por ejemplo, Nain Plutonic Suite en Labrador o anortositas de Groenlandia): combinan **material de tierras altas + iluminación rasante + frío**, una combinación que ningún análogo clásico reúne.
- **Campos de lava jóvenes en Arabia** (Harrat Khaybar / Harrat Rahat; tubos como Umm Jirsan): análogos de pozos y tubos de mare poco usados por las agencias.
- **El Pinacate (México):** maars y lava; se usó para entrenar al Apolo, pero está poco caracterizado con datos modernos.
- **Tefras y cenizas finas** en volcanes áridos de los Andes centrales o de Etiopía, como análogos de las propiedades mecánicas del regolito.

### 6.8 Fase 2 (Marte)
Sitios: Jezero, Gale y Arcadia Planitia (SWIM). Parámetros adicionales: G2 (EMIT ↔ CRISM), E6, P1-P3 y B3. Las hipótesis de Marte (por ejemplo, yardangs del Lut o salares) se mueven aquí.

---

## 7. Riesgos y mitigaciones
| Riesgo | Mitigación |
|---|---|
| Descargas planetarias grandes y lentas | Usar productos globales de baja resolución (MOLA, TES, MCD) y teselas de Trek para visualizar |
| Cuotas o cuenta de Google Earth Engine | Registrarse hoy (uso no comercial); alternativa: earthaccess + Microsoft Planetary Computer (STAC) |
| Comparar magnitudes imposibles (temperatura) | Comparabilidad "R" con percentiles y declararlo |
| Score de "caja negra" | Ficha por dimensión, fórmula pública y pesos editables |
| Alucinación de fuentes al investigar con IA | El prompt maestro obliga a dar URL/DOI y un campo `verified`; nada sin fuente entra a `parameters.yaml` |
| Falta de datos polares en NASADEM | Copernicus GLO-30 + ArcticDEM/REMA |
| Sin catálogo global de cuevas | Proxy por vulcanismo y declararlo como brecha |

## 8. Criterios de evaluación de Space Apps (verificar en el sitio oficial)
Impacto/influencia, creatividad, validez, relevancia y presentación. Este diseño los cubre así: validez (validación y comparabilidad declarada), creatividad (novedad y perfiles de uso), relevancia (sitios objetivo reales de Artemis y Marte) y presentación (web + ficha explicativa). **Todas las fuentes deben citarse, aunque sean abiertas.**

## 9. Decisiones abiertas (le toca al equipo decidirlas)
1. ~~¿Marte o la Luna primero?~~ **Decidido: Luna primero** (2026-11-14). Ver sección 6.
2. ¿Quién tiene acceso a Google Earth Engine y quién domina Python geoespacial o React?
3. ¿Tamaño del equipo? Ajusta el recorte del MVP.
4. ¿Habrá un caso de estudio local con datos propios (fotos o muestras), que el reto permite?

---

## Fuentes consultadas para este borrador
- [USGS: Known Terrestrial Analog Sites for Planetary Science](https://www.usgs.gov/data/known-terrestrial-analog-sites-planetary-science)
- [ESA: Cataloguing otherworldly landscapes on Earth](https://www.esa.int/Our_Activities/Preparing_for_the_Future/Discovery_and_Preparation/Cataloguing_otherworldly_landscapes_on_Earth)
- [The Catalogue of Planetary Analogues (PDF)](https://freight.cargo.site/m/D1821053255089660420449933921929/The-Catalogue-of-Planetary-Analogues.pdf)
- [Europlanet Planetary Field Analogues (Space Science Reviews, 2017)](https://link.springer.com/10.1007/s11214-017-0369-1)
- [Preston & Dartnell 2014: Planetary habitability, lessons from terrestrial analogues](https://ui.adsabs.harvard.edu/abs/2014IJAsB..13...81P)
- [UPI: NASA identifies 9 possible landing regions for Artemis III](https://www.upi.com/Science_News/2024/10/28/nasa-artemis-moon-landing-regions/5971730152372/)
- [JPL: Where should future astronauts land on Mars? Follow the water (SWIM)](https://www.jpl.nasa.gov/news/where-should-future-astronauts-land-on-mars-follow-the-water/)
- [NASA Science: 10 things to know about planetary analogs](https://science.nasa.gov/solar-system/planetary-analogs/10-things-to-know-about-planetary-analogs)
- [PGDA: A New View of the Lunar South Pole from LOLA (LDEM 20 m, mapa PSR)](https://pgda.gsfc.nasa.gov/products/90)
- [PGDA: South Pole LOLA DEM Mosaic](https://pgda.gsfc.nasa.gov/products/81) y [mosaico LOLA de 5 m/px para 87-90°S](https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/87S/)
- [PGDA: Large-Scale Roughness Properties of the Lunar Poles](https://pgda.gsfc.nasa.gov/products/98)
- [Space Apps 2026](https://www.spaceappschallenge.org/2026/) y [FAQ de participantes](https://www.spaceappschallenge.org/resources/participant-faqs/)

El resto de los datasets (MOLA, LOLA, CRISM, EMIT, MODIS, etc.) se citan de memoria técnica y **deben verificarse con el prompt maestro** antes de la entrega.
