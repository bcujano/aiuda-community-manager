# 01 · Inventario de reuso (crm-321 + postpro-321)

Fuentes leídas (solo lectura): `bcujano/crm-321` (Next.js 16, 659 archivos) y `bcujano/postpro-321` (FastAPI en Railway). Auditoría base: `crm-321/docs/08-mapa-del-sistema/03-marketing-ia-motor-publicidad.md`.

**Decisiones de tratamiento:** `PORTAR` = copiar y parametrizar · `ADAPTAR` = cambia en profundidad · `NUEVO` = no existe · `DESCARTAR`.

## A. crm-321 · Pantallas (`src/app/marketing-ia/*`, `src/app/marketing/*`)
| Origen (líneas) | Qué hace | Trato | Destino AiUDA | Cambios obligatorios |
|---|---|---|---|---|
| `marketing-ia/page.tsx` (315) | Contenedor con 4 secciones: Estrategia · Contenido IA · Estudio · Publicidad | ADAPTAR | AiUDA Social (shell) | Pasa a rutas propias del menú lateral; selector de negocio (marca) |
| `EstrategiaPanel.tsx` (295) | Plan del mes, competencia, informe | PORTAR | Social → Plan / Insights → Competencia | `org_id`/`marca_id`; competidores por marca |
| `CalendarioMes.tsx` (102) | Calendario mensual | PORTAR | Social → Calendario | Zona horaria por organización (hoy Ecuador fija); leyenda con `error` y `propuesta` (defecto B de la auditoría) |
| `DetallePieza.tsx` (170) | Vista previa, edición, aprobar, regenerar | PORTAR | Social → Detalle | Botón de reintento también para piezas manuales; vista previa «como se verá» en IG/FB/TikTok |
| `FormContenido.tsx` (283) | Nueva pieza / regla | ADAPTAR | Social → Nueva pieza | Orígenes dependen de la marca (no solo crm/creativo/marca_personal/ugc); «línea» deja de ser inmobiliario/cargotectura fija |
| `constantes.ts` | Costos estimados en créditos | ADAPTAR | tabla `costos_unidad` | Costos leídos del ledger real, no constantes |
| `PostProPanel.tsx` (1165) | Estudio manual: fichas, wizard, historial, alertas | ADAPTAR | Studio → Manual | Las «fichas» salen del catálogo de la marca; fuente única |
| `AdsBoomIAPanel.tsx` (410) | Plan IA de anuncios → aprobación → creativos → Meta en pausa | PORTAR | Ads → Crear con IA | Creación en Meta **del lado servidor** (hoy depende del navegador) |
| `AdsBoomPanel.tsx` (1835) + `AdsManagerPanel.tsx` (234) | Modo manual y administrador | ADAPTAR | Ads → Manual / Administrador | Partir en componentes; mismo contrato de API |
| `marketing/resultados/page.tsx` (430) + `lib/marketing-resultados.ts` (479) + `api/marketing/resultados` (309) | Resultados: Meta Ads + IG + CRM + plan | ADAPTAR | Insights | Quitar CRM de 321; «leads» vienen de Inbox/lead propio; **cuentas por conexión, no por variable de entorno** |
| `marketing/vectorial/page.tsx` (376) + `lib/vectorial/*` (11 archivos) + `api/marketing/vectorial` (103) | Piezas vectoriales (SVG+PNG), 4 plantillas, 3 formatos, 10 estilos, regla «sin texto sobre foto» | PORTAR | Studio → Diseño | Marca editable por organización (ya existe `marca_empresa`); tipografías con licencia |
| `marketing/landings/*` + `lib/landings/*` (7) + `api/landings*` | Landings con 10 diseños, ángulos, métricas | PORTAR (fase posterior) | Studio → Landings (add-on) | Dominio propio por cliente; hoy ligado a Academy/CRM |
| `marketing/animaciones/page.tsx` + `lib/animacion/generar.ts` + `api/marketing/animaciones` | Animaciones HTML+CSS con IA | PORTAR (baja prioridad) | Studio → Animaciones | Saneado de HTML obligatorio (ya existe `sanearHtml`) |
| `marketing/anuncios`, `publicidad`, `[seccion]` | Redirecciones | DESCARTAR | — | — |
| `reportes/post-pro/page.tsx` + `api/reports/post-pro` (147) | Reporte de publicaciones | ADAPTAR | Insights → Publicaciones | — |

