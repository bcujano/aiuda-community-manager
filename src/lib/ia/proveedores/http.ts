import { ErrorProveedor, type Proveedor } from '../tipos'

// Clasifica la respuesta HTTP según docs/plan/03 §4. Nunca incluye claves ni cuerpos completos en el mensaje.
export async function postJson(prov: Proveedor, url: string, headers: Record<string, string>, cuerpo: unknown, señal: AbortSignal) {
  let r: Response
  try {
    r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(cuerpo), signal: señal })
  } catch (e) {
    throw new ErrorProveedor(prov, 'transitorio', `red/timeout: ${(e as Error).name}`)
  }
  if (r.ok) return (await r.json()) as Record<string, any>
  const cod = r.status
  const txt = (await r.text().catch(() => '')).slice(0, 200)
  if (cod === 401 || cod === 403) throw new ErrorProveedor(prov, 'credencial', `HTTP ${cod}`, cod)
  if (cod === 402 || /credit|balance|quota/i.test(txt)) throw new ErrorProveedor(prov, 'credencial', `HTTP ${cod} (saldo o cuota)`, cod)
  if (cod === 429 || cod >= 500 || cod === 529) throw new ErrorProveedor(prov, 'transitorio', `HTTP ${cod}`, cod)
  if (cod === 400) throw new ErrorProveedor(prov, /safety|policy/i.test(txt) ? 'politica' : 'esquema', `HTTP 400: ${txt}`, cod)
  throw new ErrorProveedor(prov, 'otro', `HTTP ${cod}`, cod)
}
