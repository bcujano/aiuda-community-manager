import type { AdaptadorProveedor } from '../tipos'
import { postJson } from './http'

export const openai: AdaptadorProveedor = {
  nombre: 'openai',
  disponible: () => Boolean(process.env.OPENAI_API_KEY),
  async llamar(p, señal) {
    const j = await postJson('openai', `${process.env.IA_OPENAI_URL || 'https://api.openai.com'}/v1/chat/completions`,
      { authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      { model: p.modelo, max_completion_tokens: p.maxTokens,
        ...(p.json ? { response_format: { type: 'json_object' } } : {}),
        messages: [{ role: 'system', content: p.json ? `${p.sistema}\n\nResponde con un objeto JSON válido.` : p.sistema }, { role: 'user', content: p.usuario }] }, señal)
    return { texto: j.choices?.[0]?.message?.content ?? '', tokensIn: j.usage?.prompt_tokens ?? 0, tokensOut: j.usage?.completion_tokens ?? 0 }
  },
}
