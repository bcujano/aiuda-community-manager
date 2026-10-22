# 06 · Decisiones y riesgos

## A. Decisiones cerradas
| # | Decisión | Fecha |
|---|---|---|
| C-1 | Marca madre **AiUDA**; línea de nombres A (Social, Ads, Inbox, Studio, Insights, Setup, Agency) | 2026-10-21 |
| C-2 | Una sola rama: `main` | 2026-10-21 |
| C-3 | Stack: Vercel · Supabase (gratuito de AiUDA por ahora) · GitHub · Railway · n8n · Chatwoot · Anthropic · OpenAI · Gemini | 2026-10-21 |
| C-4 | Empresa: Tres Dos Uno Soluciones Inmobiliarias S.A.S., Whymper 3236, Quito, Ecuador | 2026-10-21 |
| C-5 | Se trabaja con la URL de Vercel; dominio propio es opcional | 2026-10-22 |
| C-6 | **Motor de IA: Anthropic principal → OpenAI respaldo → Gemini garantía** | 2026-10-22 |
| C-7 | **No se repite lo que ya existe en crm-321/postpro-321: se porta, se parametriza y se corrige** | 2026-10-22 |
| C-8 | Repos ajenos solo lectura | 2026-10-21 |
| C-9 | El diseño (`design.md`) es estético; la funcionalidad manda | 2026-10-22 |
| C-10 | La construcción se hace en otra sesión, cuando la planificación esté completa | 2026-10-22 |
| C-11 | **Solo Instagram, Facebook, TikTok y YouTube con sus anuncios** (Meta Ads, TikTok Ads, Google Ads/YouTube); **Ad Library** incluido. Descartadas: Threads, LinkedIn, Pinterest, X, Reddit, Discord, Telegram | 2026-10-22 |
| C-12 | La revisión de Meta **no es inmediata**: primero el sistema funcionando bien | 2026-10-22 |
| C-13 | **Ningún plan de pago (Vercel Pro, Supabase Pro u otro) hasta generar dinero** (primer ingreso recibido). Infraestructura gratuita hasta entonces | 2026-10-22 |
| C-15 | **Tope de IA: US$50 al mes** mientras se construye y valida | 2026-10-22 |
| C-16 | **Diseño: receta Refero** (Notion + Ramp + Intercom + Raycast), **con vuelta atrás fácil** (`04` §6) | 2026-10-22 |
| C-14 | Skills ≥100 combinadas con el conocimiento del sistema (`10`) | 2026-10-22 |

## B. Decisiones abiertas (con recomendación)
| # | Tema | Recomendación | ¿Bloquea? |
|---|---|---|---|
| D-1 | Dominio propio y **correo de contacto operativo** (hoy `contacto@emprendimientum.com` no recibe: hosting suspendido) | Antes de enviar a revisión de Meta: correo que reciba (reactivar hosting, o mover DNS y reenviar) y dominio verificable | **Sí, para App Review** (no para Fase A) |
| D-2 | Proveedor de imagen/video **por cliente** (R-1) | Gemini (imagen) → OpenAI (imagen); video con Veo; Higgsfield solo para la cuenta de 321 | Sí, para E4 video |
| D-3 | Avatar/UGC por marca | Solo con consentimiento escrito del titular de la imagen; fase B; el avatar de Byron solo para 321 | No |
| D-4 | Planes de pago de infraestructura | **Decidido por Byron: nada Pro hasta generar dinero.** Riesgo asumido: Vercel Hobby es no comercial; se mitiga con portabilidad y copias (`09` §4). Al **primer ingreso** se paga Vercel Pro y, con datos reales de clientes, Supabase Pro | No |
| D-5 | Precios y comercialización | **Propuesta 39 / 89 / 229 + programa fundador US$59** (`11`); validar con cotizaciones, 10 entrevistas y costo real por pieza | No |
| D-6 | Composición de piezas: Pillow (Python) vs vectorial TS | **Vectorial TS como estándar** (SVG editable, reglas de diseño, 10 estilos); Pillow solo mientras 321 migra | No |
| D-7 | Inbox: n8n vs código propio; Chatwoot | **Núcleo propio** (webhook→clasificar→responder→escalar, con pruebas); n8n para alertas y seguimientos; **Chatwoot diferido** a Fase B/C | No |
| D-8 | Dónde corre la generación | **Sin servidor propio en la etapa gratuita:** trabajos asíncronos + `pg_cron` (`09` §3); Railway solo si hace falta | No |
| D-9 | Router de IA | **Una implementación en TypeScript** con contrato portable y pruebas en `evals/` (corregido en la prueba ácida: no hay Python en la etapa gratuita) | No |
| D-10 | Idiomas | Español primero; inglés/portugués en lanzamiento | No |
| D-11 | Segmentos | Inmobiliario primero; plantillas para restaurantes/clínicas/retail; **edición creadores** (marca personal) después | No |
| D-12 | Claves propias del cliente (BYO) | Solo agencias, fase C | No |
| D-13 | Redes y orden | **Cuatro** (`08`): Instagram/Facebook directo; TikTok privado en desarrollo y asistido para público; YouTube asistido hasta auditar; anuncios Meta → TikTok → Google (YouTube) | No |
| D-14 | Ad Library de competidores | **Tres modos** (API oficial si sirve; **asistido con capturas** siempre; proveedor de pago después). Se valida la API con una consulta de solo lectura antes de prometerla (`08` §4) | No |
| D-15 | Diseño | **Decidido:** receta Refero con vuelta atrás (`04` §6). Si Byron entrega su propio código, entra como tercer tema (`propio`) y puede ganar | No |

