# 09 · Plan «nada de pago hasta generar dinero»

**Decisión (Byron, 2026-10-22):** **ningún plan de pago hasta generar dinero.** Tope de IA: **US$50/mes**.
**Dos matices honestos:** (1) la **IA no es gratis** (se paga por uso; tope US$50/mes); (2) **Vercel Hobby no permite uso comercial** según su documentación: Byron **asume ese riesgo** (R-3) y se mitiga con portabilidad, copias y un plan B de alojamiento. El gatillo para pagar es el **primer ingreso recibido**.

## 1. Qué es gratis y qué no
| Pieza | Gratis | Límite / condición (⚠️ verificar en la fuente oficial) | Gatillo para pagar |
|---|---|---|---|
| **Supabase** | Sí | 500 MB de base, 1 GB de archivos, 5 GB de ancho de banda, 50.000 usuarios activos, **se pausa tras ~7 días sin actividad**, sin copias de seguridad (fuentes terciarias) | Primer cliente real, o base > ~350 MB |
| **Vercel** | Hobby | **Solo uso personal/no comercial** (documentación oficial); funciones de **10 s por defecto, hasta 60 s** (oficial, a confirmar) | **Primer cliente que pague, o el día que 321 lo use para su negocio real** → Pro (US$20/mes) |
| **GitHub** | Sí | Repos privados gratis; GitHub Actions con minutos gratuitos | — |
| **Colas/cron** | Sí | **Supabase `pg_cron` + `pg_net`** llaman a nuestros endpoints cada minuto (con `CRON_SECRET` en header); GitHub Actions (mín. 5 min) como respaldo | — |
| **Generación larga** (video, lotes) | Sí, sin servidor propio | Los proveedores de video/imagen trabajan con **trabajos asíncronos**: se envía, se consulta por cron y se recibe por webhook. Evita funciones de minutos | Solo si un proveedor exige proceso largo |
| **Railway / n8n / Chatwoot** | **No se usan en esta etapa** | Costo y RAM | Fase B/C si hace falta (D-7) |
| **Correo** (Resend u otro) | Plan gratis (⚠️ cifras sin verificar) | Dominio verificado para producción | Volumen |
| **Errores** (Sentry) | Plan gratis (⚠️) | — | Volumen |
| **Stripe** | Sin cuota mensual; comisión por cobro | — | — |
| **Dominio propio** | Opcional | Necesario para revisión de Meta (más adelante) | Antes de App Review |
| **Medios (imágenes/video)** | Dentro de 1 GB de Storage de Supabase, con **limpieza** | Cloudflare R2 (plan gratis, ⚠️ verificar) si hace falta | Volumen |
| **IA — Anthropic / OpenAI** | **No** | Pago por uso con saldo prepago | Siempre |
| **IA — Gemini** | **Parcial** | Nivel gratuito para modelos de texto «flash»; **imagen y video sin nivel gratuito**; los límites cambian y las fuentes **discrepan** (p. ej. 5–15 solicitudes/min) | Cuando se superen los límites |

## 2. Presupuesto de IA mínimo (lo único que no es gratis)
- **Tope mensual de IA en el motor: US$50** (decidido por Byron). Reparto sugerido: 60 % planes/redacción (Anthropic), 25 % respaldo/pruebas (OpenAI/Gemini de pago), 15 % reserva; alerta al 80 % y corte de tareas no esenciales al 100 %.
- **«Modo ahorro» del router** (`03` §12): tareas simples a Gemini flash (gratis) o Haiku; solo planes y diagnóstico usan el modelo grande; **caché del prefijo de skills**; límites de reintentos; sin regenerar sin pedir.
- Pruebas con **cuentas propias de 321** y anuncios solo con topes de **US$1–5/día**.
- El **ledger** (`ia_llamadas`) mide el costo real por pieza desde la primera semana: es el dato que fija precios.

## 3. Arquitectura sin servidor propio (etapa gratuita)
Next.js en Vercel (UI + API) ↔ Supabase (datos, auth, Storage, `pg_cron`, `pg_net`) ↔ proveedores de IA y redes por API. **Sin Python, sin Railway, sin n8n.** El motor de generación de postpro-321 se **porta a TypeScript** (o se mantiene como referencia) para evitar un servidor siempre encendido; las funciones largas se reemplazan por trabajos asíncronos con sondeo. Esto **cambia D-8** (ya no hay worker en Railway en la Fase A).

## 4. Riesgos de esta etapa y mitigación
| Riesgo | Mitigación |
|---|---|
| Hobby y uso comercial | **Riesgo asumido.** Mantener el despliegue **portable** (sin KV/Edge Config/otras funciones exclusivas de Vercel); documentar el plan B (Cloudflare Pages/Workers o Netlify, ⚠️ verificar sus términos comerciales); si Vercel avisa, migrar sin perder datos (están en Supabase). **Pro al primer ingreso** |
| Supabase se pausa | Latido (`pg_cron` o GitHub Action cada día); alerta si no responde |
| Sin copias de seguridad | **Exportación semanal** a un repositorio privado/Storage (solo datos esenciales) |
| Base llena (500 MB) | Retención de `ia_llamadas` (90 días), limpieza de medios, sin binarios en tablas |
| Funciones de 10–60 s | Trabajos asíncronos + sondeo; nada de procesos largos |
| IA cara | Tope mensual, modo ahorro, ledger |

## 5. Gatillos de pasar a pago
1. **Primer ingreso recibido** → Vercel Pro.
2. Base > ~350 MB o primer cliente con datos reales críticos → Supabase Pro (⚠️ US$25/mes según fuentes), pagado **con ese ingreso**.
3. Revisión de Meta → dominio propio + correo operativo.
4. Volumen de mensajes/imágenes → plan de correo, R2, etc.
Los costos fijos de infraestructura (~US$45–50/mes, ⚠️ a confirmar) quedan **cubiertos por un solo cliente del plan medio**.

## 6. Qué cambia en el backlog (`05`)
Nada Pro implica: sin Railway, sin n8n, sin Chatwoot, sin Sentry de pago, sin dominio de pago hasta el primer ingreso (la revisión de Meta ya está pospuesta).
E5 (programador) usa `pg_cron`; E4 (video) con trabajos asíncronos; E6 sin n8n ni Chatwoot; E14 con latido y exportación semanal; **la revisión de Meta (E12) se mueve a después de que el sistema funcione bien**.
