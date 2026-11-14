# Arquitectura v1: alcance, límites, tareas y plan de 30 horas

**Fecha:** 2026-11-14, ~16:30 h. **Entrega:** domingo 15 a las 23:59, hora local (~31 h).
**Sustituye** las decisiones del documento 01 donde haya conflicto (ver 03 §6). Las cifras citadas están verificadas en el documento 03.

---

## 1. Decisión de producto: el giro

### 1.1 Problema detectado
Hay al menos tres equipos de este mismo reto con repositorios públicos que ya hacen **"rejilla global + similitud ponderada + mapa"** (PTAE, TerraNova y terrestrial-analog-finder; ver 03 §4). Si hacemos lo mismo, el criterio **Creativity** queda en 2-3 de 5.

### 1.2 Propuesta: **PROVING GROUNDS**
> *"Find **where — and when —** Earth can rehearse NASA's Moon Base and Mars."*

(Es un nombre sugerido. "Proving ground" es la expresión que usa el propio documento de la Moon Base de NASA.)

Hay cuatro ideas que **ningún competidor tiene**. Cada una está ligada a un criterio de evaluación:

| # | Idea | Qué es | Criterio que sube | Por qué es defendible |
|---|---|---|---|---|
| 1 | **Analogía guiada por brechas oficiales** | No buscamos "lugares que se parezcan a la Luna". Partimos de las **brechas de la fase 1 de la Moon Base** que publicó NASA en abril de 2026 (aterrizaje de precisión en sombra, sobrevivir a la noche, movilidad en pendientes extremas, polvo y regolito, volátiles) y convertimos cada una en un **perfil de prueba** con requisitos físicos | **Relevance**, **Impact** | El documento de NASA dice que la fase 1 es para *"experiment and test capabilities"* y *"establish ground truth for Moon Base landing sites"*. Respondemos dónde probarlo en la Tierra |
| 2 | **Calendario análogo (4D)** | Un lugar es análogo **solo en ciertos meses**. Ejemplo: con el Sol a ≤7.5° sobre el horizonte, Svalbard en octubre se parece al Polo Sur lunar (≤6° del polo + 1.54° de inclinación). Se calcula por celda y por mes | **Creativity** | La geometría solar es analítica (se puede verificar), y los meses salen de la climatología mensual de NASA POWER |
| 3 | **Comparabilidad explícita D/R/N y "Analogy Break Card"** | Cada parámetro dice si es **D** (misma magnitud física, comparable), **R** (extremo relativo, percentil terrestre) o **N** (la Tierra no lo reproduce). La ficha de cada sitio muestra **qué coincide, qué falla y qué nunca será análogo** | **Validity** | Es el requisito textual del reto: *"where the analogy breaks down"* |
| 4 | **Embudo multiescala** | Cribado global (celdas de 55 km) → zoom local (DEM de 30 m) para comprobar los **umbrales reales de NASA**: <10° a 100 m y <20° a 2 km | **Validity**, **Relevance** | Responde a *"Consider scale"* y usa los requisitos publicados (NTRS 20250009323) |

Además (fase 2, si da tiempo): **novedad medida con la literatura** (conteo en OpenAlex por topónimo) y **casos de estudio** con EMIT (minerales) y RADARSAT-1 o RCM (de CSA, agencia socia).

### 1.3 Los objetivos (cuerpos y sitios)
| Prioridad | Objetivo | Por qué |
|---|---|---|
| **1** | **Moon Base: región del Polo Sur lunar (≤6° del polo)** | Título del reto, prioridad de NASA en 2026 (Ignition) y Diviner en Resources |
| 2 | **Marte: zonas de hielo para aterrizaje humano (SWIM: Arcadia Planitia y Deuteronilus Mensae)** | Conecta con *SR-1 Freedom* (helicópteros que buscarán sitios de aterrizaje humano) y el workshop de las 47 EZ |
| 3 (opcional) | Marte, Jezero (astrobiología) | Requiere minerales (EMIT) para ser serio: solo como caso de estudio |

