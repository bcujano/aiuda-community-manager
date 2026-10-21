import type { Metadata } from 'next'
import Link from 'next/link'
import { legalHtml } from '@/lib/legal'

export const metadata: Metadata = { title: 'Términos de servicio — AiUDA' }

export default function Pagina() {
  return (
    <main className="contenedor">
      <p><Link href="/">← AiUDA</Link></p>
      <article dangerouslySetInnerHTML={{ __html: legalHtml('terminos-de-servicio.md') }} />
    </main>
  )
}
