'use server'
import { redirect } from 'next/navigation'
import { supabaseServidor, supabaseConfigurado } from '@/lib/supabase/servidor'

function ir(error: string): never {
  redirect(`/login?error=${encodeURIComponent(error)}`)
}

export async function entrar(fd: FormData) {
  if (!supabaseConfigurado()) ir('Falta configurar la base de datos.')
  const supabase = await supabaseServidor()
  const { error } = await supabase.auth.signInWithPassword({
    email: String(fd.get('correo') ?? '').trim(),
    password: String(fd.get('clave') ?? ''),
  })
  if (error) ir('Correo o contraseña incorrectos.')
  redirect('/app')
}

export async function registrar(fd: FormData) {
  if (!supabaseConfigurado()) ir('Falta configurar la base de datos.')
  const clave = String(fd.get('clave') ?? '')
  if (clave.length < 8) ir('La contraseña debe tener al menos 8 caracteres.')
  const supabase = await supabaseServidor()
  const { data, error } = await supabase.auth.signUp({
    email: String(fd.get('correo') ?? '').trim(),
    password: clave,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/callback` },
  })
  if (error) ir('No pudimos crear la cuenta. Revisa el correo e inténtalo de nuevo.')
  if (!data.session) ir('Te enviamos un correo para confirmar tu cuenta.')
  redirect('/app')
}

export async function salir() {
  const supabase = await supabaseServidor()
  await supabase.auth.signOut()
  redirect('/login')
}
