# Reporte de validación (2026-11-15)

Celdas de tierra puntuadas: **62852** (141.6 M km²). Rejilla: POWER/MERRA-2 0.5° × 0.625°.
Percentiles ponderados por área de celda. Ranking solo con cobertura de datos ≥ 75%.

## Low-sun navigation & precision landing (`moon_lowsun_nav`)

- Percentil mediano de los positivos conocidos (n=3, ponderado por área): **98.5** (100 = mejor)
- Control negativo: % de celdas de trópico húmedo (precip > 2000 mm/año) en el conjunto análogo: **0.0 %** (ideal 0)
- Conjunto análogo (best ≥ 0.6): **414 celdas = 0.54 M km² (0.4 % de la tierra firme)**
- Celdas sobre el umbral excluidas del ranking por cobertura < 75%: **0**
- Estabilidad del conjunto análogo con pesos ±20 % (Jaccard medio, 50 réplicas): **0.78**

| Análogo conocido | Percentil | Score |
|---|---|---|
| Haughton impact structure, Devon Island | 98.5 | 0.49 |
| McMurdo Dry Valleys | 99.9 | 0.73 |
| Svalbard (AMASE, Bockfjorden) | 85.6 | 0.23 |

Top candidatos (supresión de no-máximos a 300 km):

| # | Celda | Lat, Lon | Score | Meses análogos | Dist. a análogo conocido (km) | Lugar |
|---|---|---|---|---|---|---|
| 1 | 33_551 | -73.50, 164.38 | 0.83 | 1 | 450 |  |
| 2 | 24_549 | -78.00, 163.12 | 0.82 | 1 | 64 |  |
| 3 | 310_517 | 65.00, 143.12 | 0.78 | 3 | 3594 |  |
| 4 | 319_58 | 69.50, -143.75 | 0.78 | 1 | 1819 |  |
| 5 | 313_204 | 66.50, -52.50 | 0.78 | 3 | 1623 |  |
| 6 | 339_152 | 79.50, -85.00 | 0.76 | 1 | 119 |  |
| 7 | 299_67 | 59.50, -138.12 | 0.75 | 1 | 1408 |  |
| 8 | 307_55 | 63.50, -145.62 | 0.75 | 2 | 1988 |  |
| 9 | 304_84 | 62.00, -127.50 | 0.75 | 2 | 1286 |  |
| 10 | 300_43 | 60.00, -153.12 | 0.75 | 1 | 2196 |  |
| 11 | 313_231 | 66.50, -35.62 | 0.75 | 3 | 878 |  |
| 12 | 317_241 | 68.50, -29.38 | 0.75 | 2 | 684 |  |
| 13 | 303_299 | 61.50, 6.88 | 0.74 | 1 | 1237 |  |
| 14 | 301_217 | 60.50, -44.38 | 0.74 | 1 | 1474 |  |
| 15 | 306_45 | 63.00, -151.88 | 0.71 | 2 | 2238 |  |

## Survive the cold & dark (`moon_night_survival`)

- Percentil mediano de los positivos conocidos (n=3, ponderado por área): **92.4** (100 = mejor)
- Control negativo: % de celdas de trópico húmedo (precip > 2000 mm/año) en el conjunto análogo: **0.0 %** (ideal 0)
- Conjunto análogo (best ≥ 0.6): **21026 celdas = 16.42 M km² (11.6 % de la tierra firme)**
- Celdas sobre el umbral excluidas del ranking por cobertura < 75%: **0**
- Estabilidad del conjunto análogo con pesos ±20 % (Jaccard medio, 50 réplicas): **0.96**

| Análogo conocido | Percentil | Score |
|---|---|---|
| Haughton impact structure, Devon Island | 92.8 | 0.81 |
| Axel Heiberg Island (Expedition Fiord) | 92.4 | 0.80 |
| McMurdo Dry Valleys | 91.8 | 0.78 |

Top candidatos (supresión de no-máximos a 300 km):

