import { createClient } from '@supabase/supabase-js'
import { ESQUEMA_DB } from './esquema'

// Service role: salta RLS. Solo para rutas de servidor que ya verificaron permisos del usuario.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Falta configurar Supabase (URL o service role)')
  return createClient(url, key, { auth: { persistSession: false }, db: { schema: ESQUEMA_DB as 'public' } })
}
