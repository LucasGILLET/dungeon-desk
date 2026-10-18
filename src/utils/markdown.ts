// Markdown des textes de l'API (règles du SRD, guides) → HTML nettoyé par
// DOMPurify avant tout v-html : le contenu est édité dans Directus.
import DOMPurify from 'dompurify'
import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: false })

export function renderMarkdown(text: string | null | undefined, options: { inline?: boolean } = {}): string {
  if (!text) return ''
  const html = options.inline ? marked.parseInline(text, { async: false }) : marked.parse(text, { async: false })
  return DOMPurify.sanitize(html)
}

// Premier titre d'un texte de règle ("## Abri") : déjà affiché par la page
export function stripLeadingHeading(text: string): string {
  return text.replace(/^\s*#{1,6} [^\n]*\n+/, '')
}
