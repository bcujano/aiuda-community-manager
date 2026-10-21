# AIUDA Community Manager — Plan maestro

> Fecha: 2026-10-21 · Estado: **PLAN (sin ejecutar)** · Fuente base: `bcujano/crm-321` (módulo Marketing iA) + `bcujano/postpro-321` (motor Python).

## 1. Qué es el producto

**AIUDA CM**: un community manager con IA, 100 % automático y multi-cliente (SaaS). Planifica el mes, crea las piezas (post, carrusel, reel, story, UGC con avatar), las publica, responde comentarios y DMs, mide resultados y reajusta el plan solo. El humano solo aprueba, y puede desactivar la aprobación.

**Cliente objetivo (cabeza de playa):** pymes de LATAM y España con presencia en Instagram/Facebook/TikTok que no pueden pagar una agencia (USD 300–1.500/mes). Primer nicho vertical: **inmobiliarias y constructoras**, porque crm-321 ya resolvió ese caso con datos reales (fichas, fotos, lanzamientos). Después: restaurantes, clínicas y retail.

**Posicionamiento:** no es "una herramienta para programar posts" (Buffer, Metricool, Hootsuite). Es **el empleado completo**: estrategia + producción + publicación + comunidad + reporte. Precio de software, resultado de agencia.

## 2. Qué tomamos de crm-321 (ya funciona en producción)

| Pieza existente | Dónde vive | Qué hacemos |
|---|---|---|
| Director de marketing: plan mensual con métricas propias, competencia (Business Discovery) y tendencias → JSON de piezas validado | `postpro-321/motor/director` + `sql/032` + `EstrategiaPanel.tsx` | **Reusar** y generalizar por marca (hoy está fijo a 321) |
| Cola única con máquina de estados `propuesta → por_generar → generando → por_aprobar → pendiente → publicando → publicado` | `sql/022`, `031` · `api/contenido-ia` | **Reusar** y agregar `tenant_id` + `CHECK` de estados |
| Motor de generación: redacción con skills + revisor de frases prohibidas, imágenes (nano banana, Soul), video (kling → veo → seedance), UGC avatar, láminas Pillow | `postpro-321/motor/*` | **Reusar**; el "Soul/avatar Byron" pasa a ser un **Brand Kit por cliente** |
| Reglas recurrentes y lanzamientos automáticos | `contenido_reglas`, `lanzamientos.py` | **Reusar**; "ficha nueva" pasa a ser "evento del cliente" (producto, promo, fecha) |
| Publicador IG/FB Graph v22 | `api/post-pro/schedule` | **Reescribir** como worker idempotente (ver riesgos) |
| AdsBoom: plan de anuncios → creativos → campaña en Meta en pausa | `api/adsboom`, `sql/026/027/033` | **Fase 2** como add-on de pago |
| Reglas de producto A–D (ayuda en cada término, lecturas automáticas, ningún número lo escribe un LLM) | `CLAUDE.md` | **Adoptar tal cual**: son diferenciador de confianza |

### Lo que la auditoría interna (docs/08 §11) marca como roto y hay que corregir antes de vender
1. Duplicados al publicar IG+FB con reintentos → **clave de idempotencia por plataforma**.
2. Piezas colgadas en `publicando` → **lease con expiración** + reintento.
3. Secreto en la URL del nodo n8n, sin error workflow → secretos en header, alertas.
4. `main.py` legacy sin autenticación gasta OpenAI → **eliminar**.
5. Ninguna ruta revisa rol → **RBAC** (owner / editor / aprobador / solo lectura).
6. `aprobar_plan` no atómico → transacción + compare-and-set.
7. Todo es mono-empresa (IDs de Byron en código, Supabase gratis) → **multi-tenant con RLS**.

## 3. Lo que falta para ser "100 % automático" y ganador

