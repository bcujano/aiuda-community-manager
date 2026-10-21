# Reglas de Instagram / Meta Graph API

Síntesis de `IvanBBaev/instagram-mcp`, `William-Gao/instagram-mcp` y `oliverames/meta-mcp-server`. Los valores volátiles se marcan **(verificar)**: confirmarlos en la documentación de Meta antes de depender de ellos.

## Requisitos de cuenta
- Solo cuentas **Business o Creator** (profesionales). La Basic Display API se cerró el 2024-12-04: las cuentas personales no tienen API.
- Medios por **URL HTTPS pública** accesible por Meta. No hay subida de archivos locales.
- Todo lo publicado por API es público. No existe "Mejores amigos" por API.

## Dos rutas de autenticación
**Ruta A, Instagram Login** (`graph.instagram.com`): no necesita Página de Facebook.
- Scopes: `instagram_business_basic`, `_content_publish`, `_manage_comments`, `_manage_insights`, (`_manage_messages` solo con App Review).
- Token corto (~1 h) -> largo de **60 días** (`ig_exchange_token`). Se renueva con `ig_refresh_token` si tiene >= 24 h y no expiró.
- Sin `appsecret_proof`, sin `debug_token`. **No** hay búsqueda de hashtags, `business_discovery`, tags de producto ni métricas `total_*`.
- Un token vencido no se auto-recupera: exige re-login en el navegador.

**Ruta B, Facebook Login** (`graph.facebook.com`): la cuenta IG vinculada a una Página, app tipo Business.
- Scopes: `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`, `business_management`.
- Token ideal: **system-user token** (no expira). Alternativa: token de usuario de 60 días (`fb_exchange_token`).
- Firmar cada llamada con `appsecret_proof` = HMAC-SHA256(app_secret, `access_token|appsecret_time`) y activar "Require App Secret".
- Necesaria para descubrimiento de hashtags y `business_discovery`.

App Review: Standard Access alcanza para admins/devs/testers sobre sus propios activos (operador único sin App Review ni verificación de negocio). Excepciones: búsqueda de hashtags (Public Content Access) y DMs (Advanced Access). Las apps en modo desarrollo tienen límites más bajos.

Almacenamiento de tokens: archivo de entorno con permisos 0600 o gestor de secretos; guardar fecha de expiración; **renovar es una acción del operador, nunca automática silenciosa**. Avisar a los ~45 días. Programar el refresco cada ~30 días.

## Publicación (2 fases)
1. `create_media_container` (imagen, carrusel 2-10, reel, story).
2. Consultar estado hasta `FINISHED` (`IN_PROGRESS`, `ERROR`, `EXPIRED`, `PUBLISHED`). No recrear si dice "no listo" (códigos 9007/2207027): seguir esperando.
3. `media_publish`. Si falla tras crear el contenedor, **no recrear**: reanudar con el ID del contenedor.
- Contenedor no publicado en **24 h** expira (códigos 24/2207008): recrear.
- Cuota: leer `content_publishing_limit` **en runtime**. Las fuentes dicen 100 por 24 h; otra cita a Meta con 100 y 50 **(verificar)**. Un carrusel cuenta como 1.
- Límites de texto: pie de foto **2200 caracteres, 30 hashtags, 20 @menciones**. `alt_text` solo imágenes (1000 caracteres máx.). `user_tags` con x,y entre 0 y 1 en imágenes. Hasta 5 `product_tags` (catálogo Shopping, no en reels). Hasta 3 `collaborators` (no en reels de prueba ni videos).
- Reels: `share_to_feed`, `thumb_offset` (ms) o `cover_url`, `audio_name` (renombrar una vez). **Trial Reels requieren >= 1.000 seguidores**. La portada se elige antes y **no se edita después**.
- Specs de Reel (verificar): 9:16, 1080x1920, MP4/MOV H.264, 30/60 fps, <= 4 GB, 15-20 Mbps VBR; zona segura: ~250 px arriba y ~350 px abajo son UI; hook en los primeros 3 s; cuadrícula de perfil 3:4 (1080x1440), feed 4:5; quitar marcas de agua de otras plataformas.
- Solo en la app (no por API): audio en tendencia, Share-to-Feed manual, tags de colaborador/producto en algunos casos, Reel Insights.
- Stories: viven 24 h; requieren media (no hay story solo de texto).

## Límites, reintentos y errores
- Límite BUC: 4800 x impresiones llamadas / 24 h móviles; leer `X-App-Usage` y `X-Business-Use-Case-Usage`; frenar sobre el 90%.
- Hashtags: **30 únicos por 7 días móviles** (Ruta B).
- Throttling: códigos 4, 17, 32, 613, 80002, HTTP 429. **Subcódigo 2207051 = restricción por spam/integridad: no reintentar jamás**; mostrar `error_user_msg` de Meta.
- Reintentos: solo GET en 429/5xx (backoff `min(500*2^n, 8000)` ms + jitter, máx. 3, `Retry-After` con tope de 60 s, concurrencia 4 por host). **POST/DELETE nunca se reintentan**.
- Códigos: 190 token inválido; 10 y 200-299 permisos; 100 parámetro inválido (URL de media o relación de aspecto); 9/2207042 cuota de publicación excedida.
- Mensajería: ventana de **24 h** para responder DMs.
- No seguir `paging.next` a ciegas: reconstruir desde cursores. Limitar tamaño de respuestas (16 MiB). Permitir solo hosts `graph.instagram.com` / `graph.facebook.com` (anti-SSRF) con versión fija.

## Insights
- Desde 2025-01-08 se eliminaron métricas antiguas; las métricas se basan en `views`. Retención de métricas de cuenta: 90 días. Sin `since/until`, la ventana por defecto es de 24 h. `online_followers` cubre 30 días. Demografía con `metric_type=total_value` y `timeframe`.
- Antes de elegir métricas, consultar la doc vigente de Page/IG Insights (hay selectores retirados, p. ej. fan demographics legados).
- Benchmarks de alcance en stories (SYK): ver `syk-content-playbook.md`.

## Moderación
- **Ocultar** comentario (reversible) antes que **borrar** (destructivo). Borrar exige permiso explícito aparte.

## Versión de Graph API
Las fuentes usan v21.0 (oliverames), v23.0 (William-Gao) y v25.0 (IvanBBaev). Mantener **una sola constante** de versión y verificar la vigente al construir.

## Qué MCP usar para qué
Ver `repos-reference.md`. Resumen: `IvanBBaev/instagram-mcp` (más seguro, con preview por defecto) o `William-Gao/instagram-mcp` (sin Página de Facebook) para Instagram; `oliverames/meta-mcp-server` para cobertura total (Ads, Threads, Commerce) pero **sin puerta de confirmación** en escrituras: agregarla externamente.