## B. crm-321 · APIs
| Origen (líneas) | Acciones | Trato | Cambios |
|---|---|---|---|
| `api/contenido-ia` (214) | `crear_pieza`, `aprobar`, `aprobar_idea`, `regenerar`, `editar`, `cancelar`, `crear_regla`, `actualizar_regla`, `eliminar_regla`, `generar_ahora`, `estado_motor` | PORTAR | `verifyAuth` → sesión Supabase + RBAC (hoy no se revisa rol); `aprobar` pasa por `aprobar_pieza()` SQL atómico |
| `api/marketing-ia/estrategia` (160) | `generar_plan`, `aprobar_plan`, `descartar_plan`, `quitar_pieza_plan`, `agregar/quitar_competidor`, `actualizar_metricas` | PORTAR | `aprobar_plan` atómico (defecto B-8: doble clic duplicaba piezas); salida para plan atascado en `generando` (B-12) |
| `api/post-pro/route` (290) + `publish` (383) + `schedule` (410) + `upload` (113) + `ads` (207) | Publicar IG/FB, programar, historial, subir medios | ADAPTAR | **Reescribir el publicador** con `publicaciones` (SQL 002): una fila por plataforma, clave de idempotencia, lease; secreto en header (no `?secret=`); `upload`/`ads` legacy sin uso → DESCARTAR |
| `api/adsboom` (157) + `adsboom/metricas` (130) | `crear_plan`, `regenerar_plan`, `guardar_anuncios`, `aprobar_plan`, `reintentar_generacion`, `marcar_publicando`, `marcar_publicado`, `fallo_publicacion`, `descartar` + insights y pausa/activar | PORTAR | Estados huérfanos `generando_plan` y `publicando` con salida; pausa/activar con RBAC y registro de auditoría |
| `api/ads-manager` (1174) | `create_campaign/adset/ad`, `search_interests`, `search_locations`, `get_instagram_account`, `ai_generate`, `ai_generate_image`, `ai_generate_reel_script`, `generate_reel_download`, `pause`, `resume`, `delete`, `sync_metrics`, `get_sources`, `mensaje_sugerido` | ADAPTAR | Dividir en módulos; token y cuenta por conexión; **reglas Meta v22 ya resueltas** (ver `knowledge/meta-publicacion-idempotencia-y-ads.md`) |
| `api/agente/*` (whatsapp 73, contexto 26, agente 48) + `lib/agente/*` (gerentes, herramientas, turno) | Super Agente por WhatsApp con lista blanca, topes diario y mensual, 14 herramientas | ADAPTAR | Es la base del **asistente del dueño** de cada cliente («pregúntale a AiUDA»); las herramientas cambian a las de AiUDA (plan, piezas, anuncios, bandeja) |
| `api/meta/firma` (77) | Valida `X-Hub-Signature-256` sin ser oráculo | PORTAR | Se usa en el webhook de Meta propio (no depender de n8n para la firma) |
| `lib/meta-diario.ts`, `meta-pagina.ts`, `api/cron/anuncios` | Foto diaria de métricas de anuncios | PORTAR | Por conexión |
| `lib/glosario.ts` (960, 146 términos) + `lecturas*.ts` + `fuente-dato.ts` | Ayuda de cada término, lecturas automáticas, fuente del dato | PORTAR la **infraestructura** (`<Ayuda>`, `<Lecturas>`, `fuente-dato`); el contenido se reescribe para AiUDA | Regla A/B/C/F |
| `lib/marketing/base-anuncio.ts` (94), `piezas.ts` (75) | Fuentes de anuncio, biblioteca de piezas | PORTAR | Fuente = catálogo de la marca |
| `vercel.json` crons diarios | Cron diario | DESCARTAR | Se reemplaza (ver `06` R-3: Vercel Hobby solo permite cron diario) |

