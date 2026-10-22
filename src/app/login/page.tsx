import { entrar, registrar } from './acciones'

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  return (
    <main className="contenedor" style={{ maxWidth: 420 }}>
      <h1>Entrar a AiUDA</h1>
      {error && <p role="alert" className="alerta-error">{error}</p>}
      <form action={entrar} className="formulario">
        <label>Correo<input name="correo" type="email" required autoComplete="email" /></label>
        <label>Contraseña<input name="clave" type="password" required minLength={8} autoComplete="current-password" /></label>
        <button type="submit">Entrar</button>
        <button type="submit" formAction={registrar} className="secundario">Crear cuenta</button>
      </form>
    </main>
  )
}
