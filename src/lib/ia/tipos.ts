import type { ZodType } from 'zod'

export type Proveedor = 'anthropic' | 'openai' | 'gemini'
export type Tarea = 'plan_mes' | 'redactar_pieza' | 'hooks' | 'clasificar_intencion' | 'diagnostico'
export type Nivel = 'razonamiento' | 'estandar' | 'pequeno'

export type PeticionModelo = {
  modelo: string
  sistema: string
  usuario: string
  maxTokens: number
  temperatura?: number
  json: boolean
}
export type RespuestaModelo = { texto: string; tokensIn: number; tokensOut: number }

// Contrato único de proveedor: solo lectura (sin efectos externos), por eso se puede reintentar.
export interface AdaptadorProveedor {
  nombre: Proveedor
  disponible(): boolean
  llamar(p: PeticionModelo, señal: AbortSignal): Promise<RespuestaModelo>
}

export class ErrorProveedor extends Error {
  constructor(
    public proveedor: Proveedor,
    public codigo: 'transitorio' | 'esquema' | 'politica' | 'credencial' | 'otro',
    mensaje: string,
    public http?: number,
  ) {
    super(mensaje)
  }
}

export type EntradaEjecutar<T> = {
  tarea: Tarea
  org_id: string
  marca_id?: string | null
  pieza_id?: string | null
  sistema: string
  usuario: string
  // Texto base permitido para cifras (Regla C). Si se omite, no se aceptan cifras nuevas.
  fuente?: string
  frasesProhibidas?: string[]
  esquema: ZodType<T>
  maxTokens?: number
  campoTexto?: (salida: T) => string // qué texto se valida con las reglas deterministas
}

export type MetaLlamada = {
  proveedor: Proveedor
  modelo: string
  tokens_in: number
  tokens_out: number
  costo_usd: number
  latencia_ms: number
  intentos: number
  fallback_de: Proveedor | null
  cache_hit: boolean
}

export type ResultadoEjecutar<T> =
  | { ok: true; salida: T; meta: MetaLlamada; avisos: string[] }
  | { ok: false; motivo: 'en_cola_ia' | 'presupuesto' | 'validacion' | 'kill_switch'; detalle: string }

export type RegistroLedger = {
  org_id: string
  marca_id?: string | null
  pieza_id?: string | null
  tarea: Tarea
  proveedor: Proveedor
  modelo: string
  tokens_in: number
  tokens_out: number
  costo_usd: number
  latencia_ms: number
  estado: 'ok' | 'error' | 'invalida'
  fallback_de: Proveedor | null
  error_codigo: string | null
}
export interface Ledger {
  registrar(r: RegistroLedger): Promise<void>
  gastoMesUsd(org_id: string | null): Promise<number>
}
