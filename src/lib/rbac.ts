import { supabaseServidor } from '@/lib/supabase/servidor'

// Roles y acciones. Misma matriz que las políticas SQL (la base es la defensa final; esto da mensajes claros y corta antes).
export type Rol = 'owner' | 'editor' | 'aprobador' | 'lector'
export type Accion = 'ver' | 'editar_contenido' | 'aprobar' | 'conectar_redes' | 'gestionar_miembros' | 'ver_costos'

const MATRIZ: Record<Accion, Rol[]> = {
  ver: ['owner', 'editor', 'aprobador', 'lector'],
  editar_contenido: ['owner', 'editor'],
  aprobar: ['owner', 'aprobador'],
  conectar_redes: ['owner', 'editor'],
  gestionar_miembros: ['owner'],
  ver_costos: ['owner', 'aprobador'],
}
export const puede = (rol: Rol | null | undefined, accion: Accion) => Boolean(rol && MATRIZ[accion].includes(rol))

// Devuelve el rol del usuario en la organización o null. Pasa por RLS: solo ve sus propias membresías.
export async function rolEn(orgId: string): Promise<Rol | null> {
  const sb = await supabaseServidor()
  const { data: u } = await sb.auth.getUser()
  if (!u.user) return null
  const { data } = await sb.from('miembros').select('rol').eq('org_id', orgId).eq('user_id', u.user.id).maybeSingle()
  return (data?.rol as Rol | undefined) ?? null
}

export class SinPermiso extends Error {}
export async function exigir(orgId: string, accion: Accion): Promise<Rol> {
  const rol = await rolEn(orgId)
  if (!puede(rol, accion)) throw new SinPermiso('No tienes permiso para hacer esto en esta empresa.')
  return rol!
}
