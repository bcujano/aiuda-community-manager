import type { Metadata } from 'next'
import './globals.css'
import { temaActivo } from '@/styles/temas'

export const metadata: Metadata = {
  title: 'AiUDA — Community manager con IA',
  description: 'Contenido, anuncios y respuestas automáticas para tus redes sociales.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-tema={temaActivo()}>
      <body>{children}</body>
    </html>
  )
}
