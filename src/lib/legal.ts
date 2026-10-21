import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { marked } from 'marked'

// Los textos legales viven en content/legal/*.md (una sola fuente).
export function legalHtml(archivo: string): string {
  const md = readFileSync(join(process.cwd(), 'content', 'legal', archivo), 'utf8')
  return marked.parse(md, { async: false }) as string
}
