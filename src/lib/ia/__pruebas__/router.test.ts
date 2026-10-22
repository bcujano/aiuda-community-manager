import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { crearRouter } from '../router'
import { ErrorProveedor, type AdaptadorProveedor, type Ledger, type Proveedor, type RegistroLedger } from '../tipos'
import { cifrasSinFuente, frasesProhibidasEn, limitesIg } from '../validadores'
import { Circuitos } from '../circuito'

const esquema = z.object({ caption: z.string() })
const mk = (n: Proveedor, f: (i: number) => string | Error, vivo = true): AdaptadorProveedor & { n: number } => {
  const a = { n: 0, nombre: n, disponible: () => vivo,
    async llamar() { const r = f(a.n++); if (r instanceof Error) throw r; return { texto: r, tokensIn: 100, tokensOut: 50 } } }
  return a
}
const ledger = (gasto = 0): Ledger & { filas: RegistroLedger[] } => {
  const filas: RegistroLedger[] = []
  return { filas, registrar: async (r) => void filas.push(r), gastoMesUsd: async () => gasto }
}
const base = { tarea: 'redactar_pieza' as const, org_id: 'o1', sistema: 's', usuario: 'u', esquema, campoTexto: (s: { caption: string }) => s.caption }
const ok = JSON.stringify({ caption: 'Hola Quito' })
const caida = (p: Proveedor) => new ErrorProveedor(p, 'transitorio', 'HTTP 529', 529)
const sinEspera = { esperar: async () => {} }

describe('router de IA', () => {
  it('usa Anthropic cuando responde y deja ledger', async () => {
    const l = ledger()
    const r = await crearRouter({ proveedores: [mk('anthropic', () => ok), mk('openai', () => ok)], ledger: l, ...sinEspera }).ejecutar(base)
    expect(r.ok && r.meta.proveedor).toBe('anthropic')
    expect(l.filas).toHaveLength(1)
    expect(l.filas[0].costo_usd).toBeGreaterThan(0)
  })
  it('cae a OpenAI si Anthropic falla (sin saldo) y lo registra', async () => {
    const l = ledger(); const alertas: string[] = []
    const a = mk('anthropic', () => new ErrorProveedor('anthropic', 'credencial', 'HTTP 402', 402))
    const r = await crearRouter({ proveedores: [a, mk('openai', () => ok)], ledger: l, alerta: (m) => alertas.push(m), ...sinEspera }).ejecutar(base)
    expect(r.ok && r.meta.proveedor).toBe('openai')
    expect(r.ok && r.meta.fallback_de).toBe('anthropic')
    expect(alertas).toHaveLength(1)
    expect(l.filas.map((f) => f.estado)).toEqual(['error', 'ok'])
  })
  it('termina con Gemini si caen Anthropic y OpenAI', async () => {
    const r = await crearRouter({ proveedores: [mk('anthropic', () => caida('anthropic')), mk('openai', () => caida('openai')), mk('gemini', () => ok)], ledger: ledger(), ...sinEspera }).ejecutar(base)
    expect(r.ok && r.meta.proveedor).toBe('gemini')
  })
  it('con los tres caídos queda en cola', async () => {
    const ps = (['anthropic', 'openai', 'gemini'] as const).map((p) => mk(p, () => caida(p)))
    const r = await crearRouter({ proveedores: ps, ledger: ledger(), ...sinEspera }).ejecutar(base)
    expect(!r.ok && r.motivo).toBe('en_cola_ia')
  })
  it('omite proveedores sin clave', async () => {
    const r = await crearRouter({ proveedores: [mk('anthropic', () => ok, false), mk('openai', () => ok)], ledger: ledger(), ...sinEspera }).ejecutar(base)
    expect(r.ok && r.meta.proveedor).toBe('openai')
  })
  it('repara una salida inválida una vez', async () => {
    const a = mk('anthropic', (i) => (i === 0 ? 'no es json' : ok))
    const r = await crearRouter({ proveedores: [a], ledger: ledger(), ...sinEspera }).ejecutar(base)
    expect(r.ok).toBe(true); expect(a.n).toBe(2)
  })
  it('bloquea frases prohibidas y cifras sin fuente que persisten', async () => {
    const mal = JSON.stringify({ caption: 'Oferta imperdible: 30% menos' })
    const r = await crearRouter({ proveedores: [mk('anthropic', () => mal)], ledger: ledger(), ...sinEspera }).ejecutar(base)
    expect(!r.ok && r.motivo).toBe('validacion')
  })
  it('acepta cifras que están en la fuente', async () => {
    const r = await crearRouter({ proveedores: [mk('anthropic', () => JSON.stringify({ caption: 'Desde USD 85.000' }))], ledger: ledger(), ...sinEspera }).ejecutar({ ...base, fuente: 'Rango: desde USD 85.000 hasta 140.000' })
    expect(r.ok).toBe(true)
  })
  it('respeta el tope mensual y el kill switch', async () => {
    const a = mk('anthropic', () => ok)
    const r1 = await crearRouter({ proveedores: [a], ledger: ledger(50), topeMensualUsd: 50 }).ejecutar(base)
    expect(!r1.ok && r1.motivo).toBe('presupuesto')
    const r2 = await crearRouter({ proveedores: [a], ledger: ledger(), killSwitch: async () => true }).ejecutar(base)
    expect(!r2.ok && r2.motivo).toBe('kill_switch'); expect(a.n).toBe(0)
  })
  it('el circuito abre tras 5 fallas en 60 s', () => {
    let t = 0; const c = new Circuitos(() => t)
    for (let i = 0; i < 5; i++) c.falla('openai')
    expect(c.permite('openai')).toBe(false); t = 31_000; expect(c.permite('openai')).toBe(true)
  })
})

describe('validadores', () => {
  it('frases prohibidas sin importar tildes', () => expect(frasesProhibidasEn('Última oportunidad', [])).toContain('última oportunidad'))
  it('cifras', () => { expect(cifrasSinFuente('85.000 y 12%', 'USD 85.000')).toEqual(['12']); expect(cifrasSinFuente('85,000', 'USD 85.000')).toEqual([]) })
  it('límites de Instagram', () => expect(limitesIg('a'.repeat(2300))).toHaveLength(1))
})
