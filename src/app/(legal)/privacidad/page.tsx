import type { Metadata } from 'next'
import Link from 'next/link'
import { legalHtml } from '@/lib/legal'

export const metadata: Metadata = { title: 'Política de privacidad — AiUDA' }

export default function Pagina() {
  return (
    <main className="contenedor">
      <p><Link href="/">← AiUDA</Link></p>
      <article dangerouslySetInnerHTML={{ __html: legalHtml('politica-de-privacidad.md') }} />
    </main>
  )
}
