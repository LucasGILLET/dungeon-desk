// Métadonnées de la page : titre de l'onglet, description, lien canonique,
// indexation et aperçu de lien (Open Graph, Twitter). Le routeur pose celles de
// la route ; une page de détail les précise une fois chargée (nom du sort…).
import { watch, type WatchSource } from 'vue'

export const SITE_NAME = 'Dungeon Desk'
export const SITE_URL = 'https://www.dungeon-desk.com'
export const DEFAULT_DESCRIPTION =
  'Dungeon Desk : fiches de personnage, créateur guidé, sorts, bestiaire, objets magiques et outils du MJ pour Donjons & Dragons 5e.'
const DEFAULT_IMAGE = `${SITE_URL}/logo-bg-1024x1024.png`

export interface PageMeta {
  title?: string // « Thaumaturgie » → « Thaumaturgie · Dungeon Desk »
  description?: string
  noindex?: boolean // pages privées ou propres à un utilisateur
  image?: string | null
}

function setTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

// Description : une ligne de texte simple, sans balisage, coupée vers 160 caractères
export function summarize(text: string | null | undefined, max = 160): string | undefined {
  const plain = (text ?? '').replace(/[*_#>`[\]]/g, '').replace(/\s+/g, ' ').trim()
  if (!plain) return undefined
  return plain.length > max ? `${plain.slice(0, max - 1).replace(/\s+\S*$/, '')}…` : plain
}

// path : chemin de l'adresse canonique, paramètres de contenu compris (/rules?section=…)
export function applyPageMeta(meta: PageMeta, path = window.location.pathname) {
  const title = meta.title ? `${meta.title} · ${SITE_NAME}` : `${SITE_NAME} · Outils pour D&D 5e`
  const description = meta.description ?? DEFAULT_DESCRIPTION
  const url = `${SITE_URL}${path === '/' ? '' : path}`
  document.title = title
  setTag('name', 'description', description)
  setTag('name', 'robots', meta.noindex ? 'noindex, nofollow' : 'index, follow')
  setCanonical(url)
  setTag('property', 'og:title', title)
  setTag('property', 'og:description', description)
  setTag('property', 'og:url', url)
  setTag('property', 'og:image', meta.image || DEFAULT_IMAGE)
  setTag('name', 'twitter:title', title)
  setTag('name', 'twitter:description', description)
}

// Page de détail : métadonnées tirées des données chargées, par-dessus celles de
// la route (posées par le routeur à chaque navigation). null tant que rien n'est chargé.
let routeMeta: PageMeta = {}
let routePath: string | undefined
export function setRouteMeta(meta: PageMeta, path: string) {
  routeMeta = meta
  routePath = path
}

export function usePageMeta(source: WatchSource<PageMeta | null | undefined>) {
  watch(source, (meta) => {
    if (meta) applyPageMeta({ ...routeMeta, ...meta }, routePath)
  }, { immediate: true })
}
