'use server'
import { redirect } from 'next/navigation'
import { supabaseServidor } from '@/lib/supabase/servidor'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { exigir, SinPermiso } from '@/lib/rbac'
import { ia } from '@/lib/ia'
import { EsquemaPlan, EsquemaPieza, fichaComoTexto, frasesDeFicha, sistemaPieza, sistemaPlan, type Plan } from '@/lib/contenido'
import type { Perfil } from '@/lib/ficha'
import { coloresDeFicha, renderPieza } from '@/lib/vectorial/render'
import { randomUUID } from 'node:crypto'

const ir = (marca: string, k: 'ok' | 'error', msg: string): never => redirect(`/app/negocio/${marca}/plan?${k}=${encodeURIComponent(msg)}`)
const MENSAJE_IA: Record<string, string> = {
  en_cola_ia: 'Los servicios de IA no respondieron. Inténtalo de nuevo en unos minutos; no se perdió nada.',
  presupuesto: 'Se alcanzó el tope mensual de gasto en IA. Súbelo desde ajustes o espera al próximo mes.',
  validacion: 'La IA escribió algo que rompe tus reglas (frase prohibida o cifra sin fuente) y no lo mostramos. Completa la ficha e inténtalo otra vez.',
  kill_switch: 'La pausa de emergencia está activa en tu empresa.',
}

async function marcaConFicha(marcaId: string) {
  const sb = await supabaseServidor()
  const { data } = await sb.from('marcas').select('id, org_id, nombre, perfil, aprobaciones').eq('id', marcaId).maybeSingle()
  if (!data) redirect('/app?error=No+encontramos+ese+negocio.')
  return data!
}

export async function generarPlan(fd: FormData) {
  const marcaId = String(fd.get('marca') ?? '')
  const m = await marcaConFicha(marcaId)
  try { await exigir(m.org_id, 'editar_contenido') } catch (e) { if (e instanceof SinPermiso) ir(marcaId, 'error', e.message); throw e }
  const sb = await supabaseServidor()
  const mes = new Date(); const mesIso = new Date(Date.UTC(mes.getUTCFullYear(), mes.getUTCMonth(), 1)).toISOString().slice(0, 10)
  const { data: plan, error } = await sb.from('planes_mes').insert({ org_id: m.org_id, marca_id: m.id, mes: mesIso }).select('id').single()
  if (error || !plan) return ir(marcaId, 'error', 'No pudimos crear el plan.')

  const ficha = fichaComoTexto(m.nombre, m.perfil as Perfil)
  const r = await ia.ejecutar<Plan>({
    tarea: 'plan_mes', org_id: m.org_id, marca_id: m.id, esquema: EsquemaPlan, sistema: sistemaPlan,
    usuario: `<ficha>\n${ficha}\n</ficha>\n\nPrimera entrega de prueba: propón un plan con EXACTAMENTE 1 pieza (tipo "post") para este mes.`,
    fuente: ficha, frasesProhibidas: frasesDeFicha(m.perfil as Perfil), maxTokens: 1500,
  })
  if (!r.ok) {
    await sb.from('planes_mes').update({ estado: 'error', error: r.detalle }).eq('id', plan.id)
    return ir(marcaId, 'error', MENSAJE_IA[r.motivo] ?? r.detalle)
  }
  await sb.from('planes_mes').update({ estado: 'por_aprobar', contenido: r.salida as unknown as Record<string, unknown> }).eq('id', plan.id)
  ir(marcaId, 'ok', 'Plan listo para que lo revises.')
}

export async function aprobarPlan(fd: FormData) {
  const marcaId = String(fd.get('marca') ?? ''), planId = String(fd.get('plan') ?? '')
  const sb = await supabaseServidor()
  const { data: unaVez, error } = await sb.rpc('aprobar_plan', { p_plan: planId })
  if (error) return ir(marcaId, 'error', 'No tienes permiso para aprobar este plan.')
  if (unaVez) { // solo el primer clic crea piezas: la aprobación es atómica
    const { data: p } = await sb.from('planes_mes').select('org_id, marca_id, contenido').eq('id', planId).single()
    const plan = EsquemaPlan.parse(p!.contenido)
    const filas = plan.piezas.map((x) => ({ org_id: p!.org_id, marca_id: p!.marca_id, plan_id: planId, tipo: x.tipo, estado: 'por_generar', parametros: x }))
    await supabaseAdmin().from('piezas').insert(filas)
  }
  ir(marcaId, 'ok', unaVez ? 'Plan aprobado.' : 'Ese plan ya estaba aprobado.')
}

