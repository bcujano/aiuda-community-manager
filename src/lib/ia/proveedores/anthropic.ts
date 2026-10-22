import type { AdaptadorProveedor } from '../tipos'
import { postJson } from './http'

export const anthropic: AdaptadorProveedor = {
  nombre: 'anthropic',
  disponible: () => Boolean(process.env.ANTHROPIC_API_KEY),
  async llamar(p, señal) {
    const j = await postJson('anthropic', `${process.env.IA_ANTHROPIC_URL || 'https://api.anthropic.com'}/v1/messages`,
      { 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      { model: p.modelo, max_tokens: p.maxTokens, system: p.json ? `${p.sistema}\n\nResponde SOLO con un objeto JSON válido, sin texto alrededor.` : p.sistema,
        messages: [{ role: 'user', content: p.usuario }] }, señal)
    const texto = (j.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
    return { texto, tokensIn: j.usage?.input_tokens ?? 0, tokensOut: j.usage?.output_tokens ?? 0 }
  },
}
