# Meta / Instagram API — reglas de trabajo

> Estado: lo marcado ✅ viene de la auditoría real de crm-321 (Graph v22.0 en producción) o de fuentes consultadas; ⚠️ es conocimiento general a verificar en el panel de Meta antes de depender de ello.

## Acceso
- ✅ Publicar en cuentas de terceros exige **App Review** y **Business Verification** de Meta; tarda de 1 a 6+ semanas según fuentes terciarias. **Empezar el trámite en la Fase 0.** (Una fuente indica que desde mayo 2026 ya no se pide video de pantalla; no confirmado: ver Permisos y funciones en el panel de la app.)
- ✅ Solo cuentas Instagram **Profesional** (Business/Creator) enlazadas a una **Página de Facebook**.
- ✅ Webhooks de Instagram: por defecto incluyen `comments`, `live_comments`, `message_reactions`, `messages`. La app debe procesarlos y responder con la Send API.
- ⚠️ Mensajes (DMs): ventana de **24 h** desde el último mensaje del usuario para responder libremente; fuera de ventana, solo etiquetas/plantillas permitidas. Verificar.
- ⚠️ Respuesta privada a un comentario (private reply): una por comentario, dentro de 7 días. Verificar.

## Tokens
- ⚠️ Token de usuario de larga vida ≈ 60 días; renovar antes de caducar. Token de Página derivado de uno de larga vida no caduca mientras el usuario mantenga permisos. Guardar cifrado; registrar fecha de vencimiento; alerta a los 10 días.
- ✅ Nunca poner secretos en la URL (error ya detectado en crm-321: secreto del publicador en query `?secret=`). Usar header `Authorization`.

## Versiones y límites
- ✅ Fijar versión (v22.0 en crm-321). Marketing API saca versiones trimestrales con ~2 años de vida: agendar revisión cada 6 meses.
- ⚠️ Límite de publicación por cuenta de IG ≈ 100 publicaciones por API cada 24 h (consultar `content_publishing_limit`). Límites de llamadas por app/cuenta: leer cabecera `X-App-Usage` y frenar al 80 %.

## Publicación en 2 fases (✅ patrón usado en crm-321)
1. Crear contenedor: `POST /{ig-user-id}/media` (`image_url` / `video_url`, `media_type` = `REELS`/`STORIES`/`CAROUSEL`, `caption`).
2. Para video: sondear `status_code` del contenedor hasta `FINISHED` (con tope y espera creciente).
3. Publicar: `POST /{ig-user-id}/media_publish` con `creation_id`.
- Carrusel: crear hijos primero (`is_carousel_item=true`), luego contenedor padre con `children`.
- Facebook: `/photos`, `/feed` (multi-foto con `attached_media`) y `/videos`.
- Las URLs de medios deben ser públicas y directas (Drive necesita conversión a URL directa).

## Reglas de idempotencia (lo que falló en crm-321)
- Una pieza = una fila por **plataforma** con su propia clave de idempotencia (`org_id + pieza_id + plataforma`).
- Estado `publicando` con **lease** (`bloqueado_hasta`); un worker recupera piezas con lease vencido.
- **Nunca reintentar `media_publish` a ciegas**: antes de reintentar, consultar si ya existe la publicación (guardar `creation_id`).
- Contar `intentos`; tras 3, estado `error` visible en UI con botón de reintento manual.

## Errores frecuentes
| Síntoma | Causa probable | Acción |
|---|---|---|
| Token inválido / caducado | Vencimiento o cambio de contraseña | Marcar conexión «requiere reconectar», avisar al cliente |
| Contenedor `ERROR` | Formato/duración/relación de aspecto | Revalidar medio (ffprobe) antes de subir |
| Límite alcanzado | Demasiadas llamadas | Esperar y repartir en el tiempo |
| Comentario/mensaje sin permiso | Falta permiso aprobado | Revisar App Review |

## Notas de anuncios heredadas de crm-321 (Meta API v22.0) ✅
- `advantage_audience=1` obligatorio → `age_min` máximo 25, `age_max` fijo 65.
- CTA WhatsApp: `{ type: 'WHATSAPP_MESSAGE', value: { app_destination: 'WHATSAPP' } }` **sin link**.
- ABO exige `is_adset_budget_sharing_enabled=false` explícito. CBO exige `budget_rebalance_flag=true` + `daily_budget` en la campaña.
- `slideshow_spec` de Meta no funciona → generar MP4 real con ffmpeg.
- Crear siempre campañas **en pausa** y activar tras confirmación.
