# Reporte de validación (2026-11-14)

Celdas de tierra puntuadas: **62852**. Rejilla: POWER/MERRA-2 0.5° × 0.625°.

## Low-sun navigation & precision landing (`moon_lowsun_nav`)

- Percentil mediano de los positivos conocidos (n=3): **97.0** (100 = mejor)
- Control negativo: % de celdas de trópico húmedo (precip > 2000 mm/año) en el conjunto análogo: **0.0 %** (ideal 0)
- Celdas en el conjunto análogo (best ≥ 0.6): **519**
- Estabilidad del conjunto análogo con pesos ±20 % (Jaccard medio, 50 réplicas): **0.78**

| Análogo conocido | Percentil | Score |
|---|---|---|
| Haughton impact structure, Devon Island | 97.0 | 0.49 |
| McMurdo Dry Valleys | 100.0 | 0.75 |
| Svalbard (AMASE, Bockfjorden) | 67.2 | 0.24 |

Top candidatos (supresión de no-máximos a 300 km):

| # | Celda | Lat, Lon | Score | Meses análogos | Dist. a análogo conocido (km) | Lugar |
|---|---|---|---|---|---|---|
| 1 | 33_551 | -73.50, 164.38 | 0.83 | 1 | 450 | Antarctica |
| 2 | 24_544 | -78.00, 160.00 | 0.82 | 1 | 70 | Antarctica |
| 3 | 310_517 | 65.00, 143.12 | 0.81 | 3 | 3594 | Sakha Republic, Russia |
| 4 | 313_204 | 66.50, -52.50 | 0.80 | 3 | 1623 | Greenland |
| 5 | 339_152 | 79.50, -85.00 | 0.78 | 1 | 119 | Nunavut, Canada |
| 6 | 319_58 | 69.50, -143.75 | 0.78 | 1 | 1819 | Alaska, United States |
| 7 | 307_54 | 63.50, -146.25 | 0.75 | 2 | 2014 | Alaska, United States |
| 8 | 301_217 | 60.50, -44.38 | 0.75 | 1 | 1474 | Greenland |
| 9 | 317_240 | 68.50, -30.00 | 0.75 | 2 | 707 | Greenland |
| 10 | 303_45 | 61.50, -151.88 | 0.75 | 1 | 2178 | Alaska, United States |
| 11 | 303_300 | 61.50, 7.50 | 0.75 | 1 | 1266 | Norway |
| 12 | 313_231 | 66.50, -35.62 | 0.75 | 3 | 878 | Greenland |
| 13 | 299_67 | 59.50, -138.12 | 0.75 | 1 | 1408 | Alaska, United States |
| 14 | 304_84 | 62.00, -127.50 | 0.75 | 2 | 1286 | Northwest Territories, Canada |
| 15 | 327_250 | 73.50, -23.75 | 0.72 | 2 | 999 | Greenland |

## Survive the cold & dark (`moon_night_survival`)

- Percentil mediano de los positivos conocidos (n=3): **73.7** (100 = mejor)
- Control negativo: % de celdas de trópico húmedo (precip > 2000 mm/año) en el conjunto análogo: **0.0 %** (ideal 0)
- Celdas en el conjunto análogo (best ≥ 0.6): **15777**
- Estabilidad del conjunto análogo con pesos ±20 % (Jaccard medio, 50 réplicas): **0.96**

| Análogo conocido | Percentil | Score |
|---|---|---|
| Haughton impact structure, Devon Island | 74.2 | 0.58 |
| Axel Heiberg Island (Expedition Fiord) | 73.7 | 0.58 |
| McMurdo Dry Valleys | 72.7 | 0.55 |

Top candidatos (supresión de no-máximos a 300 km):