| # | Celda | Lat, Lon | Score | Meses análogos | Dist. a análogo conocido (km) | Lugar |
|---|---|---|---|---|---|---|
| 1 | 36_505 | -72.00, 135.62 | 1.00 | 5 | 966 |  |
| 2 | 16_316 | -82.00, 17.50 | 1.00 | 6 | 2174 |  |
| 3 | 11_522 | -84.50, 146.25 | 1.00 | 7 | 817 |  |
| 4 | 29_484 | -75.50, 122.50 | 1.00 | 5 | 1023 |  |
| 5 | 29_460 | -75.50, 107.50 | 1.00 | 4 | 1374 |  |
| 6 | 23_297 | -78.50, 5.62 | 1.00 | 6 | 2610 |  |
| 7 | 315_460 | 67.50, 107.50 | 1.00 | 3 | 2830 |  |
| 8 | 19_261 | -80.50, -16.88 | 1.00 | 6 | 2446 |  |
| 9 | 15_241 | -82.50, -29.38 | 1.00 | 6 | 2214 |  |
| 10 | 7_480 | -86.50, 120.00 | 1.00 | 7 | 1130 |  |
| 11 | 29_534 | -75.50, 153.75 | 1.00 | 4 | 305 |  |
| 12 | 8_205 | -86.00, -51.88 | 1.00 | 7 | 1777 |  |
| 13 | 27_402 | -76.50, 71.25 | 1.00 | 5 | 2047 |  |
| 14 | 13_285 | -83.50, -1.88 | 1.00 | 7 | 2093 |  |
| 15 | 15_129 | -82.50, -99.38 | 1.00 | 6 | 1724 |  |

## Extreme-slope polar mobility (`moon_polar_mobility`)

- Percentil mediano de los positivos conocidos (n=3, ponderado por área): **94.8** (100 = mejor)
- Control negativo: % de celdas de trópico húmedo (precip > 2000 mm/año) en el conjunto análogo: **2.4 %** (ideal 0)
- Conjunto análogo (best ≥ 0.6): **1703 celdas = 4.58 M km² (3.2 % de la tierra firme)**
- Celdas sobre el umbral excluidas del ranking por cobertura < 75%: **0**
- Estabilidad del conjunto análogo con pesos ±20 % (Jaccard medio, 50 réplicas): **0.92**

| Análogo conocido | Percentil | Score |
|---|---|---|
| Haughton impact structure, Devon Island | 90.2 | 0.34 |
| McMurdo Dry Valleys | 98.7 | 0.71 |
| Svalbard (AMASE, Bockfjorden) | 94.8 | 0.50 |

Top candidatos (supresión de no-máximos a 300 km):

| # | Celda | Lat, Lon | Score | Meses análogos | Dist. a análogo conocido (km) | Lugar |
|---|---|---|---|---|---|---|
| 1 | 274_436 | 47.00, 92.50 | 0.96 | 12 | 1057 |  |
| 2 | 250_412 | 35.00, 77.50 | 0.94 | 12 | 1416 |  |
| 3 | 256_403 | 38.00, 71.88 | 0.94 | 12 | 1854 |  |
| 4 | 267_432 | 43.50, 90.00 | 0.94 | 12 | 714 |  |
| 5 | 264_416 | 42.00, 80.00 | 0.93 | 12 | 1217 |  |
| 6 | 269_419 | 44.50, 81.88 | 0.92 | 12 | 1214 |  |
| 7 | 252_419 | 36.00, 81.88 | 0.92 | 12 | 1004 |  |
| 8 | 265_425 | 42.50, 85.62 | 0.92 | 12 | 838 |  |
| 9 | 266_439 | 43.00, 94.38 | 0.92 | 12 | 623 |  |
| 10 | 33_551 | -73.50, 164.38 | 0.92 | 12 | 450 |  |
| 11 | 257_409 | 38.50, 75.62 | 0.91 | 12 | 1524 |  |
| 12 | 116_176 | -32.00, -70.00 | 0.91 | 12 | 881 |  |
| 13 | 258_447 | 39.00, 99.38 | 0.90 | 12 | 581 |  |
| 14 | 256_428 | 38.00, 87.50 | 0.90 | 12 | 487 |  |
| 15 | 251_395 | 35.50, 66.88 | 0.90 | 12 | 2338 |  |

## Frozen volatiles prospecting (ISRU) (`moon_volatiles`)

