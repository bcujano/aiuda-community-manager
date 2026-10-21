import { createHmac, timingSafeEqual } from 'node:crypto'

// "state" firmado para OAuth: ata el flujo a un usuario y una marca, y caduca en 10 minutos.
function firmar(payload: string): string {
  const k = process.env.APP_ENCRYPTION_KEY
  if (!k) throw new Error('Falta APP_ENCRYPTION_KEY')
  return createHmac('sha256', Buffer.from(k, 'base64')).update(payload).digest('base64url')
}

export function crearEstado(uid: string, marca: string): string {
  const p = Buffer.from(JSON.stringify({ uid, marca, exp: Date.now() + 10 * 60_000 })).toString('base64url')
  return `${p}.${firmar(p)}`
}

export function leerEstado(estado: string | null): { uid: string; marca: string } | null {
  if (!estado) return null
  const [p, sig] = estado.split('.')
  if (!p || !sig) return null
  const esperado = Buffer.from(firmar(p))
  const recibido = Buffer.from(sig)
  if (esperado.length !== recibido.length || !timingSafeEqual(esperado, recibido)) return null
  const d = JSON.parse(Buffer.from(p, 'base64url').toString('utf8')) as { uid: string; marca: string; exp: number }
  return d.exp > Date.now() ? { uid: d.uid, marca: d.marca } : null
}
