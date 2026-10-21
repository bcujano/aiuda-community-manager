# SYK: ManyChat y flujo de setting automatizado (resumen propio)

## Prerrequisitos
- Página de Facebook activa y cuenta de Instagram en modo **Business o Creator** vinculada a esa Página (ManyChat se conecta a Instagram vía Meta). Si no está vinculada: Facebook Business Suite -> Configuración -> Cuentas de Instagram.
- Alta en ManyChat con "Continue with Facebook", elegir la Página y conectar Instagram.

## Principios
- Escribir **antes** el guion del flujo en un documento, nunca directamente en la plataforma.
- Mal uso típico (99%): mandar el recurso y "cualquier duda avisame". Un flujo bueno califica y lleva a una llamada.
- No automatizar antes de entender el proceso: empezar con Claude manual en cada paso y automatizar cuando se repita siempre lo mismo.
- Errores que hacen que el flujo falle, que Instagram penalice o que el lead tenga mala experiencia: aprender las buenas prácticas antes de publicar. Probar siempre sin mandar mensajes reales a contactos.

## Estructura del flujo "Setting -> Agenda -> Follow-up"
1. **Trigger:** Instagram Direct Message -> Keywords. Palabra ejemplo "QUIERO". Comparación **"Contains"** (no "Is"), así activa con "sí quiero", "QUIERO!" o "quiero info".
2. **Mensaje 1 (bienvenida y calificación)** con `{{first name}}` y botones (hasta **3 botones** por mensaje). Ej.: "¿Cuántas consultas por DM recibís por semana?" -> "Menos de 10" / "Más de 10".
3. **Mensaje 2 (filtro de intención):** ofrece mostrar el sistema en una llamada corta (20 min); botones "Sí, quiero" / "Después lo veo".
4. **Delay de 30 minutos** antes del link (más natural), luego **Mensaje 3** con el link de agenda.
5. **Delay de 24 h** + **Condition** ("Button was clicked" sobre "Ya agendé"). Rama YES: tag **"Agendado"** y fin. Rama NO: **Mensaje 4** (follow-up) con botones "Ya agendé" / "Todavía no".
6. **Delay de 48 h** tras "Todavía no" + **Mensaje 5** (cierre, texto plano sin botones) + tag **"Lead frío"**.
7. **Custom Fields** para tracking: `estado_lead` (Text) y `agendas_hoy` (Number, default 0; en la rama YES incrementar +1). Ver agendas con Contacts filtrado por tag "Agendado".
8. **Test Flow** -> revisar mensajes, botones, delays y condiciones -> **Publish**.
9. **Disparo manual:** Live Chat -> contacto -> "Send to Flow" -> elegir el flujo; sirve para leads que no usaron la palabra clave.
- Navegación: Automation -> Flows -> + New Flow (Start from Scratch, sin templates) -> nombre descriptivo.

## Las 6 automatizaciones clave de la biblioteca
Follow-ups, Tags, "Follow for lead magnet", Capturar emails, Agendar calls en automático, "Hiper secuencia". Solo se conocen los títulos (videos no vistos).

## Integración con Claude
Tres momentos donde sirve: mensaje automático del bot, mensajes de prospección manual y follow-up a quien no respondió (ver `syk-dm-prospeccion-objeciones.md`).
Con **Make** (plan gratuito) se arma un agente real: video en Google Drive -> Make lo detecta -> envía la transcripción a Claude -> Claude genera copy de carrusel y prompt de imagen -> Make lo deja en un Google Doc y en Slack. Requiere una API key de Claude y 2-3 horas la primera vez.
**Para este proyecto:** n8n ya está conectado a la sesión y cumple el mismo rol que Make.

## Cuidados al llevarlo a código
- Los mensajes automáticos son envíos reales a terceros: aplicar el contrato de confirmación de `agent-safety-rules.md`.
- Ventana de 24 h para DMs y reglas de Meta para mensajería: ver `instagram-api-rules.md`.
- No guardar datos de leads en el repo (es público).
