# Repos evaluados

Datos de la búsqueda del 2026-10-21 (estrellas aproximadas). Solo se leyeron README y archivos de convenciones; **ninguno se ejecutó** ni se probó con una cuenta real.

## Asistentes tipo Jarvis (voz/escritorio)
| Repo | ⭐ | Notas |
|---|---|---|
| Priler/jarvis | ~3000 | Asistente de voz offline en Rust/Tauri. |
| isair/jarvis | ~2100 | Python, local-first (Ollama, Whisper), memoria, MCP. Convenciones útiles: specs junto al código, TDD, Conventional Commits, privacidad primero. |
| ethanplusai/jarvis | ~900 | Voz para Claude Code en macOS; corre `claude -p`; usa suscripción sin API key; **taint gate** y límites de seguridad web. Licencia no comercial. |
| Otros (GauravSingh9356, kishanrajput23, AlexandreSajus, llm-guy...) | | Asistentes de voz de juguete; solo "abren Instagram". No son gestores. |

Ninguno se conecta a Instagram. Sirven como cerebro/voz y como referencia de arquitectura y seguridad.

## MCP de Instagram / Meta (métricas y gestión)
| Repo | Fortaleza | Debilidad |
|---|---|---|
| **IvanBBaev/instagram-mcp** (TS, 29 tools) | Solo API oficial; **preview por defecto**, diario de escrituras, paquetes por perfil, doctor, límites y errores documentados; ambas rutas de login | No probado en cuenta real (su propio README lo admite) |
| **William-Gao/instagram-mcp** (Py, ~25 tools) | Instagram Login sin Página de FB; verificado en cuenta real; publica reels/carruseles/trial reels; renovación de token | Sin puerta de escritura: publica de inmediato; hashtags/discovery requieren token de FB |
| **oliverames/meta-mcp-server** (TS, 199 tools) | Cobertura total: Pages, Instagram, Threads, Ads, Commerce, CAPI, Insights, Ad Library | Graph v21; **sin confirmación para escrituras**; mucha superficie |
| armavita-meta-ads-mcp | Meta Marketing API (anuncios) en Rust | Solo ads |
| AleemHaider/instagram-mcp, BilalTariq01/instagram-analytics-mcp, arjun1194/insta-mcp | Variantes pequeñas (24 tools / solo analítica) | Pocas estrellas, sin revisar |

Elección por defecto: **IvanBBaev** si prima la seguridad; **William-Gao** si no hay Página de Facebook; **oliverames** si hace falta Ads/Threads (agregando una puerta de confirmación por encima). Antes de dar un token a cualquiera: **leer el código**.

En esta sesión de Claude Code también existe el MCP oficial de **Facebook Ads** (herramientas `ads_*`, incluye cuentas IG y media), útil sin instalar nada.

## Publicación y gestión multi-red
- **trypostit/trypost** (PHP/Laravel, AGPL-3.0, autoalojable): programador con **80+ herramientas MCP + REST**, colas con franjas, aprobaciones, analítica, webhooks, workspaces por cliente. Publica con las APIs oficiales. Patrones útiles: una única regla de aprobación, colas sin doble reserva, OAuth con confirmación de identidad. Nada documentado sobre límites de Instagram.
- **social-media-skills/skills** (MIT, 106 skills): flujo completo Fundación -> Plan -> Crear -> Medios -> Publicar -> Crecer -> Medir. Instalación: `npx skills add social-media-skills/skills -g -a claude-code -s '*' -y` o marketplace de plugins de Claude Code. Conjunto inicial recomendado: brand-profile, voice-builder, audience-research, content-pillars, content-calendar, hook-writer, caption-writer, short-form-video-script, cross-platform-repurposing, engagement-routine, platform-specs-and-validation, scheduling-and-queue. Publica vía WoopSocial (MCP/API: valida y publica de forma atómica, sin endpoint de edición: editar = borrar y recrear mientras esté `NOT_STARTED`).
- **Klaudiusz321/social-media-agents** (Py): orquestador multiagente (tendencias -> contenido -> programación). Rescatable: dry-run, revisión humana, topes diarios, JSON de lineamientos de marca, moderador. **Antipatrón:** ruta con usuario/contraseña de Instagram.
- **abozaralizadeh/aismm**, **AshmithaRajadurai/agentic-ai-social-media-manager** (n8n + Gemini + Graph API): ejemplos pequeños de agente que genera y publica.

## Investigación
- **ScrapeCreators/social-media-research-skills** (skills con API de pago): outliers, minería de comentarios, teardown de competencia, biblioteca de anuncios. Principios: solo datos públicos, citar fuentes, comparar contra la línea base, conservar el lenguaje textual, terminar con acciones. Es scraping de terceros: tener en cuenta términos y privacidad.
- mvanhorn/last30days-skill, nashsu/autocli-skill, OpenCreator: herramientas generales de investigación/edición; sin revisar a fondo.

## Arquitectura sugerida (no implementada)
1. Cerebro: Claude (o un Jarvis de voz) con las reglas de este repo en `CLAUDE.md`.
2. Instagram: un MCP de la tabla de arriba con puerta de confirmación.
3. Cola/publicación: TryPost o WoopSocial, o el propio MCP de Instagram.
4. Automatización de DMs: ManyChat (ver `syk-manychat.md`); n8n está conectado a la sesión para orquestar.
5. Investigación opcional: ScrapeCreators (datos públicos).
