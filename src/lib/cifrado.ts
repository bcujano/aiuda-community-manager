import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

// AES-256-GCM para tokens de redes. Formato: v1.<iv>.<etiqueta>.<texto> (base64url).
function clave(): Buffer {
  const b64 = process.env.APP_ENCRYPTION_KEY
  if (!b64) throw new Error('Falta APP_ENCRYPTION_KEY')
  const k = Buffer.from(b64, 'base64')
  if (k.length !== 32) throw new Error('APP_ENCRYPTION_KEY debe ser de 32 bytes en base64')
  return k
}

export function cifrar(texto: string): string {
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', clave(), iv)
  const ct = Buffer.concat([c.update(texto, 'utf8'), c.final()])
  return ['v1', iv, c.getAuthTag(), ct].map((p) => (typeof p === 'string' ? p : p.toString('base64url'))).join('.')
}

export function descifrar(valor: string): string {
  const [v, iv, tag, ct] = valor.split('.')
  if (v !== 'v1' || !iv || !tag || !ct) throw new Error('Formato de token no válido')
  const d = createDecipheriv('aes-256-gcm', clave(), Buffer.from(iv, 'base64url'))
  d.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([d.update(Buffer.from(ct, 'base64url')), d.final()]).toString('utf8')
}
