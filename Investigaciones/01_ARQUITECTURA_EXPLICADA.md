# Arquitectura explicada en lenguaje sencillo

Este documento es una versión introductoria de la arquitectura del proyecto.  
El archivo técnico original sigue siendo la referencia completa:
[`01_ARQUITECTURA_PROYECTO.md`](./01_ARQUITECTURA_PROYECTO.md).

La intención aquí no es memorizar nombres de satélites, fórmulas o bases de datos. Primero hay que entender **qué quiere hacer la aplicación**, **qué compara** y **por qué necesita cada dato**.

---

## 1. ¿Qué quiere hacer la aplicación?

La aplicación busca lugares en la Tierra que se parezcan a una zona de la Luna o de Marte.

Por ejemplo:

- Elegimos una zona lunar cercana al polo sur.
- La aplicación describe esa zona: si tiene pendientes, cráteres, rocas, sombra, frío o hielo.
- Después revisa muchas zonas de la Tierra.
- Compara cada zona terrestre con la zona lunar.
- Finalmente muestra un ranking de los lugares terrestres más parecidos.

Un lugar terrestre que se parece a una zona de otro planeta se llama **análogo planetario**.

### Importante: no buscamos “otro planeta” en la Tierra

La Tierra nunca será exactamente igual a la Luna o a Marte. La aplicación busca parecidos concretos:

- Un desierto puede parecerse por su sequedad.
- Un campo de lava puede parecerse por su tipo de roca.
- Un lugar polar puede parecerse por el frío y la iluminación.
- Un cráter terrestre puede parecerse por su forma.

Por eso, un sitio puede ser bueno para una actividad y malo para otra. Un lugar útil para entrenar la conducción de un rover no necesariamente sirve para estudiar hielo.

---

## 2. La diferencia entre los tres tipos de lugares

El proyecto trabaja con tres grupos diferentes:

| Grupo | Dónde está | Qué representa |
|---|---|---|
| Sitios objetivo | Luna o Marte | El lugar que queremos imitar |
| Análogos conocidos | Tierra | Lugares que ya se usan o se conocen como parecidos |
| Nuevos candidatos | Tierra | Lugares que la aplicación descubre |

### Ejemplo

Si elegimos **Haworth**, una región candidata de la Luna:

1. Haworth es el **sitio objetivo**.
2. Svalbard o los Valles Secos de McMurdo pueden ser **análogos conocidos**.
3. Un nuevo valle polar encontrado por el sistema sería un **candidato nuevo**.

Los análogos conocidos no son el resultado principal. Sirven para comprobar que el sistema funciona. Si el sistema no reconoce lugares conocidos como parecidos, probablemente hay un problema en los datos o en la forma de puntuar.

---

## 3. Qué significa “comparar” un lugar

La aplicación divide cada lugar en varias características. Estas características se llaman **parámetros** o **variables**.

Una variable es simplemente una pregunta que podemos contestar con datos:

- ¿Qué tan inclinada es la superficie?
- ¿Cuántos cráteres hay?
- ¿Qué tan fría es?
- ¿Qué tipo de roca hay?
- ¿Hay hielo debajo?
- ¿Hay polvo o viento?

Cada lugar termina representado por una lista de valores. Esa lista funciona como su “perfil”.

### Ejemplo simplificado

| Característica | Zona de la Luna | Zona de la Tierra |
|---|---:|---:|
| Pendiente máxima | 8° | 9° |
| Rugosidad | Alta | Alta |
| Temperatura | Muy baja | Baja |
| Hielo bajo el suelo | Posible | Sí |
| Atmósfera | No | Sí |

Las primeras cuatro características pueden tener cierto parecido. La última no puede ser igual: la Tierra tiene atmósfera y la Luna prácticamente no.

---

## 4. Las letras D, R y N

Estas letras indican **qué tan justa es una comparación entre la Tierra y la Luna o Marte**.

### D — Comparación directa

La propiedad se puede medir de una forma parecida en los tres cuerpos.

Ejemplos:

- Pendiente.
- Relieve.
- Rugosidad.
- Albedo, es decir, qué tanta luz refleja una superficie.
- Tipo general de roca.
- Forma de un cráter.

Si una zona lunar tiene una pendiente de 8° y una zona terrestre tiene 9°, podemos decir que se parecen bastante en esa característica.

### R — Comparación relativa

La propiedad existe en los tres cuerpos, pero los valores no se pueden comparar como si fueran exactamente equivalentes.

En este caso no preguntamos “¿tienen la misma cantidad?”, sino:

> “¿Este lugar está entre los más fríos, secos o extremos de su propio mundo?”

Ejemplos:

