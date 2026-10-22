# 14 · Prueba ácida del plan (2026-10-22)

Método: leer el paquete buscando **contradicciones entre documentos, dependencias imposibles, cuentas que no cierran y supuestos sin respaldo**, y **atacar el SQL ya escrito** en un Postgres local con dos organizaciones. Resultado: **14 hallazgos**; todos corregidos o con una compuerta explícita (`13` §11).

## Hallazgos
| # | Gravedad | Hallazgo | Evidencia | Corrección |
|---|---|---|---|---|
| 1 | **Crítica** | **Una organización podía colgar datos de otra:** una pieza de la organización B podía apuntar a la marca de A (bastaba con que el id existiera). | Ataque en Postgres: el `insert` pasó sin error | `sql/003`: claves foráneas **compuestas** (id, org_id); tras aplicarlo el ataque **falla** y lo legítimo pasa. Probado también en conexiones y publicaciones |
| 2 | Alta | `youtube` **no estaba permitido** como plataforma (decisión de redes ignorada en el SQL) | `insert` rechazado por la restricción | `sql/003` |
| 3 | Alta | Los **planes del SQL** (`starter/pro/agency`) no coincidían con los de AiUDA (`arranque/crecimiento/agencia`); no existía la condición «fundador» | Columna inexistente | `sql/003` (+ `condicion_precio`, `pais_facturacion`, `marcas.tipo` negocio/proyecto) |
| 4 | Media | `crear_organizacion` permitía **crear organizaciones sin límite** | Se crearon 4 | `sql/003`: máximo 3 por usuario |
| 5 | **Crítica (plan)** | **Contradicción de arquitectura:** el plan decía «sin Railway ni n8n» pero el inventario seguía diciendo «portar el motor Python» y el router «TS + Python» | Menciones en `01`, `03`, `05`, `06`, `CLAUDE.md` | Todo se **porta a TypeScript**; router en una sola implementación; `CLAUDE.md` corregido |
| 6 | **Crítica (negocio)** | **Escalar a clientes de pago exige la revisión de Meta:** en modo desarrollo solo conectan cuentas con rol en la app. «Posponer la revisión» solo sirve para 321 y los primeros fundadores | Reglas de Meta (`instagram-api-rules.md`) | Fundadores como **probadores** (⚠️ límite sin verificar) + **compuertas G1/G2**; la revisión se empieza en la Fase B, no al final (R-17) |
| 7 | Alta | **El Ad Library «brutal» dependía de una herramienta de Claude**, no de una API del producto | La herramienta es un conector de esta sesión | `08` §4: **tres modos** (API oficial si sirve; asistido con capturas + visión; proveedor de pago después) y se retira la dependencia |
| 8 | Alta | **Las cuentas del regalo no cerraban:** 10 regalos/día × US$0,30–1,00 = hasta US$300/mes frente a un tope de US$50 | Aritmética | `12`: costo objetivo ≤ US$0,15, **cupos = porción del tope (≈35 %) ⇒ 1–4/día**, crece con los ingresos |
| 9 | Alta | **El regalo suponía datos del Instagram del prospecto sin que conectara nada** | Business Discovery necesita token de AiUDA con Facebook Login y comparte límites | `12` §3: fuentes públicas (web, Instagram público Business/Creator, datos pegados) + plan B; conectar es opcional |
| 10 | Media | **«Borrador de campaña» en el regalo** implicaba crearla en Meta sin cuenta conectada | — | Se llama «plan de campaña listo para cargar»; no se crea hasta conectar |
| 11 | Alta | **El video de IA puede romper el margen** y el plan Crecimiento lo prometía «incluido» | Precio por segundo sin verificar | Reels con fotos (ffmpeg) como base; clips de IA limitados y en packs; compuerta G5 (R-19) |
| 12 | Media | **WhatsApp** (asistente del dueño) estaba en el plan sin su costo ni verificación | — | Fase B, «cuando esté disponible»; compuerta G6 (R-18) |
| 13 | Media | **Fase A demasiado grande:** incluía TikTok directo | — | Fase A = IG/FB directo; TikTok y YouTube **asistido**; **rebanada vertical primero** (`05`) |
| 14 | Media | **Almacenamiento:** 5 clientes llenan el gigabyte gratuito en ~7 meses sin limpieza | Cuenta de `09` | Regla de borrado a los 30 días, miniaturas, límite por cliente y alerta |

## Preguntas ácidas y su respuesta
| Pregunta | Respuesta |
|---|---|
| ¿Puede 321 usar el sistema solo con lo gratuito? | **Sí**, con cuentas propias en modo desarrollo; riesgo asumido de Vercel Hobby (R-3) |
| ¿Puede cobrarse al primer cliente? | **Sí**, por transferencia/enlace, **si** se conecta como probador de la app (G1). **No** hay escala sin App Review (G2) |
| ¿Cabe el regalo en US$50? | **Sí**, a ~1–4 por día; no a 10/día |
| ¿Puede fallar un proveedor de IA sin tumbar el servicio? | **Sí**, por diseño (`03`); se **prueba** en la aceptación de la Fase A (#5) |
| ¿Hay aislamiento real entre clientes? | **Ahora sí**, tras `sql/003` (antes no del todo) |
| ¿Se puede volver atrás del diseño? | **Sí**, temas con una variable (`04` §6) |
| ¿Se cumple «superar a SaleADS»? | En alcance y control, **sí**; en anuncios de TikTok/Google, **tras las aprobaciones** (`07`) |

## Riesgos que quedan abiertos (conscientes)
Límite real de probadores de Meta · precio del video de IA · cobertura del Ad Library comercial · Business Discovery a escala · tarifas y recurrencia del enlace de pago · IVA/factura SRI · ley de consumo (texto oficial) · Vercel Hobby (suspensión). Todos tienen compuerta o verificación en `13` §8 y §11.

## Veredicto
**El plan está listo para construir**, con la condición de empezar por la **rebanada vertical** y respetar las **compuertas G1–G6**. Antes de la prueba había una vulnerabilidad de aislamiento y varias contradicciones; ahora no.
