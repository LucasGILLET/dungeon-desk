// Mise en forme du bloc de statistiques d'un monstre et des objets magiques à
// partir des champs structurés de l'API (distances en pieds, enums).
import type { ApiDamageModifier, ApiMonster, ApiMonsterAction, ApiMonsterSummary, MagicItemRarity, MonsterUsage, Size } from './dataLoader'

export const SIZE_LABELS: Record<Size, string> = {
  TINY: 'Très petite', SMALL: 'Petite', MEDIUM: 'Moyenne', LARGE: 'Grande', HUGE: 'Très grande', GARGANTUAN: 'Gigantesque',
}
export const SIZES = Object.keys(SIZE_LABELS) as Size[]

export const RARITY_LABELS: Record<MagicItemRarity, string> = {
  COMMON: 'Commun', UNCOMMON: 'Peu commun', RARE: 'Rare', VERY_RARE: 'Très rare', LEGENDARY: 'Légendaire', ARTIFACT: 'Artefact', VARIES: 'Variable',
}
export const RARITIES = Object.keys(RARITY_LABELS) as MagicItemRarity[]

// Couleurs habituelles des raretés (gris, vert, bleu, violet, orange, rouge)
export const RARITY_CLASSES: Record<MagicItemRarity, string> = {
  COMMON: 'border-zinc-400/30 bg-zinc-400/10 text-zinc-200',
  UNCOMMON: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  RARE: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  VERY_RARE: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
  LEGENDARY: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
  ARTIFACT: 'border-red-400/30 bg-red-400/10 text-red-200',
  VARIES: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// 30 pieds → "9 m" ; 5 pieds → "1,5 m"
export function meters(feet: number): string {
  return `${String(Math.round(feet * 0.3 * 10) / 10).replace('.', ',')} m`
}

// 0.125 → "1/8"
export function formatChallenge(cr: number): string {
  return ({ 0.125: '1/8', 0.25: '1/4', 0.5: '1/2' } as Record<number, string>)[cr] ?? String(cr)
}

export const abilityModifier = (score: number) => Math.floor((score - 10) / 2)
export const signed = (n: number) => (n >= 0 ? `+${n}` : `−${-n}`)

// "Loyal Bon (LB)" → "loyal bon"
const alignmentName = (name: string) => name.replace(/\s*\([^)]*\)$/, '').toLowerCase()

const AXIS_LABELS: Record<string, string> = { lawful: 'loyal', chaotic: 'chaotique', good: 'bon', evil: 'mauvais' }
// "lawful-evil" → ["lawful", "evil"] ; "neutral" → ["neutral", "neutral"]
const axes = (index: string) => (index === 'neutral' ? ['neutral', 'neutral'] : index.split('-'))

export function formatAlignment(alignment: ApiMonsterSummary['alignment']): string {
  if (alignment.unaligned) return 'sans alignement'
  const options = alignment.options
  if (options.length >= 9) return 'tout alignement'
  // Plages du Manuel des monstres : "tout alignement mauvais", "tout alignement non loyal"
  for (const axis of [0, 1]) {
    const values = new Set(options.map((o) => axes(o.index)[axis]!))
    const [only] = values
    if (options.length === 3 && values.size === 1 && only && AXIS_LABELS[only]) return `tout alignement ${AXIS_LABELS[only]}`
    if (options.length === 6 && values.size === 2) {
      const missing = Object.keys(AXIS_LABELS).find((v) => (axis === 0 ? ['lawful', 'chaotic'] : ['good', 'evil']).includes(v) && !values.has(v))
      if (missing) return `tout alignement non ${AXIS_LABELS[missing]}`
    }
  }
  return options.map((a) => alignmentName(a.name)).join(' ou ')
}

// "Dragon de taille Très grande, loyal bon" ; "Nuée de créatures de taille Très petite (bête), sans alignement"
export function formatTypeLine(m: ApiMonsterSummary): string {
  const subtypes = m.subtypes.length ? ` (${m.subtypes.map((s) => s.name).join(', ')})` : ''
  const type = m.swarmOfSize
    ? `Nuée de créatures de taille ${SIZE_LABELS[m.swarmOfSize]} (${m.type.name.toLowerCase()}), de taille ${SIZE_LABELS[m.size]}`
    : `${capitalize(m.type.name)}${subtypes} de taille ${SIZE_LABELS[m.size]}`
  return `${type}, ${formatAlignment(m.alignment)}`
}