1. **Onboarding en 10 minutos:** conectar Meta/TikTok (OAuth), pegar web → la IA extrae Brand Kit (tono, colores, logo, productos, público) y propone el primer mes. *Momento "wow" antes de pagar.*
2. **Community management real:** bandeja unificada de comentarios y DMs; la IA responde con la base de conocimiento de la marca, escala lo sensible, captura leads (aquí reusamos el agente de WhatsApp del CRM).
3. **Bucle de aprendizaje:** cada semana compara rendimiento por formato/hook/hora y ajusta el plan (bandit simple). Ningún número inventado (regla C).
4. **TikTok + LinkedIn + Google Business Profile** además de IG/FB.
5. **Modo agencia (white-label):** una agencia gestiona 20 marcas → canal de distribución.
6. **Facturación (Stripe), límites por plan, medición de créditos de IA por cliente** (margen controlado).

## 4. Negocio SaaS

**Precios (hipótesis a validar con 20 entrevistas):**

| Plan | USD/mes | Incluye |
|---|---|---|
| Starter | 49 | 1 marca, 2 redes, 12 piezas/mes, respuestas IA |
| Pro | 149 | 1 marca, 4 redes, 30 piezas, reels con IA, avatar UGC, bandeja completa |
| Agency | 399 | 10 marcas, white-label, aprobación del cliente |
| Add-on Ads | 10 % del gasto (mín. 49) | AdsBoom |

**Economía unitaria objetivo:** costo de IA+infra ≤ 20 % del precio (margen bruto ≥ 75 %); CAC recuperado en < 6 meses; churn mensual < 4 %; NRR > 100 % con add-ons. Hoy el costo variable medido en crm-321 es ~USD 3–8/mes + créditos Higgsfield fijos → hay que medir el costo por pieza y limitarlo por plan.

**Métricas que vamos a mostrar (y que pide un evaluador de startup visa):** MRR, clientes de pago, churn, CAC, LTV, margen bruto, piezas publicadas, horas ahorradas por cliente.

**Go-to-market:** (1) 321 Soluciones como cliente cero y caso de estudio con números reales; (2) 10 inmobiliarias de Ecuador gratis 60 días → testimonios; (3) contenido propio generado *por el producto* (dogfooding); (4) programa para agencias; (5) Meta Tech Provider + marketplace de apps.

## 5. Startup visa — dónde aplicar

| País | Requisito clave | Encaje |
|---|---|---|
| **España** (Ley 28/2022 de Startups) | Informe favorable de **ENISA** sobre carácter innovador y escalable; empresa < 5 años; medios económicos; 3 años renovable | **Recomendado**: idioma, mercado hispano, puente a LATAM, sin inversión mínima fija |
| Portugal (StartUP Visa) | Aceptación por **incubadora certificada** IAPMEI | Buena alternativa, barata |
| Canadá (Start-up Visa) | Carta de apoyo de entidad designada; el programa tuvo cupos/pausas recientes | Verificar estado actual en IRCC antes de invertir tiempo |

**Lo que ENISA evalúa y cómo lo cubrimos:**
- *Innovación:* motor propio de decisión (director + bucle de aprendizaje + reglas anti-alucinación de números). Documentar arquitectura y propiedad intelectual (registro de software y marca en OEPM).
- *Escalabilidad:* SaaS multi-tenant, multi-idioma, mercado hispano de ~30 M de pymes.
- *Equipo:* perfil del fundador + asesores; plan de contratación en España.
- *Tracción:* MRR, clientes, cartas de intención. **Es lo que más pesa: hay que llegar con clientes de pago.**
- *Plan de negocio:* 3–5 años, financiero, sede y empleo en España.

Entregables para la solicitud (los preparamos en Fase 4): plan de negocio, modelo financiero, pitch deck, demo en vivo, métricas reales, LOIs, registro de marca.

> Verificar cifras de medios económicos y plazos en fuentes oficiales (ENISA, consulado, IAPMEI, IRCC): las fuentes consultadas no coinciden.

## 6. Arquitectura objetivo

