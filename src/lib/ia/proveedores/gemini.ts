import type { AdaptadorProveedor } from '../tipos'
import { postJson } from './http'

export const gemini: AdaptadorProveedor = {
  nombre: 'gemini',
  disponible: () => Boolean(process.env.GEMINI_API_KEY),
  async llamar(p, señal) {
    const base = process.env.IA_GEMINI_URL || 'https://generativelanguage.googleapis.com'
    const j = await postJson('gemini', `${base}/v1beta/models/${encodeURIComponent(p.modelo)}:generateContent`,
      { 'x-goog-api-key': process.env.GEMINI_API_KEY! },
      { systemInstruction: { parts: [{ text: p.sistema }] }, contents: [{ role: 'user', parts: [{ text: p.usuario }] }],
        generationConfig: { maxOutputTokens: p.maxTokens, ...(p.json ? { responseMimeType: 'application/json' } : {}) } }, señal)
    const texto = (j.candidates?.[0]?.content?.parts ?? []).map((x: any) => x.text ?? '').join('')
    return { texto, tokensIn: j.usageMetadata?.promptTokenCount ?? 0, tokensOut: j.usageMetadata?.candidatesTokenCount ?? 0 }
  },
}