export function formatArmorClass(m: Pick<ApiMonster, 'armorClasses'>): string {
  return m.armorClasses.map((ac) => {
    const detail = {
      NATURAL: 'armure naturelle',
      DEXTERITY: null,
      ARMOR: ac.note ?? ac.armor.map((a) => a.name.toLowerCase()).join(', '),
      SPELL: ac.spell ? `avec ${ac.spell.name.toLowerCase()}` : null,
      CONDITION: ac.condition ? ac.condition.name.toLowerCase() : null,
    }[ac.source]
    return detail ? `${ac.value} (${detail})` : String(ac.value)
  }).join(', ')
}

// 135 (18d10 + 36)
export function formatHitPoints(m: Pick<ApiMonster, 'hitPoints' | 'hitDice'>): string {
  const { count, size, bonus } = m.hitDice
  const extra = bonus ? ` ${bonus > 0 ? '+' : '−'} ${Math.abs(bonus)}` : ''
  return `${m.hitPoints} (${count}d${size}${extra})`
}

const SPEED_LABELS = { fly: 'vol', swim: 'nage', climb: 'escalade', burrow: 'creusement' } as const

export function formatSpeeds(speeds: ApiMonster['speeds']): string {
  const parts = [meters(speeds.walk ?? 0)]
  for (const [key, label] of Object.entries(SPEED_LABELS) as [keyof typeof SPEED_LABELS, string][]) {
    const value = speeds[key]
    if (value == null) continue
    parts.push(`${label} ${meters(value)}${key === 'fly' && speeds.hover ? ' (vol stationnaire)' : ''}`)
  }
  return parts.join(', ')
}

const SENSE_LABELS = { blindsight: 'vision aveugle', darkvision: 'vision dans le noir', tremorsense: 'perception des vibrations', truesight: 'vision véritable' } as const

export function formatSenses(m: Pick<ApiMonster, 'senses' | 'passivePerception'>): string {
  const parts: string[] = []
  for (const [key, label] of Object.entries(SENSE_LABELS) as [keyof typeof SENSE_LABELS, string][]) {
    const value = m.senses[key]
    if (value == null) continue
    parts.push(`${label} ${meters(value)}${key === 'blindsight' && m.senses.blindBeyond ? ' (aveugle au-delà de ce rayon)' : ''}`)
  }
  parts.push(`Perception passive ${m.passivePerception}`)
  return parts.join(', ')
}

const joinFr = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} et ${items.at(-1)}` : items[0] ?? '')

// "froid ; contondant, perforant et tranchant d'attaques non magiques non argentées"
export function formatDamageModifiers(list: ApiDamageModifier[]): string {
  const plain = list.filter((d) => d.damageType && !d.nonMagicalOnly && !d.note).map((d) => d.damageType!.name.toLowerCase())
  const groups = new Map<string, { types: string[]; nonMagicalOnly: boolean; note: string | null }>()
  for (const d of list) {
    if (d.damageType && !d.nonMagicalOnly && !d.note) continue
    const key = `${d.nonMagicalOnly}|${d.note}`
    const group = groups.get(key) ?? { types: [], nonMagicalOnly: d.nonMagicalOnly, note: d.note }
    if (d.damageType) group.types.push(d.damageType.name.toLowerCase())
    groups.set(key, group)
  }
  const special = [...groups.values()].map((g) =>
    [joinFr(g.types), g.nonMagicalOnly ? "d'attaques non magiques" : null, g.note].filter(Boolean).join(' '))
  return [plain.join(', '), ...special].filter(Boolean).join(' ; ')
}

// "10 (5 900 PX)"
export function formatChallengeLine(m: Pick<ApiMonsterSummary, 'challengeRating' | 'xp'>): string {
  return `${formatChallenge(m.challengeRating)} (${m.xp.toLocaleString('fr-FR')} PX)`
}

export function formatUsage(usage: MonsterUsage | null): string | null {
  if (!usage) return null
  switch (usage.type) {
    case 'at_will': return 'À volonté'
    case 'per_day': return `${usage.times}/jour`
    case 'recharge': return usage.minValue >= 6 ? 'Recharge 6' : `Recharge ${usage.minValue}–6`
    case 'per_rest': return 'Recharge après un repos court ou long'
  }
}

// Le nom de l'action indique parfois déjà l'usage ("Souffle de feu (Recharge 5–6)")
export function actionTitle(action: ApiMonsterAction): string {
  const usage = formatUsage(action.usage)
  return usage && !action.name.includes('(') ? `${action.name} (${usage})` : action.name
}