- Temperatura.
- Diferencia entre el día y la noche.
- Aridez.
- Iluminación rasante.
- Hielo en el subsuelo.

Una zona de la Tierra no puede alcanzar las mismas temperaturas de una trampa fría lunar. Aun así, una región polar terrestre puede estar entre las zonas más frías y oscuras de la Tierra, por lo que sirve como comparación relativa.

### N — No análoga

Es una condición que la Tierra no puede reproducir de forma realista.

Ejemplos:

- La gravedad lunar es aproximadamente una sexta parte de la terrestre.
- Marte tiene cerca de 0.38 veces la gravedad de la Tierra.
- La Luna no tiene una atmósfera como la Tierra.
- Marte tiene una atmósfera muy delgada, principalmente de dióxido de carbono.
- La Luna recibe radiación y tiene polvo electrostático que no podemos reproducir completamente en un desierto.

Una característica N **no debe entrar al ranking como si pudiera igualarse**. Se muestra como una advertencia en la ficha:

> “Este lugar es parecido en terreno, pero la Tierra no reproduce la gravedad, el vacío ni la radiación del sitio lunar.”

---

## 5. Qué se toma de la Luna y qué se toma de Marte

La aplicación no usa exactamente las mismas variables para ambos cuerpos.

## 5.1 Datos principales de la Luna

La primera versión de la aplicación se concentra en la Luna, especialmente en el polo sur lunar.

### Terreno

Se observa:

- Altura y cambios de altura.
- Pendiente.
- Rugosidad.
- Cráteres.
- Cantidad de rocas y bloques.

Estos datos ayudan a saber si un rover puede moverse o si una nave podría aterrizar.

### Materiales

Se observa:

- Si el terreno es basalto, anortosita u otro material.
- Qué minerales aparecen.
- Qué tan reflectante o emisiva es la superficie.
- Si el suelo se parece a ceniza, roca o regolito.

El **regolito** es la capa de polvo, piedras y material suelto que cubre la superficie lunar.

### Temperatura e iluminación

Se observa:

- Temperatura máxima y mínima.
- Diferencia de temperatura entre el día y la noche.
- Inercia térmica.
- Albedo.
- Cuánto tiempo recibe luz.
- Cuánto tiempo el Sol permanece muy bajo en el horizonte.

La **inercia térmica** indica qué tan rápido cambia la temperatura de un material. Un material rocoso y compacto suele cambiar de temperatura de manera distinta a una capa de polvo suelto.

La iluminación es especialmente importante en el polo sur lunar porque el Sol permanece muy bajo. Esto produce sombras largas y puede dificultar la navegación.

### Hielo y sombra

Se observa:

- Regiones que permanecen en sombra.
- Posible hielo bajo el suelo.
- Temperatura de las trampas frías.
- Cercanía a cráteres permanentemente sombreados.

Una **trampa fría** es una zona que casi nunca recibe luz solar y puede conservar hielo durante mucho tiempo.

### Lo que no se intenta copiar de la Luna

Siempre se debe indicar que la Tierra no reproduce:

- El vacío lunar.
- La gravedad lunar.
- La radiación sin una magnetosfera protectora.
- El polvo lunar alterado por el espacio.
- La carga electrostática del regolito.

## 5.2 Datos principales de Marte

Marte queda como una segunda fase. Se agregan variables que tienen más sentido en un planeta con atmósfera delgada y una historia de agua.

### Terreno y geología

Se observa:

- Pendientes y relieve.
- Cráteres.
- Valles, dunas y llanuras.
- Minerales como arcillas, sulfatos, hematita o yeso.
- Tipo de roca.

Estos datos ayudan sobre todo a estudiar lugares donde pudo existir agua en el pasado.

### Agua y hielo

Se observa:

- Hielo bajo el suelo.
- Permafrost.
- Glaciares cubiertos de polvo o rocas.
- Zonas donde se detectaron minerales relacionados con agua.

Esto es importante para una futura base porque el agua puede servir para beber, producir oxígeno y fabricar combustible. A ese uso de recursos locales se le llama **ISRU**.

### Polvo y viento

Se observa:

- Cantidad de polvo en la atmósfera.
- Velocidad y dirección del viento.
- Dunas.
- Señales de erosión.

Estos datos ayudan a evaluar riesgos para paneles solares, vehículos, instrumentos y personas.

### Biología y biofirmas

En Marte no se mide vida directamente con estos datos. Se buscan lugares que podrían conservar señales de vida antigua.

- Arcillas y sales pueden conservar materiales.
- Ambientes muy secos o salinos pueden ser extremos para la vida.
- La ausencia de vegetación en la Tierra sirve como filtro, pero no demuestra que un lugar sea marciano.

