// Textes longs de l'API (Markdown simple) : paragraphes séparés par une ligne
// vide, tableaux "| a | b |". Découpés en blocs rendus par RichText.vue, sans
// v-html.

export type TextBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'table'; caption: string | null; header: string[]; rows: string[][] }

// Mise en valeur en ligne : ***gras italique***, **gras**, *italique* ou _italique_
// (noms d'attaques ou d'effets dans les objets magiques, les sorts…).
export interface InlineSegment {
  text: string
  strong: boolean
  em: boolean
}

const EMPHASIS = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(?!\s)(.+?)\*|(?<![\p{L}\d])_(?!\s)(.+?)_(?![\p{L}\d])/gu

export function parseInline(text: string): InlineSegment[] {
  const segments: InlineSegment[] = []
  let last = 0
  for (const m of text.matchAll(EMPHASIS)) {
    if (m.index > last) segments.push({ text: text.slice(last, m.index), strong: false, em: false })
    const [, both, strong, star, underscore] = m
    segments.push({ text: both ?? strong ?? star ?? underscore ?? '', strong: !!(both ?? strong), em: !!(both ?? star ?? underscore) })
    last = m.index + m[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last), strong: false, em: false })
  return segments
}

// Texte sans marqueurs, pour les aperçus tronqués
export const plainText = (text: string | null | undefined) => parseInline(text ?? '').map((s) => s.text).join('')

const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
const isRow = (line: string) => line.trim().startsWith('|')
const isSeparator = (line: string) => /^\|?\s*:?-{2,}/.test(line.trim())

export function parseRichText(text: string | null | undefined): TextBlock[] {
  const lines = (text ?? '').split(/\n+/).map((l) => l.trim()).filter(Boolean)
  const blocks: TextBlock[] = []
  for (let i = 0; i < lines.length; i++) {
    if (!isRow(lines[i]!)) {
      blocks.push({ type: 'paragraph', text: lines[i]! })
      continue
    }
    const rows: string[][] = []
    while (i < lines.length && isRow(lines[i]!)) {
      if (!isSeparator(lines[i]!)) rows.push(cells(lines[i]!))
      i++
    }
    i--
    // Le paragraphe qui précède un tableau en est souvent le titre ("Leviers du submersible")
    const previous = blocks.at(-1)
    const caption = previous?.type === 'paragraph' && previous.text.length < 60 && !/[.:]$/.test(previous.text) ? previous.text : null
    if (caption) blocks.pop()
    blocks.push({ type: 'table', caption, header: rows[0] ?? [], rows: rows.slice(1) })
  }
  return blocks
}