- **Front + API:** Next.js (como crm-321) en Vercel, multi-tenant por `organization_id`.
- **DB:** Supabase plan Pro, RLS por organización (el plan gratis ya se cayó por Disk IO).
- **Motor:** el FastAPI de postpro-321, limpio de legacy, con cola real (tabla + `SELECT … FOR UPDATE SKIP LOCKED` o Inngest/Trigger.dev) en vez de n8n cada 2 min.
- **IA:** Claude para estrategia/redacción/respuestas; generadores de imagen/video intercambiables detrás de una interfaz (`proveedor_imagen`, `proveedor_video`) con contador de costo.
- **Integraciones:** Meta Graph (IG/FB), TikTok Content Posting API, LinkedIn, Google Business, WhatsApp Cloud API, Stripe.
- **Observabilidad:** Sentry, logs estructurados, alertas por pieza fallida.

## 7. Fases (planificar → ejecutar → lanzar → optimizar → relanzar)

| Fase | Semanas | Resultado | Criterio de salida |
|---|---|---|---|
| **0. Base** | 1 | Repo nuevo, Next.js + Supabase multi-tenant, auth, RBAC, Stripe en modo prueba | Dos organizaciones aisladas con RLS probada |
| **1. Núcleo IA** | 2–4 | Port del director, cola, motor y publicador idempotente; Brand Kit; onboarding por URL | 321 Soluciones migrada y publicando sola 2 semanas sin duplicados |
| **2. Community** | 5–6 | Bandeja de comentarios/DMs con respuestas IA y escalamiento; reportes con lecturas | 90 % de comentarios respondidos < 15 min |
| **3. Beta privada** | 7–10 | 10–20 clientes, TikTok, bucle de aprendizaje, precios activos | ≥ 5 clientes de pago, churn medido |
| **4. Lanzamiento + visa** | 11–14 | Lanzamiento público (Product Hunt, LATAM), modo agencia, dossier ENISA | Solicitud ENISA enviada con tracción real |
| **5. Optimizar y relanzar** | continuo | Ads add-on, nuevos verticales, más idiomas | MRR creciendo mes a mes |

## 8. Decisiones que necesito de Byron antes de ejecutar

1. **Nombre y dominio:** ¿"AIUDA" definitivo? (revisar marca disponible en OEPM/EUIPO).
2. **País de visa:** España (recomendado) vs Portugal vs Canadá.
3. **Código:** ¿extraemos el módulo de crm-321 a este repo (recomendado: producto limpio y vendible, propiedad intelectual separada de 321) o lo dejamos dentro del CRM?
4. **Acceso a `bcujano/postpro-321`** (el motor) para portarlo.
5. **Cuentas:** Supabase Pro, Stripe, Meta App (revisión de app para publicar en cuentas de terceros: tarda semanas, hay que empezar ya).

## Fuentes consultadas
- https://www.migrate.es/visas/entrepreneur-startup-visa/
- https://relovisa.co/startup-visa-in-spain
- https://www.frenchtechbarcelona.com/en/guides/entrepreneur-visa-spain-2026
- https://startupvisa.barcelona/startup-visa/saas-founders
- https://www.apextax.co/spain/knowledge-hub/spain-startup-visa
- https://www.startupblink.com/blog/best-startup-visa-and-relocation-programs/

---

## 9. Decisiones aprobadas por Byron (2026-10-21) — mandan sobre lo anterior

1. **Marca:** AiUDA es la marca madre; cada especialidad con nombre propio (`docs/MARCA.md`, propuestas A/B/C; recomendada A: AiUDA Social, Ads, Inbox, Studio, Insights, Setup, Agency).
2. **Visas:** se persiguen **todas las rutas reales** (EE. UU., Canadá, España, Portugal) → `docs/knowledge/visas-startup.md`. Hallazgos clave: E-2 cerrada para Ecuador; Start-Up Visa de Canadá pausada desde 2026; España (ENISA) y Portugal (D2/StartUp Visa) son las rutas más viables a corto plazo; O-1A para EE. UU.
3. **Código:** crm-321 y postpro-321 son **referencia de solo lectura**; se copia y mejora aquí. No se mueve ni edita nada allá.
4. **Base de datos:** Supabase gratuito que ya tiene AiUDA (cuidar Disk IO y Storage; sin binarios en tablas).
5. **Alcance ampliado:**
   - **AiUDA Ads automático** (Meta + TikTok + Google): plan, creación en pausa, reglas con topes, informes. Ver `knowledge/ads-meta-tiktok-google.md`.
   - **Diagnóstico y setup personalizado** por cliente/negocio: `knowledge/onboarding-diagnostico.md`.
   - **Inbox:** respuestas automáticas a comentarios y DMs con escalamiento: `knowledge/dms-comentarios-objeciones.md`.
   - **Conexión por API a todo** (administrador de anuncios, mensajes, comentarios, insights).
   - **Todo Marketing iA de crm-321 se incluye** (mapa en `knowledge/repos-reference.md`) y se mejora.
   - **UI/UX de vanguardia:** `knowledge/ui-ux-referencias.md`.