Una **biofirma** es una señal que podría indicar vida pasada o presente. Debe estudiarse con mucho cuidado porque también puede producirse por procesos no biológicos.

### Lo que no se intenta copiar de Marte

La Tierra tampoco reproduce completamente:

- La gravedad marciana.
- La presión atmosférica marciana.
- La radiación de la superficie.
- La atmósfera de dióxido de carbono.
- La forma en que el polvo marciano se comporta durante tormentas globales.

---

## 6. Las ocho áreas de comparación

El documento original organiza las variables en ocho grupos:

1. **Terreno:** forma, altura, pendiente y rugosidad.
2. **Geología:** rocas, minerales y materiales.
3. **Temperatura e iluminación:** calor, frío, sombras y luz.
4. **Agua y hielo:** agua congelada, permafrost y recursos.
5. **Polvo y viento:** atmósfera, dunas y erosión.
6. **Biología:** ambientes extremos y conservación de biofirmas.
7. **Subsuelo:** cuevas, tubos de lava y vacíos.
8. **Operaciones:** carreteras, población, permisos y facilidad de acceso.

No todas las áreas tienen la misma importancia. Por ejemplo, para un rover importa mucho el terreno; para buscar agua importa mucho el hielo.

---

## 7. Las variables principales del MVP lunar

El MVP es la primera versión pequeña y funcional. Para no intentar hacerlo todo, se usarán doce variables principales.

| ID | Nombre sencillo | Qué pregunta responde | Fuente principal |
|---|---|---|---|
| T1 | Relieve local | ¿Cuánto cambia la altura dentro del área? | Copernicus en la Tierra; LOLA en la Luna |
| T2 | Pendiente | ¿Qué tan inclinada está la superficie? | Se calcula a partir del relieve |
| T3 | Rugosidad | ¿El suelo es liso o lleno de cambios bruscos? | Se calcula a partir del relieve |
| T4 | Cráteres | ¿Qué cantidad y tamaño de cráteres hay? | Catálogos de cráteres terrestres y lunares |
| G1 | Tipo de material | ¿Es basalto, anortosita, tefra u otro material? | Mapas geológicos |
| G3 | Emisividad y composición | ¿Cómo responde la superficie al calor? | ASTER en la Tierra; Diviner en la Luna |
| E3 | Inercia térmica | ¿Se calienta y enfría rápido o lentamente? | MODIS/ASTER en la Tierra; Diviner en la Luna |
| E4 | Albedo | ¿Cuánta luz refleja? | MODIS en la Tierra; LROC/Diviner en la Luna |
| E5b | Iluminación rasante | ¿Cuánto tiempo el Sol está debajo de 5°? | Cálculo solar y mapas LOLA |
| E2 | Rango térmico | ¿Qué diferencia hay entre el día y la noche? | MODIS en la Tierra; Diviner en la Luna |
| W1 | Hielo o sombra fría | ¿Podría conservarse hielo en el suelo? | Mapas de permafrost, PSR y detectores de neutrones |
| B1/O4 | Filtro de superficie | ¿Hay vegetación o suelo desnudo? | NDVI y mapas de cobertura terrestre |

### Qué significan los nombres de las fuentes

Los nombres como **MODIS, LOLA, Diviner, ASTER o Copernicus** son instrumentos o conjuntos de datos. No son variables adicionales.

- **MODIS:** observa la Tierra desde satélites y ayuda a obtener temperatura, vegetación y reflectividad.
- **Copernicus GLO-30:** modelo de elevación de la Tierra.
- **ASTER:** observa características de la superficie terrestre, incluyendo información térmica.
- **LOLA:** instrumento que mide la forma y la iluminación de la Luna.
- **Diviner:** instrumento lunar que mide temperatura y propiedades térmicas.
- **MOLA:** instrumento que mide la topografía de Marte.
- **CRISM:** instrumento marciano usado para estudiar minerales.

La fuente entrega el dato; el proyecto lo transforma en una variable que sí puede comparar.

---

## 8. Cómo se convierte un dato en una comparación

La aplicación sigue esta secuencia:

1. Elige un sitio objetivo lunar o marciano.
2. Define una ventana alrededor del sitio, por ejemplo, un radio de 10 km.
3. Calcula las variables dentro de esa ventana.
4. Divide la Tierra en celdas.
5. Calcula las mismas variables para cada celda terrestre.
6. Compara cada celda con el objetivo.
7. Combina los resultados según el tipo de uso elegido.
8. Muestra coincidencias, diferencias y limitaciones.

### ¿Qué es una celda H3?

