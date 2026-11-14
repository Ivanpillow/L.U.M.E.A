# Investigación verificada: reto "Analog the Permanent Moon Base Locations and Mars"

**Fecha de corte:** 2026-11-14 (día 1 del hackathon).
**Método:** cada afirmación se contrastó con la fuente primaria (NASA, NTRS, NSSDC, sitio oficial de Space Apps, USGS o LP DAAC) y, cuando fue posible, con una segunda fuente independiente.

**Leyenda de estado**
- ✅ **Confirmado**: lo dice la fuente primaria y al menos otra fuente coincide, o se leyó directamente en el documento oficial.
- ⚠️ **Discrepancia o matiz**: las fuentes difieren o hay una condición importante. Se explica el porqué.
- ❓ **Fuente única o no verificado**: no se pudo corroborar. No usar como dato duro en la entrega.

---

## 1. El reto oficial (leído directamente en spaceappschallenge.org) ✅

- **Título:** *Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars*
- **Niveles:** Advanced, Intermediate y Beginner/Youth. **Temas:** Earth Science, Planets & Moons, Software, Space Exploration.
- **Lo que pide:** usar datos abiertos de la Tierra, la Luna y Marte (de NASA y otras agencias) para **identificar y caracterizar NUEVOS análogos terrestres** de futuras bases o sitios de aterrizaje, y presentarlos como mapa, visualización u otra herramienta.
- **Ideas textuales clave** (son lo que buscará el juez):
  - *"The goal is not simply to rediscover well-known analog sites, or to find one place that simply looks like the Moon or Mars."*
  - Explicar **qué es análogo, qué tan similar es y qué no lo es**.
  - Ocho dimensiones: geología/mineralogía; terreno (elevación, pendiente, rugosidad, cráteres); temperatura, iluminación y extremos; agua, hielo y permafrost; polvo, viento y erosión; biología y biofirmas; cuevas y subsuelo; condiciones para aterrizaje, movilidad, navegación y construcción.
  - **Procesos además de lugares** (sedimentación, tormentas de polvo, vulcanismo, dinámica del hielo).
  - **Escala:** *"A particular crater, valley, volcanic field… could provide a much stronger match."*
  - **Ir más allá** de Antártida, Atacama, Islandia y Hawái: *"NASA's global Earth-observation datasets may allow you to discover compelling analogs in places that have received much less attention."*
  - **Límites de la Tierra:** gravedad reducida, vacío lunar, atmósfera marciana tenue y radiación.
  - *"Surprise us."*
- **Pestaña Resources (oficial):**
  - NASA: Earthdata Search, Worldview, Planetary Data System (PDS), LRO (LROC, LOLA, Diviner, LEND, Mini-RF) y **Diviner** destacado (*"polar and resource products could be compared with extreme cold, ice-bearing… terrestrial environments"*).
  - Agencias socias: **CSA** (RADARSAT Constellation Mission, RADARSAT-1 con licencia abierta y un tutorial de SAR en Python), **ESA** (Copernicus Data Space Ecosystem, Open Science Catalog) y **JAXA** (G-Portal).
- Fuente: [Página oficial del reto](https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/) (leída el 2026-11-14).

> **Implicación de diseño:** el título habla de *Permanent Moon Base*. El juez espera que la Luna sea protagonista y que Diviner se use de verdad (es el único dataset que el reto destaca con nombre).

---

## 2. Reglas de entrega y evaluación (fuente oficial) ✅

