import { supabaseAdmin } from '@/lib/supabase/admin'
import { descifrar } from '@/lib/cifrado'
import { crearContenedorCarrusel, crearContenedorImagen, crearHijoCarrusel, estadoContenedor, ErrorIg, publicarContenedor } from '@/lib/instagram'

type Fila = { id: string; org_id: string; pieza_id: string; conexion_id: string; plataforma: string; creation_id: string | null; id_externo: string | null; fase: string | null }

// Procesa la cola (llamado por el cron). Idempotente: ver docs/knowledge/meta-publicacion-idempotencia-y-ads.md.
export async function procesarCola(limite = 5) {
  const db = supabaseAdmin()
  const { data: filas, error } = await db.rpc('tomar_publicaciones', { p_limite: limite, p_lease_seg: 300 })
  if (error) throw new Error('No se pudo leer la cola')
  const out = { tomadas: 0, publicadas: 0, errores: 0 }
  for (const f of (filas ?? []) as Fila[]) {
    out.tomadas++
    const fin = async (campos: Record<string, unknown>) => { await db.from('publicaciones').update({ bloqueado_hasta: null, ...campos }).eq('id', f.id).eq('org_id', f.org_id) }
    try {
      if (f.id_externo) { await fin({ estado: 'publicada' }); continue }
      // Recuperación tras caída: si ya se había enviado media_publish no se repite (riesgo de duplicado).
      if (f.fase === 'publish_enviado') { await fin({ estado: 'error', error: 'No pudimos confirmar si se publicó. Revisa Instagram antes de reintentar.' }); out.errores++; continue }
      if (f.plataforma !== 'instagram') { await fin({ estado: 'error', error: 'Esta red aún no se publica directo.' }); out.errores++; continue }

      const { data: cx } = await db.from('conexiones').select('cuenta_externa_id, token_cifrado, estado').eq('id', f.conexion_id).eq('org_id', f.org_id).maybeSingle()
      const { data: pz } = await db.from('piezas').select('caption, media_urls, estado, tipo').eq('id', f.pieza_id).eq('org_id', f.org_id).maybeSingle()
      if (!cx || cx.estado !== 'activa') { await fin({ estado: 'error', error: 'La conexión de Instagram necesita reconectarse.' }); out.errores++; continue }
      // Defensa: nunca se publica algo que no esté aprobado.
      if (!pz || pz.estado !== 'aprobada' || !pz.media_urls?.[0]) { await fin({ estado: 'error', error: 'La pieza no está aprobada o no tiene imagen.' }); out.errores++; continue }
      const token = descifrar(cx.token_cifrado)

      let creation = f.creation_id
      if (!creation) {
        if (pz.tipo === 'carrusel') {
          // Hijos primero (si se corta aquí, quedan contenedores huérfanos que Instagram expira solos; no se publica nada).
          const hijos: string[] = []
          for (const u of pz.media_urls) hijos.push(await crearHijoCarrusel(cx.cuenta_externa_id, token, u))
          creation = await crearContenedorCarrusel(cx.cuenta_externa_id, token, hijos, pz.caption ?? '')
        } else creation = await crearContenedorImagen(cx.cuenta_externa_id, token, pz.media_urls[0], pz.caption ?? '')
        await db.from('publicaciones').update({ creation_id: creation, fase: 'contenedor_creado' }).eq('id', f.id).eq('org_id', f.org_id)
      }
      let st = await estadoContenedor(token, creation)
      for (let i = 0; i < 4 && st === 'IN_PROGRESS'; i++) { await new Promise((r) => setTimeout(r, 2000 * (i + 1))); st = await estadoContenedor(token, creation) }
      if (st === 'IN_PROGRESS') { await fin({ estado: 'pendiente', programada_para: new Date(Date.now() + 60_000).toISOString() }); continue } // sigue esperando; no se recrea
      if (st !== 'FINISHED') { await fin({ estado: 'error', error: `Instagram no pudo procesar la imagen (${st}).` }); out.errores++; continue }

      await db.from('publicaciones').update({ fase: 'publish_enviado' }).eq('id', f.id).eq('org_id', f.org_id) // ANTES del POST
      const idExterno = await publicarContenedor(cx.cuenta_externa_id, token, creation)
      await fin({ estado: 'publicada', id_externo: idExterno, publicada_en: new Date().toISOString(), error: null })
      await db.from('auditoria').insert({ org_id: f.org_id, actor: 'publicador', accion: 'publicar_instagram', detalle: { pieza: f.pieza_id, id_externo: idExterno } })
      out.publicadas++
    } catch (e) {
      out.errores++
      if (e instanceof ErrorIg && e.tipo === 'token') {
        await db.from('conexiones').update({ estado: 'reconectar' }).eq('id', f.conexion_id).eq('org_id', f.org_id)
        await fin({ estado: 'error', error: 'La conexión de Instagram caducó. Reconéctala.' })
      } else if (e instanceof ErrorIg && e.tipo === 'incierto') {
        await fin({ estado: 'error', error: 'No pudimos confirmar si se publicó. Revisa Instagram antes de reintentar.' })
      } else {
        await fin({ estado: 'error', error: e instanceof ErrorIg ? e.message : 'Falló la publicación.' })
      }
    }
  }
  return out
}
