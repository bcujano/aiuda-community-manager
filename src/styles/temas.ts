// Registro de temas. «base» es el único activo hasta que Byron apruebe capturas de Refero (docs/plan/04 §6).
export const TEMAS = ['base'] as const
export type Tema = (typeof TEMAS)[number]
export function temaActivo(): Tema {
  const t = process.env.NEXT_PUBLIC_TEMA as Tema | undefined
  return t && (TEMAS as readonly string[]).includes(t) ? t : 'base'
}