| Regla | Detalle | Fuente |
|---|---|---|
| Fechas | Hackathon del 14 al 15 de nov. de 2026. **Cierre: domingo 15 a las 23:59, hora local del evento** | [Judging & Awards Guide](https://www.spaceappschallenge.org/resources/judging-awards-guide/), [FAQ](https://www.spaceappschallenge.org/resources/participant-faqs/) |
| Demo | **Video de ≤30 s** (subtítulos en inglés si se habla otro idioma) **o ≤7 diapositivas** (incluidas la portada y la introducción). Si se excede, el proyecto **no es elegible** | [Project Submission Guide](https://www.spaceappschallenge.org/resources/project-submission-guide/) |
| Idioma | **Inglés** en la página de envío y **en todo material enlazado**. La web debe estar en inglés | Ídem |
| Datos NASA | Obligatorio usar al menos un dato o recurso de NASA para optar a un premio global | Ídem |
| Agencias socias | "Highly encouraged". La lista de 2026 tiene 17 agencias, entre ellas CSA, ESA, ISRO, JAXA, KASA, la Agencia Espacial Española, la CONAE (Argentina), la Agencia Espacial Brasileña, la Agencia Espacial Paraguaya y la UKSA | Ídem |
| Uso de IA ("Super Intelligence", SI) | Permitida. Hay que **declarar cómo se usó**. Las imágenes y videos generados llevan **marca de agua visible**; el código y los datos generados se reconocen en el texto o los metadatos. *"SI should not be used to come up with your idea"* | Ídem y FAQ |
| Referencias | Todo recurso externo (código, texto, imágenes, aunque sea abierto) va en el campo *References* | Judging Guide |
| Restricción China | Revisión de "prohibited bilateral activity with China". **Recomendación:** no depender de productos de la CNSA (Chang'e o Zhurong) como componente central. Citar sus coordenadas públicas es contexto, no colaboración, pero no vale el riesgo | Judging Guide |
| Equipo | Máximo 6 personas, registradas en el mismo evento local | FAQ |

**Criterios (escala del 1 al 5 cada uno):** Impact, Creativity, Validity, Relevance y **Presentation**. La guía insiste en que la presentación pesa igual que los demás.

**Premios globales** (para orientar la narrativa): Best Use of Science, **Best Use of Data**, Best Use of Technology, Galactic Impact, **Best Mission Concept**, Most Inspirational, Best Storytelling, Global Connection, Art & Technology y **Local Impact**.

---

## 3. Contexto de misión 2026: cambios que el documento 01 no tenía

### 3.1 Artemis III ya no aluniza ✅ (crítico)
- **NASA, 4 de nov. de 2026:** *Artemis III* será un **vuelo de prueba en órbita terrestre (2027)** de 14 días para ensayar el encuentro y el acoplamiento de Orion con los módulos de aterrizaje de SpaceX (Starship V3) y Blue Origin (Blue Moon). **El alunizaje tripulado pasa a Artemis IV (2028)** en el Polo Sur.
  - Primaria: [NASA, "NASA Shares Plans to Accelerate Artemis, Return to Moon"](https://www.nasa.gov/missions/artemis/nasa-shares-plans-to-accelerate-artemis-return-to-moon/)
  - Corroboración: [SpacePolicyOnline, 23 oct. 2026](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/) (Isaacman: el Polo Sur *"is probably the most advantageous area"*; falta información de los módulos robóticos CLPS)
- **Consecuencia:** en la entrega no hay que escribir "sitios de Artemis III". Lo correcto es "las 9 regiones candidatas del Polo Sur identificadas por NASA (oct. 2024) para el primer alunizaje tripulado de Artemis".

### 3.2 Moon Base: el "Permanent Moon Base" del título ✅
- El **24 de marzo de 2026**, en el evento *Ignition*, NASA anunció que **EE. UU. establecerá una Moon Base en la región del Polo Sur lunar** con un enfoque por fases. Fuente primaria: [NASA, *Moon Base User's Guide: Architecture Resources* (NP-2026-04-6806-HQ, abril de 2026)](https://www.nasa.gov/wp-content/uploads/2026/04/moon-base-architecture-users-guide.pdf).
- Fases, según la tabla del documento (pág. 4):

| Fase | Lanzamientos / alunizajes | Carga a superficie | Hitos |
|---|---|---|---|
| 01 | 25 / 21 | ~4 000 kg | Acceso fiable a la superficie, **"Establish ground truth for Moon Base landing sites"**, **"Experiment and test capabilities"**, primera misión tripulada a la base |
| 02 | 27 / 24 | ~60 000 kg | Infraestructura inicial, demostraciones tecnológicas y misiones tripuladas semestrales |
| 03 | 29 / 28 | ~150 000 kg | **Manipulación de regolito y preparación del sitio** y presencia tripulada continua |

- **Retos ambientales que nombra el documento** (son el anzuelo perfecto para el proyecto):
  - **Iluminación:** *"the Sun will remain low on the horizon, casting dramatic shadows"*. Hay que sobrevivir a la noche lunar y operar en sombra permanente.
  - **Terreno:** *"topography of extremes"*. Hay que descender y subir las pendientes extremas de los cráteres para llegar a los volátiles congelados de las PSR.
  - **Brechas de conocimiento y tecnología de la fase 1:** aterrizaje de precisión y evitación de peligros con poca visibilidad y en sombra; interacción pluma-superficie (PSI); polvo abrasivo y electrostático; mecanismos y electrónica para frío extremo; movilidad en zonas iluminadas y dentro de PSR; excavación y compactación de regolito; datos de alta resolución de los sitios.
- **Marte en el mismo documento:** *SR-1 Freedom* (propulsión eléctrica nuclear) con **una flota de helicópteros robóticos que explorarán Marte para buscar regiones candidatas de aterrizaje humano**.
- ⚠️ Los plazos de la base varían según la fuente (2030-2033) y una sola fuente de baja calidad menciona Shackleton. **El sitio exacto no está decidido.** [Scientific American](https://www.scientificamerican.com/article/inside-nasas-very-ambitious-moon-base-plan/) y [Planetary Society](https://www.planetary.org/articles/ignition-new-nasa-initiatives) sirven de contexto.

### 3.3 Las 9 regiones candidatas del Polo Sur ✅
- **Peak near Cabeus B, Haworth, Malapert Massif, Mons Mouton Plateau, Mons Mouton, Nobile Rim 1, Nobile Rim 2, de Gerlache Rim 2 y Slater Plain.** Sustituyen a las 13 de agosto de 2022.
  - Primaria: [NASA Release 24-136 (28 oct. 2024)](https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/)
  - Corroboración técnica: [NTRS 20250011660, George et al., *Artemis III Site Selection Update: Downselection from Thirteen to Nine* (LPSC 2026)](https://ntrs.nasa.gov/citations/20250011660)
- Cada región mide **~15 × 15 km** (dato de prensa: [Space.com](https://www.space.com/space-exploration/artemis/nasa-announces-9-possible-moon-landing-sites-for-artemis-3-lunar-mission), [Astronomy](https://www.astronomy.com/space-exploration/here-are-the-nine-sites-where-artemis-3-might-land-on-the-moon/)). ⚠️ No figura en el comunicado de NASA que se leyó.
- ❓ **Coordenadas de los centros:** NASA no las publica en el comunicado. Solo hay un punto de un estudio académico: Nobile Rim 2 en 84.2016° S, 60.6999° E ([arXiv 2406.19863](https://arxiv.org/pdf/2406.19863)). **Acción:** sacar los polígonos de LROC QuickMap o del mapa de NASA y digitalizarlos. Mientras tanto, la app usa "región del Polo Sur (≤6° del polo)", que **sí** es un requisito publicado.

### 3.4 Requisitos de ingeniería para el aterrizaje lunar ✅ (sirven como filtros del modelo)
Leídos en [NTRS 20250009323, *Artemis Overview* para el International Space Apps Challenge 2025](https://ntrs.nasa.gov/api/citations/20250009323/downloads/ArtemisOverview2025IntSPAPPSChallenge.pdf), diapositiva *"Key Artemis III Landing Requirements"*:

| # | Requisito | Valor |
|---|---|---|
| 1 | Latitud | **A ≤6° del Polo Sur** |
| 2 | Pendiente para aterrizar (escala de 100 m) | **<10°** |
| 3 | Pendiente para EVA (escala de 2 km) | **<20°** |
| 4 | Comunicación | Directa con la Tierra (DTE), sin relé. Las figuras excluyen zonas con **visibilidad de la Tierra <25 %** |
| 5 | Iluminación | De superficie y de aproximación. Las figuras excluyen zonas con **visibilidad solar <5 %** |
| 6 | Precisión | Aterrizar a ≤100 m del objetivo |

- **Corrección al documento 01:** el umbral de pendiente es **<10° a 100 m**, no "≤8-10°".
- George et al. (2026) añade que la iluminación polar **se desplaza unas 2-3 semanas por año**, que la estancia en superficie dura **~5.75-6.25 días** y que se priorizan regiones con poca variabilidad de pendiente y pocos bloques o cráteres peligrosos.
- Contexto: [*Lunar Site Selection*, white paper de la arquitectura Moon to Mars de 2023 (NTRS 20230016267)](https://ntrs.nasa.gov/api/citations/20230016267/downloads/Lunar%20Site%20Selection.pdf).

### 3.5 Geometría de iluminación en el Polo Sur ✅
- El eje de giro lunar está inclinado **~1.54°** respecto a la eclíptica. Por eso, en el polo, el Sol "roza" el horizonte todo el año y existen las regiones en sombra permanente (PSR).
  - [NASA Science, *South Pole Illumination Map*](https://science.nasa.gov/photojournal/south-pole-illumination-map/) (1.54°), [NASA LRO, *Permanently Shadowed Regions*](https://science.nasa.gov/wp-content/uploads/2024/01/lro-litho5-shadowed.pdf) (1.5°)
  - ⚠️ Una visualización del SVS dice 1.6° "respecto al Sol". Es solo redondeo.
- **Dato derivado** (cálculo propio, verificable): a ≤6° del polo y con 1.54° de inclinación, la **elevación solar máxima ≈ 6° + 1.54° ≈ 7.5°**. Es la base del **calendario análogo de iluminación** del proyecto.

### 3.6 Marte: sitios para exploración humana ✅
- **Workshop *First Landing Site/Exploration Zone* (LPI, Houston, 27-30 oct. 2015): 47 propuestas de Exploration Zones (EZ).** Una EZ es un conjunto de regiones de interés a **≤~100 km** de un sitio central de aterrizaje.
  - Primaria: [NTRS 20150019636](https://ntrs.nasa.gov/citations/20150019636), [NTRS 20160001040](https://ntrs.nasa.gov/citations/20160001040)
  - Corroboración: [Planetary Society, 2016](https://planetary.org/articles/20160122-nasa-h2m-landing-site-selection)
  - ⚠️ Un abstract del IAC de 2017 dice 46. Usar **47** (es la cifra de NASA y la que repiten la mayoría de las fuentes).
- **SWIM (*Subsurface Water Ice Mapping*):** mapas de **consistencia de hielo** que combinan neutrones, termal, radar (SHARAD) y geomorfología. La escala va de −1 (los datos contradicen el hielo) a +1. Las mejores zonas son **Arcadia Planitia** y **Deuteronilus Mensae**.
  - [Morgan et al. 2021, *Nature Astronomy*, DOI 10.1038/s41550-020-01290-z](https://link.springer.com/article/10.1038/s41550-020-01290-z), [USGS: *SWIM 2.0 data products*](https://pubs.usgs.gov/publication/70233244), [swim.psi.edu](https://swim.psi.edu/)
  - ❓ No se encontró un "release" único del mapa en el PDS. Los productos están en el sitio de SWIM (PSI).
- **Constantes de Marte** (NSSDC, ✅): gravedad **3.73 m/s² (0.38 g)**; presión **6.36 mb** (de 4.0 a 8.7 según la estación); temperatura media **~214 K (−59 °C)**; rango diurno en Viking 1 de **184-242 K**; albedo de Bond **0.250**; oblicuidad **25.19°**. [NSSDC Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html)
- **Constantes de la Luna** (NSSDC, ✅): gravedad **1.62 m/s² (0.165 g)**; albedo de Bond **0.11**; rango térmico ecuatorial de **95-390 K**; presión nocturna de **3 × 10⁻¹⁵ bar**. [NSSDC Moon Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html)

---

## 4. Competencia: otros equipos de 2026 en este mismo reto ✅ (repositorios públicos)

| Equipo / repo | Qué hace | Debilidad que declaran |
|---|---|---|
| [PTAE](https://github.com/JFJubayer/nasa-space-apps-2026-ptae) | 33 regiones terrestres vs. 8 objetivos. Firma de pendiente, exponente de Hurst, relieve, NASA POWER y etiquetas geológicas. Media geométrica ponderada, 1 000 pesos aleatorios y AUC | Luna débil (AUC 0.66); POWER grueso; geología "a juicio" |
| [TerraNova](https://github.com/KraKEn-bit/TerraNova) | ~78 mil celdas de 0.5°. NASA POWER, NDVI de GIBS, terrain tiles. Globo en Three.js con pesos ajustables | Celdas de 55 km; objetivos por "percentil" y no medidos; novedad frente a solo 12 sitios |
| [terrestrial-analog-finder](https://github.com/shishir-kuet/terrestrial-analog-finder) | Ventanas de 12 km con DEM de 30 m (LOLA, CTX, Copernicus). Similitud geométrica de 0 a 100 | **Solo geometría** y a una sola escala |

**Conclusión:** el "motor global de similitud ponderada" del documento 01 **ya no es original**. Hace falta diferenciarse (ver el documento 04): partir de **las brechas oficiales de la Moon Base 2026**, añadir la dimensión **temporal** (calendario análogo), trabajar en **varias escalas** y medir la **novedad con la literatura real**.

---

## 5. Datasets: estado de verificación

### 5.1 Usados en el primer avance (acceso probado hoy desde este equipo)
| Dataset | Proveedor | Acceso probado | Notas |
|---|---|---|---|
| **NASA POWER Climatology API** v2.10.1 | NASA LaRC (MERRA-2 + CERES) | ✅ HTTP 200, sin login | Climatología **2001-2025**. Rejilla 0.5° × 0.625°. **1 parámetro por petición regional** (máx. 10° × 10°). `T2M_MIN` = **mínima horaria** del periodo (no la media de las mínimas). [Docs](https://power.larc.nasa.gov/docs/) |
| **AWS Terrain Tiles** (Terrarium) | Mapzen/Tilezen sobre SRTM (NASA), GMTED2010, ETOPO1 | ✅ sin login | Web Mercator: no hay datos en |lat| >85.05°. [Registry](https://registry.opendata.aws/terrain-tiles/) |
| **NSSDC Fact Sheets** | NASA GSFC | ✅ | Constantes de la Luna y Marte |

### 5.2 Verificados en documentación (para la fase 2 y el zoom local)
| Dataset | Estado | Detalle verificado | Fuente |
|---|---|---|---|
| **EMIT L2B Mineral ID (EMITL2BMIN v001)** | ✅ | 60 m. **10 minerales clave**: calcita, clorita, dolomita, goethita, yeso, hematita, illita+moscovita, caolinita, montmorillonita y vermiculita. Cobertura en regiones áridas de 54° S a 54° N. **Requiere Earthdata Login** | [CMR](https://cmr.earthdata.nasa.gov/search/concepts/C2408034484-LPCLOUD.html), [User Guide](https://lpdaac.usgs.gov/documents/1660/EMITL2BMIN_User_Guide_V1.pdf) |
| ⚠️ Periodo de EMIT | Una ficha de catálogo indica de 2022-08-09 a **2026-06-15**. Confirmar en LP DAAC si la misión terminó | [Earthdata](https://www.earthdata.nasa.gov/data/catalog/lpcloud-emitl2bmin-001) |
| **SRTMGL1 v003** | ✅ | 30 m, de 60° N a 56° S. Requiere Earthdata Login | [Earthdata](https://www.earthdata.nasa.gov/data/catalog/lpcloud-srtmgl1-003) |
| **HLS L30 v2.0** | ✅ | 30 m, Landsat + Sentinel-2 armonizados | [Earthdata](https://www.earthdata.nasa.gov/data/catalog/lpcloud-hlsl30-2.0) |
| **LRO Diviner** (temperaturas polares) | ✅ (en Resources) | PDS Geosciences | [PDS](https://pds-geosciences.wustl.edu/missions/lro/diviner.htm), [diviner.ucla.edu](https://www.diviner.ucla.edu/data) |
| **Moon/Mars Trek WMTS** | ✅ | Teselas base (LRO, CTX, MOLA) para la vista dividida | [Trek API](https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars) |
| **CRISM MTRDR** | ✅ | Mapas minerales de Marte, PDS/ODE | [PDS CRISM](https://pds-geosciences.wustl.edu/missions/mro/crism.htm) |
| **USGS Known Terrestrial Analog Sites** | ✅ existe; ⚠️ descarga | Hunter, M.H. (2020), DOI **10.5066/P9J72921**. Capa de puntos (cráteres desde la Earth Impact Database, dunas y volcanes). **ScienceBase tiene un desafío anti-bot**: hay que descargarlo a mano desde el navegador | [USGS](https://www.usgs.gov/data/known-terrestrial-analog-sites-planetary-science), [ScienceBase](https://www.sciencebase.gov/catalog/item/5f88940b82cebb8c13d912ee) |
| **Mars Global Cave Candidate Catalog (MGC3)** | ✅ | **>1 000** candidatos, con coordenadas, tipo y prioridad | [USGS Astrogeology](https://astrogeology.usgs.gov/search/map/mars_global_cave_candidate_catalog_v1_cushing), [USGS news](https://www.usgs.gov/news/caves-mars) |
| **Lunar Pit Atlas (LROC)** | ⚠️ | **281** pozos (Wagner & Robinson 2021), cifra citada en Le Corre et al. 2025 (Icarus). Revisar el atlas vivo, que puede haber crecido | [LROC](https://lroc.sese.asu.edu/) |
| **Earth Impact Database (PASSC)** | ⚠️ | **190** estructuras confirmadas según Wikipedia citando la EID (nov. 2025). Otras fuentes dan 194+ o 198. Usar "~190 confirmadas (EID)" | [Wikipedia: EID](https://en.wikipedia.org/wiki/Earth_Impact_Database) (secundaria) |
| **NASA NEO** (neo.gsfc.nasa.gov) | ❌ **retirado** | Redirige a science.nasa.gov. Hay que usar Worldview/GIBS | Comprobado hoy |

### 5.3 Pendientes (❓, no se verificaron en esta sesión)
Los IDs exactos de Google Earth Engine, Diviner rock abundance, el mosaico THEMIS TI, Robbins (2018) y Robbins & Hynek (2012) (conteos), MGD3, GLiM y ESA CCI Permafrost. Siguen marcados **(verificar)** en el documento 01. El prompt P1 del documento 02 sirve para cerrarlos.

**Umbral de permafrost (proxy de temperatura media anual < −2 °C):** ⚠️ Solo hay fuentes secundarias. Oxford Bibliographies sitúa el permafrost discontinuo entre −2 y −4 °C de temperatura media anual del aire y el continuo por debajo de −5 °C. Wikipedia lo expresa con la temperatura del suelo, que es otra variable. **Acción:** citar Brown et al. (1997, mapa circumpolar de la IPA) o sustituir el proxy por ESA CCI Permafrost. Mientras tanto, en la app sigue marcado como `proxy`.

---

## 6. Correcciones al documento 01

| En el 01 decía | Lo correcto (verificado) |
|---|---|
| "Regiones candidatas de **Artemis III**" | Artemis III es una **prueba en órbita terrestre (2027)**. El alunizaje es **Artemis IV (2028)**. Las 9 regiones siguen siendo la referencia publicada para el primer alunizaje en el Polo Sur |
| Pendiente HLS "≤8-10°" | **<10° a 100 m**; **<20° para EVA a 2 km**; a **≤6° del polo** |
| "~47 zonas (verificar)" | **47** ✅ |
| Chang'e 3/4/5/6 como objetivos | **Evitar** productos de la CNSA como componente central (regla de elegibilidad sobre China) |
| Recomendación "Marte primero" | **Luna primero (Moon Base, Polo Sur)**: es el título del reto, la prioridad de NASA en 2026 y Diviner está en Resources. Marte queda como segundo objetivo |
| NEO como fuente | Retirado: usar POWER, GIBS o Earthdata |
| Earth Impact Database "190-200" | ~190 confirmadas (con discrepancias de 190-198 según el corte) |

---

## 7. Bibliografía (todas las fuentes de este documento)

**Oficiales del reto**
1. NASA Space Apps (2026). *Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars*. https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/
2. NASA Space Apps (2026). *Judging & Awards Guide*. https://www.spaceappschallenge.org/resources/judging-awards-guide/
3. NASA Space Apps (2026). *Project Submission Guide*. https://www.spaceappschallenge.org/resources/project-submission-guide/
4. NASA Space Apps (2026). *Participant FAQs*. https://www.spaceappschallenge.org/resources/participant-faqs/

**NASA: misión y arquitectura**
5. NASA (2026). *Moon Base User's Guide: Architecture Resources*, NP-2026-04-6806-HQ. https://www.nasa.gov/wp-content/uploads/2026/04/moon-base-architecture-users-guide.pdf
6. NASA (4 nov. 2026). *NASA Shares Plans to Accelerate Artemis, Return to Moon*. https://www.nasa.gov/missions/artemis/nasa-shares-plans-to-accelerate-artemis-return-to-moon/
7. NASA (28 oct. 2024). *NASA Provides Update on Artemis III Moon Landing Regions*, Release 24-136. https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/
8. George, T., Rubio, M. A., Lawrence, S. J. y Curell, P. (2026). *Artemis III Site Selection Update: Downselection from Thirteen to Nine Candidate Regions*. LPSC. NTRS 20250011660. https://ntrs.nasa.gov/citations/20250011660
9. NASA (2025). *Artemis Overview: International Space Apps Challenge*. NTRS 20250009323. https://ntrs.nasa.gov/api/citations/20250009323/downloads/ArtemisOverview2025IntSPAPPSChallenge.pdf
10. NASA (2023). *Lunar Site Selection* (white paper de la arquitectura Moon to Mars). NTRS 20230016267. https://ntrs.nasa.gov/api/citations/20230016267/downloads/Lunar%20Site%20Selection.pdf
11. NASA Science. *South Pole Illumination Map*. https://science.nasa.gov/photojournal/south-pole-illumination-map/
12. NASA LRO. *Permanently Shadowed Regions on the Moon* (litografía). https://science.nasa.gov/wp-content/uploads/2024/01/lro-litho5-shadowed.pdf
13. NASA NSSDC. *Moon Fact Sheet*; *Mars Fact Sheet*; *Earth Fact Sheet*. https://nssdc.gsfc.nasa.gov/planetary/factsheet/

**Marte**
14. NASA (2015). *First Landing Site/Exploration Zone Workshop for Human Missions to the Surface of Mars*. NTRS 20150019636, 20160001040.
15. Morgan, G. A. et al. (2021). *Availability of subsurface water-ice resources in the northern mid-latitudes of Mars*. Nature Astronomy. DOI 10.1038/s41550-020-01290-z
16. USGS. *Mars Subsurface Water Ice Mapping 2.0 data products and results*. https://pubs.usgs.gov/publication/70233244
17. Cushing, G. *Mars Global Cave Candidate Catalog v1*. USGS Astrogeology. https://astrogeology.usgs.gov/search/map/mars_global_cave_candidate_catalog_v1_cushing

**Datos terrestres**
18. NASA LaRC. *POWER Climatology API* v2.10.1. https://power.larc.nasa.gov/docs/
19. NASA JPL / LP DAAC. *EMIT L2B Estimated Mineral Identification and Band Depth and Uncertainty 60 m V001*. https://lpdaac.usgs.gov/documents/1660/EMITL2BMIN_User_Guide_V1.pdf
20. Hunter, M. H. (2020). *Known Terrestrial Analog Sites for Planetary Science*. USGS data release. DOI 10.5066/P9J72921
21. AWS Open Data. *Terrain Tiles*. https://registry.opendata.aws/terrain-tiles/

**Secundarias (contexto, no como dato duro)**
22. SpacePolicyOnline (23 oct. 2026). *NASA is Full Steam Ahead on Artemis III, IV and V*.
23. Scientific American. *Inside NASA's 'very ambitious' moon base plan*.
24. The Planetary Society. *'Ignition': A new series of NASA initiatives*.
25. Repositorios de la competencia: PTAE, TerraNova y terrestrial-analog-finder (GitHub, 2026).
