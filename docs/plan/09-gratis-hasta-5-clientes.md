# 09 · Plan «todo gratis hasta lanzar y tener ≥5 clientes»

**Decisión (Byron, 2026-10-22):** infraestructura gratuita hasta el lanzamiento y los primeros 5 clientes.
**Dos matices honestos:** (1) la **IA no es gratis** (se paga por uso); (2) **Vercel Hobby no permite uso comercial**, así que con clientes que pagan hay que subir de plan. Abajo se resuelve con costos mínimos y gatillos claros.

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
- Fijar un **tope mensual de IA en el motor** (p. ej. US$20–50 mientras se construye; el valor lo decide Byron).
- **«Modo ahorro» del router** (`03` §12): tareas simples a Gemini flash (gratis) o Haiku; solo planes y diagnóstico usan el modelo grande; **caché del prefijo de skills**; límites de reintentos; sin regenerar sin pedir.
- Pruebas con **cuentas propias de 321** y anuncios solo con topes de **US$1–5/día**.
- El **ledger** (`ia_llamadas`) mide el costo real por pieza desde la primera semana: es el dato que fija precios.

## 3. Arquitectura sin servidor propio (etapa gratuita)
Next.js en Vercel (UI + API) ↔ Supabase (datos, auth, Storage, `pg_cron`, `pg_net`) ↔ proveedores de IA y redes por API. **Sin Python, sin Railway, sin n8n.** El motor de generación de postpro-321 se **porta a TypeScript** (o se mantiene como referencia) para evitar un servidor siempre encendido; las funciones largas se reemplazan por trabajos asíncronos con sondeo. Esto **cambia D-8** (ya no hay worker en Railway en la Fase A).

## 4. Riesgos de esta etapa y mitigación
| Riesgo | Mitigación |
|---|---|
| Hobby y uso comercial | Solo desarrollo/pruebas en Hobby; **Pro desde el primer cobro** (US$20 vs ≥ US$49 por cliente) |
| Supabase se pausa | Latido (`pg_cron` o GitHub Action cada día); alerta si no responde |
| Sin copias de seguridad | **Exportación semanal** a un repositorio privado/Storage (solo datos esenciales) |
| Base llena (500 MB) | Retención de `ia_llamadas` (90 días), limpieza de medios, sin binarios en tablas |
| Funciones de 10–60 s | Trabajos asíncronos + sondeo; nada de procesos largos |
| IA cara | Tope mensual, modo ahorro, ledger |

## 5. Gatillos de pasar a pago
1. **Primer cliente que paga** → Vercel Pro.
2. **Primer cliente real** o base > ~350 MB → Supabase Pro (⚠️ US$25/mes según fuentes).
3. Revisión de Meta → dominio propio + correo operativo.
4. Volumen de mensajes/imágenes → plan de correo, R2, etc.
Los costos fijos al llegar a 5 clientes (~US$45–50/mes de infraestructura, ⚠️ a confirmar) quedan **cubiertos por un solo cliente del plan medio**.

## 6. Qué cambia en el backlog (`05`)
E5 (programador) usa `pg_cron`; E4 (video) con trabajos asíncronos; E6 sin n8n ni Chatwoot; E14 con latido y exportación semanal; **la revisión de Meta (E12) se mueve a después de que el sistema funcione bien**.
