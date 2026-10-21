import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AiUDA — Community manager con IA',
  description: 'Contenido, anuncios y respuestas automáticas para tus redes sociales.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
