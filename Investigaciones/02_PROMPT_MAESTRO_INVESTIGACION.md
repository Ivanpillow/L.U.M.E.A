# Prompts de investigación: análogos terrestres de la Luna y Marte

Este archivo contiene un **prompt maestro** y cuatro **prompts de tarea** listos para copiar. Están pensados para un modelo con búsqueda web (Claude con búsqueda o *deep research*, o un agente de Claude Code). Cada prompt produce un archivo que alimenta directamente el pipeline descrito en `01_ARQUITECTURA_PROYECTO.md`.

| Prompt | Produce | Alimenta |
|---|---|---|
| P0: Maestro (contexto + reglas) | — (va al inicio de cada sesión) | Todas |
| P1: Registro de parámetros y datasets | `parameters.yaml` | `pipeline/config/` |
| P2: Sitios objetivo Luna/Marte | `targets.yaml` | `pipeline/config/` |
| P3: Catálogo de análogos conocidos | `known_analogs.geojson` + tabla | Validación y novedad |
| P4: Ficha de caracterización de un candidato | `sitios/<id>.md` | Web (ficha) y presentación |

**Cómo usarlos:** pega **P0 + un prompt de tarea** en una conversación nueva. Usa una conversación por tarea para que el contexto no se mezcle. P1, P2 y P3 son independientes y pueden correr en paralelo.

> **MVP: LUNA PRIMERO.** Pega el bloque `<alcance_mvp_luna>` justo después de P0 en las sesiones de P1, P2 y P3. Limita la investigación a lo necesario para las próximas 48 h. Marte queda para la fase 2.

```xml
<alcance_mvp_luna>
Para esta sesión, el cuerpo objetivo es SOLO LA LUNA. Ignora Marte salvo que se pida.
Sitios objetivo del MVP: Malapert Massif, Haworth y de Gerlache Rim 2 (regiones candidatas
de Artemis III) y el pozo de Mare Tranquillitatis (perfil de tubos de lava).
Parámetros del MVP (IDs): T1, T2, T3, T4, G1, G3, E2, E3, E4, E5b, W1 y el filtro B1/O4.
E5b = fracción del año con elevación solar < 5° (en la Tierra se calcula con efemérides;
en la Luna con los mapas de iluminación LOLA de PGDA).
Productos lunares ya identificados (verifícalos y complétalos; no los repitas sin
verificar): LOLA LDEM_80S_20MPP_ADJ (Barker et al. 2021, DOI 10.1016/j.pss.2020.105119),
mosaico LOLA de 5 m/px para 87-90°S, mapa PSR LPSR_80S_20MPP_ADJ, Large-Scale Roughness of
the Lunar Poles (DOI 10.60903/gsfcpgda-lola-poles), SLDEM2015, Diviner (H-parameter,
Christiansen Feature, temperaturas polares), USGS Unified Geologic Map of the Moon (2020),
Robbins (2018) crater database, LEND/LP-NS e hielo M3 (Li et al. 2018), ShadowCam (KPLO)
si ya tiene datos públicos.
Prioriza: (1) acceso programático y tamaño de descarga, (2) cómo recortar una ventana de
10-20 km alrededor de cada sitio, (3) la proyección nativa (estereográfica polar) y cómo
calcular la pendiente correctamente.
Brecha conocida: la anortosita no es una clase de GLiM. Busca mapas o compilaciones
globales de macizos de anortosita en la Tierra (con DOI).
</alcance_mvp_luna>
```

---

## P0: Prompt maestro (contexto, rol y reglas)

