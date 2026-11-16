# L.U.M.E.A.: metodología y desarrollo

**Versión documental:** 15 de noviembre de 2026.  
**Alcance:** redacción para completar el informe a partir del código, la configuración y los resultados almacenados en el repositorio. Las cifras corresponden al reporte existente; no se generó una nueva evaluación para este documento.

## Base documental y versión examinada

La documentación se basa en la copia de trabajo de **L.U.M.E.A. situada en `D:\LUMEA\L.U.M.E.A`**, cuyo remoto es `https://github.com/Ivanpillow/L.U.M.E.A.git`. Al realizar esta revisión, la rama activa `main` y la referencia local `origin/main` apuntan al commit **`211cee33d703221b2c3a11e80f5c9a63cccc5b51`**, con mensaje `Merge branch 'claude/lumea-ui-ux-frontend-46a7ae'`. El registro local documenta su incorporación mediante `pull` el **15 de noviembre de 2026 a las 18:15:45, hora de Ciudad de México**. La coincidencia acredita la versión descargada que se examinó; no comprueba si existen commits posteriores en el servidor.

Se contrastaron veinte archivos de investigación, configuración e implementación con el contenido de ese commit, normalizando los finales de línea. Dieciocho coincidieron. `web/src/main.ts` y `web/src/i18n.ts` contienen diferencias locales de visualización, entre ellas sombreado solar y colores del mapa. La metodología toma en cuenta el contenido local disponible. Los archivos revisados del motor de puntuación, preparación de datos, configuración de perfiles y composición de modos coinciden con el commit. Esta comprobación no equivale a un inventario de todos los cambios del repositorio.

Se leyeron completos los seis archivos de investigación anteriores a este documento:

| Archivo | Aporte recuperado para el informe | Tratamiento |
|---|---|---|
| [01_ARQUITECTURA_PROYECTO.md](./01_ARQUITECTURA_PROYECTO.md) | Distinción entre objetivos planetarios, análogos documentados y candidatos; dimensiones físicas; importancia de la escala. | Es el diseño inicial. H3, similitud gaussiana, mineralogía y novedad bibliométrica no se atribuyen a la implementación actual. |
| [01_ARQUITECTURA_EXPLICADA.md](./01_ARQUITECTURA_EXPLICADA.md) | Explicación de analogía según el propósito, comparabilidad D/R/N y comunicación de límites. | Su lenguaje introductorio se conserva; sus descripciones de funciones previstas se contrastan con el código. |
| [02_PROMPT_MAESTRO_INVESTIGACION.md](./02_PROMPT_MAESTRO_INVESTIGACION.md) | Criterios de evidencia: producto exacto, unidades, resolución, acceso, referencias e incertidumbre; separación entre dato, derivación y proxy. | Es un protocolo de investigación, no un conjunto de resultados ni evidencia de que sus tareas se hayan ejecutado. |
| [03_INVESTIGACION_VERIFICADA.md](./03_INVESTIGACION_VERIFICADA.md) | Referencias del contexto planetario, requisitos de ingeniería, geometría solar y bibliografía de fuentes. | Sus afirmaciones se distinguen de sus referencias. El título «verificada» no sustituye el contraste con la fuente primaria. |
| [04_ARQUITECTURA_V1_ALCANCE_Y_TAREAS.md](./04_ARQUITECTURA_V1_ALCANCE_Y_TAREAS.md) | Cambio a perfiles de ensayo, calendario mensual, rejilla meteorológica y evaluación multiescala. | Sustituye decisiones del diseño inicial. Los cronogramas y tareas no se presentan como resultados logrados. |
| [05_SITIOS_PARAMETROS_SESGOS_Y_VALIDACION.md](./05_SITIOS_PARAMETROS_SESGOS_Y_VALIDACION.md) | Definición de objetivos por condiciones, sesgos, ponderación por área, cobertura mínima e incorporación de ESA CCI. | Sus actualizaciones finales y el código prevalecen sobre pasajes anteriores que describen estados ya superados. |

Las carpetas `.claude/` e `Investigaciones/.claude/` presentes en esta copia contienen configuraciones de arranque, no investigaciones adicionales ni transcripciones completas de conversaciones. El presente archivo es una síntesis documental elaborada a partir de los materiales disponibles.

# 5. Metodología y Desarrollo

