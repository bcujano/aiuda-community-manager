import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServidor } from '@/lib/supabase/servidor'
import { CAMPOS, GRUPOS, completitud, type Perfil } from '@/lib/ficha'
import { Ayuda } from '@/components/Ayuda'
import { guardarFicha } from './acciones'

export const dynamic = 'force-dynamic'

export default async function Ficha({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params
  const { error, ok } = await searchParams
  const supabase = await supabaseServidor()
  const { data: marca } = await supabase.from('marcas').select('id, nombre, perfil').eq('id', id).maybeSingle()
  if (!marca) notFound()
  const perfil = (marca.perfil ?? {}) as Perfil
  const av = completitud(perfil)

  return (
    <main className="contenedor">
      <p><Link href="/app">← Inicio</Link></p>
      <h1>{marca.nombre}</h1>
      <p className="suave">Cuanto más completa esté esta ficha, mejores serán tus publicaciones, anuncios y respuestas. Lo que no sepas, déjalo en blanco: nunca se inventa.</p>
      <div className="barra" aria-label={`Avance ${av.porcentaje}%`}><i style={{ width: `${av.porcentaje}%` }} /></div>
      <p className="suave">{av.hechos} de {av.total} datos completos ({av.porcentaje} %)</p>
      {error && <p role="alert" style={{ color: '#c0392b' }}>{error}</p>}
      {ok && <p role="status" style={{ color: '#1e8e5a' }}>{ok}</p>}

      <form action={guardarFicha}>
        <input type="hidden" name="id" value={marca.id} />
        {GRUPOS.map((g) => (
          <section key={g} className="grupo">
            <h2>{g}</h2>
            {CAMPOS.filter((c) => c.grupo === g).map((c) => {
              const v = perfil[c.clave]
              const valor = v == null ? '' : String(v)
              return (
                <label key={c.clave} className="campo">
                  <span>{c.etiqueta}<Ayuda {...c.ayuda} /></span>
                  {c.tipo === 'largo' ? <textarea name={c.clave} defaultValue={valor} />
                    : c.tipo === 'opcion' ? (
                      <select name={c.clave} defaultValue={valor}>
                        <option value="">Elige una opción</option>
                        {c.opciones!.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : <input name={c.clave} defaultValue={valor} type={c.tipo === 'numero' ? 'number' : 'text'} min={c.tipo === 'numero' ? 0 : undefined} />}
                </label>
              )
            })}
          </section>
        ))}
        <div className="fija"><button type="submit">Guardar ficha</button></div>
      </form>
    </main>
  )
}
