import { anthropic } from './proveedores/anthropic'
import { openai } from './proveedores/openai'
import { gemini } from './proveedores/gemini'
import { crearRouter } from './router'
import { ledgerSupabase } from './ledger'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Única puerta de IA de la app: nada llama a un proveedor directo.
export const ia = crearRouter({
  proveedores: [anthropic, openai, gemini],
  ledger: ledgerSupabase,
  killSwitch: async (org) => {
    const { data } = await supabaseAdmin().from('organizaciones').select('kill_switch').eq('id', org).maybeSingle()
    return Boolean(data?.kill_switch)
  },
  alerta: (m) => console.error(`ALERTA IA: ${m}`),
})