6. **Conocimiento persistente:** `CLAUDE.md` en la raíz + `docs/knowledge/` (9 archivos).

## 10. Fases actualizadas (optimizando recursos)
- **Fase 0 (semana 1):** repo Next.js + Supabase gratuito con `org_id`+RLS; auth; **iniciar App Review de Meta, scope review de TikTok y developer token de Google** (son los trámites más lentos); registrar marca.
- **Fase 1 (sem 2–4):** portar Director + cola + publicador idempotente (copia adaptada); Brand Kit; alta por URL + diagnóstico (AiUDA Setup).
- **Fase 2 (sem 5–7):** Inbox (comentarios/DMs) + Insights con Lecturas.
- **Fase 3 (sem 8–11):** AiUDA Ads (Meta primero; luego TikTok y Google) con reglas y topes; beta con clientes.
- **Fase 4 (sem 12–15):** lanzamiento, modo agencia, dossier de visa con métricas reales.
- Principio de recursos: una sola pasada por tarea, modelos pequeños donde alcancen, caché de IA, lotes en Supabase, colas en vez de sondeos frecuentes.

## 11. Pendientes que bloquean ejecución
1. Confirmar nombre de la línea (A/B/C) y búsqueda de marca/dominio.
2. Acceso de **lectura** a `bcujano/postpro-321` (hoy no está en el alcance de la sesión).
3. Credenciales del Supabase de AiUDA (URL y claves) por variables de entorno; nunca en el repo.
4. Nacionalidad/residencia del fundador para afinar la ruta de visa.

## 12. Stack y datos de la empresa (confirmado 2026-10-21)
- **Empresa:** Tres Dos Uno Soluciones Inmobiliarias S.A.S. · **Dominio:** aiuda.emprendimientum.com · **Contacto:** contacto@321archlab.com (nota: el correo está en otro dominio que el sitio; Meta/Google lo aceptan, pero un correo @emprendimientum.com se ve más sólido para la revisión).
- **Plataformas:** Vercel (web/API) · Supabase gratuito (datos/auth/storage) · GitHub (`main` única) · Railway (motor Python, n8n, Chatwoot si se autoaloja) · n8n (orquestación) · Chatwoot (bandeja) · Anthropic, OpenAI y Gemini (IA).
- **Reparto de modelos (hipótesis, medir costo por pieza):** Claude → estrategia, redacción de marca y respuestas (calidad/seguridad); Gemini → visión, imágenes y tareas masivas baratas; OpenAI → imagen/voz donde rinda mejor. Interfaz de proveedor intercambiable; todo costo se registra por pieza.
- **AiUDA Inbox sobre Chatwoot:** Chatwoot aporta bandeja, canales (IG, FB, WhatsApp, web), asignación humana y etiquetas; AiUDA aporta el agente IA con reglas, base de conocimiento y escalamiento. A validar: límites de RAM de Railway y que el canal de Instagram de Chatwoot use la misma app de Meta (una sola App Review).
- **Riesgo de recursos:** Railway + n8n + Chatwoot (Rails + Redis + Postgres) pesan; empezar con Chatwoot en la nube de Chatwoot o diferirlo a Fase 2 para no gastar créditos antes de tener clientes.
- **Hecho:** sitio base en Next.js con `/privacidad`, `/terminos`, `/eliminacion-de-datos` y `/api/salud` (compila). Falta desplegar en Vercel con el dominio.
