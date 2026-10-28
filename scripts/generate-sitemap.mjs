// Plan du site pour les moteurs de recherche, écrit dans dist/ après le build :
// pages publiques fixes, puis chaque sort, monstre, objet magique, section des
// règles et page du guide lus dans l'API. Si l'API ne répond pas, le plan ne
// contient que les pages fixes (le build ne doit pas échouer pour autant).
import { writeFileSync } from 'node:fs'

const SITE = 'https://www.dungeon-desk.com'
const API = `${new URL(process.env.VITE_API_URL ?? 'https://dungeon-desk-back-657109760065.europe-west9.run.app').origin}/api/srd/2014`
const OUT = process.env.SITEMAP_OUT ?? 'dist/sitemap.xml'

const STATIC_PAGES = ['/', '/character-creator', '/sorts', '/bestiary', '/magic-items', '/rules', '/documentation', '/npc-generator', '/combat-cheat-sheet']

async function list(path) {
  const response = await fetch(`${API}/${path}?lang=fr`, { signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`${path} : ${response.status}`)
  return response.json()
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const urls = [...STATIC_PAGES]
try {
  const [spells, monsters, items, chapters, guides] = await Promise.all([
    list('spells'), list('monsters'), list('magic-items'), list('rule-chapters'), list('guides'),
  ])
  const srd = (rows) => rows.filter((r) => !r.source || r.source === 'SRD')
  urls.push(
    ...srd(spells).map((s) => `/sort/${s.index}`),
    ...srd(monsters).map((m) => `/bestiary/${m.index}`),
    ...srd(items).map((i) => `/magic-items/${i.index}`),
    ...chapters.flatMap((c) => c.sections.map((s) => `/rules?section=${encodeURIComponent(s.index)}`)),
    ...guides.map((g) => `/documentation?section=${encodeURIComponent(g.index)}`),
  )
} catch (e) {
  console.warn(`[sitemap] API injoignable (${e.message}) : pages fixes seulement`)
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${escape(`${SITE}${u === '/' ? '' : u}`)}</loc></url>`).join('\n')}
</urlset>
`
writeFileSync(OUT, xml)
console.log(`[sitemap] ${urls.length} adresses → ${OUT}`)
