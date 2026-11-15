# 05: Sitios objetivo, origen de los parámetros, sesgos y cómo validarlo tú mismo

**Fecha:** 2026-11-14. Responde dudas del equipo sobre el estado **real** del proyecto: los documentos 03 y 04 y el código en `pipeline/` y `web/`. Donde el documento 01 contradiga a este, manda este.

---

## 1. ¿Cuántos sitios hay en el Polo Sur lunar? ¿Usamos todos los de la Luna?

### 1.1 Lo que existe oficialmente (verificado en el doc 03)
| Tipo | Cantidad | Estado | Fuente |
|---|---|---|---|
| **Sitio de la base (Moon Base)** | **0 decididos** | NASA anunció el 24-mar-2026 que la base irá en la **región** del Polo Sur, pero **no ha elegido el sitio exacto** | Moon Base User's Guide (NP-2026-04-6806-HQ) |
| **Regiones candidatas de alunizaje** | **9** (~15 × 15 km cada una) | Candidatas para el primer alunizaje tripulado, que **ahora es Artemis IV (2028)**. Artemis III pasó a ser una prueba en órbita terrestre (2027) | NASA Release 24-136; NTRS 20250011660 |
| **Requisitos que deben cumplir** | — | A ≤6° del polo, pendiente <10° a 100 m, <20° a 2 km para EVA, ≥25 % de visibilidad de la Tierra, ≥5 % de visibilidad solar | NTRS 20250009323 |

Las 9 regiones son Peak near Cabeus B, Haworth, Malapert Massif, Mons Mouton Plateau, Mons Mouton, Nobile Rim 1, Nobile Rim 2, de Gerlache Rim 2 y Slater Plain. **NASA no publicó sus coordenadas** en el comunicado (tarea T11: digitalizarlas desde LROC QuickMap).

### 1.2 ¿Se usan todos los sitios de la Luna sin importar su ubicación? **No.**
Usamos **un solo objetivo lunar**: *"región del Polo Sur, ≤6° del polo"*. Hay tres razones:

1. **El reto es sobre la *Moon Base*,** y NASA ya decidió que estará en el Polo Sur.
2. **Las condiciones polares son únicas.** El Sol nunca sube más de ~7.5°, hay sombras larguísimas, regiones en sombra permanente (PSR), hielo y relieve extremo. Los sitios ecuatoriales (Apollo, por ejemplo) tienen otra física: Sol alto, días de ~14 días terrestres y llanuras basálticas. **Mezclarlos daría un perfil que no se parece a ninguno.**
3. **Escala.** Nuestras celdas terrestres miden ~55 km y cada región candidata ~15 km. A esa escala, las 9 regiones comparten las mismas condiciones relevantes. Solo se distinguirían con un zoom local (DEM de 20 m de LOLA vs. 30 m en la Tierra), y eso es fase 2.

| Sitio lunar | ¿Lo usamos? | Por qué |
|---|---|---|
| Región del Polo Sur (≤6°) | ✅ Objetivo principal | Es la Moon Base |
| Cada una de las 9 regiones por separado | ⏳ Fase 2 (zoom local) | Son indistinguibles a 55 km |
| Apollo y otros sitios ecuatoriales | ❌ | Otra iluminación, otro terreno, no es la base |
| Pozos de Mare Tranquillitatis (tubos de lava) | ⏳ Opcional, como **perfil aparte** | Interesante como refugio, pero no es el Polo Sur. Nunca se mezcla con el perfil polar |
| Chang'e (China) | ❌ | Regla de elegibilidad sobre China (doc 03 §2) |

**Clave:** el objetivo lunar no es "un punto". Es **un conjunto de condiciones** (iluminación, frío, relieve, hielo) que cada **perfil de prueba** toma por separado según la brecha de NASA que ataca.

### 1.3 ¿Y Marte?
Funciona igual: **zonas definidas por condiciones, no un catálogo de puntos.**

