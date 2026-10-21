# Trámites lentos — hacerlos YA, en paralelo

Son lo que más tarda y bloquea el lanzamiento. Marcas: ✅ hecho · ⏳ en curso · ☐ pendiente. Pasos según conocimiento general; **los paneles cambian: verifica cada requisito en la pantalla oficial** y dime lo que veas para ajustar.

## 0. Antes de todo (1 día)
- ☐ **Entidad legal:** los revisores de Meta/TikTok/Google piden empresa verificable. Define con qué empresa se registra la app (puede ser una existente de Byron; la entidad definitiva para la visa se decide con el abogado).
- ☐ **Sitio web público** de AiUDA con: qué hace, **Política de privacidad**, **Términos**, **instrucciones de eliminación de datos** y correo de contacto. Sin esto no pasa ninguna revisión. *(Yo redacto los textos; tú los publicas en el dominio.)*
- ☐ Dominio y correo corporativo (`@tudominio`).
- ☐ Búsqueda de marca (ver `MARCA.md`).

## 1. Meta (Instagram, Facebook, Anuncios, WhatsApp) — el más largo
1. ☐ Crear/entrar a **Meta Business Portfolio** (business.facebook.com) con datos reales de la empresa.
2. ☐ **Verificación de empresa** (Business Verification): documentos legales + dominio + teléfono. Suele tardar días a semanas.
3. ☐ Crear la **app** en developers.facebook.com (tipo Business) con el correo corporativo. Anotar `META_APP_ID` y `META_APP_SECRET` (van a Vercel, ver `ENV.md`).
4. ☐ Agregar productos: **Facebook Login (for Business)**, **Instagram** (API con inicio de sesión de Instagram y/o vía Página), **Webhooks**, **Marketing API**; más adelante **WhatsApp**.
5. ☐ Configurar URL de callback OAuth y **webhook** (`/api/webhooks/meta`) con el `META_WEBHOOK_VERIFY_TOKEN`. *(Se activa cuando exista el despliegue.)*
6. ☐ Solicitar permisos con **App Review** (lista a confirmar en el panel): publicación de contenido, comentarios, insights, mensajes, gestión de páginas, gestión de anuncios (Marketing API: acceso estándar/avanzado). Para cada uno: caso de uso en texto claro + demo de cómo se usa dentro de AiUDA + cuenta de prueba.
7. ☐ **Cuentas de prueba:** una cuenta IG Profesional + Página FB propias (la de 321 sirve) para grabar el demo.
8. ☐ Pasar la app a **modo Live** al aprobarse.
- Riesgo: sin demo funcionando no hay aprobación. Por eso la **Fase 1 prioriza un flujo mínimo de punta a punta** (conectar → publicar → leer comentarios) para poder grabarlo.

## 2. TikTok
1. ☐ Cuenta en **TikTok for Developers** → crear app → agregar *Login Kit* y *Content Posting API* (Direct Post).
2. ☐ Cuenta en **TikTok for Business** → portal de **Marketing API** → solicitar app y alcances de anuncios (revisión de alcances; puede tardar semanas).
3. ☐ Enviar la app a **auditoría** para publicar en público (sin auditoría, lo publicado queda privado). Requiere demo, dominio verificado y políticas.
4. Guardar `TIKTOK_CLIENT_KEY/SECRET` y claves de Ads en Vercel.

## 3. Google
1. ☐ **Google Cloud project** → pantalla de consentimiento OAuth (verificación de la app si usa alcances sensibles).
2. ☐ **Cuenta administradora de Google Ads (MCC)** → solicitar **developer token** (empieza en acceso de prueba; pedir acceso básico/estándar con descripción del uso). *Niveles y tiempos: sin verificar.*
3. ☐ Habilitar APIs: Google Ads, Business Profile, Analytics/Search Console según se vayan usando.

## 4. Otros
- ☐ **Stripe** (cuenta de empresa) y **Resend** (correo).
- ☐ **Supabase:** confirmar el proyecto gratuito de AiUDA y copiar URL/anon/service_role a Vercel (ver `ENV.md`). Pegar `sql/001` y `sql/002` en el SQL Editor.
- ☐ **Dominio en Vercel** y proyecto conectado al repo.

## Cómo lo hacemos juntos
Tú haces los clics con tus cuentas (no comparto ni manejo contraseñas); yo preparo textos (privacidad, términos, casos de uso para App Review, guion del demo), checklists por pantalla y reviso lo que me pegues. Avísame el estado de cada punto y actualizo esta lista.

## Orden recomendado
Día 1: 0 y Business Verification. Día 2–3: apps de Meta/TikTok/Google creadas. Semana 2–3: demo mínimo grabado y solicitudes de revisión enviadas. En paralelo: Fase 1 del código.
