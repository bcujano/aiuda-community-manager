import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import opentype from 'opentype.js'
import sharp from 'sharp'

// Motor vectorial: texto convertido a trazados con una fuente incluida (Inter, licencia OFL), así el resultado es idéntico
// en cualquier servidor, sin depender de fuentes del sistema. Costo de IA = 0 (docs/plan/03 §5).
export type Formato = 'cuadrado' | 'vertical' | 'historia'
export const FORMATOS: Record<Formato, [number, number]> = { cuadrado: [1080, 1080], vertical: [1080, 1350], historia: [1080, 1920] }

let fuentes: { reg: opentype.Font; neg: opentype.Font } | null = null
function cargar() {
  if (!fuentes) {
    const dir = join(process.cwd(), 'node_modules/@fontsource/inter/files')
    const leer = (f: string) => opentype.parse(Uint8Array.from(readFileSync(join(dir, f))).buffer)
    fuentes = { reg: leer('inter-latin-400-normal.woff'), neg: leer('inter-latin-700-normal.woff') }
  }
  return fuentes
}

const HEX = /#([0-9a-f]{6}|[0-9a-f]{3})\b/gi
export function coloresDeFicha(texto: unknown): { fondo: string; acento: string } {
  const hex = String(texto ?? '').match(HEX) ?? []
  const norm = (h: string) => (h.length === 4 ? '#' + [...h.slice(1)].map((c) => c + c).join('') : h)
  return { fondo: hex[0] ? norm(hex[0]) : '#14171f', acento: hex[1] ? norm(hex[1]) : '#ffffff' }
}
const luminancia = (h: string) => { const n = parseInt(h.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255 }

// Composición propia glifo a glifo (sin las tablas de sustitución de Inter, que opentype.js no soporta).
function ancho(f: opentype.Font, t: string, tam: number): number {
  const k = tam / f.unitsPerEm; let w = 0, prev: opentype.Glyph | null = null
  for (const ch of t) { const g = f.charToGlyph(ch); w += (g.advanceWidth ?? 0) * k + (prev ? f.getKerningValue(prev, g) * k : 0); prev = g }
  return w
}
function trazo(f: opentype.Font, t: string, x: number, y: number, tam: number): string {
  const k = tam / f.unitsPerEm; let cx = x, prev: opentype.Glyph | null = null, d = ''
  for (const ch of t) { const g = f.charToGlyph(ch); if (prev) cx += f.getKerningValue(prev, g) * k; d += g.getPath(cx, y, tam).toPathData(2); cx += (g.advanceWidth ?? 0) * k; prev = g }
  return d
}
function lineas(f: opentype.Font, texto: string, tam: number, anchoMax: number): string[] {
  const out: string[] = []; let act = ''
  for (const p of texto.split(/\s+/).filter(Boolean)) {
    const prueba = act ? `${act} ${p}` : p
    if (ancho(f, prueba, tam) > anchoMax && act) { out.push(act); act = p } else act = prueba
  }
  if (act) out.push(act)
  return out
}
function bloque(f: opentype.Font, texto: string, tam: number, ancho: number, x: number, y: number, color: string, interlineado = 1.18) {
  let d = ''; const ls = lineas(f, texto, tam, ancho)
  ls.forEach((l, i) => { d += trazo(f, l, x, y + i * tam * interlineado, tam) })
  return { svg: `<path d="${d}" fill="${color}"/>`, alto: ls.length * tam * interlineado }
}

export async function renderPieza(o: { titular: string; subtitulo?: string; marca: string; colores: unknown; formato?: Formato }): Promise<Buffer> {
  const { neg, reg } = cargar()
  const [W, H] = FORMATOS[o.formato ?? 'vertical']
  const { fondo, acento } = coloresDeFicha(o.colores)
  const texto = luminancia(fondo) > 0.55 ? '#14171f' : '#ffffff'
  const m = 90, ancho = W - 2 * m
  let tam = 110
  while (tam > 48 && lineas(neg, o.titular, tam, ancho).length * tam * 1.18 > H * 0.5) tam -= 6
  const t = bloque(neg, o.titular, tam, ancho, m, H * 0.3, texto)
  const s = o.subtitulo ? bloque(reg, o.subtitulo, 44, ancho, m, H * 0.3 + t.alto + 40, texto) : { svg: '' }
  const marca = bloque(neg, o.marca.toUpperCase().slice(0, 40), 34, ancho, m, H - 110, texto).svg
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${fondo}"/><rect x="${m}" y="${H * 0.3 - tam * 1.5}" width="120" height="10" fill="${acento}"/>${t.svg}${s.svg}${marca}</svg>`
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
}
