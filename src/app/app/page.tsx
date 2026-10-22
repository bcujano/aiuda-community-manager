import { supabaseServidor } from '@/lib/supabase/servidor'
import Link from 'next/link'
import { completitud, type Perfil } from '@/lib/ficha'
import { crearMarca, crearOrganizacion } from './acciones'

export const dynamic = 'force-dynamic'

export default async function Panel({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { error, ok } = await searchParams
  const supabase = await supabaseServidor()
  const { data: membresia } = await supabase
    .from('miembros')
    .select('rol, organizaciones(id, nombre)')
    .limit(1)
    .maybeSingle()
  const org = (membresia?.organizaciones as unknown as { id: string; nombre: string } | null) ?? null
  const { data: marcas } = org
    ? await supabase.from('marcas').select('id, nombre, sector, perfil').eq('org_id', org.id).order('creada_en')
    : { data: [] }
  const { data: conexiones } = org
    ? await supabase.from('conexiones').select('marca_id, plataforma, nombre_cuenta, estado, vence_en').eq('org_id', org.id)
    : { data: [] }

  return (
    <main className="contenedor">
      <h1>{org ? org.nombre : 'Bienvenido a AiUDA'}</h1>
      {error && <p role="alert" style={{ color: '#c0392b' }}>{error}</p>}
      {ok && <p role="status" style={{ color: '#1e8e5a' }}>{ok}</p>}

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
            <div key={m.id} className="tarjeta">
              <strong>{m.nombre}</strong>{m.sector && <span className="suave"> · {m.sector}</span>}
              {(conexiones ?? []).filter((c) => c.marca_id === m.id).map((c) => (
                <p key={c.plataforma + c.nombre_cuenta} className="suave" style={{ margin: '8px 0 0' }}>
                  {c.plataforma === 'instagram' ? 'Instagram' : c.plataforma}: @{c.nombre_cuenta} · {c.estado === 'activa' ? 'conectada' : 'hay que reconectar'}
                </p>
              ))}
              <p style={{ margin: '12px 0 0' }}>
                <Link href={`/app/negocio/${m.id}`}>Ficha del negocio ({completitud(m.perfil as Perfil).porcentaje} %)</Link>
                {' · '}<a href={`/api/conexiones/instagram/inicio?marca=${m.id}`}>Conectar Instagram</a>
              </p>
            </div>
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
