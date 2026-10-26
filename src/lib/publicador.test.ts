import { beforeEach, describe, expect, it, vi } from 'vitest'

type Fila = Record<string, any>
const tablas: Record<string, Fila[]> = {}
let cola: Fila[] = []

// Base en memoria con la parte de la API de Supabase que usa el publicador.
function consulta(tabla: string) {
  const filtros: [string, any][] = []; let cambios: Fila | null = null; let insertar: Fila | null = null
  const filas = () => (tablas[tabla] ?? []).filter((r) => filtros.every(([k, v]) => r[k] === v))
  const q: any = {
    select: () => q, eq: (k: string, v: any) => (filtros.push([k, v]), q),
    update: (c: Fila) => ((cambios = c), q), insert: (r: Fila) => ((insertar = r), q),
    maybeSingle: async () => ({ data: filas()[0] ?? null }),
    then: (res: any) => { if (insertar) (tablas[tabla] ??= []).push(insertar); if (cambios) filas().forEach((r) => Object.assign(r, cambios)); return Promise.resolve({ data: null }).then(res) },
  }
  return q
}
vi.mock('@/lib/supabase/admin', () => ({ supabaseAdmin: () => ({ from: consulta, rpc: async () => ({ data: cola.splice(0), error: null }) }) }))
vi.mock('@/lib/cifrado', () => ({ descifrar: () => 'TOKEN' }))
import { procesarCola } from './publicador'

const llamadas: string[] = []
function fetchSim(opts: { cortarPublish?: boolean } = {}) {
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    const u = String(url); llamadas.push((init?.method ?? 'GET') + ' ' + u.replace(/\?.*/, '').split('/').slice(-1)[0])
    if (u.endsWith('/media')) return Response.json({ id: 'CONT1' })
    if (u.includes('CONT1')) return Response.json({ status_code: 'FINISHED' })
    if (u.endsWith('/media_publish')) { if (opts.cortarPublish) throw new Error('proceso muerto'); return Response.json({ id: 'POST1' }) }
    return Response.json({}, { status: 404 })
  }))
}
const pub = (o: Fila = {}) => ({ id: 'p1', org_id: 'o1', pieza_id: 'z1', conexion_id: 'c1', plataforma: 'instagram', creation_id: null, id_externo: null, fase: null, estado: 'publicando', ...o })

beforeEach(() => {
  llamadas.length = 0
  tablas.conexiones = [{ id: 'c1', org_id: 'o1', cuenta_externa_id: 'ig1', token_cifrado: 'x', estado: 'activa' }]
  tablas.piezas = [{ id: 'z1', org_id: 'o1', estado: 'aprobada', caption: 'Hola', media_urls: ['https://x/y.png'] }]
  tablas.publicaciones = [pub()]; tablas.auditoria = []; cola = [tablas.publicaciones[0]]
})

describe('publicador', () => {
  it('publica en dos fases y marca publicada', async () => {
    fetchSim()
    expect(await procesarCola()).toMatchObject({ publicadas: 1, errores: 0 })
    expect(llamadas.filter((l) => l.startsWith('POST'))).toEqual(['POST media', 'POST media_publish'])
    expect(tablas.publicaciones[0]).toMatchObject({ estado: 'publicada', id_externo: 'POST1' })
  })
  it('si el proceso muere al publicar, la recuperación NO republica (sin duplicados)', async () => {
    fetchSim({ cortarPublish: true })
    await procesarCola()
    expect(tablas.publicaciones[0]).toMatchObject({ estado: 'error', fase: 'publish_enviado' })
    // el lease vence y otro worker la retoma
    Object.assign(tablas.publicaciones[0], { estado: 'publicando' }); cola = [tablas.publicaciones[0]]; llamadas.length = 0
    fetchSim()
    await procesarCola()
    expect(llamadas.filter((l) => l.startsWith('POST'))).toEqual([])
    expect(tablas.publicaciones[0].estado).toBe('error')
  })
  it('si muere después de crear el contenedor, reanuda con el creation_id sin recrearlo', async () => {
    tablas.publicaciones[0] = pub({ creation_id: 'CONT1', fase: 'contenedor_creado' }); cola = [tablas.publicaciones[0]]
    fetchSim(); await procesarCola()
    expect(llamadas).not.toContain('POST media')
    expect(tablas.publicaciones[0]).toMatchObject({ estado: 'publicada', id_externo: 'POST1' })
  })
  it('carrusel: hijos → contenedor padre → publica una sola vez', async () => {
    tablas.piezas[0] = { ...tablas.piezas[0], tipo: 'carrusel', media_urls: ['https://x/1.png', 'https://x/2.png', 'https://x/3.png'] }
    fetchSim(); await procesarCola()
    expect(llamadas.filter((l) => l === 'POST media')).toHaveLength(4) // 3 hijos + padre
    expect(llamadas.filter((l) => l === 'POST media_publish')).toHaveLength(1)
    expect(tablas.publicaciones[0].estado).toBe('publicada')
  })
  it('no publica piezas no aprobadas', async () => {
    tablas.piezas[0].estado = 'por_aprobar'; fetchSim()
    await procesarCola()
    expect(llamadas).toHaveLength(0); expect(tablas.publicaciones[0].estado).toBe('error')
  })
  it('una fila ya publicada no se vuelve a publicar', async () => {
    tablas.publicaciones[0] = pub({ id_externo: 'POST0' }); cola = [tablas.publicaciones[0]]; fetchSim()
    await procesarCola(); expect(llamadas).toHaveLength(0); expect(tablas.publicaciones[0].estado).toBe('publicada')
  })
})
