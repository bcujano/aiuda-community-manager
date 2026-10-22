import { supabaseServidor } from '@/lib/supabase/servidor'
import { TOPE_MENSUAL_GLOBAL_USD } from '@/lib/ia/config'
import { Lecturas } from '@/components/Lecturas'
import { FuenteDato } from '@/components/FuenteDato'
import { Ayuda } from '@/components/Ayuda'

export const dynamic = 'force-dynamic'

export default async function Costos() {
  const sb = await supabaseServidor()
  const desde = new Date(); desde.setUTCDate(1); desde.setUTCHours(0, 0, 0, 0)
  // RLS: solo owner/aprobador de la organización leen el ledger.
  const { data: filas } = await sb.from('ia_llamadas').select('proveedor, modelo, tarea, costo_usd, estado, fallback_de, pieza_id, creado_en').gte('creado_en', desde.toISOString()).order('creado_en', { ascending: false }).limit(1000)
  const ll = filas ?? []
  const total = ll.reduce((s, f) => s + Number(f.costo_usd), 0)
  const porProv = new Map<string, { n: number; usd: number }>()
  for (const f of ll) { const a = porProv.get(f.proveedor) ?? { n: 0, usd: 0 }; a.n++; a.usd += Number(f.costo_usd); porProv.set(f.proveedor, a) }
  const fallbacks = ll.filter((f) => f.fallback_de && f.estado === 'ok').length
  const errores = ll.filter((f) => f.estado !== 'ok').length
  const piezas = new Set(ll.filter((f) => f.pieza_id && f.estado === 'ok').map((f) => f.pieza_id)).size
  return (
    <main className="contenedor">
      <h1>Costo de IA este mes</h1>
      {ll.length === 0 ? <p className="suave">Aún no hay llamadas de IA este mes. Cuando generes un plan o una pieza, aquí verás cuánto costó.</p> : (
        <>
          <section className="tarjeta">
            <p>Gastado: <FuenteDato valor={total.toFixed(4)} unidad=" US$" origen="suma del registro de llamadas de IA de tu empresa este mes" />
              <Ayuda que="Lo que costaron las llamadas a los modelos de IA este mes." origen="Tokens usados × tarifa por modelo (tarifas referenciales, por verificar)." afecta="Al llegar al tope mensual se detiene la generación." ejemplo="US$ 0,35 de 50" /></p>
            <p>Tope mensual del sistema: <FuenteDato valor={TOPE_MENSUAL_GLOBAL_USD} unidad=" US$" origen="variable IA_TOPE_MENSUAL_USD (por defecto 50)" /></p>
            <p>Costo medio por pieza: <FuenteDato valor={piezas ? (total / piezas).toFixed(4) : null} unidad=" US$" origen={`${piezas} pieza(s) con llamadas exitosas este mes`} /></p>
            <p className="suave">Llamadas que pasaron a un proveedor de respaldo: {fallbacks} · llamadas fallidas o inválidas: {errores}</p>
          </section>
          <table className="tarjeta"><thead><tr><th>Proveedor</th><th>Llamadas</th><th>US$</th></tr></thead>
            <tbody>{[...porProv].map(([p, a]) => <tr key={p}><td>{p}</td><td>{a.n}</td><td>{a.usd.toFixed(4)}</td></tr>)}</tbody></table>
        </>
      )}
      <Lecturas items={[
        { decision: 'Si el costo por pieza sube', cruzar: 'el proveedor: un respaldo caro puede estar cubriendo una caída del principal' },
        { decision: 'Si hay muchas llamadas inválidas', cruzar: 'la ficha: datos faltantes o frases prohibidas que chocan con el tema' },
      ]} />
    </main>
  )
}