### 1.4 Perfiles de prueba (versión inicial)
| ID | Perfil (UI en inglés) | Brecha de NASA que ataca | Parámetros |
|---|---|---|---|
| `moon_lowsun_nav` | Low-sun navigation & precision landing | Aterrizaje de precisión y evitación de peligros en poca visibilidad y sombra | Días con el Sol a ≤7.5° (D), relieve (R), aridez (R), sin hielo permanente (albedo) |
| `moon_night_survival` | Survive the cold & dark | Mecanismos y electrónica para frío extremo y la noche | Temperatura mínima (R), días de noche polar (D/R), rango térmico (R) |
| `moon_polar_mobility` | Extreme-slope polar mobility | Descender a las PSR por las pendientes de los cráteres | Pendiente p90 (R), relieve (R), frío (R), sin vegetación |
| `moon_volatiles` | Frozen volatiles prospecting | Localización de recursos, ISRU | Permafrost por proxy (temperatura media anual < −2 °C), aridez, sin vegetación |
| `moon_dust_regolith` | Dust & regolith handling | Polvo abrasivo, manipulación de regolito | Aridez extrema (R), viento (R), sin vegetación |
| `mars_ice_landing` | Mars ice-rich landing zone (SWIM) | Aterrizaje humano junto a hielo accesible | Temperatura media anual muy fría (R), aridez (R), permafrost (R), albedo ~0.25 (D, con matiz) |

> Los pesos y umbrales iniciales viven en `pipeline/config/profiles.yaml`. Cada umbral tiene su fuente o la marca `verified: false`.

---

## 2. Alcance: qué SÍ y qué NO

### 2.1 Sí entra en la entrega (MVP)
1. **Web estática en inglés**: un globo con el mapa global de "analogía" por perfil, un deslizador de mes (calendario), pesos ajustables, un ranking de candidatos, la ficha *Analogy Break Card* y la capa de análogos conocidos.
2. **Datos de NASA como núcleo**: NASA POWER (MERRA-2/CERES, 2001-2025), elevación de SRTM vía Terrain Tiles, el mapa base de **NASA GIBS** (Worldview), las constantes del NSSDC y los requisitos de Artemis (NTRS).
3. **Validación**: percentil que obtienen los análogos conocidos y sensibilidad del top-20 a ±20 % en los pesos.
4. **1-2 casos de estudio "sorpresa"** con zoom local: DEM de 30 m y comprobación de los umbrales <10° y <20°.
5. **Página de metodología y fuentes** (obligatoria por las reglas de referencias).

### 2.2 No entra (y lo decimos explícitamente)
| Fuera de alcance | Por qué | Cómo se comunica |
|---|---|---|
| Declarar "el mejor sitio de aterrizaje" | No es el reto y no tenemos autoridad | "Screening tool, not a site certification" |
| Reproducir PSR, vacío, gravedad o radiación | La Tierra no puede | Bloque fijo **N** en cada ficha |
| Mineralogía global | EMIT es de 60 m y por escenas, con login. No cabe en 30 h a escala global | Solo en el caso de estudio |
| Catálogo global de cuevas y tubos de lava | No existe en la Tierra | Brecha declarada |
| Coordenadas exactas de las 9 regiones | NASA no las publica en el comunicado | Se usa el requisito "≤6° del polo" |
| Comparar temperaturas absolutas Luna-Tierra | La Luna llega a <110 K en las PSR; la Tierra no | Comparabilidad **R** (percentil) |

---

## 3. Límites técnicos y científicos (lista honesta para la página de metodología)

1. **Resolución**: celdas de 0.5° × 0.625° (~55 × 69 km en el ecuador). No resuelven cráteres pequeños ni tubos de lava. Por eso existe el zoom local.
2. **Pendiente global**: se calcula con píxeles de ~5 km, así que es una **pendiente regional** y **no** la pendiente de aterrizaje a 100 m.
3. **Polos**: las teselas Web Mercator no cubren más allá de 85.05°. En el interior antártico no hay relieve (NaN), y la cobertura baja la confianza.
4. **Temperatura**: POWER da **temperatura del aire a 2 m** (reanálisis MERRA-2), no temperatura de superficie. La Luna no tiene aire. La analogía es **R** (extremo relativo).
5. **Luz**: en la Tierra la atmósfera dispersa luz y **rellena las sombras**; en la Luna las sombras son negras. La analogía de iluminación rasante es **geométrica, no radiométrica**.
6. **Permafrost**: proxy de temperatura media anual < −2 °C. No es una medición. Sustituir por ESA CCI Permafrost si da tiempo.
7. **Vegetación**: proxy de precipitación y albedo en el MVP. Sustituir por MODIS NDVI (MOD13) si da tiempo.
8. **Análogos conocidos**: lista curada con coordenadas **aproximadas**. Validar con la capa de USGS (DOI 10.5066/P9J72921) cuando alguien del equipo la descargue manualmente.

