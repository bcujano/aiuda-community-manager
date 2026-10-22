# Guía de puesta en marcha (de cero a login funcionando)

Orden: 1 Supabase → 2 Variables → 3 Vercel → 4 Dominio → 5 Prueba. Los paneles cambian de nombre con el tiempo: si algo no está donde digo, busca el equivalente y avísame.

## 1. Supabase
1. **SQL:** SQL Editor → New query → pega **`sql/001_esquema_aiuda_cm.sql`** → Run (un solo script; crea el esquema `aiuda_cm`). Luego: Project Settings → API (Data API) → **Exposed schemas** → agrega `aiuda_cm`. *(Los antiguos 001–003 están en `sql/_reemplazados/` y ya no se usan.)*
2. **Claves:** Project Settings → API (o «API Keys»). Copia: **Project URL**, la clave **anon / publishable** y la **service_role / secret**. La service_role es secreta: solo va en Vercel.
3. **Autenticación → Providers → Email:** debe estar activado (Enable Email provider).
4. **Autenticación → URL Configuration:**
   - Site URL: `https://aiuda.emprendimientum.com`
   - Redirect URLs: agrega `https://aiuda.emprendimientum.com/**` y `http://localhost:3000/**`
5. **Confirmación por correo — decisión:** el servicio de correo gratuito de Supabase solo envía a correos del equipo del proyecto y con un tope muy bajo. Por eso:
   - **Para probar ahora:** en Authentication → Providers → Email apaga **Confirm email**. El registro entra directo.
   - **Para clientes reales:** conecta un SMTP propio (Authentication → SMTP Settings; recomendado Resend, que exige verificar el dominio con registros DNS) y vuelve a encender Confirm email.
6. Los proyectos gratuitos se **pausan por inactividad** (alrededor de 7 días): si ves errores de conexión, entra al panel y pulsa Restore.

## 2. Variables (las 7 de arranque)
Hoy el sitio solo necesita las **3 de Supabase** para el login. Las otras 4 se usarán al conectar Instagram, pero cárgalas ya.

| # | Variable | Valor |
|---|---|---|
| 1 | `NEXT_PUBLIC_SUPABASE_URL` | Project URL de Supabase |
| 2 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clave anon / publishable |
| 3 | `SUPABASE_SERVICE_ROLE_KEY` | clave service_role / secret |
| 4 | `NEXT_PUBLIC_APP_URL` | `https://aiuda.emprendimientum.com` |
| 5 | `APP_ENCRYPTION_KEY` | 32 bytes aleatorios en base64 (ver abajo) |
| 6 | `CRON_SECRET` | 32 bytes aleatorios en hex (ver abajo) |
| 7 | `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys → Create key (necesita saldo; es independiente de la suscripción de Claude) |

**Generar 5 y 6 sin instalar nada** (se crean en tu navegador, no salen a internet): abre una pestaña cualquiera, F12 → Console, pega y copia el resultado.
- `APP_ENCRYPTION_KEY`: `btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))`
- `CRON_SECRET`: `[...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('')`

Guarda `APP_ENCRYPTION_KEY` en tu gestor de contraseñas: si se pierde, hay que reconectar todas las cuentas de redes. No pegues estos valores en ningún chat.

## 3. Vercel
1. vercel.com → Add New → Project → Import `bcujano/aiuda-community-manager` (si no aparece, «Adjust GitHub App Permissions» y da acceso al repo).
2. Framework: Next.js (se detecta solo). **Environment Variables:** agrega las 7 en Production, Preview y Development.
3. Deploy. Al terminar, abre la URL `*.vercel.app` y prueba `/api/salud` (debe decir `{"ok":true}`).
4. Settings → Git → **Production Branch = `main`**.

## 4. Dominio `aiuda.emprendimientum.com`
1. Vercel → Project → Settings → Domains → Add → `aiuda.emprendimientum.com`. Vercel muestra el registro DNS (normalmente un **CNAME** `aiuda` → un valor `…vercel-dns.com`).
2. Créalo en el **DNS del dominio**. Ojo: si el DNS lo maneja el hosting suspendido, no podrás. Soluciones: (a) pagar/reactivar el hosting, o (b) cambiar los *nameservers* del dominio en el registrador a Cloudflare (gratis) y crear ahí el CNAME. Dime dónde compraste el dominio y quién tiene hoy los nameservers y te digo el camino exacto.
3. Espera la propagación (minutos a horas). Vercel pone el candado HTTPS solo.

## 5. Prueba de punta a punta
`https://aiuda.emprendimientum.com/login` → Crear cuenta → `/app` → crear empresa → agregar negocio. Si falla, copia el mensaje exacto.

## Aviso sobre el correo de contacto
`contacto@emprendimientum.com` aparece en las páginas legales y Meta/Google pueden escribir ahí durante la revisión. Mientras el hosting esté suspendido ese buzón no recibe nada. Opciones: reactivar el hosting; mover el DNS a Cloudflare y usar **Email Routing** (gratis) para reenviar `contacto@` a tu Gmail; o volver temporalmente a `contacto@321archlab.com`. Decide antes de enviar la app a revisión.