## C. crm-321 · Tablas (SQL)
| Origen | Tablas | Destino |
|---|---|---|
| 022, 031 | `publicaciones_programadas`, `contenido_reglas` | `piezas`, `publicaciones` (002, hecho), `reglas_contenido` |
| 032 | `marketing_competidores`, `marketing_metricas`, `marketing_planes` | `competidores`, `metricas_cuenta`, `planes_mes` |
| 023, 026, 027, 033 | `campanas_meta`, `ad_sets`, `ads_meta`, `adsboom_planes` | `ads_campanas`, `ads_conjuntos`, `ads_anuncios`, `ads_planes` |
| 041 | `meta_diario` | `ads_diario` |
| 050 | `landings`, `landings_metricas` | `landings`, `landings_metricas` |
| 053 | `animaciones` | `animaciones` |
| 011 | `publicaciones_postpro` (histórico) | se absorbe en `publicaciones` |
Todas con `org_id` + `marca_id` + RLS + `CHECK` de estados (la auditoría: «no hay CHECK de estados en la base de datos»).

## D. postpro-321 · Motor (Python/FastAPI, `motor/`)
> **Nota de la prueba ácida:** en la etapa gratuita **no hay Railway ni Python**. Todo lo que dice «PORTAR» aquí se **porta a TypeScript** (la lógica, las skills y los prompts son la referencia; el lenguaje cambia). La generación larga se hace con trabajos asíncronos (`09` §3).
| Archivo (líneas) | Qué hace | Trato | Cambios obligatorios |
|---|---|---|---|
| `motor.py` (341) | Ciclo `procesar()`: expandir reglas, lanzamientos, tomar piezas, generar, estados | PORTAR | `org_id`/`marca_id`; cola con `SKIP LOCKED` (no `threading.Lock` global: dos réplicas se pisarían); zona horaria por organización |
| `director.py` (281) | Métricas (Business Discovery), tendencias (web search), informe, Plan del Mes | PORTAR | `IG_BUSINESS_ID` y `IG_PROPIO` (valores de 321 en el código) → por marca; `GRAPH` v22.0 fijo → constante única; **OpenAI → router de IA**; tendencias con búsqueda web vía adaptador por proveedor |
| `redaccion.py` (88) | Caption, hashtags, portada, prompt visual, guion UGC | PORTAR | `LINEAS`, `WHATSAPP`, voz de Byron → Brand Kit de la marca; **OpenAI → router**; el revisor de frases prohibidas sigue siendo **código determinista**, no LLM |
| `skills.py` (56) + `skills/*.md` (9) | Carga skills por tipo de pieza; lista `PROHIBIDAS`; corrección | PORTAR | Skills **por organización** (default global editable): `hooks`, `caption`, `carrusel`, `reel`, `historia`, `anuncios-meta`, `segmentacion-meta`, `diseno-piezas`, `voz-y-reglas`. `voz-y-reglas` se genera desde el Brand Kit |
| `piezas.py` (195) | Composición con Pillow (portada, lámina, cierre WhatsApp, historia) | ADAPTAR | `NARANJA`, `PIE_MARCA`, `WHATSAPP_VISIBLE` → Brand Kit. Evaluar reemplazo por el motor vectorial TS (mismo resultado, un solo sistema de diseño) — decisión D-6 |
| `higgsfield.py` (152) | Imagen/video/UGC con CLI de Higgsfield usando créditos del plan personal; Soul y avatar fijos de Byron | ADAPTAR | **No es multicliente**: usa una cuenta personal y personajes de Byron. Ver riesgo R-1 y `03-motor-ia.md` §5 |
| `adsboom.py` (279) | Plan de anuncios con IA, enrutador de costos, creativos | PORTAR | OpenAI → router; `COSTOS` desde ledger; límite 70 % de créditos |
| `lanzamientos.py` (90) | Detecta fichas nuevas y propone reel/carrusel/historia | ADAPTAR | «Evento de la marca» (producto nuevo, promo, fecha) |
| `api.py` (88) | `/procesar`, `/estado`, `/director/*`, `/adsboom/*`, `/render` con `x-motor-secret` | PORTAR | Autenticación por servicio; límites por organización |
| `supabase_rest.py` (56) | Cliente REST | PORTAR | Solo service role dentro del motor |
| `main.py`, `ai_generator.py`, `pdf_generator.py`, `image_generator.py`, `story_generator.py`, `carousel_generator.py`, `tts_generator.py`, `video_generator.py`, `templates/`, `static/`, `video/` (Remotion), `legacy/bot-python-polling/`, `ref_page_*.png`, `*.bat` | Generador antiguo, sin autenticación y sin uso | DESCARTAR | No se copia nada |

