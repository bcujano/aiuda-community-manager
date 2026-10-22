'use server'
import { redirect } from 'next/navigation'
import { supabaseServidor } from '@/lib/supabase/servidor'
import { CAMPOS } from '@/lib/ficha'

export async function guardarFicha(fd: FormData) {
  const id = String(fd.get('id') ?? '')
  const supabase = await supabaseServidor()
  // RLS: solo owner/editor de la organización pueden leer y escribir esta marca.
  const { data: marca } = await supabase.from('marcas').select('perfil').eq('id', id).maybeSingle()
  if (!marca) redirect('/app?error=No+encontramos+ese+negocio.')

  const perfil: Record<string, unknown> = { ...(marca.perfil as Record<string, unknown>) }
  for (const c of CAMPOS) {
    const v = String(fd.get(c.clave) ?? '').trim().slice(0, 4000)
    if (c.tipo === 'numero') perfil[c.clave] = v === '' ? null : Number(v)
    else perfil[c.clave] = v
  }
  const { error } = await supabase.from('marcas').update({ perfil }).eq('id', id)
  if (error) redirect(`/app/negocio/${id}?error=No+pudimos+guardar.`)
  redirect(`/app/negocio/${id}?ok=Guardado`)
}