- Percentil mediano de los positivos conocidos (n=4, ponderado por área): **98.7** (100 = mejor)
- Control negativo: % de celdas de trópico húmedo (precip > 2000 mm/año) en el conjunto análogo: **0.0 %** (ideal 0)
- Conjunto análogo (best ≥ 0.6): **3091 celdas = 5.09 M km² (3.6 % de la tierra firme)**
- Celdas sobre el umbral excluidas del ranking por cobertura < 75%: **219**
- Estabilidad del conjunto análogo con pesos ±20 % (Jaccard medio, 50 réplicas): **0.87**

| Análogo conocido | Percentil | Score |
|---|---|---|
| Haughton impact structure, Devon Island | 98.3 | 0.73 |
| Axel Heiberg Island (Expedition Fiord) | 99.5 | 0.93 |
| McMurdo Dry Valleys | 99.2 | 0.88 |
| Svalbard (AMASE, Bockfjorden) | 96.4 | 0.60 |

Top candidatos (supresión de no-máximos a 300 km):

| # | Celda | Lat, Lon | Score | Meses análogos | Dist. a análogo conocido (km) | Lugar |
|---|---|---|---|---|---|---|
| 1 | 254_408 | 37.00, 75.00 | 1.00 | 12 | 1592 |  |
| 2 | 254_426 | 37.00, 86.25 | 1.00 | 12 | 600 |  |
| 3 | 345_171 | 82.50, -73.12 | 1.00 | 12 | 459 |  |
| 4 | 278_430 | 49.00, 88.75 | 1.00 | 12 | 1324 |  |
| 5 | 252_415 | 36.00, 79.38 | 1.00 | 12 | 1224 |  |
| 6 | 258_440 | 39.00, 95.00 | 1.00 | 12 | 241 |  |
| 7 | 340_152 | 80.00, -85.00 | 1.00 | 12 | 133 |  |
| 8 | 255_433 | 37.50, 90.62 | 1.00 | 12 | 210 |  |
| 9 | 252_438 | 36.00, 93.75 | 1.00 | 12 | 180 |  |
| 10 | 265_425 | 42.50, 85.62 | 1.00 | 12 | 838 |  |
| 11 | 261_410 | 40.50, 76.25 | 1.00 | 12 | 1483 |  |
| 12 | 247_413 | 33.50, 78.12 | 1.00 | 12 | 1416 |  |
| 13 | 258_404 | 39.00, 72.50 | 1.00 | 12 | 1794 |  |
| 14 | 273_436 | 46.50, 92.50 | 1.00 | 12 | 1002 |  |
| 15 | 264_416 | 42.00, 80.00 | 1.00 | 12 | 1217 |  |

## Dust & regolith handling (`moon_dust_regolith`)

- Percentil mediano de los positivos conocidos (n=4, ponderado por área): **57.6** (100 = mejor)
- Control negativo: % de celdas de trópico húmedo (precip > 2000 mm/año) en el conjunto análogo: **0.0 %** (ideal 0)
- Conjunto análogo (best ≥ 0.6): **5498 celdas = 18.35 M km² (13.0 % de la tierra firme)**
- Celdas sobre el umbral excluidas del ranking por cobertura < 75%: **0**
- Estabilidad del conjunto análogo con pesos ±20 % (Jaccard medio, 50 réplicas): **0.98**

| Análogo conocido | Percentil | Score |
|---|---|---|
| Atacama Desert (Yungay) | 91.7 | 0.84 |
| Death Valley | 58.1 | 0.37 |
| Black Point Lava Flow (D-RATS) | 57.1 | 0.36 |
| Mauna Kea (PISCES ISRU tests) | 9.8 | 0.12 |

Top candidatos (supresión de no-máximos a 300 km):

| # | Celda | Lat, Lon | Score | Meses análogos | Dist. a análogo conocido (km) | Lugar |
|---|---|---|---|---|---|---|
| 1 | 217_318 | 18.50, 18.75 | 1.00 | 12 | 3257 |  |
| 2 | 220_337 | 20.00, 30.62 | 1.00 | 12 | 3676 |  |
| 3 | 225_312 | 22.50, 15.00 | 1.00 | 12 | 2667 |  |
| 4 | 235_294 | 27.50, 3.75 | 1.00 | 12 | 1490 |  |
| 5 | 227_266 | 23.50, -13.75 | 1.00 | 12 | 612 |  |
| 6 | 221_262 | 20.50, -16.25 | 1.00 | 12 | 982 |  |
| 7 | 236_341 | 28.00, 33.12 | 1.00 | 12 | 3018 |  |
| 8 | 126_313 | -27.00, 15.62 | 1.00 | 12 | 6962 |  |
| 9 | 266_434 | 43.00, 91.25 | 1.00 | 12 | 629 |  |
| 10 | 225_307 | 22.50, 11.88 | 1.00 | 12 | 2444 |  |
| 11 | 253_426 | 36.50, 86.25 | 1.00 | 12 | 610 |  |
| 12 | 243_387 | 31.50, 61.88 | 1.00 | 12 | 2915 |  |
| 13 | 231_352 | 25.50, 40.00 | 0.99 | 12 | 3639 |  |
| 14 | 217_346 | 18.50, 36.25 | 0.99 | 12 | 4089 |  |
| 15 | 232_273 | 26.00, -9.38 | 0.99 | 12 | 534 |  |