H3 es una forma de dividir el mapa en hexágonos. Cada hexágono funciona como una pequeña zona de análisis.

En vez de comparar millones de puntos sueltos, la aplicación dice:

> “Esta celda de la Tierra tiene estos valores.”

Después compara una celda con otra.

- Resolución 4: celdas grandes para ver todo el planeta.
- Resolución 6 o 7: celdas más pequeñas para estudiar una región.

El tamaño debe ser parecido al tamaño de la ventana del sitio lunar o marciano. No sería justo comparar una región lunar pequeña con una celda terrestre enorme.

---

## 9. Cómo funciona el puntaje, sin la fórmula complicada

Cada variable recibe una puntuación de parecido entre 0 y 1:

- **1:** muy parecido.
- **0.5:** parecido intermedio.
- **0:** muy diferente.

Después:

1. Se agrupan las variables por área.
2. Se calcula un resultado para terreno, materiales, temperatura, hielo, etc.
3. Cada perfil de uso da más importancia a algunas áreas.
4. Se obtiene un puntaje general.

### Ejemplo

Para “aterrizaje y movilidad”:

- Terreno: 50 %.
- Iluminación: 20 %.
- Temperatura: 15 %.
- Materiales: 10 %.
- Hielo: 5 %.

Para “ISRU de hielo”:

- Hielo: 40 %.
- Terreno: 20 %.
- Temperatura: 20 %.
- Iluminación: 15 %.
- Materiales: 5 %.

El mismo lugar puede aparecer en posiciones diferentes dependiendo del perfil. Eso es intencional.

### Datos faltantes

Si no tenemos un dato, no significa que el lugar sea malo. El dato simplemente no se usa para ese cálculo y se reduce la **confianza**.

La aplicación debe mostrar dos cosas separadas:

- **Parecido:** qué tanto coincide el lugar.
- **Confianza:** cuántos datos disponibles respaldan ese resultado.

---

## 10. Los perfiles de uso

Un perfil es el objetivo de la comparación. Cambia las prioridades del ranking.

### Aterrizaje y movilidad polar

Busca suelo con poca pendiente, poca rugosidad y condiciones de iluminación manejables.

### ISRU de hielo

Busca hielo o zonas frías que puedan conservarlo, sin olvidar si el terreno permite llegar hasta allí.

### Navegación con iluminación rasante

Busca lugares donde el Sol esté bajo y existan sombras largas, pero donde un vehículo todavía pueda orientarse.

### Entrenamiento geológico

Busca materiales y formas de terreno parecidos a los de la Luna, como anortosita, basalto y cráteres.

### Hábitat en tubos de lava

Busca campos de lava y señales de posibles cuevas o tubos. En esta versión se usan indicios, porque no existe un catálogo completo de cuevas terrestres.

---

## 11. Qué significa “novedad”

La aplicación no solo busca sitios parecidos. También quiere encontrar lugares que todavía no hayan sido estudiados demasiado.

La novedad aumenta cuando:

- El lugar se parece mucho al objetivo.
- Tiene poca literatura científica asociada.
- Está lejos de los análogos conocidos.

Un lugar muy conocido puede tener un puntaje de analogía alto, pero poca novedad. Un lugar poco estudiado puede subir en el ranking de descubrimiento si también tiene buenos datos físicos.

La novedad no debe ocultar un mal parecido. Primero debe ser un buen análogo; después se valora que sea poco conocido.

---

## 12. Cómo se organiza la aplicación web

### Parte 1: preparación de datos

Un proceso en Python descarga y prepara los datos. Esta parte se ejecuta antes de publicar la web:

- Descarga datos de la Tierra.
- Descarga datos lunares o marcianos.
- Calcula pendientes, rugosidad y otras variables.
- Guarda los resultados en archivos preparados.

### Parte 2: aplicación web

La web usa esos archivos ya preparados:

- Mapa de la Tierra.
- Vista de la Luna o Marte.
- Selector del sitio objetivo.
- Selector del perfil de uso.
- Controles para ajustar pesos.
- Ranking de candidatos.
- Ficha detallada de cada lugar.

### Por qué no se necesita un backend en el MVP

La mayor parte del trabajo pesado se hace antes. La web recibe archivos ya calculados y solo cambia los pesos cuando el usuario mueve un control.

Esto permite publicar la aplicación en GitHub Pages, Netlify o Vercel sin mantener un servidor complejo.

---

## 13. Qué archivos tendrá el proyecto