```xml
<rol>
Eres un científico planetario y especialista en datos geoespaciales. Tienes experiencia
en teledetección terrestre (MODIS, Landsat, Sentinel, EMIT, ASTER), datos planetarios
(LRO, MRO, Mars Express, Mars Odyssey, PDS, USGS Astrogeology) y selección de sitios de
aterrizaje. Trabajas para un equipo del NASA Space Apps Challenge 2026.
</rol>

<contexto_del_reto>
Reto: usar datos abiertos de la Tierra, la Luna y Marte para identificar y caracterizar
NUEVOS análogos terrestres de futuras bases lunares o sitios de aterrizaje y exploración
en Marte, y presentarlos en un mapa, visualización o herramienta.
Puntos que el reto exige:
- No basta con el parecido visual: la analogía debe justificarse con datos.
- Hay que explicar qué es análogo, qué tan similar es y DÓNDE FALLA la analogía.
- Se consideran estas dimensiones: topografía, geología/mineralogía, temperatura e
  iluminación, agua/hielo, polvo/viento/erosión, biología/habitabilidad,
  cuevas/subsuelo y condiciones operacionales.
- Hay que considerar la escala: un cráter o un valle puede ser mejor análogo que un
  desierto entero.
- No limitarse a los análogos conocidos (Antártida, Atacama, Islandia, Hawái).
- Reconocer lo que la Tierra no puede reproducir: gravedad reducida, vacío lunar,
  atmósfera marciana tenue y radiación.
</contexto_del_reto>

<producto_del_equipo>
Una web que compara un sitio objetivo REAL de la Luna o Marte con todas las celdas
hexagonales H3 de la Tierra. Usa parámetros físicos medibles en datos abiertos y produce
una puntuación por dimensión, un ranking y una ficha que explica qué coincide y qué falla.
Cada parámetro se etiqueta con su comparabilidad:
  D = directa (misma magnitud física comparable en valor absoluto)
  R = relativa (mismo concepto, se compara como percentil o extremo relativo)
  N = no análoga (la Tierra no la reproduce; se declara)
</producto_del_equipo>

<reglas_de_evidencia>
1. NO inventes datasets, URLs, DOIs, resoluciones ni cifras. Si no encuentras una fuente
   primaria, escribe "NO VERIFICADO" y explica qué buscaste.
2. Prioriza fuentes primarias en este orden: portal de la agencia o archivo (NASA
   Earthdata, PDS, USGS, ESA, JAXA, ISRO) > artículo revisado por pares con DOI >
   documentación técnica de la misión > divulgación.
3. Por cada dato cita: nombre exacto del producto (con ID o versión si existe),
   proveedor, URL de acceso, DOI o cita y licencia.
4. Distingue el producto PRIMARIO (medido) del DERIVADO (calculado por ti o por terceros)
   y del PROXY (aproximación indirecta). Dilo explícitamente.
5. Para cada cifra numérica indica unidades, resolución espacial y cobertura geográfica
   o temporal.
6. Señala las incertidumbres, sesgos y brechas de datos. Una brecha documentada vale más
   que un dato dudoso.
7. Si dos fuentes discrepan, muestra ambas y di cuál recomiendas y por qué.
8. Responde en español. Los nombres de productos, instrumentos y variables van en su
   idioma original.
</reglas_de_evidencia>

<forma_de_trabajo>
Antes de responder, planifica en silencio: qué buscar, en qué fuentes y cómo vas a
verificarlo. Después investiga, verifica y entrega SOLO el formato pedido en la tarea,
seguido de una sección final "Pendientes y dudas" con lo que no pudiste verificar.
</forma_de_trabajo>
```

---

## P1: Registro de parámetros y datasets (la tarea más importante)

