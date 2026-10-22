# 03 · Motor de IA: Anthropic → OpenAI → Gemini

**Decisión (Byron, 2026-10-22):** Anthropic es el motor principal; OpenAI entra si Anthropic falla; Gemini asegura que **nunca falle**. Esto es una **cadena de proveedores con fallback automático**, no tres funciones sueltas.

## 1. Principios
1. **Una sola puerta:** ninguna parte del sistema llama a un proveedor directo. Todo pasa por `ejecutar(tarea, …)`.
2. **El fallback nunca baja la seguridad:** mismas skills, mismo esquema de salida, mismas validaciones deterministas (frases prohibidas, cifras con fuente, límites), mismas aprobaciones.
3. **Las llamadas a LLM son de solo lectura y se pueden reintentar** (no tienen efecto externo). Lo que **no** se reintenta a ciegas son las escrituras a Meta/TikTok/Google (regla heredada).
4. **Cada llamada deja rastro** (proveedor, modelo, tokens, costo, latencia, si fue fallback) en un ledger por organización.
5. **Si los tres fallan:** la tarea queda **en cola con reintento**, la UI lo dice («en cola por falla de proveedores») y **nunca se publica nada sin revisar**.

## 2. Contrato
```
ejecutar({ tarea, org_id, marca_id, entrada, esquema_salida, prioridad })
  → { salida (validada), meta: { proveedor, modelo, tokens_in, tokens_out, costo_usd,
      latencia_ms, intentos, fallback_de|null, cache_hit } }
```
Se implementa **una sola vez, en TypeScript** (Fase A). El contrato es portable: si más adelante hay un worker en otro lenguaje, replica este contrato con los mismos fixtures JSON de `evals/`. (D-9)

## 3. Catálogo de tareas y cadena por tarea
Los IDs de modelo viven en la tabla `ia_modelos` (editable sin desplegar). **Verificar los IDs vigentes el día de construir.** Familias conocidas hoy de Anthropic: Opus 5.5 (`claude-opus-5-5`), Sonnet 5.5 (`claude-sonnet-5-5`), Haiku 5.5 (`claude-haiku-5-5`) y Fable 5.1 (`claude-fable-5-1`).

| Tarea | Necesita | Nivel principal (Anthropic) | Fallback 1 (OpenAI) | Fallback 2 (Gemini) |
|---|---|---|---|---|
| `plan_mes`, `ads_plan`, `diagnostico` | razonamiento largo, JSON | Opus 5.5 | modelo de razonamiento de OpenAI | modelo «pro» de Gemini |
| `redactar_pieza`, `hooks`, `guion_reel` | calidad de redacción, JSON | Sonnet 5.5 | modelo estándar de OpenAI | modelo estándar de Gemini |
| `responder_comentario`, `responder_dm` | baja latencia + seguridad | Sonnet 5.5 (o Haiku según riesgo) | idem | idem |
| `clasificar_intencion`, `moderar`, `etiquetar` | alto volumen, barato | Haiku 5.5 | modelo pequeño de OpenAI | modelo «flash» de Gemini |
| `investigar_tendencias` | **búsqueda web** | herramienta de búsqueda de Anthropic | búsqueda de OpenAI | «grounding» de Gemini |
| `vision_imagen` (leer foto del cliente, adjuntos) | visión | Sonnet 5.5 | OpenAI visión | Gemini visión |
| `transcribir_audio` | audio (**Anthropic no transcribe**) | — | OpenAI (transcripción) | Gemini audio |
| `generar_imagen` | imagen (**Anthropic no genera imágenes**) | — | ver §5 | ver §5 |
| `supervisor` (revisa respuestas antes de enviar) | juicio | **proveedor distinto al que generó** | — | — |

Los nombres exactos de los modelos de OpenAI y Gemini **no están fijados aquí a propósito**: cambian con frecuencia; se fijan el día de construir tras consultar sus catálogos.

## 4. Comportamiento ante fallas
| Situación | Acción |
|---|---|
| 429 / 5xx / sobrecarga / timeout | 1 reintento al mismo proveedor (espera creciente con jitter) → siguiente proveedor |
| 400 por esquema o salida inválida | 1 reparación («corrige esto») → siguiente proveedor |
| Rechazo por política de contenido | siguiente proveedor, **marcado**; si los tres rechazan → a persona |
| 401/403 (clave inválida o sin saldo) | desactivar proveedor, **alerta inmediata** al operador, seguir con el siguiente |
| Proveedor caído de forma sostenida | **Circuito abierto** (5 fallas en 60 s → saltar 30 s → sonda de prueba) |
| Los tres fallan | tarea a `en_cola_ia`, reintento con espera creciente, aviso en la UI y alerta |

**Sondas sintéticas** cada 5 minutos por proveedor (prompt mínimo) para abrir el circuito antes de que lo note un cliente.

