import Link from 'next/link'
import { salir } from '../login/acciones'

const PRONTO = ['Calendario', 'Bandeja', 'Anuncios', 'Insights']

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <aside className="lateral">
        <div className="marca">AiUDA</div>
        <nav>
          <Link href="/app">Inicio</Link>
          {PRONTO.map((n) => <span key={n} className="pronto">{n}<small>pronto</small></span>)}
        </nav>
        <form action={salir}><button className="secundario">Salir</button></form>
      </aside>
      <div className="contenido">{children}</div>
    </div>
  )
}