| Sitio marciano | ¿Lo usamos? | Por qué |
|---|---|---|
| **Zonas de hielo de SWIM** (Arcadia Planitia, Deuteronilus Mensae) | ✅ Objetivo de Marte (`mars_ice_landing`) | Ahí es más probable el aterrizaje humano (agua accesible) |
| 47 *Exploration Zones* (workshop de 2015) | 📚 Contexto | Propuestas, no decisiones. Útiles para la narrativa |
| Jezero, Gale, Meridiani y otros sitios robóticos | ⏳ Solo como caso de estudio (astrobiología/minerales) | Requieren mineralogía (EMIT ↔ CRISM), que no es global en la Tierra |
| Zhurong (China) | ❌ | Regla sobre China |

Marte es **prioridad 2**. El perfil ya existe, pero sus parámetros son más débiles (todos relativos, "R"), porque la Tierra no tiene ni −59 °C de media ni 6 mb de presión.

---

## 2. Las 8 dimensiones: de dónde salen los valores de la Tierra

### 2.1 Primero, un malentendido común
Las **8 dimensiones son las categorías del reto, no 8 columnas obligatorias**. Ningún lugar de la Tierra (ni ningún dataset global) las tiene todas. Cada **perfil** usa **solo las 3-5 dimensiones relevantes para su brecha de NASA**. Por ejemplo, para la navegación con Sol rasante no importan los minerales.

### 2.2 Qué hay hoy en el proyecto (v1)
Para la Tierra hay **3 fuentes de datos + 1 cálculo**, y todas cubren todo el planeta (salvo la limitación polar de Terrain Tiles en |lat| > 85.05°):

| Fuente | Qué da | Resolución | ¿Login? |
|---|---|---|---|
| **NASA POWER** (MERRA-2 + CERES, climatología 2001-2025) | Temperatura media, mínima y máxima del aire a 2 m; precipitación; albedo; viento a 10 m (**por mes**) | 0.5° × 0.625° (~55 × 69 km en el ecuador) | No |
| **AWS Terrain Tiles** (SRTM de NASA + GMTED2010 + ETOPO1) | Elevación → relieve y pendiente p90 | Píxel de ~4.9 km (zoom 5), agregado a la celda | No |
| **Geometría solar analítica** (`pipeline/analog/solar.py`) | Días por mes con el Sol de mediodía ≤7.5° y días sin amanecer | Exacta por latitud | — (es matemática) |
| **Zoom local** (`local_zoom.py`, DEM de 30 m) | Comprueba los umbrales de NASA (<10° a 100 m y <20° a 2 km) | 30 m | Depende de la fuente |

### 2.3 Estado de cada dimensión
| # | Dimensión | Estado | Con qué | Comp. |
|---|---|---|---|---|
| 1 | Geología y mineralogía | ❌ **No global** | EMIT (60 m, por escenas, con login) solo en un caso de estudio | — |
| 2 | Terreno y topografía | ✅ | Terrain Tiles: relieve y pendiente regional | R |
| 3 | Temperatura e iluminación | ✅ | POWER (aire a 2 m) + geometría solar | Temp. R / Luz D |
| 4 | Agua, hielo y permafrost | ⚠️ **Proxy** | "Temperatura media anual < −2 °C" ≈ permafrost. Reemplazo real: ESA CCI Permafrost (T4) | R |
| 5 | Polvo, viento y erosión | ⚠️ Parcial | Aridez (precipitación < 250 mm/año) + viento de POWER | R |
| 6 | Biología y habitabilidad | ⚠️ **Proxy** | "Desierto" como señal de suelo desnudo. Reemplazo real: MODIS NDVI (T4) | R |
| 7 | Cuevas y subsuelo | ❌ **Brecha declarada** | No existe un catálogo global terrestre de cuevas o tubos de lava | — |
| 8 | Operaciones y aterrizaje | ✅ Local | Zoom de 30 m con los umbrales de NASA | D |

### 2.4 ¿Qué pasa cuando un lugar **no tiene** un dato?
El código lo trata así (`pipeline/analog/scoring.py`, idéntico en `web/src/scoring.ts`):

```
s_p        = qué tanto cumple el lugar el parámetro p (0 a 1); NaN si no hay dato
base       = Σ w_p·s_p / Σ w_p        ← solo con los parámetros que SÍ tienen dato
gate       = Π s_g                    ← condiciones obligatorias (por ejemplo, "Sol rasante")
score      = base × gate
coverage   = peso disponible / peso total   ← se muestra en la ficha como "Data coverage"
```

