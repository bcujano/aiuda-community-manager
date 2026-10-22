# 08 · Redes, anuncios y fuentes de inteligencia: qué es posible, con qué acceso, y cómo lo damos todo

**Decisión (Byron, 2026-10-22):** se quieren **todas** las redes del carrusel (Instagram, Facebook, Threads, TikTok, YouTube, LinkedIn, Pinterest, X, Reddit, Discord, Telegram) y el **Ad Library**. Y la revisión de Meta **no es inmediata**: primero se hace bien el sistema.
Estado de la información: búsquedas del 2026-10-22, mayormente de blogs y proveedores; **verificar cada punto en la documentación oficial al construir** (marcado ⚠️).

## 1. Idea clave: cada red tiene dos modos
| Modo | Qué es | Cuándo |
|---|---|---|
| **Directo** | El sistema publica por la API oficial con la cuenta del cliente | Cuando el acceso está disponible y aprobado |
| **Asistido** | El sistema **genera la pieza adaptada a esa red** (formato, texto, medidas, hora sugerida), la deja en el calendario como «lista para publicar» con un paquete descargable/copiable y un **recordatorio**; el usuario la publica en un toque | Mientras no haya acceso directo, o si la API cuesta o está restringida |
Así el cliente tiene **las 11 redes desde el primer día**, con etiqueta honesta de «directo» o «asistido». Cambiar una red de asistido a directo no cambia nada para el usuario salvo que deja de tener que publicar a mano.

## 2. Matriz de redes
| Red | Publicar por API oficial | Puerta de acceso (⚠️) | Costo / límite (⚠️) | Modo previsto |
|---|---|---|---|---|
| **Instagram** | Sí (posts, carruseles, reels, historias) | Cuenta Profesional; con app en **modo desarrollo** funciona con cuentas propias; terceros requieren App Review | Cuota de publicación diaria (leer en runtime) | **Directo** (desarrollo) desde la Fase A |
| **Facebook** | Sí (Páginas: fotos, feed, video) | Igual que Instagram | — | **Directo** (desarrollo) |
| **Threads** | Sí (texto, imagen, video; contenedor → publicar) | Revisión de app de Meta | Texto ≤500 caracteres; ≤250 publicaciones por API en 24 h | Directo en desarrollo; terceros tras revisión |
| **TikTok** | Sí (Content Posting API: Direct Post / subir a borradores) | Revisión de alcances; **sin auditoría el contenido queda privado** | — | Directo en desarrollo (privado) → asistido para público hasta auditoría |
| **YouTube (Shorts)** | Sí (`videos.insert`) | **Videos subidos desde proyectos no auditados quedan privados**; hay que pasar una auditoría de cumplimiento | Cuota diaria de subidas (cifra en disputa: verificar en la consola) | Asistido hasta auditar |
| **LinkedIn** | Sí (Community Management API) | **Aprobación de LinkedIn**, empresa registrada, página verificada, revisión en dos niveles y video de la app | — | Asistido hasta aprobar |
| **Pinterest** | Sí (v5, crear pines) | Acceso de prueba: **pines visibles solo para el creador** (sandbox); pasar a estándar con video de la app | — | Asistido hasta estándar |
| **X** | Sí | **Pago por uso** (feb-2026): ≈US$0,015 por publicación y ≈US$0,20 si lleva enlace; ya no hay planes Basic/Pro para nuevos desarrolladores | Costo por publicación | **Directo con cobro por uso trasladado al cliente** (créditos) o asistido en planes bajos |
| **Reddit** | Solo con API oficial y **aprobación**; uso comercial requiere **acuerdo con Reddit** | Términos de uso de datos (julio-2026, según fuente terciaria); posible cierre de nuevas solicitudes de acceso | — | **Asistido** (borrador adaptado a la comunidad + recordatorio); respetar reglas de cada subreddit y no promocionar en exceso |
| **Discord** | Sí (webhooks o bot del propio servidor del cliente) | El cliente instala el bot/webhook | ⚠️ cifras de límites sin confirmar (≈30 solicitudes/min por canal citado por foros) | **Directo** (barato y sin revisión) |
| **Telegram** | Sí (Bot API a canales donde el bot es admin) | Crear bot y añadirlo al canal | ≈30 mensajes/s global y ≈20/min por grupo (canales posiblemente igual) | **Directo** (gratis, sin revisión) |
**Conclusión:** Discord y Telegram son directos de inmediato (sin revisión); Instagram, Facebook y Threads quedan directos con cuentas propias; el resto empieza asistido y pasa a directo al aprobarse cada acceso.

## 4. Anuncios
| Plataforma | API | Puerta de acceso | Plan |
|---|---|---|---|
| **Meta Ads** | Marketing API (ya probada en crm-321) | Cuentas propias en modo desarrollo; terceros con acceso estándar/avanzado | **Primero**; en pausa → confirmación → topes |
| **TikTok Ads** | Marketing API | **Revisión de alcances de la app** antes de que los anunciantes la autoricen | Después de Meta |
| **Google Ads** | Google Ads API | **Developer token** (acceso de prueba → básico/estándar) ⚠️ | Después de TikTok |
Mientras no haya acceso aprobado a TikTok/Google para terceros, el sistema **prepara la campaña completa** (estructura, textos, creativos, presupuesto) en un **paquete listo para cargar** y la sigue con el mismo panel.

