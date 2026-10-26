// Convierte «2026-11-03T09:30» escrito en la hora de la organización a un instante UTC (sin librerías).
export function localAUtc(local: string, tz: string): Date | null {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/)
  if (!m) return null
  const [a, mes, d, h, mi] = m.slice(1).map(Number)
  const ref = Date.UTC(a, mes - 1, d, h, mi)
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  const desfase = (t: number) => {
    const p = Object.fromEntries(fmt.formatToParts(new Date(t)).map((x) => [x.type, x.value]))
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - t
  }
  let t = ref - desfase(ref)
  t = ref - desfase(t) // segunda pasada: cambios de horario
  const r = new Date(t)
  return Number.isNaN(r.getTime()) ? null : r
}
export const formatoLocal = (d: Date | string, tz: string) => new Date(d).toLocaleString('es-EC', { timeZone: tz, dateStyle: 'medium', timeStyle: 'short' })
