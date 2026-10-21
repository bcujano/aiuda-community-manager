# Repos de referencia

> **Regla:** repos ajenos = solo lectura. Se copia y adapta a este repo; nunca se edita el original.

## Propios (Byron)
| Repo | Qué es | Qué tomar |
|---|---|---|
| `bcujano/crm-321` | CRM inmobiliario (Next.js 16 + Supabase). Módulo Marketing iA completo | Pantallas `src/app/marketing-ia/*` (Estrategia, Calendario, DetallePieza, FormContenido, AdsBoom*), APIs `api/contenido-ia`, `api/marketing-ia/estrategia`, `api/post-pro/*`, `api/adsboom`, `api/ads-manager`; SQL `022, 023, 026, 027, 031, 032, 033, 041`; `lib/marketing/*`, glosario/ayudas, `Lecturas`; auditoría `docs/08-mapa-del-sistema/03-marketing-ia-motor-publicidad.md` (§11 riesgos); agente WhatsApp (`api/agente/*`) para el Inbox |
| `bcujano/postpro-321` | Motor Python (FastAPI, Railway): director, redacción con skills, generación imagen/video, publicador, AdsBoom | `motor/*` y `motor/skills/*.md` (solo lectura; **acceso pendiente de confirmar**) |

## Mapa del módulo Marketing de crm-321 → destino en AiUDA
| Origen | Destino AiUDA | Mejora obligatoria |
|---|---|---|
| Director (plan mensual) | AiUDA Social | Multi-marca (Brand Kit), no fijo a 321 |
| Cola `publicaciones_programadas` | AiUDA Social | `org_id`, `CHECK` de estados, lease, idempotencia por plataforma |
| Motor de generación | AiUDA Studio | Proveedores intercambiables + contador de costo por pieza |
| AdsBoom / Ads Manager | AiUDA Ads | + TikTok y Google; reglas automáticas con topes |
| Estrategia/Competencia/Informe | AiUDA Insights | Lecturas automáticas con fuente de dato |
| Agente WhatsApp | AiUDA Inbox | + comentarios y DMs IG/FB/TikTok |
| Landings/Academy/Ebooks | Fase posterior (add-on) | Solo si aporta al cliente |

## Externos sugeridos (a evaluar, solo lectura/uso como dependencia)
- UI: shadcn/ui, Tremor (gráficas/KPI), Shadcn Admin (plantilla de dashboard), Next Forge (base SaaS). Ver `ui-ux-referencias.md`.
- Automatización/colas: n8n (ya usado), Inngest o Trigger.dev (colas durables).
- Pendiente de buscar: repos de referencia de inbox/CRM social, motores de reglas de ads y generación de video.