L.U.M.E.A. se desarrolla mediante un enfoque cuantitativo, geoespacial y exploratorio, orientado a priorizar regiones terrestres para ensayos relacionados con la exploración lunar y marciana. La analogía se define en función de una actividad: un sitio puede ofrecer condiciones útiles para probar navegación, movilidad o prospección de recursos sin reproducir el ambiente planetario completo.

El procedimiento comprende la selección de fuentes, la integración de variables en una rejilla común, la evaluación mediante perfiles de prueba y la explicación de los candidatos. La versión actual utiliza un modelo multicriterio determinista, con funciones y pesos explícitos. Las representaciones vectoriales corresponden a conjuntos de variables físicas por celda; el prototipo no incorpora un modelo entrenado de aprendizaje automático.

## 5.1. Datos y Unidad de Análisis

La unidad de análisis es la combinación de una celda terrestre y un mes del año. Se emplea una rejilla de 0,5° de latitud por 0,625° de longitud, alineada con los datos meteorológicos utilizados. Una celda mide aproximadamente 55 × 69 km en el ecuador; su superficie disminuye hacia los polos. El conjunto procesado contiene 62 852 celdas seleccionadas por el procedimiento de disponibilidad climática y máscara terrestre del prototipo.

Cada celda se representa mediante un vector de variables climáticas, topográficas y de iluminación. Algunas varían mensualmente y otras resumen condiciones anuales o características del terreno. Esta organización permite evaluar tanto la compatibilidad espacial como su variación estacional.

Se mantienen separados tres elementos: el **objetivo planetario**, que aporta las condiciones relevantes para el ensayo; los **análogos terrestres documentados**, que sirven como referencias de evaluación; y los **candidatos**, que son celdas priorizadas por el modelo. En el alcance actual, el objetivo lunar corresponde a condiciones de la región polar sur y el marciano a condiciones relacionadas con regiones de hielo subsuperficial. No se generan firmas medidas individuales de cada sitio planetario.

| Componente | Variables utilizadas | Tratamiento e interpretación |
|---|---|---|
| Clima | Temperatura media, mínima y máxima del aire a 2 m; precipitación; viento a 10 m | Se obtienen de NASA POWER. La precipitación media diaria anual se multiplica por 365,25 para estimar mm/año. |
| Reflectancia | Albedo mensual, media de los doce meses y mínimo mensual | El mínimo mensual se utiliza como aproximación a una condición menos influida por nieve estacional; no demuestra que el suelo esté libre de nieve. |
| Terreno | Elevación media, relieve y pendiente regional | Se derivan de Terrain Tiles y se agregan a la rejilla de análisis. |
| Iluminación | Días mensuales con Sol bajo y días sin salida del Sol | Se estiman con geometría solar analítica a partir de la latitud y el día del año. |
| Permafrost | Fracción de área con permafrost e indicador de incertidumbre | Se usa ESA CCI Permafrost v5.0 para 2023, agregado a la rejilla. Es un producto de modelación apoyado en datos satelitales. |

La integración conserva las diferencias entre las resoluciones originales. Por ejemplo, el albedo de CERES se incorpora desde una rejilla de 1° mediante vecino más cercano. Asignarlo a celdas menores no aumenta su resolución efectiva.

Para el terreno global se utilizan teselas de nivel de zoom 5, cuyo espaciamiento es aproximadamente 4,9 km en el ecuador y cambia con la latitud. El relieve se calcula como la diferencia entre las elevaciones máxima y mínima de los píxeles seleccionados. La variable denominada `slope_p90_deg` aproxima un percentil alto de pendiente mediante la media más 1,2816 desviaciones estándar; no es un percentil empírico calculado ordenando las pendientes.

El régimen de iluminación se estima mediante la declinación solar y la altura del Sol al mediodía:

\[
h(c,d)=90^\circ-|\varphi_c-\delta(d)|.
\]