## Mars ice-rich landing zone (`mars_ice_landing`)

- Percentil mediano de los positivos conocidos (n=4, ponderado por área): **96.6** (100 = mejor)
- Control negativo: % de celdas de trópico húmedo (precip > 2000 mm/año) en el conjunto análogo: **0.0 %** (ideal 0)
- Conjunto análogo (best ≥ 0.6): **3699 celdas = 5.35 M km² (3.8 % de la tierra firme)**
- Celdas sobre el umbral excluidas del ranking por cobertura < 75%: **0**
- Estabilidad del conjunto análogo con pesos ±20 % (Jaccard medio, 50 réplicas): **0.87**

| Análogo conocido | Percentil | Score |
|---|---|---|
| Haughton impact structure, Devon Island | 99.9 | 0.90 |
| Axel Heiberg Island (Expedition Fiord) | 97.1 | 0.63 |
| McMurdo Dry Valleys | 96.2 | 0.60 |
| Svalbard (AMASE, Bockfjorden) | 60.9 | 0.30 |

Top candidatos (supresión de no-máximos a 300 km):

| # | Celda | Lat, Lon | Score | Meses análogos | Dist. a análogo conocido (km) | Lugar |
|---|---|---|---|---|---|---|
| 1 | 335_148 | 77.50, -87.50 | 0.99 | 12 | 224 |  |
| 2 | 336_127 | 78.00, -100.62 | 0.97 | 12 | 264 |  |
| 3 | 338_179 | 79.00, -68.12 | 0.96 | 12 | 472 |  |
| 4 | 330_109 | 75.00, -111.88 | 0.96 | 12 | 629 |  |
| 5 | 341_144 | 80.50, -90.00 | 0.95 | 12 | 123 |  |
| 6 | 333_94 | 76.50, -121.25 | 0.95 | 12 | 765 |  |
| 7 | 345_245 | 82.50, -26.88 | 0.94 | 12 | 761 |  |
| 8 | 343_191 | 81.50, -60.62 | 0.93 | 12 | 595 |  |
| 9 | 326_89 | 73.00, -124.38 | 0.92 | 12 | 1067 |  |
| 10 | 328_131 | 74.00, -98.12 | 0.92 | 12 | 291 |  |
| 11 | 250_414 | 35.00, 78.75 | 0.90 | 12 | 1306 |  |
| 12 | 324_117 | 72.00, -106.88 | 0.89 | 12 | 652 |  |
| 13 | 325_146 | 72.50, -88.75 | 0.89 | 12 | 322 |  |
| 14 | 252_422 | 36.00, 83.75 | 0.87 | 12 | 840 |  |
| 15 | 320_173 | 70.00, -71.88 | 0.87 | 12 | 833 |  |

## Registro de calibración (honestidad metodológica)

v0 (2026-11-14) falló en dos perfiles: la pendiente regional (píxel ~5 km, mediana terrestre 0.8°) se usó como 'terreno llano' con umbrales p50–p90 y excluía desiertos llanos; y el albedo ANUAL incluía la nieve invernal del Ártico. v1: la pendiente regional solo excluye montañas (p75–p98), el albedo de suelo usa la estación sin nieve (mínimo mensual) y la aridez usa la definición de desierto de USGS/Meigs (1953): < 250 mm/año árido, 250–500 semiárido.

**Riesgo de circularidad:** los mismos positivos sirvieron para diagnosticar y validar. Validación independiente pendiente: la capa USGS (doi:10.5066/P9J72921) como conjunto de prueba.