## 5. Ad Library y competencia (lo «brutal» del carrusel)
| Fuente | Qué da | Acceso real (⚠️) | Uso en AiUDA |
|---|---|---|---|
| **Meta Ad Library** | Por anuncio: creativo (texto, imagen/video), página, fechas, plataformas, activo/inactivo, URL del snapshot. **Gasto e impresiones solo por rangos y solo en anuncios políticos/sociales**; anuncios con menos de 100 impresiones llevan etiqueta | La API pública está orientada a políticos/sociales y a la UE; **para anuncios comerciales fuera de la UE las fuentes dicen que no devuelve lo mismo**. Existe además la herramienta oficial de **anuncios de Meta** disponible en esta plataforma (`ads_library_search`): busca por palabra, página y país, hasta 50 por consulta, para anunciantes con cuenta activa, y prohíbe extracción masiva | **Validar en la construcción** con una consulta de solo lectura qué devuelve para Ecuador/LATAM. Si funciona: detector de **ángulos, ofertas, formatos y duración de anuncios de la competencia**; ideas adaptadas; «qué anunciar»; cruce con tus métricas para **«qué orgánico impulsar»** |
| **Instagram Business Discovery** | Métricas públicas de cuentas profesionales (seguidores, publicaciones, interacción) | Requiere la ruta con Facebook Login | **Ya probado en crm-321** (16 competidores) |
| **TikTok Commercial Content Library** | Anuncios comerciales | **Solo datos de la UE** según fuentes | No cubre LATAM; sin uso inicial |
| **Google Ads Transparency Center** | Anuncios por anunciante | **No encontré API oficial**; existen proveedores que lo raspan (riesgo con términos) | Enlace de consulta manual desde la ficha del competidor; proveedor de pago solo si hay demanda |
| **Búsqueda web** (tendencias) | Contexto de mercado | Adaptador por proveedor de IA | Ya existe (`investigar_tendencias`) |
Reglas: **solo datos públicos**, citar origen, sin extracción masiva, conservar el lenguaje textual, terminar siempre con acciones (principios de `repos-reference.md`). Resultado esperado: informe «**qué hace tu competencia y qué hacer tú**» con ganchos, ángulos, formatos y ofertas, **sin copiar** contenido.

## 6. Bandeja (comentarios y mensajes) por red
Directo: Instagram, Facebook, Threads (Meta). Discord y Telegram (webhooks/bots propios). Resto: sin lectura por API hasta aprobarse; se puede importar a mano. Ver E6.

## 7. Reglas de adaptación «crea una vez, publica en todos lados»
Una **idea madre** → piezas nativas por red: Instagram (reel/carrusel/historia), Facebook, Threads (≤500 caracteres), TikTok (vertical, ganchos de 1–3 s), YouTube Shorts (título con palabra clave), LinkedIn (enseñanza profesional, carrusel PDF), Pinterest (pin vertical con título/descripción), X (hilo corto, enlace con costo), Reddit (valor primero, reglas de la comunidad), Discord (anuncio en canal), Telegram (mensaje con medios). Las medidas y límites por red viven en una tabla de datos (`redes_specs`), con fecha de verificación.

## 8. Qué se prueba antes de prometer cada red
Una publicación real de prueba por red con cuentas propias de 321; si no se puede, se declara «asistido» y no «directo».

## Fuentes consultadas (2026-10-22, no oficiales salvo donde se indica)
- Ad Library: [ppc.land](https://ppc.land/ads-library/) · [admapix](https://www.admapix.com/blog/ad-intelligence/meta-ads-library-api-developers) · [mida.so](https://www.mida.so/blog/meta-ads-library)
- TikTok / Google transparencia: [TikTok for Developers](https://developers.tiktok.com/products/commercial-content-api) · [Datashake](https://www.datashake.com/blog/tiktok-data-coverage-in-2026-what-social-intelligence-teams-need-to-know) · [SerpApi](https://serpapi.com/blog/scrape-competitors-google-ads-data-using-python) · [DataForSEO](https://dataforseo.com/blog/uncover-competitor-advertising-strategies-with-google-ads-transparency-and-apis)
- X y Reddit: [PostProxy](https://postproxy.dev/blog/x-api-pricing-2026) · [Postiz sobre Reddit](https://postiz.com/blog/reddit-api-limits-rules-and-posting-restrictions-explained)
- Pinterest (oficial): [niveles de acceso](https://developers.pinterest.com/docs/key-concepts/access-tiers/) · Threads (oficial): [publicación](https://developers.facebook.com/documentation/threads/posts) · LinkedIn: [guía de partners de Microsoft](https://learn.microsoft.com/en-ca/linkedin/shared/linkedin-api-partner-support-guide) · YouTube: [guía de subidas](https://postproxy.dev/blog/automate-youtube-uploads/)
- Telegram/Discord: [python-telegram-bot sobre límites](https://github.com/python-telegram-bot/python-telegram-bot/wiki/Avoiding-flood-limits) · [IFTTT sobre Discord](https://help.ifttt.com/hc/en-us/articles/1260804901449-Webhooks-to-Discord-may-fail-due-to-rate-limiting-too-many-requests-to-this-host-error)