Aquí, \(\varphi_c\) es la latitud y \(\delta(d)\) la declinación del día. Se cuentan como días de Sol bajo aquellos con \(0<h\leq7,54^\circ\), y como días sin amanecer aquellos con \(h\leq0\). El límite de 7,54° es una aproximación del proyecto que combina una región hasta 6° del polo lunar con la inclinación del eje de la Luna de 1,54°. La estimación usa un año de 365 días y omite la refracción atmosférica y el horizonte topográfico local. [NASA: iluminación del polo sur lunar](https://science.nasa.gov/photojournal/south-pole-illumination-map/).

El análisis mensual describe condiciones climatológicas y estacionales. No constituye un pronóstico meteorológico ni identifica fechas concretas de una campaña.

## 5.2. Fundamento Científico y Selección de Fuentes de Datos

La selección de variables se fundamenta en la relación entre las condiciones del entorno y la actividad que se desea ensayar. Watson y Blaisdell (2000) identifican el terreno, las propiedades del suelo y la meteorología entre las características que influyen en los resultados de pruebas de sistemas planetarios. También establecen que la importancia de cada característica depende del ensayo: un sitio apropiado para una actividad puede resultar inadecuado para otra. Este antecedente respalda la organización de L.U.M.E.A. mediante perfiles específicos de evaluación. [Watson y Blaisdell: *Salient Characteristics for Terrestrial Analog Engineering Test Sites*](https://ntrs.nasa.gov/citations/20000105009).

La investigación con análogos terrestres tiene aplicación documentada. El programa BASALT de NASA realizó campañas en terrenos volcánicos de Idaho y Hawái para estudiar procedimientos de exploración, herramientas y comunicaciones en escenarios relacionados con Marte. Este caso demuestra que un ambiente terrestre puede aportar evidencia sobre componentes concretos de una operación planetaria, aunque no reproduzca el ambiente completo. [NASA: *What is BASALT?*](https://www.nasa.gov/missions/analog-field-testing/what-is-basalt/).

La consideración conjunta del terreno y la iluminación tiene, además, una base física. En un modelo geométrico de un obstáculo vertical de altura H sobre una superficie horizontal, iluminado por rayos solares paralelos con elevación h, la longitud de su sombra L satisface:

\[
\frac{L}{H}=\frac{1}{\tan h},\qquad 0^\circ<h<90^\circ.
\]

Por cálculo geométrico, a 7,5° la sombra mide aproximadamente 7,6 veces la altura del obstáculo; a 45° mide una vez esa altura. Así, un mismo terreno presenta condiciones de visibilidad diferentes al cambiar la elevación solar. Esta relación justifica evaluar iluminación y terreno conjuntamente para ensayos de navegación. La ecuación describe la geometría de una sombra ideal; no reproduce el contraste radiométrico lunar ni las sombras de un relieve complejo.

La relevancia operativa de esta relación también cuenta con evidencia experimental. Litaker y colaboradores (2025) realizaron dos estudios en un entorno virtual de navegación lunar con astronautas y un operador remoto. Encontraron que la dirección de la iluminación a baja elevación dificultaba la conducción y motivaba cambios de trayectoria para mejorar la visibilidad. Es evidencia sobre el efecto de la iluminación en la operación; no es una validación experimental de los sitios ni del ranking de L.U.M.E.A. [*South Pole Lunar Lighting Studies for Driving Exploration on the Lunar Surface*](https://ntrs.nasa.gov/citations/20240011393).

La dimensión temporal se deriva de esa misma geometría: en la Tierra, la altura solar al mediodía depende de la latitud y de la declinación, que cambia durante el año. En consecuencia, la compatibilidad geométrica de un lugar para un ensayo de Sol bajo cambia con la estación. Esto fundamenta la evaluación por celda y mes, en lugar de asignar una analogía fija a cada lugar.

El fundamento matemático del modelo consiste en representar por separado las variables y transformar sus unidades a grados adimensionales de cumplimiento, que después se combinan según el ensayo. Es una construcción de indicador compuesto: hace explícitas y reproducibles las decisiones de normalización, ponderación y agregación. El manual metodológico OECD/JRC (2008) exige justificar esas decisiones y examinar sensibilidad y compensaciones entre indicadores. Ese antecedente respalda el procedimiento general, pero no determina los pesos ni valida los umbrales específicos del proyecto. [OECD/JRC: *Handbook on Constructing Composite Indicators*](https://www.oecd.org/content/dam/oecd/en/publications/reports/2008/08/handbook-on-constructing-composite-indicators-methodology-and-user-guide_g1gh9301/9789264043466-en.pdf).

Con estos fundamentos, las fuentes se seleccionan por las variables que aportan y por su pertinencia para cada ensayo:

| Función | Fuentes | Uso en la versión actual |
|---|---|---|
| Datos climáticos terrestres | NASA POWER, con productos MERRA-2 y CERES | Temperatura, precipitación, viento y albedo. |
| Elevación terrestre | Terrain Tiles, distribuido mediante AWS Open Data | Métricas regionales del terreno y exploración local. La fuente de elevación subyacente varía por región. |
| Permafrost terrestre | ESA CCI Permafrost v5.0, disponible en CEDA | Fracción de permafrost para 2023 y su incertidumbre publicada. |
| Referencias planetarias y de ingeniería | Documentos de NASA, fichas planetarias y bibliografía de SWIM | Contexto de los objetivos y justificación de variables y restricciones. |
| Análogos documentados | Lista curada del proyecto y capa de USGS | Diagnóstico del modelo y consulta cartográfica, con funciones diferentes en el flujo actual. |

NASA POWER proporciona el servicio de climatología empleado por el proceso de descarga. Terrain Tiles ofrece elevaciones organizadas en teselas. Los productos de ESA CCI estiman la extensión de permafrost mediante un modelo térmico apoyado en observaciones satelitales y reanálisis; no miden directamente el volumen de hielo aprovechable. [NASA POWER: Climatology API](https://power.larc.nasa.gov/docs/services/api/temporal/climatology/), [Terrain Tiles](https://registry.opendata.aws/terrain-tiles/), [ESA CCI: hemisferio norte](https://catalogue.ceda.ac.uk/uuid/d235665772ec4b558e9a89ac85595e71/), [ESA CCI: Antártida](https://catalogue.ceda.ac.uk/uuid/25447c253cbe435b937347756fe47146/).

La justificación del sistema se apoya, por tanto, en mecanismos físicos identificables, antecedentes de ensayos análogos y reglas cuantitativas verificables. La procedencia institucional de los datos facilita su trazabilidad, pero no basta para demostrar que una comparación sea válida. Esa validez depende de la pertinencia de las variables, sus escalas y definiciones, y de la evaluación del modelo descrita en las secciones siguientes.

Los datos terrestres se procesan previamente con Python. Los archivos preparados alimentan una aplicación estática en TypeScript que recalcula los puntajes al modificar perfiles, meses o pesos. La configuración conserva las referencias de los criterios y señala los umbrales pendientes de respaldo mediante `verified: false`. Tener una referencia asociada no implica que esa fuente haya validado el peso o la función de puntuación elegidos por el equipo.

## 5.3. Modelo de Evaluación

La evaluación utiliza seis perfiles de prueba. Cada uno selecciona las condiciones relevantes para una actividad y establece cómo contribuyen al puntaje.

| Perfil | Condiciones principales evaluadas |
|---|---|
| Navegación con Sol bajo | Días de iluminación rasante, relieve, aridez y albedo. |
| Supervivencia al frío y la oscuridad | Días sin amanecer, temperatura mínima y amplitud entre máximas y mínimas mensuales. |
| Movilidad en pendientes | Pendiente regional, relieve, frío, aridez y filtro de albedo. |
| Prospección de volátiles | Fracción de permafrost, aridez, relieve y filtro de albedo. |
| Manipulación de polvo y regolito | Baja precipitación, viento, pendiente regional y filtro de albedo. |
| Zonas marcianas asociadas a hielo | Frío, fracción de permafrost, aridez, albedo y terreno regional poco inclinado. |

Cada variable se transforma en un grado de cumplimiento entre 0 y 1 mediante una rampa ascendente, una rampa descendente o una banda trapezoidal. Las rampas favorecen valores altos o bajos; la banda favorece un intervalo intermedio. Los límites pueden expresarse en unidades físicas o mediante percentiles de la distribución terrestre.

Los percentiles se ponderan por el área de cada celda para reducir la sobrerrepresentación de las regiones polares. En las variables mensuales se consideran conjuntamente las combinaciones de celdas y meses, con la ponderación espacial repetida para cada mes.

En la aproximación esférica utilizada por el código, el área de una celda delimitada por las latitudes sur y norte es:

\[
a_c=R^2\Delta\lambda\,[\sin(\varphi_N)-\sin(\varphi_S)],
\]

con los ángulos en radianes y R como radio terrestre. Para una variable x, el percentil ponderado q se obtiene a partir de la distribución acumulada:

\[
F_w(t)=\frac{\sum_{c:x_c\leq t}a_c}{\sum_{c:x_c\ \mathrm{disponible}}a_c},
\qquad P_q=\inf\{t:F_w(t)\geq q/100\}.
\]

Esta corrección responde a una propiedad geométrica de la rejilla: contar cada celda con el mismo peso daría mayor representación por unidad de superficie a las latitudes altas. No corrige por sí sola otros sesgos de muestreo o errores de las fuentes.

Las funciones de cumplimiento implementadas se expresan con \(\operatorname{clip}(z)=\min(1,\max(0,z))\):

\[
\mu_\uparrow(x)=\operatorname{clip}\left(\frac{x-a}{b-a}\right),
\qquad
\mu_\downarrow(x)=\operatorname{clip}\left(\frac{b-x}{b-a}\right),
\]

\[
\mu_{\mathrm{banda}}(x)=\operatorname{clip}\left[\min\left(\frac{x-a}{b-a},\frac{d-x}{d-c}\right)\right],
\]

para \(a<b\) en las rampas y \(a<b\leq c<d\) en la banda. Estas funciones formalizan preferencias del ensayo; no son leyes físicas ni probabilidades estimadas a partir de datos de entrenamiento.

Para un perfil \(p\), una celda \(c\) y un mes \(m\), el puntaje se calcula como:

\[
S_p(c,m)=
\frac{\sum_{j\in A(c,m)}w_j\,\mu_j(x_j(c,m))}
{\sum_{j\in A(c,m)}w_j}
\prod_{g\in G}\mu_g(x_g(c,m)).
\]

En esta expresión, \(\mu_j\) es la función de cumplimiento del criterio, \(w_j\) su peso y \(A(c,m)\) el conjunto de criterios ponderados con información disponible. El conjunto \(G\) contiene los criterios multiplicativos o «puertas». Estos últimos reducen el resultado cuando una condición necesaria se cumple parcialmente y lo anulan cuando su pertenencia es cero.

Los datos faltantes se excluyen de la media ponderada. La cobertura mensual se define como la suma de pesos con información disponible dividida entre la suma total de pesos del perfil. El ranking exige una cobertura media de los doce meses de al menos 0,75. Este indicador expresa disponibilidad de variables ponderadas; no representa una probabilidad de acierto ni incorpora toda la incertidumbre de los datos.

En la implementación actual, una puerta sin dato se considera neutra y no reduce esa cobertura, porque las puertas no tienen peso. Por tanto, superar el filtro de cobertura no garantiza que todos los requisitos multiplicativos hayan sido observados. Esta limitación debe revisarse antes de interpretar una condición como comprobada.

Como síntesis temporal se calculan el máximo puntaje entre los doce meses y el número de meses que alcanzan el umbral de 0,60. Este umbral es una decisión operativa del prototipo pendiente de validación independiente.

La interfaz también agrupa perfiles en cuatro modos:

| Modo | Composición |
|---|---|
| Luna · Aterrizaje | Media mensual de navegación con Sol bajo, movilidad y polvo/regolito. |
| Luna · Base | Media mensual de frío/oscuridad, volátiles, movilidad y polvo/regolito. |
| Marte · Aterrizaje | Perfil de zonas asociadas a hielo. |
| Marte · Base | El mismo perfil marciano, con los pesos de frío y permafrost multiplicados por 1,5 antes de normalizar. |

Los modos combinados promedian los perfiles con puntaje disponible. Sus resultados y el factor 1,5 de Marte · Base todavía requieren evaluación propia. Además, una media entre perfiles permite compensaciones: una puntuación baja en uno puede quedar compensada por otra alta. El modo Luna · Aterrizaje reúne condiciones para ensayos; su componente de movilidad favorece pendientes exigentes y no constituye una evaluación integral de seguridad para aterrizar.

## 5.4. Interpretación de la Compatibilidad

El puntaje expresa el cumplimiento de los criterios de un ensayo bajo la configuración seleccionada. Un valor de 0,80 no significa «80 % de semejanza con la Luna», ni una probabilidad de éxito de una misión. Un cambio de perfil, mes o pesos modifica la pregunta de evaluación y puede cambiar la clasificación.

Para interpretar las comparaciones se utiliza la siguiente distinción:

- **D — Directa:** se compara una magnitud física, siempre que su definición, escala y condiciones de medición sean compatibles. La geometría solar es un ejemplo, con las simplificaciones declaradas.
- **R — Relativa:** se priorizan condiciones terrestres útiles para el ensayo, como frío, aridez o relieve. Estar entre los extremos terrestres no demuestra equivalencia con el ambiente planetario.
- **N — No reproducible en un sitio terrestre natural:** incluye diferencias de gravedad, vacío, atmósfera y radiación que quedan fuera del puntaje y se explican en la ficha.

Las etiquetas deben leerse junto con las limitaciones de cada variable. El albedo terrestre de superficie y el albedo de Bond planetario representan magnitudes relacionadas, pero no equivalentes sin armonizar sus definiciones. La temperatura del aire tampoco equivale a la temperatura de la superficie lunar. La amplitud térmica calculada como `T2M_MAX − T2M_MIN` corresponde a los extremos del periodo mensual del producto; no mide directamente un ciclo térmico diario.

Los indicadores indirectos se interpretan con el mismo cuidado. La baja precipitación orienta la búsqueda de ambientes secos, pero no confirma ausencia de vegetación ni propiedades mecánicas semejantes al regolito. El permafrost indica suelo que permanece congelado, sin determinar por sí solo el contenido, la profundidad o la accesibilidad del hielo. La incertidumbre de ESA se conserva como indicador agregado; actualmente no se propaga hasta una incertidumbre del puntaje final.

En consecuencia, cada candidato debe interpretarse mediante su puntaje, las variables que lo sustentan, la cobertura y los límites de la analogía. El resultado sirve para seleccionar regiones que ameritan un estudio posterior.

## 5.5. Selección y Explicación de Candidatos

Las celdas con cobertura suficiente se ordenan por el puntaje del mes seleccionado o por su mejor resultado anual. Para reducir la repetición de regiones cercanas se aplica una separación superior a 300 km entre candidatos seleccionados. El proceso de referencia conserva hasta quince candidatos por perfil y la interfaz muestra hasta doce por modo. Este procedimiento diversifica la lista; no demuestra independencia ambiental entre los sitios.

Cada ficha muestra la ubicación, el calendario mensual, las contribuciones de los criterios, los datos faltantes y las condiciones que la Tierra no reproduce. Las explicaciones se construyen con reglas a partir de los resultados, lo que permite identificar por qué una celda obtiene un puntaje alto o bajo.

También se informa la distancia al análogo más cercano de la lista curada. La etiqueta de candidato nuevo se asigna cuando supera 500 km. Esta distancia expresa separación respecto del catálogo de referencia y no demuestra que el lugar carezca de estudios previos. La novedad científica requiere una búsqueda bibliográfica adicional.

La selección global se complementa con un procedimiento de exploración local del terreno. El script disponible descarga Terrain Tiles a mayor zoom y estima pendientes sobre escalas aproximadas de 100 m y 2 km. El espaciamiento de las teselas cambia con la latitud y no garantiza una resolución efectiva de 30 m del modelo original. Antes de usar esos resultados para evaluar restricciones de ingeniería se debe verificar la procedencia y resolución del modelo de elevación, así como el método de cálculo de pendientes.

La evaluación preliminar comprende tres procedimientos:

1. **Análogos documentados:** se identifica la celda disponible más cercana a cada sitio asignado al perfil, hasta una distancia de 150 km, y se calcula su percentil respecto de la distribución de puntajes ponderada por área. Se reporta la mediana de esos percentiles. Este indicador describe posición relativa; no equivale a una tasa de recuperación de análogos.
2. **Control de contraste:** se calcula la proporción de celdas con latitud absoluta menor de 10° y precipitación anual superior a 2 000 mm que supera el umbral. Es un diagnóstico limitado del comportamiento en ambientes húmedos; no representa todos los posibles falsos positivos ni un conjunto negativo universal para cualquier ensayo.
3. **Sensibilidad a los pesos:** se ejecutan cincuenta réplicas con perturbaciones aleatorias de ±20 % en los pesos de los criterios ponderados, manteniendo funciones y puertas. Se calcula el índice de Jaccard entre el conjunto original sobre el umbral y cada conjunto perturbado. Esta medida describe estabilidad de pertenencia al conjunto, no estabilidad del orden del ranking ni exactitud física.

El reporte almacenado, fechado el 15 de noviembre de 2026, contiene los siguientes resultados:

| Perfil | Sitios de referencia | Percentil mediano | Control húmedo sobre el umbral | Jaccard medio |
|---|---:|---:|---:|---:|
| Navegación con Sol bajo | 3 | 98,5 | 0,0 % | 0,78 |
| Supervivencia al frío y la oscuridad | 3 | 92,4 | 0,0 % | 0,96 |
| Movilidad en pendientes | 3 | 94,8 | 2,4 % | 0,92 |
| Prospección de volátiles | 4 | 98,7 | 0,0 % | 0,87 |
| Polvo y regolito | 4 | 57,6 | 0,0 % | 0,98 |
| Zonas marcianas asociadas a hielo | 4 | 96,6 | 0,0 % | 0,87 |

Estos resultados muestran diferencias entre perfiles. Por ejemplo, polvo y regolito presenta estabilidad alta frente a cambios de pesos, pero un percentil mediano de referencia menor que los demás. La estabilidad de un modelo no demuestra su capacidad de representar adecuadamente las condiciones del ensayo.

La evaluación tiene limitaciones relevantes: usa tres o cuatro sitios por perfil, sus coordenadas son aproximadas y esos mismos sitios ayudaron a diagnosticar y ajustar el modelo. Por ello, constituye una evaluación interna exploratoria y todavía no demuestra generalización a sitios independientes. Los resultados pertenecen a perfiles con pesos predeterminados; no validan automáticamente los modos combinados ni las configuraciones que modifique el usuario.

La capa de USGS ya está incorporada a la consulta cartográfica, pero su visualización no constituye una validación independiente: parte de sus registros se muestra precisamente porque el modelo les asigna un puntaje alto. Para evaluar el sistema se requiere un conjunto externo elegido por pertinencia al ensayo, sin seleccionar los casos a partir del resultado que se pretende comprobar.

## 5.6. Trabajo Futuro

La siguiente etapa debe fortalecer la evidencia del modelo antes de ampliar sus afirmaciones. La prioridad es establecer conjuntos de calibración y prueba separados, con sitios pertinentes a cada actividad y, cuando sea posible, separación geográfica para reducir la dependencia espacial. Se deberán evaluar la recuperación de análogos, la sensibilidad a los umbrales y la estabilidad de los modos combinados. La comparación con una línea base exclusivamente topográfica permitirá comprobar si integrar otras variables aporta una mejora.

En los datos se propone incorporar cobertura del suelo o vegetación para sustituir el indicador indirecto basado en precipitación; contrastar la temperatura del aire con productos de temperatura superficial; y ampliar la caracterización mineralógica y térmica. La comparación con regiones lunares o marcianas específicas requerirá descargar sus productos, armonizar unidades y escalas, y documentar las incertidumbres de cada transformación.

También se requiere sustituir la aproximación del percentil de pendiente por un cálculo empírico, mejorar la máscara terrestre, verificar los modelos de elevación locales y distinguir explícitamente la ausencia de datos en las puertas. El tratamiento del permafrost deberá conservar la diferencia entre valores publicados, valores inferidos y áreas sin información, y propagar la incertidumbre de origen hasta el resultado cuando sea metodológicamente viable.

Finalmente, la utilidad de los candidatos deberá contrastarse con revisión bibliográfica, imágenes de mayor resolución, observaciones locales y condiciones operativas como acceso, permisos e infraestructura. Las técnicas de aprendizaje automático podrán evaluarse cuando exista un conjunto de referencia suficiente y un diseño de validación independiente que permita compararlas con el modelo multicriterio actual.

---

# Ajustes de coherencia para las secciones anteriores

## 2. Objetivo del Proyecto — redacción sugerida

Desarrollar y evaluar un prototipo geoespacial que integre datos abiertos en representaciones vectoriales de variables físicas y ambientales para identificar y caracterizar regiones y periodos terrestres potencialmente útiles para ensayos de exploración lunar y marciana, explicando sus semejanzas, limitaciones y utilidad para actividades específicas.

## 4. Justificación — redacción sugerida

La selección de un análogo terrestre depende de las condiciones que exige cada ensayo. Integrar información climática, topográfica y de iluminación permite considerar aspectos que una comparación exclusivamente geométrica no describe. L.U.M.E.A. organiza estas variables en una evaluación reproducible y explicable, orientada a priorizar regiones y periodos para su estudio posterior. La mejora en la recuperación de análogos documentados frente a un método exclusivamente topográfico se plantea como una hipótesis pendiente de comprobación mediante validación independiente.

**Motivo del ajuste:** la justificación original anticipa una mejora y atribuye al sistema técnicas de aprendizaje automático que no están implementadas. La redacción propuesta conserva la motivación y distingue el aporte actual de la hipótesis por evaluar.

# Notas de trazabilidad y revisión técnica

Estas notas acompañan la revisión del proyecto y pueden quedar fuera del cuerpo principal del informe.

| Aspecto revisado | Evidencia local | Consecuencia documental |
|---|---|---|
| Evolución del diseño | Documentos 01, 04 y 05 de `Investigaciones/` | H3, los embeddings y la comparación directa de mapas planetarios pertenecen a propuestas anteriores o futuras. La implementación usa la rejilla meteorológica y perfiles de ensayo. |
| Fuentes y transformaciones | `pipeline/scripts/fetch_power.py`, `fetch_terrain.py`, `fetch_cci_permafrost.py` y `build_web_data.py` | Diferenciar dato original, remuestreo, agregación e inferencia. |
| Periodo de POWER | La investigación declara 2001–2025; la URL del descargador no fija `start` y `end` | Antes de presentar ese periodo como comprobado para todos los parámetros, verificar las cabeceras de las respuestas originales. El conjunto procesado no conserva esas cabeceras. |
| Selección terrestre | `fetch_terrain.py` usa elevación > 0 como aproximación de tierra; `build_web_data.py` selecciona fracción ≥ 0,5 y añade el extremo sur fuera de Mercator con clima disponible | No afirmar cobertura exhaustiva de toda la tierra firme: pueden omitirse depresiones bajo el nivel del mar, costas e islas. |
| Permafrost | Agregación de píxeles válidos, con mínimo de 20 %; la incertidumbre se promedia | El indicador agregado no es una incertidumbre propagada del puntaje ni una estimación directa de hielo. |
| Huecos de permafrost | `permafrost_features()` asigna 0 % cuando falta ESA y la temperatura media anual supera +3 °C; conserva NaN en otros huecos | El cero es una inferencia del prototipo, no una observación de ausencia. El límite +3 °C requiere justificación y evaluación. |
| Puertas y cobertura | `pipeline/analog/scoring.py` y `web/src/scoring.ts` | Las puertas sin dato son neutras y no reducen cobertura. Algunas notas antiguas describen incorrectamente ese comportamiento. |
| Cobertura anual | Media de cobertura mensual utilizada en el ranking | La cobertura del mes mostrado en la ficha puede diferir de la media anual con que se decide la elegibilidad. |
| Modos | `web/src/modes.ts` | La media entre perfiles es compensatoria; las puertas de un perfil no son requisitos globales del modo. |
| Validación y elegibilidad | `build_web_data.py` | El filtro de cobertura se aplica al ranking, pero el conjunto sobre el umbral utilizado para áreas y Jaccard incluye también celdas no elegibles. En volátiles el reporte registra 219 celdas sobre el umbral excluidas del ranking. |
| Recuperación de análogos | `validation_report.md` y cálculo de `known_median_pct` | El percentil mediano no es recall, precisión ni porcentaje de acierto. Un sitio puede quedar en un percentil alto sin superar 0,60. |
| USGS | `web/scripts/build-usgs.mjs` y `web/public/data/usgs.json` | Hay 192 registros de entrada, cinco coincidencias con la lista curada y siete puntos adicionales mostrados. El filtrado por resultado impide usar esa selección como prueba independiente. |
| Novedad | `web/src/main.ts`, distancia a la lista curada y `NEW_KM = 500` | La distancia no comprueba ausencia de literatura y la capa USGS no sustituye automáticamente la lista usada para este cálculo. |
| Exportación web | `quantize()` en `build_web_data.py` y decodificación en `web/src/data.ts` | Las variables se cuantizan a 255 niveles válidos y un código de ausencia. Puede haber diferencias de redondeo respecto del cálculo Python, especialmente cerca del umbral. |
| Pruebas de software | `pipeline/tests/` y `web/src/*.test.ts` | Verifican comportamientos computacionales; no sustituyen validación científica ni demuestran concordancia numérica completa entre productos cuantizados y datos originales. No se ejecutaron nuevamente para esta edición documental. |

La revisión prioriza el comportamiento del código y los productos actuales cuando entran en conflicto con notas de planificación anteriores. No modifica los algoritmos, los datos ni los resultados guardados.