| # | Celda | Lat, Lon | Score | Meses análogos | Dist. a análogo conocido (km) | Lugar |
|---|---|---|---|---|---|---|
| 1 | 12_527 | -84.00, 149.38 | 1.00 | 5 | 752 | Antarctica |
| 2 | 7_492 | -86.50, 127.50 | 1.00 | 7 | 1090 | Antarctica |
| 3 | 39_456 | -70.50, 105.00 | 1.00 | 4 | 1811 | Antarctica |
| 4 | 25_412 | -77.50, 77.50 | 1.00 | 4 | 1857 | Antarctica |
| 5 | 34_474 | -73.00, 116.25 | 1.00 | 5 | 1340 | Antarctica |
| 6 | 18_502 | -81.00, 133.75 | 1.00 | 6 | 689 | Antarctica |
| 7 | 31_457 | -74.50, 105.62 | 1.00 | 4 | 1484 | Antarctica |
| 8 | 33_494 | -73.50, 128.75 | 1.00 | 3 | 1004 | Antarctica |
| 9 | 29_483 | -75.50, 121.88 | 1.00 | 4 | 1038 | Antarctica |
| 10 | 32_511 | -74.00, 139.38 | 1.00 | 4 | 720 | Antarctica |
| 11 | 17_312 | -81.50, 15.00 | 0.99 | 5 | 2240 | Antarctica |
| 12 | 12_296 | -84.00, 5.00 | 0.99 | 5 | 2020 | Antarctica |
| 13 | 2_102 | -89.00, -116.25 | 0.99 | 6 | 1379 | Antarctica |
| 14 | 27_380 | -76.50, 57.50 | 0.98 | 4 | 2276 | Antarctica |
| 15 | 7_225 | -86.50, -39.38 | 0.98 | 6 | 1758 | Antarctica |

## Extreme-slope polar mobility (`moon_polar_mobility`)

- Percentil mediano de los positivos conocidos (n=3): **94.1** (100 = mejor)
- Control negativo: % de celdas de trópico húmedo (precip > 2000 mm/año) en el conjunto análogo: **2.5 %** (ideal 0)
- Celdas en el conjunto análogo (best ≥ 0.6): **1344**
- Estabilidad del conjunto análogo con pesos ±20 % (Jaccard medio, 50 réplicas): **0.91**

| Análogo conocido | Percentil | Score |
|---|---|---|
| Haughton impact structure, Devon Island | 89.2 | 0.25 |
| McMurdo Dry Valleys | 98.9 | 0.65 |
| Svalbard (AMASE, Bockfjorden) | 94.1 | 0.40 |

Top candidatos (supresión de no-máximos a 300 km):

| # | Celda | Lat, Lon | Score | Meses análogos | Dist. a análogo conocido (km) | Lugar |
|---|---|---|---|---|---|---|
| 1 | 274_436 | 47.00, 92.50 | 0.87 | 12 | 1057 | Khovd, Mongolia |
| 2 | 249_413 | 34.50, 78.12 | 0.86 | 12 | 1377 | Ladakh, India |
| 3 | 255_403 | 37.50, 71.88 | 0.86 | 12 | 1860 | Gorno-Badakhshan Autonomous Region, Tajikistan |
| 4 | 120_176 | -30.00, -70.00 | 0.85 | 12 | 658 | Coquimbo Region, Chile |
| 5 | 259_445 | 39.50, 98.12 | 0.85 | 12 | 498 | Gansu, China |
| 6 | 252_101 | 36.00, -116.88 | 0.85 | 12 | 57 | California, United States |
| 7 | 251_395 | 35.50, 66.88 | 0.85 | 12 | 2338 | Sar-e Pol Province, Afghanistan |
| 8 | 255_410 | 37.50, 76.25 | 0.85 | 12 | 1476 | Xinjiang, China |
| 9 | 252_418 | 36.00, 81.25 | 0.85 | 12 | 1059 | Xinjiang, China |
| 10 | 168_161 | -6.00, -79.38 | 0.85 | 12 | 2250 | Lambayeque, Peru |
| 11 | 266_439 | 43.00, 94.38 | 0.85 | 12 | 623 | Xinjiang, China |
| 12 | 162_163 | -9.00, -78.12 | 0.85 | 12 | 1890 | Ancash, Peru |
| 13 | 264_425 | 42.00, 85.62 | 0.85 | 12 | 804 | Xinjiang, China |
| 14 | 154_166 | -13.00, -76.25 | 0.85 | 12 | 1400 | Lima, Peru |
| 15 | 264_417 | 42.00, 80.62 | 0.85 | 12 | 1169 | Xinjiang, China |

## Frozen volatiles prospecting (ISRU) (`moon_volatiles`)

- Percentil mediano de los positivos conocidos (n=4): **99.1** (100 = mejor)
- Control negativo: % de celdas de trópico húmedo (precip > 2000 mm/año) en el conjunto análogo: **0.0 %** (ideal 0)
- Celdas en el conjunto análogo (best ≥ 0.6): **2335**
- Estabilidad del conjunto análogo con pesos ±20 % (Jaccard medio, 50 réplicas): **0.86**

