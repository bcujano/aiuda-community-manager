import type { Nivel, Proveedor, Tarea } from './tipos'

// Cadena por tarea (docs/plan/03 §3). Los IDs de modelo se leen de variables de entorno para poder
// cambiarlos sin tocar código. ⚠️ Los valores por defecto de OpenAI y Gemini están SIN VERIFICAR: revisar los catálogos.
export const CADENA: Proveedor[] = ['anthropic', 'openai', 'gemini']

export const NIVEL_TAREA: Record<Tarea, Nivel> = {
  plan_mes: 'razonamiento',
  diagnostico: 'razonamiento',
  redactar_pieza: 'estandar',
  hooks: 'estandar',
  clasificar_intencion: 'pequeno',
}

const POR_DEFECTO: Record<Proveedor, Record<Nivel, string>> = {
  anthropic: { razonamiento: 'claude-opus-5-5', estandar: 'claude-sonnet-5-5', pequeno: 'claude-haiku-5-5' },
  openai: { razonamiento: 'gpt-5', estandar: 'gpt-5-mini', pequeno: 'gpt-5-nano' }, // verificar
  gemini: { razonamiento: 'gemini-2.5-pro', estandar: 'gemini-2.5-flash', pequeno: 'gemini-2.5-flash-lite' }, // verificar
}

export function modeloDe(p: Proveedor, n: Nivel, env: NodeJS.ProcessEnv = process.env): string {
  return env[`IA_MODELO_${p.toUpperCase()}_${n.toUpperCase()}`] || POR_DEFECTO[p][n]
}

// USD por millón de tokens [entrada, salida]. ⚠️ Referenciales: verificar contra la tarifa vigente de cada proveedor.
// Si un modelo no figura aquí se cobra el techo del proveedor (nunca se subestima el gasto).
export const PRECIOS: Record<string, [number, number]> = {
  'claude-opus-5-5': [15, 75],
  'claude-sonnet-5-5': [3, 15],
  'claude-haiku-5-5': [1, 5],
  'gpt-5': [1.25, 10],
  'gpt-5-mini': [0.25, 2],
  'gpt-5-nano': [0.05, 0.4],
  'gemini-2.5-pro': [1.25, 10],
  'gemini-2.5-flash': [0.3, 2.5],
  'gemini-2.5-flash-lite': [0.1, 0.4],
}
const TECHO: Record<Proveedor, [number, number]> = { anthropic: [15, 75], openai: [1.25, 10], gemini: [1.25, 10] }

export function costoUsd(p: Proveedor, modelo: string, tin: number, tout: number): number {
  const [pi, po] = PRECIOS[modelo] ?? TECHO[p]
  return (tin * pi + tout * po) / 1_000_000
}

export const TOPE_MENSUAL_GLOBAL_USD = Number(process.env.IA_TOPE_MENSUAL_USD || 50)
