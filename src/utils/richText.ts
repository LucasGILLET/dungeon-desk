// Textes longs de l'API (Markdown simple) : paragraphes séparés par une ligne
// vide, tableaux "| a | b |". Découpés en blocs rendus par RichText.vue, sans
// v-html.

export type TextBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'table'; caption: string | null; header: string[]; rows: string[][] }

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