---

## 4. Arquitectura técnica

```
┌──────────────── PIPELINE OFFLINE (Python 3.14, .venv) ────────────────┐
│ fetch_terrain.py   AWS Terrain Tiles z5 ──► terrain_grid.npz           │
│ fetch_power.py     NASA POWER climatology ──► power_grid.npz           │
│ build_features.py  + solar.py (geometría analítica) ──► features       │
│ score.py           perfiles YAML ──► ranking + validación              │
│ export_web.py      ──► web/public/data/*.bin + manifest.json           │
└───────────────────────────────┬────────────────────────────────────────┘
                                ▼ archivos estáticos (~pocos MB)
┌──────────────── WEB (Vite + TypeScript + MapLibre GL v5) ──────────────┐
│ • Globo 3D (proyección globe) sobre NASA GIBS Blue Marble              │
│ • Celdas coloreadas por score (feature-state; recálculo en el navegador)│
│ • Deslizador de mes = Calendario análogo                               │
│ • Perfil + pesos ajustables, ranking y Analogy Break Card              │
│ • Capa de análogos conocidos (novedad = distancia al más cercano)      │
│ • Página de método y fuentes                                           │
└────────────────────────────────────────────────────────────────────────┘
```

**Decisiones y su porqué:**
| Decisión | Alternativa descartada | Razón |
|---|---|---|
| Rejilla = rejilla nativa de POWER | H3 | Sin remuestreo climático: un error menos. H3 queda para el zoom regional |
| Sin backend | FastAPI (lo usan 2 competidores) | Despliegue gratis en GitHub Pages, cero mantenimiento y funciona para cualquier usuario: **Validity, usabilidad** |
| El mismo scoring en Python (referencia + tests) y en TypeScript (interactivo) | Solo Python | Pesos en vivo sin servidor. Los tests garantizan que ambos coincidan |
| Datos binarios cuantizados (uint8 por mes) | GeoJSON con todo | ~50 mil celdas × 12 meses × N parámetros caben en pocos MB |
| Mapa base de NASA GIBS | Mapbox u OSM | Es un recurso oficial del reto (Worldview/GIBS) y no requiere clave: **Relevance** |
| Explicaciones con plantillas deterministas | Generar el texto con un LLM | Reproducible y sin riesgo con la regla SI. Se declara el uso de IA solo en el desarrollo |

**Para la fase 2 (tecnología de punta, solo si sobra tiempo):**
- Vista dividida Tierra ↔ Luna/Marte con las teselas WMTS de NASA Trek.
- Zoom local con Copernicus DEM GLO-30 o SRTMGL1 vía `earthaccess` (Earthdata Login del equipo).
- GeoParquet + DuckDB-WASM para consultas tipo "muéstrame celdas con X y Y".
- Embeddings de NASA/IBM **Prithvi-EO-2.0** como dimensión de textura, **siempre como dimensión secundaria** (el reto pide ir más allá de lo visual).

---

## 5. Validación (lo que verán los jueces en Validity)
1. **Recall de análogos conocidos**: percentil de cada sitio conocido en su perfil. Meta: mediana en el top 10 %.
2. **Control negativo**: las selvas húmedas, por ejemplo, deben quedar en el último cuartil.
3. **Sensibilidad**: solapamiento del top-20 con pesos a ±20 % (Jaccard).
4. **Prueba de cordura del calendario**: en latitudes bajas el perfil de luz rasante debe dar 0 días; cerca de los círculos polares, solo meses de invierno.
5. Todo se publica en `data/processed/validation_report.md` y en la página de metodología.

---

## 6. Tablero de tareas (equipo de hasta 6 personas)

**Roles:** **A** datos terrestres · **B** ciencia planetaria y fuentes · **C** scoring y validación · **D** frontend · **E** historia, demo y entrega · **F** casos de estudio (opcional).