- **Un dato faltante no es 0.** Si fuera 0, castigaríamos al lugar por un hueco del dataset y no por su física.
- **Pero baja la *cobertura*** (la confianza), y la ficha la muestra.
- **Una puerta sin dato cuenta como neutra** (×1), pero también baja la cobertura.

⚠️ **Riesgo encontrado al revisar el código:** el **ranking no exige una cobertura mínima**. Una celda con 1 de 4 parámetros puede puntuar alto solo con ese parámetro. **Corrección propuesta:** mostrar en el ranking solo las celdas con cobertura ≥ 0.75 y marcar el resto como "datos insuficientes" (ver §3, sesgo 5).

---

## 3. Sesgos: dónde están y qué tan graves son

| # | Sesgo | Dónde ocurre | Efecto | Gravedad | Mitigación |
|---|---|---|---|---|---|
| 1 | **Los umbrales relativos siempre encuentran algo** | Los umbrales `pXX` de `profiles.yaml` (por ejemplo, "el 2 % más frío de la Tierra") | El top 5 % de la Tierra **siempre existe**, aunque ningún lugar sea buen análogo. Un score de 1.0 significa "de lo más extremo de la Tierra", **no** "igual a la Luna" | **Alta** (es conceptual) | Decirlo en la ficha: comparabilidad R = "extremo relativo". Así ya se etiqueta |
| 2 | **Celdas más pequeñas cerca de los polos** | La rejilla de 0.5° × 0.625°: el área de cada celda es ∝ cos(latitud). A 70° mide ~1/3 de una ecuatorial | Los percentiles se calculan **por celda, no por área**, así que las regiones polares pesan de más. El conteo de "celdas análogas" infla los polos | Media | Ponderar los percentiles por cos(lat) y reportar km² en vez de celdas |
| 3 | **Escala (55 km)** | Toda la rejilla global | Promedia el detalle: un cráter de 10 km desaparece. La pendiente es **regional**, no la de aterrizaje | Alta para el terreno | Embudo multiescala: zoom de 30 m para los candidatos (ya existe) |
| 4 | **El reanálisis no es una medición** | POWER/MERRA-2 | Es un modelo con asimilación de datos, y es **menos preciso donde hay pocas estaciones**: Antártida, Sahara, Tíbet… justo donde están los análogos | Media | Contrastar los candidatos con MODIS LST en Worldview (§4, prueba A) |
| 5 | **Sin cobertura mínima en el ranking** | `build_web_data.py` | Una celda con pocos datos puede subir en el ranking | Media | Filtro de cobertura ≥ 0.75 (corrección propuesta) |
| 6 | **Proxies** | Permafrost y suelo desnudo | "Desierto" ≠ "sin vegetación" (hay desiertos con matorral). "T media < −2 °C" ≠ permafrost medido | Media | Sustituirlos por ESA CCI y MODIS NDVI (T4). Ya están marcados `proxy: true` |
| 7 | **Aire ≠ superficie** | POWER da la temperatura del aire a 2 m | Las rocas al sol se calientan mucho más que el aire. La Luna no tiene aire | Media | Etiqueta R. Fase 2: MODIS LST (temperatura de superficie) |
| 8 | **Luz terrestre ≠ luz lunar** | Perfil de navegación con Sol rasante | La atmósfera dispersa luz y **rellena las sombras**. La analogía es solo **geométrica** | Baja (ya declarada) | Está en la ficha como "never analog" |
| 9 | **Validación circular y con n pequeño** | `validation_report.md` | Se usaron los **mismos** análogos conocidos para ajustar y para validar, con **n = 3 por perfil** (23 en total). Un percentil mediano con n = 3 no es estadísticamente fuerte | **Alta** para el criterio Validity | Validar con la capa **independiente** de USGS (T3) y decirlo en la presentación |
| 10 | **Sesgo geográfico de los análogos conocidos** | `known_analogs.yaml` | Los análogos clásicos se concentran en Norteamérica, Europa y la Antártida (accesibles para la ciencia occidental). La "novedad" (distancia al conocido más cercano) favorece Asia, África y Sudamérica **por cómo se hizo el catálogo**, no por la física | Media | Medir la novedad también con la literatura (OpenAlex, T6) |
| 11 | **Los pesos son una decisión humana** | `profiles.yaml` | Otro equipo con otros pesos obtendría otro ranking | Media | Prueba de sensibilidad ±20 % (Jaccard 0.78-0.98, ya medido) + controles en la web |
| 12 | **La climatología oculta los extremos y la tendencia** | Promedios de 2001-2025 | Un año extremo no aparece, y el calentamiento reciente sí afecta al permafrost | Baja | Declararlo |