| Archivo o carpeta | Para qué sirve |
|---|---|
| `parameters.yaml` | Lista oficial de variables y sus fuentes |
| `targets.yaml` | Sitios objetivo de la Luna o Marte |
| `profiles.yaml` | Pesos de cada perfil de uso |
| `ingest/earth/` | Descarga y preparación de datos terrestres |
| `ingest/planetary/` | Descarga y preparación de datos lunares y marcianos |
| `features/` | Cálculo de variables por celda |
| `scoring/` | Comparación, puntajes y explicaciones |
| `validate/` | Pruebas para saber si el modelo funciona |
| `data/raw/` | Datos originales descargados; no se publican en Git |
| `data/processed/` | Datos limpios y preparados |
| `web/` | Aplicación visual |

### Tres archivos de datos importantes

#### `targets.json`

Describe el lugar de la Luna o Marte que queremos imitar:

- Nombre.
- Cuerpo celeste.
- Coordenadas.
- Radio de análisis.
- Variables calculadas.
- Fuentes.

#### `features_earth.parquet`

Tiene una fila por cada celda terrestre y una columna por cada variable:

- Identificador H3.
- Latitud y longitud.
- Pendiente.
- Rugosidad.
- Temperatura.
- Albedo.
- Hielo.
- Cobertura de datos.

#### `scores_<perfil>.parquet`

Guarda el resultado de comparar la Tierra con un sitio objetivo usando un perfil específico.

---

## 14. Qué significa validar el proyecto

Validar significa comprobar que el ranking tiene sentido.

La prueba principal es introducir análogos conocidos y revisar si aparecen arriba:

- Atacama.
- Valles Secos de McMurdo.
- Haughton.
- Río Tinto.
- Pilbara.
- Craters of the Moon.
- Black Point Lava Flow.

También se revisa:

- Si el perfil lunar favorece campos de lava y zonas de impacto.
- Si el resultado cambia demasiado al variar los pesos.
- Qué variables faltan.
- Qué sesgos tiene la Tierra frente a la Luna o Marte.

No se debe afirmar que el modelo es correcto solo porque produce un mapa bonito. Debe explicar por qué colocó cada lugar en esa posición.

---

## 15. Plan sencillo de trabajo

### Fase 1: Luna

Se recomienda comenzar solo con cuatro sitios:

- Malapert Massif.
- Haworth.
- de Gerlache Rim 2.
- Pozo de Mare Tranquillitatis.

Se implementan las doce variables del MVP lunar y cinco perfiles de uso.

### Fase 2: Marte

Después se agregan:

- Jezero.
- Gale.
- Arcadia Planitia.
- Minerales marcianos.
- Hielo marciano.
- Polvo y viento.
- Posibles biofirmas.

La estructura de la aplicación no cambia demasiado. Se agregan nuevas fuentes y columnas.

---

## 16. Qué debe quedar claro en la presentación

La aplicación no afirma que un lugar de la Tierra sea igual a la Luna o Marte.

Su mensaje correcto es:

> “Este lugar terrestre reproduce algunas condiciones útiles para estudiar una misión, pero no reproduce todas las condiciones del otro mundo.”

Cada resultado debe explicar:

- Qué coincide.
- Qué no coincide.
- Qué datos se usaron.
- Qué datos faltan.
- Para qué tipo de misión sirve.
- Qué limitaciones no se pueden eliminar.

---

## 17. Diccionario rápido

| Término | Significado |
|---|---|
| Análogo | Lugar terrestre parecido a una condición de la Luna o Marte |
| Celda H3 | Hexágono usado como unidad de comparación |
| DEM | Modelo digital de elevación; mapa de alturas |
| Pendiente | Inclinación del terreno |
| Rugosidad | Qué tan irregular es una superficie |
| Albedo | Cantidad de luz que una superficie refleja |
| Inercia térmica | Qué tan rápido cambia la temperatura de un material |
| Regolito | Polvo y roca suelta de la superficie |
| Permafrost | Suelo que permanece congelado durante mucho tiempo |
| PSR | Región permanentemente sombreada de la Luna |
| Trampa fría | Zona muy fría que puede conservar hielo |
| ISRU | Uso de recursos encontrados en el propio lugar |
| Biofirma | Posible señal de vida |
| Proxy | Medición indirecta usada cuando no existe una medición directa |
| D | Comparación directa |
| R | Comparación relativa |
| N | Condición no análoga |
| MVP | Primera versión pequeña pero funcional |
| Recall@k | Comprobación de cuántos análogos conocidos aparecen entre los primeros resultados |

---

## 18. Resumen en una sola frase

La aplicación toma una zona real de la Luna o Marte, la describe con variables medibles, busca celdas terrestres con condiciones parecidas según el propósito de la misión y explica claramente tanto las coincidencias como las cosas que la Tierra no puede reproducir.