| # | Tarea | Rol | Horas | Depende de | Criterio de "hecho" |
|---|---|---|---|---|---|
| T1 | Correr el pipeline base (terreno + POWER) | A | 0.5 | — | Existen `terrain_grid.npz` y `power_grid.npz` *(ya está en marcha)* |
| T2 | Revisar umbrales y fuentes de `profiles.yaml` (que cada uno tenga su fuente) | B | 3 | — | Sin umbrales sin fuente; si falta la fuente, `verified: false` y visible |
| T3 | Descargar manualmente la capa de USGS (DOI 10.5066/P9J72921) y reemplazar la lista curada | B | 1 | — | `data/raw/usgs_analogs.*` cargado |
| T4 | Sustituir los proxies: MODIS NDVI y ESA CCI Permafrost (si hay Earthdata o GEE) | A | 4 | T1 | Nuevas columnas en las features |
| T5 | Validación: recall, controles negativos y sensibilidad | C | 3 | T1, T2 | `validation_report.md` |
| T6 | Novedad con la literatura (OpenAlex) para el top-N | C | 2 | T5 | Columna `n_papers` en los candidatos |
| T7 | Web: pulido de la UI, página de metodología y accesibilidad | D | 6 | — | Funciona en móvil y escritorio, todo en inglés |
| T8 | Despliegue en GitHub Pages | D | 1 | T7 | URL pública sin login |
| T9 | Caso de estudio 1 (zoom de 30 m + umbrales de NASA) | F | 5 | T5 | Ficha completa con fuentes |
| T10 | Caso de estudio 2: un lugar **cercano al equipo** (premio Local Impact) | F/E | 4 | T5 | Ficha + foto propia si es posible |
| T11 | Polígonos de las 9 regiones (LROC QuickMap) para la vista lunar | B | 2 | — | GeoJSON con la fuente |
| T12 | Demo: video de 30 s **o** 7 diapositivas, en inglés | E | 4 | T7 | Dentro del límite estricto |
| T13 | Página de envío: resumen, descripción, datos NASA, referencias y declaración de IA | E | 2 | todas | Campos completos antes de las 22:00 del domingo |

---

## 7. Cronograma (hora local; ajustar a la hora real del evento)

| Bloque | Ventana | Hitos |
|---|---|---|
| **Sábado tarde** | 16:30-20:00 | Pipeline base + prototipo web *(entregado en este primer avance)*. Asignar roles. T2, T3 y T11 en paralelo |
| **Sábado noche** | 20:00-02:00 | T4, T5 y T7. **Congelar el modelo a la 01:00** (sin parámetros nuevos después) |
| **Domingo mañana** | 08:00-13:00 | T6, T9 y T10. Elegir los 2 casos "sorpresa" según los resultados reales |
| **Domingo tarde** | 13:00-19:00 | T8 + T12. Ensayar la demo con alguien ajeno al proyecto |
| **Domingo noche** | 19:00-22:00 | T13 y envío. **Enviar a las 22:00** (holgura de 2 h; se puede reenviar las veces que haga falta) |

---

## 8. Cómo cubrimos cada criterio (lista para la presentación)

| Criterio | Evidencia concreta en el proyecto |
|---|---|
| **Impact** | Sirve a una necesidad real y actual de NASA (las brechas de la fase 1 de la Moon Base). Ayuda a los equipos de prueba a elegir **dónde y cuándo** probar. Herramienta abierta y reutilizable por cualquier agencia o universidad |
| **Creativity** | Analogía **guiada por brechas** + **calendario 4D** + Analogy Break Card D/R/N. Ningún competidor público lo hace |
| **Validity** | Umbrales con fuente (NTRS, NSSDC), validación con análogos conocidos, controles negativos, sensibilidad, límites declarados y web usable sin instalación |
| **Relevance** | NASA POWER, SRTM, GIBS, NSSDC, requisitos de Artemis y el documento de la Moon Base 2026 como **núcleo**, no como decoración |
| **Presentation** | Arco narrativo: *"NASA will build a Moon Base. Before we go, where — and when — on Earth can we rehearse it?"* Demo de 30 s con el globo y el deslizador de mes |

