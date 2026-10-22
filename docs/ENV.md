# Variables de entorno (Vercel)

Se agregan en **Vercel → Project → Settings → Environment Variables** (Production + Preview). **Nunca** pegues valores en el chat, el repo ni logs. Plantilla sin valores: `.env.example`.

Regla: las que empiezan por `NEXT_PUBLIC_` llegan al navegador (solo URLs y claves públicas). Todo lo demás es secreto de servidor.

## Ahora (Fase 0 — mínimas para arrancar)
| Variable | De dónde sale | Notas |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API (anon/publishable) | Pública; la protege RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API (service_role) | **Secreta**, solo servidor; salta RLS |
| `NEXT_PUBLIC_APP_URL` | Tu dominio (p. ej. `https://app.…`) | Para callbacks OAuth |
| `APP_ENCRYPTION_KEY` | Genérala: `openssl rand -base64 32` | Cifra los tokens de redes en la base. **Si se pierde, hay que reconectar todas las cuentas** |
| `CRON_SECRET` | Genérala: `openssl rand -hex 32` | Protege los cron (publicador, métricas). Viaja en header `Authorization`, nunca en la URL |
| `ANTHROPIC_API_KEY` | console.anthropic.com | Estrategia, redacción y respuestas |

## Con Meta (cuando exista la app en developers.facebook.com)
| Variable | Notas |
|---|---|
| `META_APP_ID` · `META_APP_SECRET` | Panel de la app → Configuración básica. Secreta |
| `META_GRAPH_VERSION` | Una sola constante (p. ej. `v22.0`); verificar la vigente |
| `META_WEBHOOK_VERIFY_TOKEN` | Texto largo aleatorio que tú inventas; Meta lo usa para validar el webhook |
| `META_CONFIG_ID` | Solo si se usa Facebook Login for Business |

## Instagram (Instagram Login, ruta A)
`INSTAGRAM_APP_ID` · `INSTAGRAM_APP_SECRET`: en la app de Meta → producto Instagram → «API setup with Instagram login» (son distintos del App ID de Facebook). Redirect URI a registrar allí: `<NEXT_PUBLIC_APP_URL>/api/conexiones/instagram/callback`.

## Con TikTok
`TIKTOK_CLIENT_KEY` · `TIKTOK_CLIENT_SECRET` (Content Posting/Login) · `TIKTOK_ADS_APP_ID` · `TIKTOK_ADS_SECRET` (Marketing API).

## Con Google
`GOOGLE_CLIENT_ID` · `GOOGLE_CLIENT_SECRET` (OAuth, Business Profile, Analytics) · `GOOGLE_ADS_DEVELOPER_TOKEN` · `GOOGLE_ADS_LOGIN_CUSTOMER_ID` (cuenta administradora MCC).

## Motor de generación (Railway, cuando se porte)
`MOTOR_URL` · `MOTOR_SECRET` (header `x-motor-secret`, comparación en tiempo constante) · `OPENAI_API_KEY` (solo si se usa imagen/voz de OpenAI) · credenciales del proveedor de video elegido.

## Stack confirmado (2026-10-21): Vercel · Supabase · GitHub · Railway · n8n · Chatwoot · Anthropic · OpenAI · Gemini
| Variable | Para qué |
|---|---|
| `GEMINI_API_KEY` | Imágenes/video/visión y tareas baratas (ver reparto de modelos en el plan §6) |
| `N8N_BASE_URL` · `N8N_WEBHOOK_SECRET` | Disparadores y automatizaciones en n8n (secreto en header, no en URL) |
| `CHATWOOT_BASE_URL` · `CHATWOOT_API_TOKEN` · `CHATWOOT_ACCOUNT_ID` · `CHATWOOT_WEBHOOK_SECRET` | AiUDA Inbox: conversaciones y agentes humanos en Chatwoot |

## Cobro y correo
> **En pausa** (`plan/11` §4): los primeros clientes pagan por transferencia + factura SRI; no hay pasarela hasta el primer ingreso.
`STRIPE_SECRET_KEY` · `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` · `STRIPE_WEBHOOK_SECRET` · `STRIPE_PRICE_STARTER` · `STRIPE_PRICE_PRO` · `STRIPE_PRICE_AGENCY` · `RESEND_API_KEY` · `EMAIL_FROM`.

## Operación
`SENTRY_DSN` (errores) · `ADMIN_EMAILS` (lista separada por comas con acceso a super-administración).

## Esquema de base de datos
`NEXT_PUBLIC_DB_SCHEMA` (opcional, por defecto `aiuda_cm`): esquema de AiUDA CM dentro del proyecto de Supabase. **No cambiar** salvo que se mueva a otro proyecto.

## Reglas
- Un secreto por variable y por entorno; rotar si alguna vez se expone.
- Supabase gratuito: usar la clave `service_role` solo en rutas de servidor.
- Los valores nunca se escriben en el código ni en `docs/`.