## 5. Imagen y video (cadena aparte)
- **Texto y composición de piezas no usan IA generativa de imagen:** se componen con el motor vectorial (SVG→PNG), costo ≈ 0 y reglas de diseño exactas (`REGLAS_DISENO`).
- **Fotos de IA (render, fondo, producto):** cadena Gemini (imagen) → OpenAI (imagen). Hoy crm-321 usa `nano_banana_pro` a través de Higgsfield; el modelo es de Google, así que la ruta directa por la API de Gemini es la equivalente.
- **Video corto:** Veo (vía API de Gemini) → otro proveedor a evaluar. **Sin verificar disponibilidad/precio:** tarea de investigación de la fase 1.
- **UGC con avatar:** requiere un avatar **por marca con consentimiento** del titular de la imagen. El avatar de Byron solo sirve para 321. (D-3)
- **Higgsfield:** hoy se usa con el CLI y los créditos del **plan personal** de Byron. Eso sirve para 321 como cliente cero pero **no es un proveedor multicliente** (R-1). Se mantiene como proveedor opcional para la cuenta de 321.

## 6. Validaciones deterministas (código, no LLM)
1. **Esquema** (Zod/Pydantic) de cada tarea.
2. **Frases prohibidas** por marca y por sector (lista de `skills.py` `PROHIBIDAS` generalizada) — 1 corrección y, si persiste, bloqueo.
3. **Validador de cifras (Regla C):** todo número, moneda o porcentaje del texto debe existir en la FUENTE entregada; si no, se rechaza y se pide corrección; si persiste, se elimina la frase y se marca.
4. **Límites** de plataforma (caption 2.200, 30 hashtags, etc., desde `instagram-api-rules.md`).
5. **Declaración de IA:** «Imagen referencial.» cuando corresponde (como en `redaccion.py`) y etiquetas de contenido generado según la plataforma.

## 7. Ledger y presupuestos
- Tabla `ia_llamadas`: `org_id, marca_id, tarea, proveedor, modelo, tokens_in, tokens_out, costo_usd, latencia_ms, estado, fallback_de, error_codigo, pieza_id, creado_en`. Retención de detalle 90 días y luego agregado (plan gratuito de Supabase).
- Tabla `ia_precios` (por modelo, por millón de tokens) para calcular costos; actualizable.
- **Presupuesto mensual por organización** según plan: aviso al 80 %; al 100 % se detienen las tareas **no esenciales**; las esenciales (responder mensajes) **bajan de nivel** de modelo en vez de cortarse.
- El costo real por pieza alimenta el cálculo de precios del plan (`06`).

## 8. Portabilidad de prompts
- Skills en Markdown + esquema JSON; sin depender de funciones exclusivas de un proveedor en la ruta principal.
- Adaptadores por proveedor para: formato de salida estructurada, búsqueda web, visión, caché de prompt.
- **Caché de prompt** (prefijo estático de skills) en cada proveedor que lo ofrezca: verificar mecanismo y mínimos al construir.

## 9. Evaluación (para poder cambiar de proveedor sin miedo)
- Conjunto de **≥30 casos por tarea** (inmobiliario + 2 verticales), con entradas reales anonimizadas de 321.
- Puntaje por reglas deterministas (esquema válido, 0 frases prohibidas, 0 cifras sin fuente, longitudes) y, opcionalmente, un juez de **otro proveedor**.
- Criterio de paridad (hipótesis a calibrar): un fallback entra en producción solo si logra ≥95 % del puntaje del principal en la tarea.
- Se corre al cambiar un modelo y de forma nocturna en pequeño.

## 10. Privacidad
Solo se envía al proveedor lo necesario; PII de terceros (autores de comentarios) se minimiza; contratos/API con **no entrenamiento con datos del cliente** (verificar términos de cada proveedor al contratar); nunca se mezclan datos entre clientes en un mismo prompt.

## 11. Claves y operación
`ANTHROPIC_API_KEY` (ya cargada), `OPENAI_API_KEY`, `GEMINI_API_KEY` en Vercel y en el motor. Alertas de saldo por proveedor. A futuro: claves propias del cliente (agencias) — D-12.

## 12. Clasificador de tarea → nivel (ahorro de costo)
Inspirado en el «JEV elige el modelo» de la referencia JARVIS: antes de llamar al modelo principal, una pasada barata (Haiku 5.5 o equivalente) clasifica la solicitud entrante (p. ej. del Asistente) en **simple / normal / compleja** y elige el nivel de modelo. Reglas: nunca bajar de nivel una tarea con **riesgo** (queja, dinero, legal); el clasificador es opcional y se mide en el ledger (ahorro real vs. calidad en la evaluación).

## 13. Memoria por marca
Ficha + conocimiento (preguntas frecuentes, objeciones) + aprendizajes semanales + publicaciones propias + transcripciones subidas, indexados por marca. Búsqueda semántica con `pgvector` (**verificar** disponibilidad y límites en el plan gratuito de Supabase). Todo lo recuperado entra al prompt como **dato**, nunca como instrucción.
