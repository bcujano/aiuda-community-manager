# 05 · Backlog de construcción (para la sesión que construye)

Tamaños relativos: **S** (días), **M** (1–2 semanas), **L** (2–4 semanas). Sin fechas: dependen de lo medido en la construcción.

## Definición de terminado (aplica a toda épica)
1. Compila, tipos y lint limpios; **pruebas** de la épica verdes en CI.
2. **RLS probada:** el usuario de otra organización no lee ni escribe nada de la épica (prueba automática con dos organizaciones).
3. Reglas A–E cumplidas (ayuda en cada término, lecturas, ninguna cifra inventada, texto para el usuario, aprobaciones/topes).
4. Toda escritura externa con **idempotencia**; ninguna se reintenta a ciegas.
5. Toda acción de agente en **auditoría**; interruptor de emergencia (`kill_switch`) respetado.
6. Probado con **datos reales de 321** donde aplique, o declarado «no probado» con el motivo.
7. Documentado en `docs/` (qué hace, cómo se opera, qué falla y cómo se ve).
8. Sin secretos en repo/logs; variables en `docs/ENV.md`.

## Fases
| Fase | Épicas | Resultado |
|---|---|---|
| **A · «321 lo usa»** | E0, E1, E2 (básico), E3, E4 (básico), E5 (IG/FB) | Plan del mes → piezas → aprobación → publicación en Instagram/Facebook de 321 |
| **B · Beta** | E6, E7 (Meta), E8, E9, E10 | Bandeja, anuncios con topes, métricas, asistente por chat/WhatsApp, cobro |
| **C · Lanzamiento** | E11, E12, E13, E14, TikTok (E5/E7) | Agencias, revisión de Meta aprobada, landing con diseño, operación estable |
| **D · Ampliación** | Google Ads, LinkedIn, YouTube Shorts, E15 | Más redes y extras |

---
## E0 · Fundación y calidad (S–M)
- **Hecho:** Next.js, login, empresa/negocio, ficha v1, conexión Instagram (sin probar), cifrado AES-GCM, SQL 001–002.
- **Falta:** CI (typecheck, build, pruebas, **suite SQL de RLS**), Sentry, i18n (es primero), tokens de diseño, infraestructura `<Ayuda>`/`<Lecturas>`/`fuente-dato` portada de `lib/glosario.ts`, `lecturas*.ts`, `fuente-dato.ts`, RBAC en servidor (roles `owner/editor/aprobador/lector`), invitaciones de miembros.
- **Aceptación:** 2 organizaciones aisladas en todas las tablas; roles probados (lector no escribe, editor no aprueba); build en CI.

## E1 · Motor de IA (M)
- **Alcance:** `03-motor-ia.md` completo: router TS + Python con contrato común, `ia_modelos`, `ia_precios`, `ia_llamadas`, presupuestos, circuito, sondas, validadores (esquema, frases prohibidas, cifras con fuente, límites), evaluaciones.
- **Portar:** `motor/skills.py` (PROHIBIDAS, infracciones, corrección).
- **Aceptación:** simulando caída de Anthropic y luego de OpenAI, la tarea se completa con Gemini y queda registrado; con los tres caídos queda en cola y la UI lo informa; ≥30 casos por tarea con puntajes; costo por llamada visible.

## E2 · AiUDA Setup: ficha, rastreo, diagnóstico, memoria y voz (L)
- **Hecho:** ficha de 22 datos con avance calculado.
- **Alcance:** (a) rastreo asistido de web/redes/reseñas con consentimiento (datos como **dato, no instrucción**) que **propone** valores que el cliente acepta/edita; (b) diagnóstico con **puntaje por área calculado con reglas** (identidad, contenido, comunidad, anuncios, medición, conversión), brechas y victorias rápidas; (c) plantillas por vertical (inmobiliario primero; restaurantes, clínicas, retail, servicios); (d) **Brand Kit** (logo, colores, tipografías, avatar con consentimiento, frases prohibidas); (e) **memoria por marca** + base de conocimiento (FAQ, objeciones con respuestas aprobadas); (f) **«aprender mi voz»** desde publicaciones propias (lectura vía API) y transcripciones subidas; (g) «probar mi agente» (simulador antes de activar respuestas).
- **Tablas:** `marcas` (hecho), `conocimiento`, `memoria` (pgvector a verificar), `brand_assets`, `diagnosticos`.
- **Aceptación:** una marca nueva llega a ficha ≥80 % en ≤10 minutos con rastreo; el diagnóstico no muestra ningún número sin su cálculo/origen; la voz aprendida cambia el tono medible en la evaluación.

