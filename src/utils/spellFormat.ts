// Sorts de l'API (champs structurés, distances en pieds) → format d'affichage
// des pages Sorts : textes en français, mètres (5 pieds = 1,5 m).
import { loadApiSpells, type ApiSpell } from './dataLoader'

export interface DisplaySpell {
  index: string
  name: string
  level: number
  school: { index: string; name: string }
  classes: { index: string; name: string }[]
  subclasses: { index: string; name: string }[]
  components: string[]
  material: string | null
  concentration: boolean
  ritual: boolean
  casting_time: string
  range: string
  duration: string
  desc: string[]
  higher_level: string[]
}

const plural = (n: number, singular: string, pluralForm = `${singular}s`) => `${n} ${n > 1 ? pluralForm : singular}`

const CASTING_UNITS: Record<string, [string, string]> = {
  ACTION: ['action', 'actions'],
  BONUS_ACTION: ['action bonus', 'actions bonus'],
  REACTION: ['réaction', 'réactions'],
  MINUTE: ['minute', 'minutes'],
  HOUR: ['heure', 'heures'],
}

const DURATION_UNITS: Record<string, [string, string]> = {
  ROUND: ['round', 'rounds'],
  MINUTE: ['minute', 'minutes'],
  HOUR: ['heure', 'heures'],
  DAY: ['jour', 'jours'],
}

// 5 pieds = 1,5 mètre
export function feetToMeters(feet: number): string {
  const meters = Math.round(feet * 0.3 * 10) / 10
  const text = String(meters).replace('.', ',')
  return `${text} ${meters >= 2 ? 'mètres' : 'mètre'}`
}

export function formatCastingTime(c: ApiSpell['castingTime']): string {
  const [one, many] = CASTING_UNITS[c.unit] ?? [c.unit.toLowerCase(), c.unit.toLowerCase()]
  return plural(c.amount, one, many) + (c.note ? `, ${c.note}` : '')
}

export function formatRange(r: ApiSpell['range']): string {
  const base = {
    SELF: 'personnelle',
    TOUCH: 'contact',
    DISTANCE: r.feet != null ? feetToMeters(r.feet) : 'distance',
    SIGHT: 'à vue',
    UNLIMITED: 'illimitée',
    SPECIAL: 'spéciale',
  }[r.type] ?? r.type.toLowerCase()
  return r.note ? `${base} (${r.note})` : base
}

export function formatDuration(d: ApiSpell['duration']): string {
  let base: string
  if (d.type === 'INSTANTANEOUS') base = 'instantanée'
  else if (d.type === 'UNTIL_DISPELLED') base = "jusqu'à dissipation"
  else if (d.type === 'SPECIAL') base = 'spéciale'
  else {
    const [one, many] = DURATION_UNITS[d.type] ?? [d.type.toLowerCase(), d.type.toLowerCase()]
    base = plural(d.amount ?? 1, one, many)
  }
  return d.concentration ? `concentration, jusqu'à ${base}` : base
}

export function toDisplaySpell(s: ApiSpell): DisplaySpell {
  return {
    index: s.index,
    name: s.name,
    level: s.level,
    school: s.school,
    classes: s.classes,
    subclasses: s.subclasses,
    components: [s.components.verbal && 'V', s.components.somatic && 'S', s.components.material && 'M'].filter((c): c is string => !!c),
    material: s.components.materialText,
    concentration: s.duration.concentration,
    ritual: s.ritual,
    casting_time: formatCastingTime(s.castingTime),
    range: formatRange(s.range),
    duration: formatDuration(s.duration),
    desc: s.description.split(/\n\n+/),
    higher_level: s.higherLevels ? s.higherLevels.split(/\n\n+/) : [],
  }
}

export async function loadSpells(): Promise<DisplaySpell[]> {
  return (await loadApiSpells()).map(toDisplaySpell)
}