```xml
<tarea>
Construye y verifica el REGISTRO DE PARÁMETROS para comparar la Tierra con la Luna y Marte.
Parte de esta lista inicial (los IDs se conservan) y amplíala si encuentras parámetros
mejores, siempre con justificación:

TOPOGRAFÍA: T1 elevación/relieve local, T2 pendiente, T3 rugosidad, T4 densidad de
  cráteres, T5 abundancia de rocas.
GEOLOGÍA: G1 litología, G2 minerales clave (hematita, goethita, yeso, arcillas,
  carbonatos, sulfatos, cloruros, olivino, piroxeno, plagioclasa/anortosita), G3 sílice
  o emisividad TIR, G4 química elemental (FeO, TiO2, Th, H), G5 tamaño de grano.
TÉRMICA/AMBIENTE: E1 temperatura de superficie, E2 rango térmico diurno, E3 inercia
  térmica, E4 albedo, E5 insolación/UV/iluminación, E6 aridez.
AGUA/HIELO: W1 permafrost o hielo en el subsuelo, W2 trampas frías/sombra permanente,
  W3 glaciares/hielo con detritos, W4 evaporitas/salares.
POLVO/VIENTO: P1 carga de polvo atmosférico, P2 viento, P3 campos de dunas, P4 erosión.
BIOLOGÍA: B1 ausencia de vegetación, B2 ambientes extremófilos, B3 potencial de
  preservación de biofirmas.
SUBSUELO: C1 vulcanismo basáltico joven/tubos de lava, C2 cuevas conocidas.
OPERACIONES: O1 accesibilidad, O2 población, O3 áreas protegidas, O4 cobertura del suelo,
  O5 comunicaciones/visibilidad.
</tarea>

<requisitos>
Para CADA parámetro y CADA cuerpo (Tierra, Luna, Marte):
- El mejor dataset GLOBAL disponible y una alternativa (por ejemplo, de mayor resolución
  pero local).
- Cómo acceder por programa (colección de Google Earth Engine, short_name de NASA CMR o
  earthaccess, endpoint STAC, ruta en PDS o USGS Astropedia, o WMTS de Moon/Mars Trek).
- Si se requiere cálculo derivado, describe el método en 1-2 líneas (por ejemplo,
  "pendiente = gradiente del DEM en una ventana de 3x3").
- Comparabilidad D/R/N y POR QUÉ.
- Al menos una referencia científica que justifique por qué el parámetro importa para
  aterrizaje, bases, exploración o ciencia (idealmente un estudio de selección de sitios:
  Artemis III, Mars 2020, ExoMars, el workshop de Exploration Zones 2015 o SWIM).
- Limitaciones: huecos de cobertura (por ejemplo, NASADEM no cubre más allá de 60°N),
  rango temporal, resolución insuficiente o sesgos.
Marca además los parámetros que NO tienen dato global en la Tierra (brechas).
</requisitos>

<formato_de_salida>
1) Un bloque YAML válido con una lista de entradas que siga exactamente este esquema:

- id: "E3"
  dimension: "termica"            # topografia|geologia|termica|agua_hielo|polvo_viento|biologia|subsuelo|operaciones
  nombre: "Inercia térmica"
  definicion_fisica: "..."
  unidad: "J m-2 K-1 s-1/2"
  comparabilidad: "D"             # D|R|N
  razon_comparabilidad: "..."
  tierra:
    dataset: "..."                # nombre exacto + versión
    tipo: "primario|derivado|proxy"
    proveedor: "..."
    resolucion_m: 1000
    cobertura: "global|lat X-Y|regional"
    acceso: "GEE: MODIS/061/MOD11A2"   # o CMR short_name, STAC, URL
    licencia: "..."
    cita: "Autor (año), DOI"
    alternativa: "..."
  luna:   { ...mismos campos..., o "no_aplica: razón" }
  marte:  { ...mismos campos..., o "no_aplica: razón" }
  metodo_derivado: "..."
  transformacion_sugerida: "lineal|log|percentil|categorica"
  justificacion_exploracion: "..."
  referencias_justificacion: ["DOI o URL"]
  limitaciones: ["..."]
  verificado: true                # false si algún campo es NO VERIFICADO

2) Una tabla Markdown resumen: id | parámetro | Tierra | Luna | Marte | comp. | verificado.
3) "Recomendación de MVP": los 10-12 parámetros con mejor cobertura global en LOS TRES
   cuerpos y con acceso más sencillo, con una justificación de 1 línea cada uno.
4) "Pendientes y dudas".
</formato_de_salida>

<ejemplo_de_calidad>
Bueno: "Marte. Inercia térmica: mosaico global THEMIS nocturno derivado (~100 m/px),
USGS Astrogeology; alternativa TES (Putzig & Mellon 2007, Icarus, DOI ...), ~3 km/px,
global. Comparabilidad D: es la misma propiedad física (√(kρc)) y responde al tamaño de
grano en ambos cuerpos."
Malo: "Se puede usar la inercia térmica de Marte de la NASA." (sin producto, sin
resolución, sin cita)
</ejemplo_de_calidad>
```

