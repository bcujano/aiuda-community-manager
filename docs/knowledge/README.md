# Base de conocimiento: índice

Fuentes consolidadas el 2026-10-21:

- **Biblioteca SYK** (índice en Google Docs + 17 documentos enlazados leídos). Resumida con palabras propias; ver nota de propiedad abajo.
- **Repos de GitHub** revisados vía README/AGENTS.md/CLAUDE.md: ver `repos-reference.md`.

| Archivo | Contenido |
|---|---|
| `instagram-api-rules.md` | Graph API: auth, tokens, permisos, límites, errores, publicación, insights |
| `agent-safety-rules.md` | Contrato de confirmación, puertas de escritura, inyección, taint gate |
| `repos-reference.md` | Qué hace cada repo y qué patrón reutilizar |
| `agent-safety-saas-rules.md` | Reglas SaaS: topes de gasto, campañas en pausa, mínimo privilegio, kill switch, privacidad |
| `meta-publicacion-idempotencia-y-ads.md` | Lecciones de crm-321: idempotencia por plataforma, lease, notas de anuncios Graph v22 |
| `crm-321-mapa-de-migracion.md` | Qué copiar del módulo Marketing de crm-321 y adónde va en AiUDA |
| `contenido-viral.md` | Qué hace viral el contenido por plataforma (hipótesis a validar) |
| `dms-comentarios-objeciones.md` | Respuestas automáticas, escalamiento y objeciones (AiUDA Inbox) |
| `ads-meta-tiktok-google.md` | Anuncios Meta/TikTok/Google y método de planes ganadores |
| `onboarding-diagnostico.md` | Alta en 10 min y ficha completa del negocio (AiUDA Setup) |
| `ui-ux-referencias.md` | UI/UX de vanguardia y librerías |
| `visas-startup.md` | Rutas de visa EE. UU., Canadá, España y Portugal |
| `syk-content-playbook.md` | Perfil, bio, guiones, calendarios, stories, nicho, formatos |
| `syk-dm-prospeccion-objeciones.md` | Conversación por DM -> llamada -> cierre y objeciones |
| `syk-manychat.md` | SOP del flujo de setting automatizado |
| `syk-meta-ads.md` | Campañas TOFU/MOFU/BOFU, presupuesto y escala |
| `syk-finanzas-y-herramientas-ia.md` | Métricas financieras y stack de IA para contenido |

## Nota de propiedad y privacidad

El material SYK ("Sell Your Knowledge") es contenido de curso de pago. Este repo es público, por eso aquí solo hay **resúmenes de reglas con palabras propias**. No están los prompts originales completos, ni los enlaces de Loom/Wistia/Drive. Para guardarlos literal hay que usar un repo privado o la propia biblioteca de Google Drive: `SYK_Biblioteca_v6_Indice`.

## Huecos conocidos

- No se pudo leer el documento **Operaciones** (ID mal copiado) ni la **Calculadora de Orgánico** (planilla no encontrada o sin acceso).
- Imágenes no extraídas: ejemplo de conversación en *Manychat + Claude*, embudo y resultados en *Finanzas*.
- Los videos (Loom/Wistia/YouTube) y los posts de Instagram de "casos de éxito" **no se vieron**: solo el índice los enlaza.
- Ningún repo se probó contra una cuenta real de Instagram (el MCP de IvanBBaev declara no haberlo hecho tampoco).
- Conflictos entre fuentes: cuota de publicación (100 vs 50 por 24 h) y versión de Graph API (v21, v23, v25). Ver `instagram-api-rules.md`.

## Huecos de la fase SaaS (añadidos 2026-10-21)
- Google Ads API: niveles del developer token; TikTok: auditoría de Content Posting API; LinkedIn, Google Business Profile y WhatsApp Cloud API sin investigar.
- Skills del motor (`postpro-321/motor/skills`): acceso pendiente (solo lectura).
- Visas: cifras y reglas por confirmar en fuentes oficiales y con abogado.
- Los archivos de la fase SaaS marcan ✅ (visto en producción) / ⚠️ (por verificar). Si chocan con `instagram-api-rules.md`, **manda este último** (más detallado) y se corrige el otro.
