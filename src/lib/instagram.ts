import { GRAPH_VERSION, IG_GRAPH } from './meta'

// Cliente mínimo de la API de Instagram (Instagram Login). GET se reintenta (3 veces, con espera); POST jamás.
export class ErrorIg extends Error {
  constructor(public tipo: 'token' | 'rechazo' | 'incierto', mensaje: string, public codigo?: number) { super(mensaje) }
}
const base = (ig: string) => `${IG_GRAPH}/${GRAPH_VERSION}/${encodeURIComponent(ig)}`

async function json(r: Response) {
  const j = (await r.json().catch(() => ({}))) as { error?: { code?: number; message?: string } } & Record<string, unknown>
  return { j, ok: r.ok }
}

async function crearContenedor(ig: string, token: string, campos: Record<string, string>): Promise<string> {
  let r: Response
  try {
    r = await fetch(`${base(ig)}/media`, { method: 'POST', signal: AbortSignal.timeout(30_000),
      body: new URLSearchParams({ ...campos, access_token: token }) })
  } catch { throw new ErrorIg('incierto', 'No hubo respuesta de Instagram al crear el contenedor.') }
  const { j, ok } = await json(r)
  if (!ok || typeof j.id !== 'string') {
    const c = j.error?.code
    throw new ErrorIg(c === 190 || r.status === 401 ? 'token' : 'rechazo', 'Instagram rechazó el contenido.', c)
  }
  return j.id
}

export const crearContenedorImagen = (ig: string, token: string, imageUrl: string, caption: string) => crearContenedor(ig, token, { image_url: imageUrl, caption })
export const crearHijoCarrusel = (ig: string, token: string, imageUrl: string) => crearContenedor(ig, token, { image_url: imageUrl, is_carousel_item: 'true' })
export const crearContenedorCarrusel = (ig: string, token: string, hijos: string[], caption: string) => crearContenedor(ig, token, { media_type: 'CAROUSEL', children: hijos.join(','), caption })

export async function estadoContenedor(token: string, creationId: string): Promise<'FINISHED' | 'IN_PROGRESS' | 'ERROR' | 'EXPIRED' | string> {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(`${IG_GRAPH}/${GRAPH_VERSION}/${encodeURIComponent(creationId)}?${new URLSearchParams({ fields: 'status_code', access_token: token })}`, { signal: AbortSignal.timeout(15_000) })
      const { j, ok } = await json(r)
      if (ok && typeof j.status_code === 'string') return j.status_code
      if (r.status === 401 || j.error?.code === 190) throw new ErrorIg('token', 'Token inválido', 190)
    } catch (e) { if (e instanceof ErrorIg) throw e }
    await new Promise((res) => setTimeout(res, 1000 * 2 ** i))
  }
  return 'IN_PROGRESS'
}

// POST sin reintento: si no sabemos si Instagram lo recibió, el error es «incierto» y NO se repite.
export async function publicarContenedor(ig: string, token: string, creationId: string): Promise<string> {
  let r: Response
  try {
    r = await fetch(`${base(ig)}/media_publish`, { method: 'POST', signal: AbortSignal.timeout(30_000),
      body: new URLSearchParams({ creation_id: creationId, access_token: token }) })
  } catch { throw new ErrorIg('incierto', 'No hubo respuesta de Instagram al publicar.') }
  const { j, ok } = await json(r)
  if (ok && typeof j.id === 'string') return j.id
  const c = j.error?.code
  if (r.status >= 500) throw new ErrorIg('incierto', 'Instagram devolvió un error al publicar; no sabemos si se publicó.', c)
  throw new ErrorIg(c === 190 || r.status === 401 ? 'token' : 'rechazo', 'Instagram rechazó la publicación.', c)
}
