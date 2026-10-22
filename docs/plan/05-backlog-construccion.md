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
| **A · «321 lo usa»** | E0, E1, E2 (básico), E3, E4 (básico), E5 (**IG/FB directo; TikTok y YouTube solo asistido**) | Plan del mes → piezas → aprobación → publicación en Instagram/Facebook de 321 |
| **B · Beta** | E6, E7 (Meta), E8, E9, E10 | Bandeja, anuncios con topes, métricas, asistente por chat/WhatsApp, cobro |
| **C · Lanzamiento** | E11, E13, E14, **E12 (revisiones de Meta/TikTok/Google/YouTube cuando el sistema esté sólido)**, TikTok (E5/E7) | Agencias, revisión de Meta aprobada, landing con diseño, operación estable |
| **D · Ampliación** | Google Ads (YouTube), YouTube directo tras auditoría, E15 | Anuncios de YouTube y extras |

---
## E0 · Fundación y calidad (S–M)
- **Hecho:** Next.js, login, empresa/negocio, ficha v1, conexión Instagram (sin probar), cifrado AES-GCM, `sql/001_esquema_aiuda_cm.sql` (esquema propio, probado).
- **Falta:** **que Byron pegue `sql/001_esquema_aiuda_cm.sql` y exponga el esquema `aiuda_cm` en la API** (integridad entre organizaciones, YouTube, planes, límite de organizaciones; el proyecto comparte base con otra app: **jamás tocar `public`**); CI (typecheck, build, pruebas, **suite SQL de seguridad por fila con ataques entre organizaciones**, ya probada a mano), Sentry (solo si es gratis), i18n (es primero), tokens de diseño, infraestructura `<Ayuda>`/`<Lecturas>`/`fuente-dato` portada de `lib/glosario.ts`, `lecturas*.ts`, `fuente-dato.ts`, RBAC en servidor (roles `owner/editor/aprobador/lector`), invitaciones de miembros.
- **Aceptación:** 2 organizaciones aisladas en todas las tablas **y sin referencias cruzadas** (una pieza/conexión/publicación nunca apunta a otra organización); roles probados (lector no escribe, editor no aprueba); build en CI.

## E1 · Motor de IA (M)
- **Alcance:** `03-motor-ia.md` completo: router **en TypeScript** con contrato portable, `ia_modelos`, `ia_precios`, `ia_llamadas`, presupuestos, circuito, sondas, validadores (esquema, frases prohibidas, cifras con fuente, límites), evaluaciones.
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
- **Nuevo:** **biblioteca de ≥100 skills combinadas con el conocimiento del sistema** (`10`); chat de guiones que usa la voz y transcripciones de la marca; imágenes con cadena Gemini→OpenAI; video según investigación de la fase.
- **Aceptación:** una pieza por tipo (post, carrusel, reel, story) generada y revisada: 0 frases prohibidas, 0 cifras sin fuente, límites de plataforma cumplidos; costo real por pieza registrado.

## E5 · Publicación (M–L)
- **Reescribir** el publicador (no portar tal cual): `publicaciones` con una fila por plataforma, `tomar_publicaciones()` (SKIP LOCKED + lease), contenedor→`FINISHED`→`media_publish`, reanudar con `creation_id`, token con aviso de vencimiento, secreto en header, error visible con reintento manual. Referencia: `api/post-pro/publish|schedule`, `n8n/321-post-pro-publicar-programadas`.
- **Redes (Byron 2026-10-22): solo Instagram, Facebook, TikTok y YouTube** (`08`), cada una en modo **directo** o **asistido** según acceso: Instagram/Facebook directo; **Fase A: Instagram y Facebook directo; TikTok y YouTube solo asistido (paquete listo para publicar).** La API de TikTok en desarrollo (privado) entra en la Fase B; YouTube directo, tras la auditoría. «Una idea, cuatro formatos» (`08` §6).
- **Programador:** `pg_cron` + `pg_net` de Supabase (gratis) llamando a un endpoint con `CRON_SECRET` en header (`09`); sin Railway en esta etapa.
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

## E8 · AiUDA Insights + inteligencia competitiva (L)
- **Portar:** `api/marketing/resultados` + `lib/marketing-resultados.ts` + `resultados/page.tsx` + `reports/post-pro`.
- **Alcance:** nivel **cuenta** y nivel **pieza por pieza** (alcance, interacción, guardados, compartidos, leads, ventas cuando haya dato); patrones por gancho/tema/formato/hora **con tamaño mínimo de muestra**; competencia (métricas públicas, patrones, ideas adaptadas, con origen); lecturas automáticas; **atribución** a leads/ventas solo con seguimiento real.
- **Ad Library y competencia (`08` §4):** **tres modos** (API oficial si devuelve datos; **asistido con enlaces/capturas y visión** siempre disponible; proveedor de pago en fase D); detector de ángulos, ofertas, formatos y duración de anuncios de la competencia; **ideas adaptadas** (sin copiar); cruce con métricas propias → «qué orgánico impulsar»; patrones públicos de competidores (Business Discovery).
- **Aceptación:** ninguna cifra sin origen; sin muestra suficiente → «sin dato suficiente»; el informe de competencia cita la fuente de cada hallazgo.