### 8.1 Guion sugerido para el video de 30 s (en inglés)
- **0-3 s:** "We're <team>, tackling NASA's Moon & Mars analog challenge."
- **3-8 s:** "NASA is building a Moon Base at the lunar South Pole. Before astronauts go, every system must be tested on Earth."
- **8-20 s:** Pantalla: el globo, se elige "Low-sun navigation" y el deslizador de mes enciende el Ártico en octubre. Se abre una ficha: "matches · breaks · never analog". "PROVING GROUNDS turns NASA's own Moon Base gaps into a map of where — and when — Earth can stand in."
- **20-30 s:** "Built on NASA POWER, SRTM, GIBS and Artemis requirements. Open, free, for every test team on Earth."

---

## 9. Declaración de uso de IA (borrador para el formulario, en inglés)
> "We used an AI coding assistant (Claude) to accelerate literature lookup, source verification and boilerplate code (data download scripts, web scaffolding). The concept, the gap-driven profiles, the parameter choices and all scientific claims were defined and reviewed by the team; every figure is traced to a cited source. No AI-generated images or audio are used."

*(Ajustadla a lo que realmente haga el equipo. Recordad que la regla dice que la IA no debe generar la idea.)*

---

## 10. Estado del primer avance (2026-11-14, noche)

**Funciona de punta a punta** (`README.md` tiene los comandos):
- Pipeline: 62 852 celdas de tierra; NASA POWER completo (6 parámetros × 390 cajas, 0 fallos); terreno z5; geometría solar analítica.
- Web: `npm run dev` en `web/` (o `npm run build` para la versión estática); despliegue con `.github/workflows/pages.yml`.
- Tests: 13 de Python (`pytest pipeline/tests`) + 4 de TypeScript (`npm test`). Garantizan que la web y Python puntúan igual.
- Zoom local: `pipeline/scripts/local_zoom.py` (en Haughton, el 86.7 % del área cumple <10° a 100 m).

**Validación v1** (detalle completo en `data/processed/validation_report.md`):

| Perfil | Positivos documentados (percentil mediano) | Trópico húmedo marcado análogo | Celdas análogas | Estabilidad ±20 % |
|---|---|---|---|---|
| Low-sun navigation | p97 | 0 % | 519 | 0.78 |
| Survive the cold & dark | p74 | 0 % | 15 777 ⚠️ demasiado permisivo | 0.96 |
| Extreme-slope polar mobility | p94 | 2.5 % | 1 344 | 0.91 |
| Frozen volatiles (ISRU) | p99 | 0 % | 2 335 | 0.86 |
| Dust & regolith | p70 | 0 % | 5 074 | 0.98 |
| Mars ice-rich landing | p83 | 0 % | 7 879 | 0.88 |

**Correcciones hechas tras la v0** (también en el reporte): la pendiente regional ahora solo excluye montañas; se usa el albedo de la estación sin nieve; la aridez sigue la definición de desierto de [USGS/Meigs](https://pubs.usgs.gov/gip/deserts/what/) (<250 mm/año); y el perfil de polvo excluye las capas de hielo. **Riesgo de circularidad declarado:** los mismos positivos sirvieron para diagnosticar y para validar. La capa de USGS (T3) servirá de prueba independiente.

**Primeros candidatos "NEW"** (hipótesis para los casos de estudio T9 y T10; hay que mirarlos con el zoom local antes de presentarlos):
- *Extreme-slope polar mobility:* Khovd (Altái mongol), Ladakh, Pamir (Gorno-Badakhshan) y Coquimbo (Chile).
- *Frozen volatiles:* Kunlun occidental / Aksai Chin (Xinjiang) y Peary Land (norte de Groenlandia).
- *Dust & regolith:* Sáhara atlántico (región de Dakhla), Tibesti (Chad), desierto oriental de Egipto y Farah (Afganistán).
- *Low-sun navigation:* Victoria Land (Antártida), Sakha (Siberia, en octubre y febrero) y la costa oeste de Groenlandia.

**Pendientes inmediatos sugeridos:** endurecer *Survive the cold & dark* (el umbral p2-p30 deja un 25 % de la tierra como análoga), T3 (capa de USGS), T4 (NDVI y permafrost reales) y elegir 2 casos de estudio.