export async function generarPieza(fd: FormData) {
  const marcaId = String(fd.get('marca') ?? ''), piezaId = String(fd.get('pieza') ?? '')
  const m = await marcaConFicha(marcaId)
  try { await exigir(m.org_id, 'editar_contenido') } catch (e) { if (e instanceof SinPermiso) ir(marcaId, 'error', e.message); throw e }
  const db = supabaseAdmin()
  // Compare-and-set: solo una generación a la vez por pieza.
  const { data: tomada } = await db.from('piezas').update({ estado: 'generando', intentos_generacion: 1 })
    .eq('id', piezaId).eq('org_id', m.org_id).in('estado', ['por_generar', 'error_generacion', 'por_aprobar']).select('parametros').maybeSingle()
  if (!tomada) return ir(marcaId, 'error', 'Esta pieza ya se está generando o no existe.')

  const ficha = fichaComoTexto(m.nombre, m.perfil as Perfil)
  const idea = JSON.stringify(tomada.parametros)
  const r = await ia.ejecutar({
    tarea: 'redactar_pieza', org_id: m.org_id, marca_id: m.id, pieza_id: piezaId, esquema: EsquemaPieza, sistema: sistemaPieza,
    usuario: `<ficha>\n${ficha}\n</ficha>\n\nIdea de la pieza (dato del plan aprobado): ${idea}`,
    fuente: ficha + '\n' + idea, frasesProhibidas: frasesDeFicha(m.perfil as Perfil), maxTokens: 2000,
    campoTexto: (s) => `${s.caption} ${s.hashtags.join(' ')} ${s.titular} ${s.subtitulo}`,
  })
  if (!r.ok) {
    await db.from('piezas').update({ estado: 'error_generacion', generacion: { error: r.detalle } }).eq('id', piezaId).eq('org_id', m.org_id)
    return ir(marcaId, 'error', MENSAJE_IA[r.motivo] ?? r.detalle)
  }
  try {
    const png = await renderPieza({ titular: r.salida.titular, subtitulo: r.salida.subtitulo, marca: m.nombre, colores: (m.perfil as Perfil).colores })
    const ruta = `${m.org_id}/${piezaId}/${randomUUID()}.png`
    const { error: up } = await db.storage.from('piezas').upload(ruta, png, { contentType: 'image/png', upsert: false })
    if (up) throw new Error('subida')
    const { data: pub } = db.storage.from('piezas').getPublicUrl(ruta)
    const caption = `${r.salida.caption}\n\n${r.salida.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}`.trim()
    await db.from('piezas').update({
      estado: 'por_aprobar', caption, media_urls: [pub.publicUrl], costo_usd: r.meta.costo_usd,
      generacion: { proveedor: r.meta.proveedor, modelo: r.meta.modelo, fallback_de: r.meta.fallback_de, colores: coloresDeFicha((m.perfil as Perfil).colores) },
    }).eq('id', piezaId).eq('org_id', m.org_id)
  } catch {
    await db.from('piezas').update({ estado: 'error_generacion', generacion: { error: 'No se pudo componer o guardar la imagen.' } }).eq('id', piezaId).eq('org_id', m.org_id)
    return ir(marcaId, 'error', 'El texto salió bien pero no pudimos crear la imagen. Reintenta.')
  }
  ir(marcaId, 'ok', 'Pieza lista para aprobar.')
}

export async function aprobarPieza(fd: FormData) {
  const marcaId = String(fd.get('marca') ?? ''), piezaId = String(fd.get('pieza') ?? '')
  const sb = await supabaseServidor()
  const { data, error } = await sb.rpc('aprobar_pieza', { p_pieza: piezaId })
  if (error) return ir(marcaId, 'error', 'No tienes permiso para aprobar esta pieza.')
  ir(marcaId, 'ok', data ? 'Pieza aprobada.' : 'Esa pieza ya estaba aprobada.')
}

// Programa la publicación en Instagram: vista previa y confirmación ya ocurrieron en pantalla (botón explícito).
export async function programarInstagram(fd: FormData) {
  const marcaId = String(fd.get('marca') ?? ''), piezaId = String(fd.get('pieza') ?? '')
  const m = await marcaConFicha(marcaId)
  try { await exigir(m.org_id, 'aprobar') } catch (e) { if (e instanceof SinPermiso) ir(marcaId, 'error', e.message); throw e }
  const db = supabaseAdmin()
  const { data: org } = await db.from('organizaciones').select('kill_switch').eq('id', m.org_id).single()
  if (org?.kill_switch) return ir(marcaId, 'error', 'La pausa de emergencia está activa.')
  const { data: pz } = await db.from('piezas').select('estado').eq('id', piezaId).eq('org_id', m.org_id).maybeSingle()
  if (pz?.estado !== 'aprobada') return ir(marcaId, 'error', 'Primero aprueba la pieza.')
  const { data: cx } = await db.from('conexiones').select('id').eq('marca_id', m.id).eq('org_id', m.org_id).eq('plataforma', 'instagram').eq('estado', 'activa').limit(1).maybeSingle()
  if (!cx) return ir(marcaId, 'error', 'Conecta primero la cuenta de Instagram de este negocio.')
  const { error } = await db.from('publicaciones').upsert({
    org_id: m.org_id, pieza_id: piezaId, conexion_id: cx.id, plataforma: 'instagram',
    programada_para: new Date().toISOString(), clave_idempotencia: `${m.org_id}:${piezaId}:instagram`,
  }, { onConflict: 'clave_idempotencia', ignoreDuplicates: true })
  if (error) return ir(marcaId, 'error', 'No pudimos programar la publicación.')
  ir(marcaId, 'ok', 'Programada. Se publica en el próximo minuto.')
}

export async function reintentarPublicacion(fd: FormData) {
  const marcaId = String(fd.get('marca') ?? ''), id = String(fd.get('pub') ?? '')
  const m = await marcaConFicha(marcaId)
  try { await exigir(m.org_id, 'aprobar') } catch (e) { if (e instanceof SinPermiso) ir(marcaId, 'error', e.message); throw e }
  // Reintento manual y consciente. Si ya se había enviado la orden de publicar, no se reintenta: hay que verificar en Instagram.
  const { data } = await supabaseAdmin().from('publicaciones').update({ estado: 'pendiente', error: null, intentos: 0 })
    .eq('id', id).eq('org_id', m.org_id).eq('estado', 'error').or('fase.is.null,fase.eq.contenedor_creado').select('id')
  ir(marcaId, data?.length ? 'ok' : 'error', data?.length ? 'Reintentando.' : 'Esta publicación no se puede reintentar sin revisar Instagram primero.')
}