## E. postpro-321 · Workflows de n8n (`n8n/workflows/`)
> **Nota de la prueba ácida:** sin n8n en la etapa gratuita. Estos workflows son **referencia de lógica**; se reemplazan por `pg_cron` + endpoints y código propio. «PORTAR/ADAPTAR» significa reescribir esa lógica en TypeScript, no desplegar n8n.
| Workflow (nodos) | Trato | Notas |
|---|---|---|
| `321-contenido-ia-motor` (3), `321-marketing-ia-director` (6), `321-post-pro-publicar-programadas` (2), `321-inmo-alertas-de-error` (3) | PORTAR como **plantillas por organización** o reemplazar por cola propia | Secreto del publicador en la URL → header; error workflow obligatorio |
| `321-inmo-webhooks-redes` (14) | ADAPTAR | Verificación GET/POST de Meta, normalización de eventos, respuesta con IA, chequeo diario de token y de actividad 72 h → **base del AiUDA Inbox para comentarios/DMs**; sustituir OpenAI por router; la firma se valida con la ruta portada de `api/meta/firma` |
| `321-iagente-inmo-v2` (85) / `…chatwoot-crm-v1` (80) | ADAPTAR | Debounce, transcripción de audio, visión de imagen, memoria en Postgres, etiqueta/nota de escalamiento a humano, registro. Hoy lee catálogos de Google Sheets de 321 → leer la **base de conocimiento de la marca** (ficha) |
| `321-seguimiento-automatico-v5-2` / `v6` (21/30), `321-mensaje-manual-crm-v4` (19), `321-keep-alive-whatsapp-byron` (4) | ADAPTAR (fase posterior) | Seguimiento perpetuo con ventana de 24 h, plantillas WhatsApp, «Supervisor IA» que aprueba mensajes. Útil para Inbox/leads |
**Decisión de arquitectura pendiente (D-7):** si Inbox corre en n8n (más rápido de portar) o en código propio (más control y pruebas). Recomendación en `06`.

## F. Defectos conocidos que se corrigen al portar (auditoría crm-321 §11)
1) Duplicados IG+FB con reintentos → una fila por plataforma + idempotencia. 2) Piezas en `publicando` para siempre → lease. 3) Secreto en la URL del nodo n8n y sin error workflow. 4) Endpoints legacy abiertos que gastan OpenAI → descartados. 5) Ningún RBAC → roles. 6) Creación en Meta dependiente del navegador → job de servidor. 7) `aprobar_plan` no atómico. 8) Estados huérfanos `generando` / `generando_plan` / `publicando` sin salida. 9) Tarjeta «Por aprobar» no mostraba `error`. 10) `regenerar` exigía `origen='ia'` (piezas manuales sin reintento).

## G. Valores de 321 escritos en el código origen (pasan a datos)
`"321 Negocios Inmobiliario"`, voz de Byron, `wa.me/593963970078` y «WhatsApp 096 397 0078», `IG_BUSINESS_ID` (17841445688986577) e `IG_PROPIO` (tresdosuno.inmo), Soul y avatar «Byron» (IDs), color `NARANJA (232,121,43)`, `PIE_MARCA`, `LINEAS` (inmobiliario/cargotectura/marca_personal), `FUENTES_POR_LINEA`, `ECUADOR` (UTC-5), bucket `ai-generated-ads`, modelos `gpt-4.1` / `gpt-4.1-mini`, un único `META_INSIGHTS_TOKEN` / `META_PAGE_ACCESS_TOKEN` / `META_AD_ACCOUNT_ID`, Graph `v22.0` repetido en varios archivos.
