import { timingSafeEqual } from 'node:crypto'
import { procesarCola } from '@/lib/publicador'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// El secreto viaja en el header Authorization (nunca en la URL). Lo llama pg_cron + pg_net de Supabase.
function autorizado(req: Request): boolean {
  const esperado = process.env.CRON_SECRET
  const dado = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  if (!esperado || dado.length !== esperado.length) return false
  return timingSafeEqual(Buffer.from(dado), Buffer.from(esperado))
}

export async function POST(req: Request) {
  if (!autorizado(req)) return Response.json({ ok: false }, { status: 401 })
  try { return Response.json({ ok: true, ...(await procesarCola()) }) }
  catch { return Response.json({ ok: false }, { status: 500 }) }
}
