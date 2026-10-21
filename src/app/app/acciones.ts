'use server'
import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabaseServidor } from '@/lib/supabase/servidor'

function slug(nombre: string): string {
  const base = nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${base || 'org'}-${randomBytes(3).toString('hex')}`
}

export async function crearOrganizacion(fd: FormData) {
  const nombre = String(fd.get('nombre') ?? '').trim()
  if (!nombre) redirect('/app?error=Escribe+el+nombre+de+tu+empresa.')
  const supabase = await supabaseServidor()
  const { error } = await supabase.rpc('crear_organizacion', { p_nombre: nombre, p_slug: slug(nombre), p_pais: String(fd.get('pais') ?? '') || null })
  if (error) redirect('/app?error=No+pudimos+crear+la+empresa.')
  revalidatePath('/app')
}

export async function crearMarca(fd: FormData) {
  const nombre = String(fd.get('nombre') ?? '').trim()
  const orgId = String(fd.get('org_id') ?? '')
  if (!nombre || !orgId) redirect('/app?error=Escribe+el+nombre+del+negocio.')
  const supabase = await supabaseServidor()
  const { error } = await supabase.from('marcas').insert({ org_id: orgId, nombre, sector: String(fd.get('sector') ?? '') || null })
  if (error) redirect('/app?error=No+pudimos+crear+el+negocio.')
  revalidatePath('/app')
}