### 3.1 ¿Qué tan precisos son los datos? (orden de magnitud)
| Dato | Precisión / limitación | Confianza en el resultado |
|---|---|---|
| Días con Sol rasante (geometría) | Fórmula de Cooper (1969): error de declinación < ~1°. Ignora la refracción y el horizonte local | **Alta** (lo puedes recalcular a mano, §4 B) |
| Elevación SRTM | La especificación de la misión es de ±16 m de error absoluto (90 %). En la práctica suele ser menor. **(Verificar en la documentación de SRTM antes de citarlo)** | Alta en la elevación; **media** en la pendiente (por el píxel de ~5 km) |
| Temperatura POWER | Reanálisis a 55 km: puede desviarse varios °C en montaña y en los polos **(verificar el error en la documentación de POWER)** | Media |
| Precipitación POWER | El reanálisis tiene más error en las zonas áridas y con poca observación | Media |
| Permafrost y suelo desnudo (proxies) | Indirectos | **Baja**: solo para cribar |
| Minerales y cuevas | No hay dato global | Ninguna en el mapa global |

**Regla para comunicarlo:** el mapa es un **cribado** (*screening*), no una certificación. Los resultados de confianza alta son la geometría solar y el terreno regional. Los de confianza media son la temperatura y la aridez. Lo de confianza baja (los proxies) solo sirve para descartar.

---

## 4. Cómo validarlo **tú mismo** (sin confiar en el código)

Hay siete pruebas, de la más fácil a la más rigurosa. Haz al menos A, B y C antes de presentar.

### A. Contrastar un valor contra la fuente oficial (10 min)
1. En la web, abre un candidato (por ejemplo, Sakha, 65.00° N, 143.12° E) y anota la temperatura mínima y la precipitación de su ficha.
2. Pide el **mismo punto** directamente a NASA POWER:
   ```bash
   curl "https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M_MIN,PRECTOTCORR&community=RE&longitude=143.12&latitude=65.00&format=JSON"
   ```