| Análogo conocido | Percentil | Score |
|---|---|---|
| Haughton impact structure, Devon Island | 98.6 | 0.73 |
| Axel Heiberg Island (Expedition Fiord) | 99.8 | 0.93 |
| McMurdo Dry Valleys | 99.6 | 0.88 |
| Svalbard (AMASE, Bockfjorden) | 89.1 | 0.48 |

Top candidatos (supresión de no-máximos a 300 km):

| # | Celda | Lat, Lon | Score | Meses análogos | Dist. a análogo conocido (km) | Lugar |
|---|---|---|---|---|---|---|
| 1 | 342_171 | 81.00, -73.12 | 1.00 | 12 | 377 | Nunavut, Canada |
| 2 | 251_418 | 35.50, 81.25 | 1.00 | 12 | 1073 | Xinjiang, China |
| 3 | 338_146 | 79.00, -88.75 | 1.00 | 12 | 62 | Nunavut, Canada |
| 4 | 252_411 | 36.00, 76.88 | 1.00 | 12 | 1445 | Xinjiang, China |
| 5 | 31_551 | -74.50, 164.38 | 1.00 | 12 | 341 | Antarctica |
| 6 | 344_243 | 82.00, -28.12 | 0.98 | 12 | 777 | Greenland |
| 7 | 343_202 | 81.50, -53.75 | 0.96 | 12 | 708 | Greenland |
| 8 | 335_178 | 77.50, -68.75 | 0.96 | 12 | 530 | Greenland |
| 9 | 325_202 | 72.50, -53.75 | 0.93 | 12 | 1131 | Greenland |
| 10 | 323_244 | 71.50, -27.50 | 0.93 | 12 | 859 | Greenland |
| 11 | 258_404 | 39.00, 72.50 | 0.92 | 12 | 1794 | Gorno-Badakhshan Autonomous Region, Tajikistan |
| 12 | 326_159 | 73.00, -80.62 | 0.90 | 12 | 380 | Nunavut, Canada |
| 13 | 334_250 | 77.00, -23.75 | 0.89 | 12 | 866 | Greenland |
| 14 | 24_545 | -78.00, 160.62 | 0.88 | 12 | 62 | Antarctica |
| 15 | 253_428 | 36.50, 87.50 | 0.87 | 12 | 501 | Xinjiang, China |

## Dust & regolith handling (`moon_dust_regolith`)

- Percentil mediano de los positivos conocidos (n=4): **70.2** (100 = mejor)
- Control negativo: % de celdas de trópico húmedo (precip > 2000 mm/año) en el conjunto análogo: **0.0 %** (ideal 0)
- Celdas en el conjunto análogo (best ≥ 0.6): **5074**
- Estabilidad del conjunto análogo con pesos ±20 % (Jaccard medio, 50 réplicas): **0.98**

| Análogo conocido | Percentil | Score |
|---|---|---|
| Atacama Desert (Yungay) | 95.2 | 0.83 |
| Death Valley | 75.6 | 0.35 |
| Black Point Lava Flow (D-RATS) | 64.8 | 0.32 |
| Mauna Kea (PISCES ISRU tests) | 22.5 | 0.06 |

Top candidatos (supresión de no-máximos a 300 km):

| # | Celda | Lat, Lon | Score | Meses análogos | Dist. a análogo conocido (km) | Lugar |
|---|---|---|---|---|---|---|
| 1 | 223_261 | 21.50, -16.88 | 0.95 | 12 | 897 | Dakhla-Oued Ed-Dahab, Morocco |
| 2 | 218_318 | 19.00, 18.75 | 0.95 | 12 | 3217 | Tibesti, Chad |
| 3 | 236_341 | 28.00, 33.12 | 0.94 | 12 | 3018 | Red Sea, Egypt |
| 4 | 224_313 | 22.00, 15.62 | 0.94 | 12 | 2751 | Tibesti, Chad |
| 5 | 244_386 | 32.00, 61.25 | 0.93 | 12 | 2950 | Farah Province, Afghanistan |
| 6 | 266_434 | 43.00, 91.25 | 0.93 | 12 | 629 | Xinjiang, China |
| 7 | 228_263 | 24.00, -15.62 | 0.93 | 12 | 591 | Sahrawi Arab Democratic Republic |
| 8 | 252_425 | 36.00, 85.62 | 0.93 | 12 | 678 | Xinjiang, China |
| 9 | 126_313 | -27.00, 15.62 | 0.93 | 12 | 6962 | Karas, Namibia |
| 10 | 221_337 | 20.50, 30.62 | 0.92 | 12 | 3625 | Northern State, Sudan |
| 11 | 235_294 | 27.50, 3.75 | 0.92 | 12 | 1490 | In Salah, Algeria |
| 12 | 225_307 | 22.50, 11.88 | 0.92 | 12 | 2444 | Agadez Region, Niger |
| 13 | 215_322 | 17.50, 21.25 | 0.91 | 12 | 3522 | Ennedi-Ouest, Chad |
| 14 | 231_352 | 25.50, 40.00 | 0.91 | 12 | 3639 | Ḥa'il Province, Saudi Arabia |
| 15 | 217_346 | 18.50, 36.25 | 0.91 | 12 | 4089 | Red Sea State, Sudan |