## C. Riesgos
| # | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| R-1 | **Higgsfield con créditos del plan personal de Byron no es un proveedor multicliente** y puede violar términos si se revende | Alto | Proveedores por API (Gemini/OpenAI/Veo); Higgsfield solo cuenta de 321; revisar términos |
| R-2 | **Revisión de Meta** (App Review + Business Verification): semanas; `*.vercel.app` **no se puede verificar como dominio propio**; el correo de contacto no funciona | Alto | Dominio propio, correo operativo, demo grabado (E12); empezar el trámite al terminar Fase A |
| R-3 | **Vercel Hobby es para uso no comercial** (oficial); funciones de 10–60 s. **Riesgo asumido por Byron** (sin Pro hasta generar dinero): posible suspensión si se usa comercialmente | Alto | Hobby solo para construir/probar; **portabilidad** (sin funciones exclusivas de Vercel) y plan B de alojamiento; copias semanales; Pro al primer ingreso; `pg_cron`+`pg_net` y trabajos asíncronos |
| R-4 | **Supabase gratuito:** se pausa por inactividad, sin copias de seguridad, ~500 MB, Disk IO limitado (crm-321 ya se cayó el 27-sep) | Alto | Plan Pro antes de clientes reales; lotes con pausa; retención de `ia_llamadas`; Storage con límites |
| R-5 | Caída de un proveedor de IA | Medio | Cadena de tres + circuito + sondas + cola |
| R-6 | **Políticas de anuncios**: categoría especial de **vivienda** (segmentación restringida), claims de resultados | Alto (inmobiliario) | Validador de políticas, `segmentacion-meta` ajustada, nunca prometer resultados (a diferencia de la competencia) |
| R-7 | **Mensajes directos** requieren acceso avanzado y ventana de 24 h | Medio | Modo comentarios primero; solicitar acceso avanzado en la revisión |
| R-8 | Costo de video/imagen se dispara | Medio | Presupuestos por plan, estimación antes de generar, aprobación de gasto |
| R-9 | Cifras inventadas por la IA | Alto (confianza) | Validador de cifras (Regla C), «sin dato» |
| R-10 | Vencimiento de tokens (60 días) | Medio | Aviso a 10 días, estado «reconectar», sondas |
| R-11 | Repositorio **público** (secretos, datos) | Medio | Hacerlo privado pronto (Byron lo hará); nunca datos de clientes ni expediente de visa |
| R-12 | Imagen de personas/avatares y leyes de IA | Medio | Consentimiento, etiquetas «hecho con IA», política de contenido |
| R-13 | n8n + Chatwoot + motor en Railway consumen recursos | Medio | Diferir Chatwoot; medir antes de añadir |
| R-14 | Narrativa de visa sin tracción | Alto (visa) | Llevar a 321 como cliente cero con métricas reales y cartas de clientes |
| R-16 | **Cobro:** no está confirmado que Stripe admita comercios ecuatorianos; Payphone parece solo cobros únicos | Medio | Primeros 5 clientes por transferencia + factura SRI; Kushki o estructura en EE. UU. después del primer ingreso (`11` §4) |
| R-17 | **Puerta de Meta:** sin App Review/Live, solo cuentas con rol en la app (administradores, desarrolladores, probadores) pueden conectarse. Sirve para 321 y los primeros fundadores, **no para escalar** (⚠️ límite de probadores sin verificar) | **Alto** | Compuerta en `13`: antes de superar el límite de probadores o del lanzamiento público, **App Review + verificación de empresa aprobadas** (E12); empezar el trámite en la Fase B, no al final |
| R-18 | **WhatsApp** (asistente del dueño) requiere WhatsApp Business Platform: verificación y costo por conversación (⚠️) | Medio | Fase B; el asistente funciona primero en el chat web |
| R-19 | **Costo del video de IA** puede romper el margen (⚠️ precio por segundo) | Alto | Reels con fotos (ffmpeg) como base; clips de IA limitados por plan y en packs; verificar precios antes de prometer |
| R-20 | **Ad Library comercial** puede no estar disponible por API oficial para LATAM | Medio | Modo asistido con capturas + visión (`08` §4) |
| R-21 | **Business Discovery** a escala: límites de llamadas compartidos con un solo token de AiUDA | Medio | Caché, cuotas por prospecto, plan B con datos pegados (`12` §3) |
| R-15 | Competidores (SaleADS) y creadores que se arman su propio sistema | Medio | Diferenciar por completitud, control, seguridad y simplicidad (`02`) |

## D. Qué debe quedar resuelto antes de empezar a construir
1. `design.md` generado con la receta Refero (o el de Byron si lo entrega).
2. D-2 (imagen/video) con una prueba corta de proveedores — o aceptar que la Fase A usa solo piezas vectoriales y fotos reales.
3. ~~D-4~~ **Resuelta:** nada Pro hasta generar dinero (riesgo R-3 asumido).
4. Confirmar que Fase A = «321 lo usa» como criterio de salida (`05`).
5. Cuenta de Meta para desarrollo creada (app en modo desarrollo, solo cuentas propias).
