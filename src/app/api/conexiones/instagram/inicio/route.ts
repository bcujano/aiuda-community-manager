import { NextResponse } from 'next/server'
import { supabaseServidor } from '@/lib/supabase/servidor'
import { appUrl, IG_OAUTH, IG_SCOPES } from '@/lib/meta'
import { crearEstado } from '@/lib/estado-oauth'

export async function GET(req: Request) {
  const marca = new URL(req.url).searchParams.get('marca')
  const appId = process.env.INSTAGRAM_APP_ID
  if (!marca || !appId) return NextResponse.redirect(`${appUrl()}/app?error=Falta+configurar+Instagram.`)

  const supabase = await supabaseServidor()
  const { data: u } = await supabase.auth.getUser()
  if (!u.user) return NextResponse.redirect(`${appUrl()}/login`)
  // RLS: solo ve la marca quien es miembro de su organización.
  const { data: m } = await supabase.from('marcas').select('id').eq('id', marca).maybeSingle()
  if (!m) return NextResponse.redirect(`${appUrl()}/app?error=No+encontramos+ese+negocio.`)

  const url = new URL(IG_OAUTH)
  url.searchParams.set('client_id', appId)
  url.searchParams.set('redirect_uri', `${appUrl()}/api/conexiones/instagram/callback`)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', IG_SCOPES.join(','))
  url.searchParams.set('state', crearEstado(u.user.id, marca))
  return NextResponse.redirect(url.toString())
}
