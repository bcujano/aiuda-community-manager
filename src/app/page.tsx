import Link from 'next/link'

export default function Inicio() {
  return (
    <>
      <main className="contenedor">
        <h1>AiUDA</h1>
        <p>Community manager con inteligencia artificial: planifica, crea y publica tu contenido, gestiona anuncios y responde comentarios y mensajes por ti.</p>
        <p className="suave">Estamos en fase privada. Escríbenos a <a href="mailto:contacto@321archlab.com">contacto@321archlab.com</a>.</p>
      </main>
      <footer className="pie">
        <Link href="/privacidad">Privacidad</Link>
        <Link href="/terminos">Términos</Link>
        <Link href="/eliminacion-de-datos">Eliminación de datos</Link>
        <div>© Tres Dos Uno Soluciones Inmobiliarias S.A.S.</div>
      </footer>
    </>
  )
}