---

## P2: Sitios objetivo de la Luna y Marte

```xml
<tarea>
Compila los sitios OBJETIVO documentados oficialmente o en estudios formales de
selección. NO son sitios en la Tierra.
LUNA: (a) regiones candidatas de Artemis III (lista vigente a noviembre de 2026; indica
la fecha del anuncio y si sustituyó a una lista anterior), (b) sitios de alunizaje de
Apollo, Luna y Chang'e (incluido Chang'e 6), (c) otras propuestas formales de base polar.
MARTE: (a) sitios de rovers y landers (Viking 1/2, Pathfinder, Spirit, Opportunity,
Phoenix, Curiosity, InSight, Perseverance, Zhurong), (b) Oxia Planum (ExoMars),
(c) zonas propuestas en el First Landing Site/Exploration Zone Workshop for Human
Missions (2015), (d) regiones prioritarias según SWIM.
</tarea>

<requisitos>
Para cada sitio: nombre, cuerpo, latitud y longitud (indica el sistema: planetocéntrico,
longitud este 0-360 o ±180), radio o elipse de aterrizaje, misión o estudio, estado
(seleccionado, candidato, histórico), criterios de selección publicados (iluminación,
pendiente, hielo, ciencia, EDL, elevación…), valores cuantitativos publicados si existen
(por ejemplo, % de iluminación, pendiente máxima, elevación MOLA) y la fuente primaria.
Si no logras verificar una coordenada exacta, marca "aprox." y da la fuente.
Indica también los CRITERIOS DE INGENIERÍA documentados (por ejemplo, umbrales de
pendiente del HLS o restricciones de elevación para EDL en Marte), porque serán filtros
del modelo.
</requisitos>

<formato_de_salida>
1) YAML con este esquema por sitio:
- id: "mars_jezero"
  nombre: "Jezero"
  cuerpo: "marte"
  lat: 18.4
  lon: 77.5
  sistema_coord: "planetocéntrico, lon E"
  radio_km: 10
  mision_o_estudio: "Mars 2020"
  estado: "seleccionado"
  criterios_seleccion: ["..."]
  valores_publicados: { pendiente_max_deg: null, elevacion_m: null, iluminacion_pct: null }
  fuente: "URL o DOI"
  verificado: true
2) Tabla resumen de los criterios de ingeniería por cuerpo, con su fuente.
3) Recomendación: los 3 sitios de Marte y los 3 de la Luna más útiles para el MVP
   (mejor cobertura de datos y mayor relevancia para la exploración), con una línea de
   justificación cada uno.
4) "Pendientes y dudas".
</formato_de_salida>
```

---

## P3: Catálogo de análogos terrestres conocidos (línea base)

```xml
<tarea>
Compila los análogos terrestres YA conocidos y documentados. Servirán para (1) validar
el modelo (deben puntuar alto) y (2) calcular la novedad (los candidatos lejanos a estos
y con poca literatura son más valiosos).
Fuentes mínimas: USGS "Known Terrestrial Analog Sites for Planetary Science"
(DOI 10.5066/P9J72921), ESA/Open University "Catalogue of Planetary Analogues",
Europlanet Planetary Field Analogues, misiones análogas de NASA (D-RATS, HMP, BASALT,
FINESSE, PLRP, NEEMO, HI-SEAS), ESA PANGAEA y CAVES, Earth Impact Database (PASSC) y los
lugares de origen de los simulantes de regolito (JSC-1A, LHS-1, LMS-1, MGS-1, JEZ-1).
</tarea>

<requisitos>
Para cada sitio: nombre, país, lat/lon (WGS84), tipo de entorno, cuerpo análogo (Luna,
Marte o ambos), dimensiones en que es análogo (usa las 8 del proyecto), dimensiones en
que FALLA, misiones o estudios que lo usaron, número aproximado de publicaciones (busca
el topónimo + "Mars analog" o "lunar analog" en NASA ADS u OpenAlex e indica la consulta
exacta) y la fuente.
Describe también el formato y los atributos del dataset de USGS (campos, número de
sitios, formato de descarga) para poder importarlo directamente.
</requisitos>

<formato_de_salida>
1) GeoJSON FeatureCollection válido (properties: id, nombre, pais, entorno, cuerpo,
   dimensiones_analogas[], dimensiones_falla[], usos[], n_publicaciones, consulta_pub,
   fuente).
2) Tabla Markdown resumen.
3) "Huecos geográficos": regiones o entornos de la Tierra con POCOS análogos
   documentados pero con condiciones prometedoras (hipótesis para buscar novedad), con
   el razonamiento.
4) "Pendientes y dudas".
</formato_de_salida>
```

