import { describe, expect, it, vi } from 'vitest'
vi.mock('@/lib/supabase/servidor', () => ({ supabaseServidor: vi.fn() }))
import { puede } from './rbac'

describe('RBAC', () => {
  it('lector no escribe ni aprueba', () => { expect(puede('lector', 'editar_contenido')).toBe(false); expect(puede('lector', 'aprobar')).toBe(false) })
  it('editor escribe pero no aprueba', () => { expect(puede('editor', 'editar_contenido')).toBe(true); expect(puede('editor', 'aprobar')).toBe(false) })
  it('aprobador aprueba pero no edita', () => { expect(puede('aprobador', 'aprobar')).toBe(true); expect(puede('aprobador', 'editar_contenido')).toBe(false) })
  it('sin rol no puede nada', () => expect(puede(null, 'ver')).toBe(false))
})
