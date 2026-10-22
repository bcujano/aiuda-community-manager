import { CADENA, NIVEL_TAREA, TOPE_MENSUAL_GLOBAL_USD, costoUsd, modeloDe } from './config'
import { Circuitos } from './circuito'
import { ErrorProveedor, type AdaptadorProveedor, type EntradaEjecutar, type Ledger, type MetaLlamada, type Proveedor, type ResultadoEjecutar } from './tipos'
import { revisarTexto } from './validadores'

export type OpcionesRouter = {
  proveedores: AdaptadorProveedor[]
  ledger: Ledger
  circuitos?: Circuitos
  esperar?: (ms: number) => Promise<void>
  timeoutMs?: number
  topeMensualUsd?: number
  killSwitch?: (org_id: string) => Promise<boolean>
  alerta?: (msg: string) => void // aviso al operador (clave inválida o sin saldo); nunca incluye claves
  modeloDe?: typeof modeloDe
}

const dormir = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const extraerJson = (t: string) => {
  const s = t.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')
  const i = s.indexOf('{'), j = s.lastIndexOf('}')
  return JSON.parse(i >= 0 && j > i ? s.slice(i, j + 1) : s)
}

// Una sola puerta (docs/plan/03 §1): nada llama a un proveedor directo.
export function crearRouter(o: OpcionesRouter) {
  const circ = o.circuitos ?? new Circuitos()
  const esperar = o.esperar ?? dormir
  const modelo = o.modeloDe ?? modeloDe
  const tope = o.topeMensualUsd ?? TOPE_MENSUAL_GLOBAL_USD

  async function ejecutar<T>(e: EntradaEjecutar<T>): Promise<ResultadoEjecutar<T>> {
    if (o.killSwitch && (await o.killSwitch(e.org_id))) return { ok: false, motivo: 'kill_switch', detalle: 'La organización tiene la pausa de emergencia activa.' }
    // Tope global: si el gasto del mes ya llegó al tope, no se llama a ningún modelo (Regla E).
    if ((await o.ledger.gastoMesUsd(null)) >= tope) return { ok: false, motivo: 'presupuesto', detalle: `Se alcanzó el tope mensual de IA (US$${tope}).` }

    const nivel = NIVEL_TAREA[e.tarea]
    const avisos: string[] = []
    let primero: Proveedor | null = null
    let intentos = 0
    let correccion = ''

    for (const adap of CADENA.map((n) => o.proveedores.find((p) => p.nombre === n)).filter(Boolean) as AdaptadorProveedor[]) {
      if (!adap.disponible() || !circ.permite(adap.nombre)) { avisos.push(`${adap.nombre}: omitido (${adap.disponible() ? 'circuito abierto' : 'sin clave'})`); primero ??= adap.nombre; continue }
      const mod = modelo(adap.nombre, nivel)
      let reparado = false
      for (let intento = 0; intento < 3; intento++) {
        intentos++
        const t0 = Date.now()
        const ctl = new AbortController()
        const reloj = setTimeout(() => ctl.abort(), o.timeoutMs ?? 120_000)
        try {
          const r = await adap.llamar({ modelo: mod, sistema: e.sistema, usuario: e.usuario + correccion, maxTokens: e.maxTokens ?? 4000, json: true }, ctl.signal)
          const lat = Date.now() - t0
          const costo = costoUsd(adap.nombre, mod, r.tokensIn, r.tokensOut)
          const base = { org_id: e.org_id, marca_id: e.marca_id, pieza_id: e.pieza_id, tarea: e.tarea, proveedor: adap.nombre, modelo: mod,
            tokens_in: r.tokensIn, tokens_out: r.tokensOut, costo_usd: costo, latencia_ms: lat, fallback_de: primero }
          let salida: T, problemas: string[] = []
          try {
            const parsed = e.esquema.safeParse(extraerJson(r.texto))
            if (!parsed.success) throw new Error(parsed.error.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`).join('; '))
            salida = parsed.data
            problemas = revisarTexto((e.campoTexto ?? ((s: T) => JSON.stringify(s)))(salida), { fuente: e.fuente, extra: e.frasesProhibidas })
          } catch (err) {
            await o.ledger.registrar({ ...base, estado: 'invalida', error_codigo: 'esquema' })
            circ.ok(adap.nombre)
            if (!reparado) { reparado = true; correccion = `\n\nTu respuesta anterior no cumplió el formato (${(err as Error).message}). Corrige y responde solo con el JSON válido.`; continue }
            avisos.push(`${adap.nombre}: salida inválida`); break // siguiente proveedor
          }
          if (problemas.length) {
            await o.ledger.registrar({ ...base, estado: 'invalida', error_codigo: 'validacion' })
            if (!reparado) { reparado = true; correccion = `\n\nCorrige estos problemas y vuelve a responder con el JSON completo: ${problemas.join('; ')}.`; continue }
            // Persisten tras 1 corrección: bloqueo (nunca se entrega texto que rompa las reglas).
            return { ok: false, motivo: 'validacion', detalle: problemas.join('; ') }
          }
          await o.ledger.registrar({ ...base, estado: 'ok', error_codigo: null })
          circ.ok(adap.nombre)
          const meta: MetaLlamada = { proveedor: adap.nombre, modelo: mod, tokens_in: r.tokensIn, tokens_out: r.tokensOut, costo_usd: costo, latencia_ms: lat, intentos, fallback_de: primero, cache_hit: false }
          return { ok: true, salida: salida!, meta, avisos }
        } catch (err) {
          const pe = err instanceof ErrorProveedor ? err : new ErrorProveedor(adap.nombre, 'otro', (err as Error).message)
          await o.ledger.registrar({ org_id: e.org_id, marca_id: e.marca_id, pieza_id: e.pieza_id, tarea: e.tarea, proveedor: adap.nombre, modelo: mod,
            tokens_in: 0, tokens_out: 0, costo_usd: 0, latencia_ms: Date.now() - t0, estado: 'error', fallback_de: primero, error_codigo: pe.codigo + (pe.http ? `_${pe.http}` : '') })
          avisos.push(`${adap.nombre}: ${pe.codigo}`)
          if (pe.codigo === 'credencial') { circ.desactivar(adap.nombre); o.alerta?.(`${adap.nombre}: clave inválida o sin saldo`); break }
          circ.falla(adap.nombre)
          if (pe.codigo === 'transitorio' && intento === 0) { await esperar(800 + Math.random() * 400); continue } // 1 reintento con espera
          break
        } finally { clearTimeout(reloj) }
      }
      primero ??= adap.nombre
      correccion = ''
    }
    // Los tres fallaron: queda en cola; nada se publica sin revisar.
    return { ok: false, motivo: 'en_cola_ia', detalle: 'Los proveedores de IA no respondieron. La tarea queda en cola y se reintenta sola.' }
  }
  return { ejecutar, circuitos: circ }
}