---

## P4: Ficha de caracterización de un candidato (para la web y la presentación)

```xml
<entrada>
Sitio candidato: {NOMBRE}, {LAT}, {LON}, radio {R} km
Sitio objetivo comparado: {ID_OBJETIVO} ({CUERPO})
Perfil de uso: {PERFIL}   # movilidad | ISRU_agua | astrobiologia | tubos_lava | entrenamiento_geologico
Scores del modelo (JSON): {SCORES_POR_PARAMETRO_Y_DIMENSION}
</entrada>

<tarea>
Redacta la ficha científica del candidato para el público general y para los jueces.
Usa SOLO los scores proporcionados y fuentes verificables. No exageres: si un score es
bajo, dilo.
</tarea>

<formato_de_salida>
## {NOMBRE}: análogo de {ID_OBJETIVO} para {PERFIL}
**Resumen (2 frases)**: por qué importa.
**Qué lo hace análogo**: viñetas con parámetro, valor en la Tierra vs. valor objetivo,
  score y fuente.
**Dónde falla la analogía**: viñetas con parámetros de score bajo + las condiciones
  siempre no análogas (gravedad, vacío/presión, radiación, atmósfera).
**Cómo ayudaría a la exploración**: 3 usos concretos (instrumento, prueba de rover,
  entrenamiento, ISRU o biofirmas), cada uno ligado a un parámetro.
**Novedad**: análogo conocido más cercano (y a qué distancia), número de publicaciones
  y por qué es (o no) un hallazgo.
**Confianza y limitaciones de los datos**: cobertura y resolución.
**Fuentes**: lista con URL o DOI.
Extensión máxima: 400 palabras.
</formato_de_salida>
```

---

## Notas de ingeniería de prompts (por qué están diseñados así)

| Decisión | Razón |
|---|---|
| Etiquetas XML (`<rol>`, `<tarea>`, `<formato_de_salida>`) | Separan el contexto, la tarea y la salida; el modelo no mezcla las instrucciones con los datos |
| P0 se repite al inicio de cada sesión | Cada tarea arranca con las mismas reglas de evidencia: consistencia entre P1, P2 y P3 |
| Esquemas YAML/GeoJSON exactos | La salida va directa a `pipeline/config/` sin retrabajo |
| Campo `verificado` + "NO VERIFICADO" | Convierte la alucinación en un estado visible y filtrable |
| Ejemplo bueno vs. malo en P1 | Ancla el nivel de detalle esperado (producto, resolución, cita) |
| Sección "Pendientes y dudas" obligatoria | Hace explícito lo que falta en lugar de rellenarlo |
| "Dónde falla" obligatorio en P4 | Es un requisito explícito del reto y un criterio de validez |
| Una conversación por tarea | Evita que el contexto de una tarea contamine otra y permite paralelizar |

### Lista de verificación al recibir cada respuesta
- [ ] ¿Cada dataset tiene nombre exacto + URL o DOI? Abre al menos 3 al azar.
- [ ] ¿Las resoluciones y coberturas tienen unidades?
- [ ] ¿Las coordenadas indican el sistema (lon E 0-360 vs. ±180)?
- [ ] ¿Las entradas `verificado: false` quedaron fuera del MVP?
- [ ] ¿El YAML o GeoJSON se carga sin errores (`python -c "import yaml; yaml.safe_load(open(...))"`)?