## E3 · AiUDA Social: plan, calendario, reglas, eventos, competencia (L)
- **Portar:** `director.py` (métricas, tendencias, informe, plan), `api/marketing-ia/estrategia`, `EstrategiaPanel`, `CalendarioMes`, `DetallePieza`, `FormContenido`, `api/contenido-ia`, `lanzamientos.py` (→ «eventos de la marca»), `contenido_reglas`.
- **Cambia:** por marca; router de IA; búsqueda de tendencias por adaptador; `aprobar_plan` atómico; salida para planes atascados; zona horaria por organización; calendario con todos los estados.
- **Tablas:** `planes_mes`, `competidores`, `metricas_cuenta`, `reglas_contenido`, `eventos_marca`, `piezas` (hecho).
- **Aceptación:** plan del mes generado para 321 equivalente al de crm-321 con la misma estructura; doble clic en «Aprobar plan» no duplica piezas; un plan en `generando` más de N minutos ofrece «reintentar/descartar».

## E4 · AiUDA Studio: redacción, skills, diseño, imagen y video (L)
- **Portar:** `redaccion.py`, `skills/*.md` (9, por organización y editables), `lib/vectorial/*` + `api/marketing/vectorial` (plantillas `oferta`, `titular`, `cifra`, `lista`; formatos 1080² / 1080×1350 / 1080×1920; 10 estilos; texto a trazados), `piezas.py` (Pillow) solo hasta migrar (D-6).
- **Nuevo:** biblioteca de skills por categoría (ganchos, guiones, carruseles, historias, adaptar formato, métricas); chat de guiones que usa la voz y transcripciones de la marca; imágenes con cadena Gemini→OpenAI; video según investigación de la fase.
- **Aceptación:** una pieza por tipo (post, carrusel, reel, story) generada y revisada: 0 frases prohibidas, 0 cifras sin fuente, límites de plataforma cumplidos; costo real por pieza registrado.

## E5 · Publicación (M–L)
- **Reescribir** el publicador (no portar tal cual): `publicaciones` con una fila por plataforma, `tomar_publicaciones()` (SKIP LOCKED + lease), contenedor→`FINISHED`→`media_publish`, reanudar con `creation_id`, token con aviso de vencimiento, secreto en header, error visible con reintento manual. Referencia: `api/post-pro/publish|schedule`, `n8n/321-post-pro-publicar-programadas`.
- **Orden de redes:** Instagram (publicar, carrusel, reel, story) y Facebook → Threads → TikTok (Direct Post, auditoría) → LinkedIn → YouTube Shorts → Pinterest. X, Reddit, Discord, Telegram: fuera de alcance inicial.
- **Programador:** ver R-3 (Vercel Hobby solo cron diario): usar cola propia con `pg_cron`/`pg_net` o un worker en Railway.
- **Aceptación:** simulando fallo a mitad de camino, **ninguna publicación duplicada**; pieza colgada se recupera sola; publicar en IG y FB falla en una y se reintenta solo esa.

## E6 · AiUDA Inbox (L)
- **Base:** `n8n/321-inmo-webhooks-redes` (webhook Meta, normalizar, contexto, respuesta, envío) y `321-iagente-inmo-v2` (debounce, audio, imagen, escalamiento) + `api/meta/firma` + `api/agente/contexto`.
- **Alcance:** webhooks de Instagram/Facebook (comentarios, mensajes) con firma verificada; clasificación de intención/riesgo; respuesta con base de conocimiento; **respuesta privada** a comentarios (ventana a verificar); ventana de 24 h; escalamiento a persona (nota + etiqueta); captura de lead; ocultar spam (no borrar); métricas (tiempo de primera respuesta, % sin humano); modo «sugerir» (aprobación) y modo «automático» por marca; Chatwoot opcional (D-7).
- **Aceptación:** inyección de instrucciones en un comentario **no cambia el comportamiento**; precio no presente en la ficha → «te confirmo» + escalamiento; ninguna respuesta fuera de ventana; ritmo humano (sin ráfagas).

