// Validaciones deterministas (código, no LLM). docs/plan/03 §6.

// Frases genéricas que ninguna marca debe usar (base portable de PROHIBIDAS; cada marca suma las suyas).
export const PROHIBIDAS_BASE = [
  'oferta imperdible', 'el mejor del mercado', 'no te lo pierdas', 'última oportunidad', 'precio increíble',
  'garantizado al 100', 'resultados garantizados', 'te hará rico', 'hazte millonario', 'viral garantizado',
]

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export function frasesProhibidasEn(texto: string, extra: string[] = []): string[] {
  const t = norm(texto)
  return [...PROHIBIDAS_BASE, ...extra].filter((f) => f.trim() && t.includes(norm(f)))
}

// Regla C: toda cifra (número, moneda, porcentaje) debe existir en la fuente entregada.
const RE_CIFRA = /\d[\d.,]*/g
const canon = (c: string) => c.replace(/[.,]+$/, '').replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')

export function cifrasSinFuente(texto: string, fuente = ''): string[] {
  const permitidas = new Set((fuente.match(RE_CIFRA) ?? []).map(canon))
  const sueltas = (texto.match(RE_CIFRA) ?? []).map(canon)
  return [...new Set(sueltas.filter((c) => !permitidas.has(c)))]
}

// Límites de plataforma (docs/knowledge/instagram-api-rules.md). ⚠️ Verificar vigencia antes de ampliar.
export const LIMITES_IG = { caption: 2200, hashtags: 30 }
export function limitesIg(caption: string): string[] {
  const out: string[] = []
  if (caption.length > LIMITES_IG.caption) out.push(`caption de ${caption.length} caracteres (máximo ${LIMITES_IG.caption})`)
  const h = (caption.match(/#\p{L}[\p{L}\p{N}_]*/gu) ?? []).length
  if (h > LIMITES_IG.hashtags) out.push(`${h} hashtags (máximo ${LIMITES_IG.hashtags})`)
  return out
}

// Afirmaciones engañosas (docs/plan/12 §7): urgencia/escasez y promesas de resultados.
const RE_ENGANO = /\b(solo quedan|últimas? unidades|quedan \d+|termina hoy|oferta por tiempo limitado|resultados? garantizados?|100 ?% garantizad)/i
export function afirmacionesEnganosas(texto: string): string[] {
  const m = texto.match(RE_ENGANO)
  return m ? [m[0]] : []
}

export function revisarTexto(texto: string, o: { fuente?: string; extra?: string[]; ig?: boolean }) {
  const problemas: string[] = []
  for (const f of frasesProhibidasEn(texto, o.extra)) problemas.push(`frase prohibida: «${f}»`)
  for (const c of cifrasSinFuente(texto, o.fuente)) problemas.push(`cifra sin fuente: ${c}`)
  for (const a of afirmacionesEnganosas(texto)) problemas.push(`afirmación que exige respaldo: «${a}»`)
  if (o.ig) problemas.push(...limitesIg(texto))
  return problemas
}
