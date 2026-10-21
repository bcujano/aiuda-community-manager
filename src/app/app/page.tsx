import { supabaseServidor } from '@/lib/supabase/servidor'
import { salir } from '../login/acciones'
import { crearMarca, crearOrganizacion } from './acciones'

export const dynamic = 'force-dynamic'

export default async function Panel({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const supabase = await supabaseServidor()
  const { data: membresia } = await supabase
    .from('miembros')
    .select('rol, organizaciones(id, nombre)')
    .limit(1)
    .maybeSingle()
  const org = (membresia?.organizaciones as unknown as { id: string; nombre: string } | null) ?? null
  const { data: marcas } = org
    ? await supabase.from('marcas').select('id, nombre, sector').eq('org_id', org.id).order('creada_en')
    : { data: [] }

  return (
    <main className="contenedor">
      <form action={salir} style={{ float: 'right' }}><button className="secundario">Salir</button></form>
      <h1>{org ? org.nombre : 'Bienvenido a AiUDA'}</h1>
      {error && <p role="alert" style={{ color: '#c0392b' }}>{error}</p>}

      {!org ? (
        <form action={crearOrganizacion} className="tarjeta formulario">
          <strong>Crea tu empresa</strong>
          <label>Nombre de tu empresa<input name="nombre" required /></label>
          <label>País<input name="pais" placeholder="Ecuador" /></label>
          <button type="submit">Crear empresa</button>
        </form>
      ) : (
        <>
          <h2>Tus negocios</h2>
          {(marcas ?? []).length === 0 && <p className="suave">Aún no tienes ninguno. Agrega el primero para empezar el diagnóstico.</p>}
          {(marcas ?? []).map((m) => (
            <div key={m.id} className="tarjeta"><strong>{m.nombre}</strong>{m.sector && <span className="suave"> · {m.sector}</span>}</div>
          ))}
          <form action={crearMarca} className="tarjeta formulario">
            <input type="hidden" name="org_id" value={org.id} />
            <label>Nombre del negocio<input name="nombre" required /></label>
            <label>Sector<input name="sector" placeholder="Inmobiliario, restaurante, clínica…" /></label>
            <button type="submit">Agregar negocio</button>
          </form>
        </>
      )}
    </main>
  )
}
