import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServidor } from '@/lib/supabase/servidor'
import { rolEn, puede } from '@/lib/rbac'
import { EsquemaPlan } from '@/lib/contenido'
import { completitud, type Perfil } from '@/lib/ficha'
import { Ayuda } from '@/components/Ayuda'
import { Lecturas } from '@/components/Lecturas'
import { FuenteDato } from '@/components/FuenteDato'
import { aprobarPieza, aprobarPlan, generarPieza, generarPlan, programarInstagram, reintentarPublicacion } from './acciones'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const ESTADO_PIEZA: Record<string, string> = {
  por_generar: 'Por generar', generando: 'Generando…', por_aprobar: 'Por aprobar', aprobada: 'Aprobada', error_generacion: 'Falló la generación', cancelada: 'Cancelada', propuesta: 'Propuesta',
}

export default async function Plan({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params
  const { error, ok } = await searchParams
  const sb = await supabaseServidor()
  const { data: marca } = await sb.from('marcas').select('id, org_id, nombre, perfil').eq('id', id).maybeSingle()
  if (!marca) notFound()
  const rol = await rolEn(marca.org_id)
  const av = completitud((marca.perfil ?? {}) as Perfil)
  const { data: planes } = await sb.from('planes_mes').select('id, estado, contenido, error, mes').eq('marca_id', id).order('creado_en', { ascending: false }).limit(1)
  const plan = planes?.[0]
  const { data: piezas } = await sb.from('piezas').select('id, estado, tipo, caption, media_urls, costo_usd, parametros, generacion').eq('marca_id', id).order('creada_en', { ascending: false }).limit(20)
  const { data: pubs } = await sb.from('publicaciones').select('id, pieza_id, plataforma, estado, error, id_externo, publicada_en').in('pieza_id', (piezas ?? []).map((p) => p.id).concat('00000000-0000-0000-0000-000000000000'))
  const parsed = plan?.estado === 'por_aprobar' || plan?.estado === 'aprobado' ? EsquemaPlan.safeParse(plan.contenido) : null

  return (
    <main className="contenedor">
      <p><Link href={`/app/negocio/${id}`}>← Ficha del negocio</Link></p>
      <h1>Plan del mes · {marca.nombre}</h1>
      {error && <p role="alert" className="alerta-error">{error}</p>}
      {ok && <p role="status" className="alerta-ok">{ok}</p>}
      {av.porcentaje < 50 && <p className="suave">Tu ficha está al {av.porcentaje} %. Con más datos, el plan será más tuyo. <Link href={`/app/negocio/${id}`}>Completarla</Link></p>}

      {!plan || plan.estado === 'error' || plan.estado === 'descartado' ? (
        <form action={generarPlan} className="tarjeta">
          <input type="hidden" name="marca" value={id} />
          {plan?.estado === 'error' && <p className="alerta-error">El último intento falló. No se cobró nada que no se vea en tu registro de IA.</p>}
          <p>La IA propone el plan con lo que escribiste en la ficha. Cada generación usa crédito de IA con tope mensual.</p>
          <label className="campo"><span>Cuántas piezas <Ayuda que="Cuántas publicaciones propone el plan para el mes." origen="Lo eliges tú." afecta="Más piezas = más gasto de IA al generarlas una por una." ejemplo="4 = una por semana" /></span>
            <select name="cantidad" defaultValue="4"><option value="1">1 (prueba)</option><option value="4">4</option><option value="8">8</option><option value="12">12</option></select></label>
          <button type="submit" disabled={!puede(rol, 'editar_contenido')}>Generar plan</button>
        </form>
      ) : plan.estado === 'generando' ? (
        <p className="tarjeta">Generando el plan… recarga en unos segundos.</p>
      ) : parsed?.success ? (
        <section className="tarjeta">
          <strong>{parsed.data.titulo_mes}</strong>
          <ul>{parsed.data.piezas.map((p) => <li key={p.tema}><b>{p.tipo}</b> — {p.tema}<br /><span className="suave">Gancho: {p.gancho} · Objetivo: {p.objetivo}</span></li>)}</ul>
          {plan.estado === 'por_aprobar' && (
            <form action={aprobarPlan}>
              <input type="hidden" name="marca" value={id} /><input type="hidden" name="plan" value={plan.id} />
              <button type="submit" disabled={!puede(rol, 'aprobar')}>Aprobar plan</button>
              {!puede(rol, 'aprobar') && <span className="suave"> Solo owner o aprobador.</span>}
            </form>
          )}
        </section>
      ) : null}

      <h2>Piezas</h2>
      {(piezas ?? []).length === 0 && <p className="suave">Cuando apruebes el plan, aquí aparecen las piezas para generar.</p>}
      {(piezas ?? []).map((p) => {
        const pu = (pubs ?? []).filter((x) => x.pieza_id === p.id)
        return (
          <article key={p.id} className="tarjeta">
            <strong>{p.tipo}</strong> · {ESTADO_PIEZA[p.estado] ?? p.estado}
            <Ayuda que="El estado de la pieza en su camino a publicarse." afecta="Solo las aprobadas se publican." ejemplo="Por aprobar → Aprobada → publicada." origen="Lo calcula AiUDA según lo que hiciste." />
            {p.media_urls?.[0] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.media_urls[0]} alt="Vista previa de la pieza" style={{ width: '100%', maxWidth: 320, borderRadius: 'var(--radio-s)', display: 'block', margin: '12px 0' }} />}
            {p.caption && <p style={{ whiteSpace: 'pre-wrap' }}>{p.caption}</p>}
            {p.costo_usd != null && <p className="suave">Costo de IA de esta pieza: <FuenteDato valor={Number(p.costo_usd).toFixed(4)} unidad=" US$" origen="registro de llamadas de IA (ledger)" /></p>}
            {['por_generar', 'error_generacion', 'por_aprobar'].includes(p.estado) && (
              <form action={generarPieza} style={{ display: 'inline' }}><input type="hidden" name="marca" value={id} /><input type="hidden" name="pieza" value={p.id} />
                <button type="submit" className={p.estado === 'por_aprobar' ? 'secundario' : undefined} disabled={!puede(rol, 'editar_contenido')}>{p.estado === 'por_aprobar' ? 'Regenerar' : 'Generar pieza'}</button></form>
            )}
            {p.estado === 'por_aprobar' && (
              <form action={aprobarPieza} style={{ display: 'inline', marginLeft: 8 }}><input type="hidden" name="marca" value={id} /><input type="hidden" name="pieza" value={p.id} />
                <button type="submit" disabled={!puede(rol, 'aprobar')}>Aprobar</button></form>
            )}
            {p.estado === 'aprobada' && pu.length === 0 && (
              <form action={programarInstagram}>
                <input type="hidden" name="marca" value={id} /><input type="hidden" name="pieza" value={p.id} />
                <p className="suave">Se publicará <b>ahora</b> en el Instagram conectado de «{marca.nombre}», como imagen con el texto y los hashtags de arriba.</p>
                <button type="submit" disabled={!puede(rol, 'aprobar')}>Publicar en Instagram</button>
              </form>
            )}
            {pu.map((x) => (
              <div key={x.id} className={x.estado === 'error' ? 'alerta-error' : 'suave'}>
                Instagram: {x.estado === 'publicada' ? `publicada${x.publicada_en ? ' el ' + new Date(x.publicada_en).toLocaleString('es-EC', { timeZone: 'America/Guayaquil' }) : ''}` : x.estado === 'error' ? x.error : 'en cola'}
                {x.estado === 'error' && (
                  <form action={reintentarPublicacion} style={{ display: 'inline', marginLeft: 8 }}><input type="hidden" name="marca" value={id} /><input type="hidden" name="pub" value={x.id} /><button className="secundario" type="submit">Reintentar</button></form>
                )}
              </div>
            ))}
          </article>
        )
      })}
      <Lecturas items={[
        { decision: 'Si una pieza falla al generar', cruzar: 'tu ficha: faltan datos o hay frases prohibidas que chocan con el tema' },
        { decision: 'Costo por pieza', cruzar: 'el tope mensual de IA y el plan que contratas' },
      ]} />
    </main>
  )
}