3. Compara. Deben coincidir (salvo redondeo). Si no coinciden, hay un error de rejilla o de unidades en el pipeline.
4. Contraste independiente: abre [NASA Worldview](https://worldview.earthdata.nasa.gov/) en esa coordenada, activa *Land Surface Temperature (MODIS)* y *True Color*, y mira el mismo mes. ¿Se ve frío, seco y sin vegetación?

### B. Recalcular a mano el Sol rasante (5 min, con calculadora)
- Altura del Sol a mediodía = **90° − |latitud − declinación|**.
- La declinación es ≈ +23.4° el 21 de junio, 0° en los equinoccios y −23.4° el 21 de diciembre. Para octubre, aproximadamente −8° a mediados de mes.
- Ejemplo: Svalbard (78° N) en octubre: 90 − |78 − (−8)| = **4°**. Como 4° ≤ 7.5°, **es análogo en luz**. ✅
- Ejemplo: Ciudad de México (19° N) en diciembre: 90 − |19 − (−23)| = 48°. **No es análogo**. ✅
- Si la web dice lo contrario para algún lugar, hay un error.

### C. Controles positivos y negativos con el mapa (10 min)
- **Negativos** (deben salir ~0 en todos los perfiles lunares): Amazonas, Congo, Indonesia.
- **Positivos** (deben salir altos en su perfil): Valles Secos de McMurdo (Sol rasante), Haughton (movilidad y frío).
- Hoy el reporte dice: 0 % de trópico húmedo marcado como análogo y los positivos en p70-p99, según el perfil.

### D. Prueba a ciegas (20 min, en equipo)
1. Una persona elige 5 lugares que conozca (desierto, montaña, selva, polo y su ciudad).
2. **Antes de mirar la web**, el equipo predice si cada uno es alto, medio o bajo en cada perfil.
3. Compárenlo con la web. Cada desacuerdo es una pista: abre la ficha y revisa **qué parámetro** lo explica. Puede ser un error del modelo o una intuición equivocada; las dos cosas sirven.

### E. Sensibilidad: ¿el resultado depende de mis pesos? (5 min)
Mueve cada peso ±20 % en la web. Si el top-10 cambia por completo, ese perfil **no es robusto** y no conviene presentarlo como hallazgo. El reporte ya mide esto con el índice de Jaccard: 0.78 en Sol rasante, que es el más sensible, y 0.98 en polvo.

### F. Validación independiente (1 h, la más importante para los jueces)
1. Descarga a mano la capa de USGS *Known Terrestrial Analog Sites* (DOI 10.5066/P9J72921). ScienceBase bloquea las descargas automáticas.
2. **Sin reajustar nada**, calcula el percentil de esos sitios en cada perfil.
3. Si siguen saliendo altos con sitios que **no usamos para calibrar**, la validación deja de ser circular (sesgo 9).

### G. Verificar un candidato "nuevo" antes de presentarlo (30 min por sitio)
1. **Literatura:** busca en Google Scholar o [NASA ADS](https://ui.adsabs.harvard.edu/) `"<lugar>" AND ("lunar analog" OR "Mars analog")`. Cero o pocos resultados significa que es poco estudiado (novedad real).
2. **Zoom local:** `python pipeline/scripts/local_zoom.py` en la coordenada. ¿Qué % del área cumple <10° a 100 m y <20° a 2 km?
3. **Vista real:** imágenes de Worldview o Google Earth. ¿Hay hielo, vegetación o poblados que el modelo no ve?
4. **Ficha:** ¿la cobertura es ≥ 75 %? ¿El score depende de un solo parámetro?

### Señales de alarma (si ves alguna, no presentes ese resultado sin revisarlo)
- Cobertura < 75 %.
- Un candidato cuyo score viene casi entero de un parámetro proxy.
- Una celda de relieve NaN a más de 85° de latitud (no tiene terreno).
- Un candidato a < 100 km de un análogo conocido presentado como "nuevo".
- Un perfil cuyo conjunto análogo cubre más del ~10 % de la tierra firme. Hoy *Survive the cold & dark* cubre ~25 %: **demasiado permisivo**.

---

## 4.1 Corrección aplicada (2026-11-15): sesgos 2 y 5

- **Sesgo 2 (área):** los umbrales `pXX` y los percentiles de validación ahora se ponderan por el área real de cada celda (`grid.cell_area_km2`, `scoring.weighted_percentile` y `scoring.weighted_rank_pct`). El reporte da el conjunto análogo en km² y en % de la tierra firme.
- **Sesgo 5 (cobertura):** el ranking (Python y web) solo admite celdas con cobertura ≥ 75 % (`scoring.MIN_COVERAGE`). **Hoy no excluye ninguna celda**, porque todos los parámetros actuales tienen dato en casi toda la tierra. Es una salvaguarda para cuando se añadan datasets con huecos (EMIT, NDVI o permafrost).
- Tests: 17 de Python + 5 de TypeScript, todos en verde.

| Perfil | Positivos (antes → después) | Conjunto análogo (celdas) | % de la tierra firme |
|---|---|---|---|
| Low-sun navigation | p97 → p98.5 | 519 → 414 | 0.4 % |
| Survive the cold & dark | p74 → **p92** | 15 777 → 21 026 | **11.6 %** (sigue siendo permisivo) |
| Extreme-slope polar mobility | p94 → p95 | 1 344 → 1 703 | 3.2 % |
| Frozen volatiles | p99 → p99.6 | 2 335 → 2 266 | 2.0 % |
| Dust & regolith | p70 → **p58** ⚠️ | 5 074 → 5 498 | 13.0 % |
| Mars ice-rich landing | p83 → p79 | 7 879 → 7 810 | 15.3 % |

**Cómo leerlo:** antes, los polos "inflaban" la distribución terrestre de frío (había demasiadas celdas polares), así que "el 30 % más frío" era más frío de lo que corresponde por área. Al corregirlo, los umbrales de frío se relajan: *Survive the cold* gana celdas, pero sus análogos conocidos suben de p74 a p92. En cambio, el perfil de polvo **empeora** (p58). Sus positivos ya no son robustos y conviene revisar sus umbrales antes de presentarlo.

## 5. Resumen en una frase para el equipo
> Comparamos la Tierra con **condiciones** del Polo Sur lunar (y, después, de las zonas de hielo de Marte), **no con una lista de puntos**. Cada perfil usa solo las dimensiones con dato global, los huecos bajan la confianza en vez de inventar ceros, y todo resultado se puede comprobar contra NASA POWER, Worldview o una calculadora antes de presentarlo.

---

## 7. ESA CCI integrado (2026-11-15) y accesibilidad de fuentes

**Integrado:** ESA Permafrost_cci v5.0, extensión de permafrost 2023 (1 km, MODIS LST + CryoGrid), con su incertidumbre por píxel.
- Hemisferio Norte doi:10.5285/d235665772ec4b558e9a89ac85595e71 · Antártida doi:10.5285/25447c253cbe435b937347756fe47146
- Descarga directa y pública desde CEDA (sin registro): `pipeline/scripts/fetch_cci_permafrost.py` (12.9 MB en total) → `data/processed/permafrost_grid.npz`.
- Reemplaza el proxy "MAAT < −2 °C" en `moon_volatiles` y añade "Ground ice" a `mars_ice_landing`. Rampa del 10 % al 90 % (clases IPA: esporádico → continuo).
- **Regla de huecos:** el producto solo cubre el dominio del permafrost (25–85° N y 60–85° S). Si no hay píxel ESA y MAAT > +3 °C, se asigna 0 %. Si no hay píxel y hace frío (Andes altos, interior de mantos de hielo), queda como "no data".
- La ficha web muestra "93 % ± 26 %" con la incertidumbre que publica la ESA.

| Perfil | Antes (proxy) | Después (ESA CCI) |
|---|---|---|
| Volatiles: percentil de los positivos | p99.6 | p98.7 |
| Volatiles: % de tierra marcada | 2.0 % | 3.6 % |
| Mars ice: percentil de los positivos | p79 | **p96.6** |
| Mars ice: % de tierra marcada | 15.3 % | **3.8 %** |

**Accesibilidad de lo propuesto:**

| Recurso | ¿Accesible? | Por qué / alternativa |
|---|---|---|
| CCI Data Bridge API | Sí, pero **no aporta datos** | Solo mapea relaciones CCI ↔ C3S/OSI SAF/CM SAF. Sus 236 entradas cubren 18 ECV (Soil Moisture, Sea Ice, Land Cover…) y **ninguna es Permafrost ni LST**. Nuestra trazabilidad se apoya en el DOI de CEDA. |
| CEDA archive (Permafrost) | **Sí** | Ya integrado. |
| CEDA archive (LST) | Sí, pero pesado | Global a 0.01°, un archivo por mes y sensor (cientos de MB). Para una climatología harían falta años de archivos. La temperatura mensual ya la da POWER; queda para después. |
| esa-climate-toolbox | Instalable, pero no lo usamos | Se distribuye por conda y depende de xcube/xarray; el pipeline usa Python 3.14 + pip. Para 2 archivos NetCDF basta con `h5py`. |
| cci-notebooks / ect-training | Repos públicos | Son material de referencia. Su lógica (leer NetCDF, recortar, promediar) ya está en el script. |
| Backend FastAPI/Flask | No se adopta | La web es estática: el scoring corre en el navegador (espejo de Python). Un backend añade hosting y fallos sin dar una capacidad nueva. |
| Siguiente candidato | Land Cover CCI (bare areas) | Reemplazaría el proxy "desierto = suelo desnudo". Está en Data Bridge y es público, pero es un mapa global de 300 m (~GB). |
