# 08 · Redes, anuncios y fuentes de inteligencia

**Decisión (Byron, 2026-10-22, actualizada):** **solo Instagram, Facebook, TikTok y YouTube, con sus anuncios** (Meta Ads, TikTok Ads y Google Ads para YouTube). Se descartan Threads, LinkedIn, Pinterest, X, Reddit, Discord y Telegram. La revisión de Meta no es inmediata: primero se hace bien el sistema.
Estado de la información: búsquedas del 2026-10-22, mayormente de blogs y proveedores; **verificar cada punto en la documentación oficial al construir** (⚠️).

## 1. Dos modos por red
| Modo | Qué es | Cuándo |
|---|---|---|
| **Directo** | El sistema publica por la API oficial con la cuenta del cliente | Cuando el acceso está disponible |
| **Asistido** | El sistema **genera la pieza adaptada a esa red** (formato, texto, medidas, hora sugerida), la deja «lista para publicar» con paquete descargable y **recordatorio** | Mientras no haya acceso directo |
Cada red muestra su etiqueta honesta («directo» o «asistido»). Pasar de asistido a directo no cambia nada para el usuario salvo que deja de publicar a mano.

## 2. Orgánico
| Red | Publicar por API oficial | Puerta de acceso (⚠️) | Modo previsto |
|---|---|---|---|
| **Instagram** | Sí (posts, carruseles, reels, historias) | Cuenta Profesional; la app en **modo desarrollo** funciona con cuentas propias; terceros requieren App Review | **Directo** con cuentas propias desde la Fase A |
| **Facebook** | Sí (Páginas: fotos, feed, video) | Igual que Instagram | **Directo** con cuentas propias |
| **TikTok** | Sí (Content Posting API: Direct Post o subir a borradores) | Revisión de alcances; **sin auditoría el contenido queda privado** | Directo en desarrollo (privado) → **asistido** para publicar en público hasta la auditoría |
| **YouTube (Shorts/video)** | Sí (`videos.insert`) | **Los videos subidos desde proyectos no auditados quedan privados**; hay que pasar una auditoría de cumplimiento; cuota diaria de subidas (cifra en disputa) | **Asistido** hasta auditar |

## 3. Anuncios
| Plataforma | Cubre | API | Puerta de acceso (⚠️) | Plan |
|---|---|---|---|---|
| **Meta Ads** | Instagram y Facebook | Marketing API (ya probada en crm-321) | Cuentas propias en modo desarrollo; terceros con acceso estándar/avanzado | **Primero**: borrador → aprobación → creada **en pausa** → activación confirmada → topes |
| **TikTok Ads** | TikTok | Marketing API | **Revisión de alcances de la app** antes de que los anunciantes la autoricen | Después de Meta |
| **Google Ads (YouTube)** | YouTube (campañas de video) | Google Ads API | **Developer token** (prueba → básico/estándar) | Después de TikTok |
Mientras TikTok Ads y Google Ads no tengan acceso aprobado para terceros, el sistema **prepara la campaña completa** (estructura, textos, creativos, presupuesto) en un **paquete listo para cargar** y la sigue desde el mismo panel.

## 4. Ad Library y competencia
| Fuente | Qué da | Acceso real (⚠️) | Uso en AiUDA |
|---|---|---|---|
| **Meta Ad Library** | Por anuncio: creativo (texto, imagen/video), página, fechas, plataformas, activo/inactivo. **Gasto e impresiones solo por rangos y solo en anuncios políticos/sociales**; los anuncios con menos de 100 impresiones llevan etiqueta | La **API pública** está orientada a anuncios políticos/sociales y a la UE; para **anuncios comerciales fuera de la UE las fuentes dicen que no devuelve lo mismo**. **Corrección de la prueba ácida:** la herramienta `ads_library_search` que usa Claude en esta sesión es un **conector de Claude, no una API del producto**: AiUDA **no puede depender de ella** en producción | Se ofrece en **tres modos** (abajo) |
| **Instagram Business Discovery** | Métricas y publicaciones públicas de cuentas Business/Creator | Requiere la ruta con Facebook Login (token de AiUDA); **límites de llamadas compartidos** entre todos los clientes y prospectos ⚠️ | **Ya probado en crm-321** (16 competidores con el token de 321); verificar a escala |
| **TikTok Commercial Content Library** | Anuncios comerciales | **Solo datos de la UE** según fuentes | No cubre LATAM; sin uso inicial |
| **Google Ads Transparency Center** | Anuncios por anunciante (incluye YouTube) | **No encontré API oficial**; proveedores que lo raspan (riesgo con términos) | Enlace de consulta manual desde la ficha del competidor |
| **Búsqueda web** | Tendencias | Adaptador por proveedor de IA | Ya existe (`investigar_tendencias`) |
### Modos del Ad Library (para no prometer lo que no se puede)
1. **API oficial**, si en la validación (consulta de solo lectura con el token de AiUDA) devuelve anuncios comerciales de Ecuador/LATAM.
2. **Asistido (siempre disponible):** el usuario abre el Ad Library de Meta en su navegador, **pega enlaces o sube capturas** de los anuncios de su competencia, y la IA con visión extrae **ángulo, oferta, formato y gancho** y los cruza con sus métricas. Gratis, legal y sin raspado.
3. **Proveedor de pago** (fase D), solo si hay demanda y sus términos lo permiten.

Reglas: **solo datos públicos**, citar origen, sin extracción masiva, conservar el lenguaje textual y terminar siempre con acciones. Resultado: informe «**qué hace tu competencia y qué hacer tú**», **sin copiar** contenido.

## 5. Bandeja (comentarios y mensajes)
**Directo:** Instagram y Facebook (Meta). **TikTok y YouTube:** lectura/respuesta de comentarios por API solo si el acceso lo permite (⚠️); si no, **importación manual** de comentarios para que la IA proponga respuestas. Ver E6.

## 6. Una idea, cuatro formatos nativos
Una **idea madre** → Instagram (reel/carrusel/historia), Facebook (video/foto), TikTok (vertical, gancho de 1–3 s) y YouTube Shorts (título con palabra clave). Medidas y límites por red en una tabla de datos (`redes_specs`) con fecha de verificación.

## 7. Qué se prueba antes de prometer cada red
Una publicación real de prueba por red con cuentas propias de 321; si no se puede, se declara «asistido».

## Fuentes consultadas (2026-10-22; no oficiales salvo donde se indica)
- Ad Library: [ppc.land](https://ppc.land/ads-library/) · [admapix](https://www.admapix.com/blog/ad-intelligence/meta-ads-library-api-developers) · [mida.so](https://www.mida.so/blog/meta-ads-library)
- TikTok / Google transparencia: [TikTok for Developers](https://developers.tiktok.com/products/commercial-content-api) · [Datashake](https://www.datashake.com/blog/tiktok-data-coverage-in-2026-what-social-intelligence-teams-need-to-know) · [SerpApi](https://serpapi.com/blog/scrape-competitors-google-ads-data-using-python) · [DataForSEO](https://dataforseo.com/blog/uncover-competitor-advertising-strategies-with-google-ads-transparency-and-apis)
- YouTube: [guía de subidas](https://postproxy.dev/blog/automate-youtube-uploads/)
