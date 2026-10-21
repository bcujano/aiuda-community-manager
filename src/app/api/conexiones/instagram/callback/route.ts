import { NextResponse } from 'next/server'
import { supabaseServidor } from '@/lib/supabase/servidor'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { appUrl, GRAPH_VERSION, IG_GRAPH, IG_TOKEN } from '@/lib/meta'
import { leerEstado } from '@/lib/estado-oauth'
import { cifrar } from '@/lib/cifrado'

const volver = (msg: string) => NextResponse.redirect(`${appUrl()}/app?error=${encodeURIComponent(msg)}`)

// Los POST de Meta no se reintentan: si algo falla, el usuario repite el flujo desde cero.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams
  if (q.get('error')) return volver('Cancelaste la conexión con Instagram.')
  const code = q.get('code')?.replace(/#_$/, '')
  const estado = leerEstado(q.get('state'))
  if (!code || !estado) return volver('La conexión caducó. Inténtalo de nuevo.')

  const supabase = await supabaseServidor()
  const { data: u } = await supabase.auth.getUser()
  if (!u.user || u.user.id !== estado.uid) return volver('Sesión no válida. Entra de nuevo.')
  const { data: marca } = await supabase.from('marcas').select('id, org_id').eq('id', estado.marca).maybeSingle()
  if (!marca) return volver('No encontramos ese negocio.')

  const appId = process.env.INSTAGRAM_APP_ID
  const secret = process.env.INSTAGRAM_APP_SECRET
  if (!appId || !secret) return volver('Falta configurar Instagram.')

  try {
    const corto = await fetch(IG_TOKEN, {
      method: 'POST',
      body: new URLSearchParams({
        client_id: appId, client_secret: secret, grant_type: 'authorization_code',
        redirect_uri: `${appUrl()}/api/conexiones/instagram/callback`, code,
      }),
    })
    if (!corto.ok) return volver('Instagram rechazó la autorización.')
    const cj = await corto.json()
    const tokenCorto: string | undefined = cj.access_token ?? cj.data?.[0]?.access_token
    if (!tokenCorto) return volver('Instagram no devolvió el acceso.')

    const largo = await fetch(`${IG_GRAPH}/access_token?${new URLSearchParams({
      grant_type: 'ig_exchange_token', client_secret: secret, access_token: tokenCorto })}`)
    if (!largo.ok) return volver('No pudimos obtener el acceso de larga duración.')
    const lj = (await largo.json()) as { access_token: string; expires_in?: number }

    const perfil = await fetch(`${IG_GRAPH}/${GRAPH_VERSION}/me?${new URLSearchParams({
      fields: 'user_id,username', access_token: lj.access_token })}`)
    if (!perfil.ok) return volver('No pudimos leer tu perfil de Instagram.')
    const p = (await perfil.json()) as { user_id?: string; id?: string; username?: string }
    const cuenta = String(p.user_id ?? p.id ?? '')
    if (!cuenta) return volver('Instagram no devolvió la cuenta.')

    const admin = supabaseAdmin()
    const { error } = await admin.from('conexiones').upsert({
      org_id: marca.org_id, marca_id: marca.id, plataforma: 'instagram',
      cuenta_externa_id: cuenta, nombre_cuenta: p.username ?? null,
      token_cifrado: cifrar(lj.access_token),
      vence_en: new Date(Date.now() + (lj.expires_in ?? 5_184_000) * 1000).toISOString(),
      estado: 'activa', permisos: ['basic', 'content_publish', 'manage_comments', 'manage_insights'],
    }, { onConflict: 'marca_id,plataforma,cuenta_externa_id' })
    if (error) return volver('No pudimos guardar la conexión.')
    await admin.from('auditoria').insert({ org_id: marca.org_id, actor: u.user.id, accion: 'conectar_instagram', detalle: { cuenta } })
    return NextResponse.redirect(`${appUrl()}/app?ok=Instagram+conectado`)
  } catch {
    return volver('Algo falló al conectar Instagram.')
  }
}
