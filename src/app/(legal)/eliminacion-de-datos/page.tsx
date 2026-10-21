import type { Metadata } from 'next'
import Link from 'next/link'
import { legalHtml } from '@/lib/legal'

export const metadata: Metadata = { title: 'Eliminación de datos — AiUDA' }

export default function Pagina() {
  return (
    <main className="contenedor">
      <p><Link href="/">← AiUDA</Link></p>
      <article dangerouslySetInnerHTML={{ __html: legalHtml('eliminacion-de-datos.md') }} />
    </main>
  )
}