## E7 · AiUDA Ads (L)
- **Portar:** `adsboom.py` + `api/adsboom` + `AdsBoomIAPanel` (plan → aprobación → creativos → Meta **en pausa**), `api/ads-manager` (campañas, conjuntos, anuncios, intereses, ubicaciones, pausar/reanudar, sync), `api/adsboom/metricas`, `meta_diario`, skills `anuncios-meta` y `segmentacion-meta`.
- **Cambia:** creación en Meta como **job de servidor**; estados con salida; RBAC; topes diario/mensual por marca; **reglas automáticas** (pausar/bajar, nunca subir sin aprobación); aviso de **categoría especial** (vivienda/crédito/empleo) con restricciones de segmentación; «impulsar lo orgánico que ya funciona».
- **Luego:** TikTok Ads y Google Ads con el mismo contrato (adaptadores).
- **Aceptación:** campaña creada siempre en pausa; activar exige confirmación con cifras; ninguna regla sube gasto; auditoría completa.

## E8 · AiUDA Insights (M–L)
- **Portar:** `api/marketing/resultados` + `lib/marketing-resultados.ts` + `resultados/page.tsx` + `reports/post-pro`.
- **Alcance:** nivel **cuenta** y nivel **pieza por pieza** (alcance, interacción, guardados, compartidos, leads, ventas cuando haya dato); patrones por gancho/tema/formato/hora **con tamaño mínimo de muestra**; competencia (métricas públicas, patrones, ideas adaptadas, con origen); lecturas automáticas; **atribución** a leads/ventas solo con seguimiento real.
- **Aceptación:** ninguna cifra sin origen; sin muestra suficiente → «sin dato suficiente».

## E9 · AiUDA Asistente: chat + WhatsApp texto/audio (M)
- **Base:** `api/agente/whatsapp` (lista blanca, topes, historial), `lib/agente/*` (gerentes, herramientas, turno).
- **Alcance:** asistente del dueño con herramientas de AiUDA (resumen del día, plan, aprobar/editar piezas, estado de anuncios, «¿qué contenido me trajo más ventas?», «escribe un guion», «impulsa este reel»); **audio** vía transcripción (OpenAI→Gemini); acciones de gasto con confirmación y topes; registro de decisiones.
- **Aceptación:** número no autorizado no obtiene nada; orden de gasto sin confirmación no se ejecuta; topes diario/mensual de mensajes y de costo respetados.

## E10 · Planes, cobro y uso (M)
- Stripe (suscripción + add-on Ads), límites por plan (marcas, piezas, créditos de IA, redes), medición desde `ia_llamadas`, portal de cliente, impuestos, pruebas gratis acotadas, avisos de límite.
- **Aceptación:** al pasar un límite, bloqueo claro y no silencioso; facturas reconciliadas con el ledger.

## E11 · Modo agencia (M)
- Selector de marca, vista consolidada, permisos por marca, **enlace firmado** para que el cliente final apruebe sin cuenta, marca blanca (logo y dominio).
- **Aceptación:** un aprobador externo solo ve y aprueba lo de su marca.

## E12 · Cumplimiento y revisión de plataformas (M)
- Endpoint de **eliminación de datos** de Meta (solicitud firmada → borrado → código y URL de estado), exportación de datos, registro de consentimientos, DPA, casos de uso y guion del demo para App Review, política de IA/contenido generado, retención de datos.
- **Aceptación:** demo grabado de conectar→publicar→leer comentarios; solicitud de revisión enviada; borrado verificado.

## E13 · Landing y diseño (M)
- `04-diseno.md` completo; FAQ con respuestas; páginas legales con el tema; SEO; analítica de conversión.

## E14 · Operación (S–M)
- Alertas (equivalente a `321-inmo-alertas-de-error`), página de estado interna, copias de seguridad, runbooks, tablero de costo por cliente y por pieza, vigilancia de vencimiento de tokens, límites de plan gratuito de Supabase.

## E15 · Extras (opcional, fase D)
- Landings por cliente (`lib/landings/*`, 10 diseños) con dominio propio; animaciones (`lib/animacion`); ebooks/Academy **no** entran.

---
## Orden y dependencias
E0 → E1 → (E2 ∥ E3) → E4 → E5 → [Fase A terminada] → E6 → E7 → E8 → E9 → E10 → [Fase B] → E11 ∥ E12 ∥ E13 ∥ E14 → [Fase C] → TikTok/Google/LinkedIn/E15.