## E9 · AiUDA Asistente: chat + WhatsApp texto/audio (M)
- **Base:** `api/agente/whatsapp` (lista blanca, topes, historial), `lib/agente/*` (gerentes, herramientas, turno).
- **Alcance:** asistente del dueño con herramientas de AiUDA (resumen del día, plan, aprobar/editar piezas, estado de anuncios, «¿qué contenido me trajo más ventas?», «escribe un guion», «impulsa este reel»); **audio** vía transcripción (OpenAI→Gemini); acciones de gasto con confirmación y topes; registro de decisiones.
- **Aceptación:** número no autorizado no obtiene nada; orden de gasto sin confirmación no se ejecuta; topes diario/mensual de mensajes y de costo respetados.

## E10 · Planes, cobro y uso (M)
- **Cobro (decisión 2026-10-22): el usuario elige transferencia o link de pago.** Registro de pagos y comprobantes, activación/suspensión de plan, recordatorios de vencimiento, **factura electrónica del SRI** (manual o con proveedor), programa fundador y plan anual. Pasarela con tarjeta recurrente (Kushki u otra) y estructura en EE. UU. **después del primer ingreso**. Stripe en pausa.
- Límites por plan (negocios, piezas, créditos de IA, redes), medición desde `ia_llamadas`, portal de cliente, avisos de límite.
- **Aceptación:** al pasar un límite, bloqueo claro y no silencioso; cada pago registrado activa el plan correcto; conciliación contra el ledger.

## E11 · Modo agencia (M)
- Selector de marca, vista consolidada, permisos por marca, **enlace firmado** para que el cliente final apruebe sin cuenta, marca blanca (logo y dominio).
- **Aceptación:** un aprobador externo solo ve y aprueba lo de su marca.

## E12 · Cumplimiento y revisión de plataformas (M) — **después de que el sistema funcione bien** (Byron 2026-10-22)
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
E0 → E1 → (E2 ∥ E3) → E4 → E5 → [Fase A terminada] → E6 → E7 → E8 → E9 → E10 → [Fase B] → E11 ∥ E12 ∥ E13 ∥ E14 → [Fase C] → TikTok Ads / Google Ads (YouTube) / E15.

## E16 · Promesas y calidad de producto (S, transversal)
Panel de operación con las 10 promesas de `07` §3 medidas (borrador de campaña < 60 s, alta < 10 min, primera respuesta < 15 min, etc.); revisión mensual; biblioteca de estrategias ≥50 (`07` §5).

## E17 · Motor de crecimiento y «Regalo de valor» (M–L, transversal; arranca en Fase A/B)
- **Fuente:** `12-psicologia-de-ventas-y-regalo-de-valor.md` y `11-precios-y-comercializacion.md`.
- **Alcance:** (a) **herramientas públicas gratis** (auditoría express de Instagram, calculadora de ahorro, generador de ganchos, calendario 30 días, guía de anuncios de vivienda); (b) **«Tu Semana 1 lista»**: ficha rastreada + diagnóstico + 3 piezas + calendario de 7 días + borrador de campaña + competencia, en ≤10 min, en pantalla y PDF; (c) **cupos diarios reales** ligados al presupuesto de IA y **antiabuso** (verificación de WhatsApp/correo, una por negocio/cuenta); (d) calificación suave; (e) embudo medido (visita → regalo → ficha ≥80 % → piloto → pago) con panel; (f) referidos (1 mes gratis); (g) programa fundador (10 cupos reales); (h) **lista prohibida de dark patterns** como prueba automática de copy.
- **Producto abierto a todo el mercado:** ficha y plantillas **genéricas** + **paquetes por vertical** (inmobiliario primero: inmobiliarias, desarrolladoras, agentes); «negocio» puede ser **marca o proyecto**.
- **Aceptación:** regalo completo en ≤10 min; costo por regalo medido en el ledger y dentro del tope; el contador de cupos **coincide** con el presupuesto restante; ninguna pieza publicada sin aprobación; revisión de copy sin patrones prohibidos.

## Principio de construcción: rebanada vertical primero
Antes de ampliar cualquier épica, construir **una rebanada de punta a punta** con lo mínimo: ficha → plan del mes (1 pieza) → pieza de texto + vectorial → aprobar → publicar en Instagram (cuenta de 321) → ledger de IA. Probarla con datos reales y **solo entonces** ampliar a más tipos de pieza, redes y funciones. (Prueba ácida: la Fase A completa es grande; la rebanada reduce el riesgo.)
