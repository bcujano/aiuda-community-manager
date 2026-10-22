import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Ledger, RegistroLedger } from './tipos'

// Ledger en aiuda_cm.ia_llamadas. Solo servidor (service role). Una fila por llamada, también las fallidas.
export const ledgerSupabase: Ledger = {
  async registrar(r: RegistroLedger) {
    const { error } = await supabaseAdmin().from('ia_llamadas').insert(r)
    if (error) console.error('ledger: no se pudo registrar una llamada de IA') // sin datos del cliente en logs
  },
  async gastoMesUsd(org) {
    const { data, error } = await supabaseAdmin().rpc('gasto_ia_mes', { p_org: org })
    if (error) throw new Error('No se pudo leer el gasto de IA del mes') // sin lectura del tope no se gasta (falla cerrado)
    return Number(data ?? 0)
  },
}
