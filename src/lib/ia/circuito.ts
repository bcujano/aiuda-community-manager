import type { Proveedor } from './tipos'

// Circuito abierto: 5 fallas en 60 s → se salta el proveedor 30 s (docs/plan/03 §4). Estado en memoria por instancia.
type Est = { fallas: number[]; abiertoHasta: number; desactivado: boolean }
export class Circuitos {
  private m = new Map<Proveedor, Est>()
  constructor(private ahora: () => number = Date.now) {}
  private e(p: Proveedor) { let x = this.m.get(p); if (!x) { x = { fallas: [], abiertoHasta: 0, desactivado: false }; this.m.set(p, x) } return x }
  permite(p: Proveedor) { const x = this.e(p); return !x.desactivado && this.ahora() >= x.abiertoHasta }
  falla(p: Proveedor) {
    const x = this.e(p), t = this.ahora()
    x.fallas = [...x.fallas.filter((f) => t - f < 60_000), t]
    if (x.fallas.length >= 5) { x.abiertoHasta = t + 30_000; x.fallas = [] }
  }
  ok(p: Proveedor) { const x = this.e(p); x.fallas = []; x.abiertoHasta = 0 }
  desactivar(p: Proveedor) { this.e(p).desactivado = true } // 401/403/sin saldo: alerta al operador
  estado(p: Proveedor) { const x = this.e(p); return x.desactivado ? 'desactivado' : this.ahora() < x.abiertoHasta ? 'abierto' : 'cerrado' }
}