## Mars ice-rich landing zone (`mars_ice_landing`)

- Percentil mediano de los positivos conocidos (n=4): **82.6** (100 = mejor)
- Control negativo: % de celdas de trópico húmedo (precip > 2000 mm/año) en el conjunto análogo: **0.0 %** (ideal 0)
- Celdas en el conjunto análogo (best ≥ 0.6): **7879**
- Estabilidad del conjunto análogo con pesos ±20 % (Jaccard medio, 50 réplicas): **0.88**

| Análogo conocido | Percentil | Score |
|---|---|---|
| Haughton impact structure, Devon Island | 99.8 | 0.88 |
| Axel Heiberg Island (Expedition Fiord) | 83.1 | 0.54 |
| McMurdo Dry Valleys | 82.1 | 0.53 |
| Svalbard (AMASE, Bockfjorden) | 24.2 | 0.14 |

Top candidatos (supresión de no-máximos a 300 km):

| # | Celda | Lat, Lon | Score | Meses análogos | Dist. a análogo conocido (km) | Lugar |
|---|---|---|---|---|---|---|
| 1 | 340_153 | 80.00, -84.38 | 0.99 | 12 | 144 | Nunavut, Canada |
| 2 | 334_136 | 77.00, -95.00 | 0.98 | 12 | 229 | Nunavut, Canada |
| 3 | 338_179 | 79.00, -68.12 | 0.95 | 12 | 472 | Greenland |
| 4 | 330_109 | 75.00, -111.88 | 0.95 | 12 | 629 | Northwest Territories, Canada |
| 5 | 333_94 | 76.50, -121.25 | 0.93 | 12 | 765 | Northwest Territories, Canada |
| 6 | 345_249 | 82.50, -24.38 | 0.92 | 12 | 725 | Greenland |
| 7 | 343_191 | 81.50, -60.62 | 0.92 | 12 | 595 | Greenland |
| 8 | 326_89 | 73.00, -124.38 | 0.90 | 12 | 1067 | Northwest Territories, Canada |
| 9 | 328_131 | 74.00, -98.12 | 0.90 | 12 | 291 | Nunavut, Canada |
| 10 | 250_414 | 35.00, 78.75 | 0.88 | 12 | 1306 | Xinjiang, China |
| 11 | 330_152 | 75.00, -85.00 | 0.86 | 12 | 140 | Nunavut, Canada |
| 12 | 324_117 | 72.00, -106.88 | 0.86 | 12 | 652 | Nunavut, Canada |
| 13 | 325_146 | 72.50, -88.75 | 0.86 | 12 | 322 | Nunavut, Canada |
| 14 | 320_173 | 70.00, -71.88 | 0.84 | 12 | 833 | Nunavut, Canada |
| 15 | 252_422 | 36.00, 83.75 | 0.84 | 12 | 840 | Xinjiang, China |

## Registro de calibración (honestidad metodológica)

v0 (2026-11-14) falló en dos perfiles: la pendiente regional (píxel ~5 km, mediana terrestre 0.8°) se usó como 'terreno llano' con umbrales p50–p90 y excluía desiertos llanos; y el albedo ANUAL incluía la nieve invernal del Ártico. v1: la pendiente regional solo excluye montañas (p75–p98), el albedo de suelo usa la estación sin nieve (mínimo mensual) y la aridez usa la definición de desierto de USGS/Meigs (1953): < 250 mm/año árido, 250–500 semiárido.

**Riesgo de circularidad:** los mismos positivos sirvieron para diagnosticar y validar. Validación independiente pendiente: la capa USGS (doi:10.5066/P9J72921) como conjunto de prueba.
