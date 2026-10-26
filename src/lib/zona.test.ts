import { expect, it } from 'vitest'
import { localAUtc } from './zona'
it('Guayaquil es UTC-5 todo el año', () => expect(localAUtc('2026-11-03T09:30', 'America/Guayaquil')?.toISOString()).toBe('2026-11-03T14:30:00.000Z'))
it('Madrid en invierno es UTC+1 y en verano UTC+2', () => {
  expect(localAUtc('2026-01-15T12:00', 'Europe/Madrid')?.toISOString()).toBe('2026-01-15T11:00:00.000Z')
  expect(localAUtc('2026-07-15T12:00', 'Europe/Madrid')?.toISOString()).toBe('2026-07-15T10:00:00.000Z')
})
it('entrada inválida → null', () => expect(localAUtc('mañana', 'America/Guayaquil')).toBeNull())
