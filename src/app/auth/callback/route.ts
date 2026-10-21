import { NextResponse } from 'next/server'
import { supabaseServidor, supabaseConfigurado } from '@/lib/supabase/servidor'

// Destino del enlace del correo de confirmación: intercambia el código por una sesión.
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  if (code && supabaseConfigurado()) {
    const supabase = await supabaseServidor()
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(`${origin}/app`)
}
