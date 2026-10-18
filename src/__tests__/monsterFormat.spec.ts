import { describe, expect, it } from 'vitest'
import {
  actionTitle, formatAlignment, formatArmorClass, formatChallenge, formatChallengeLine, formatDamageModifiers, formatHitPoints, formatSenses,
  formatSpeeds, formatTypeLine, formatUsage, meters, signed,
} from '@/utils/monsterFormat'
import { parseRichText } from '@/utils/richText'
import type { ApiMonsterAction, ApiMonsterSummary } from '@/utils/dataLoader'

const ref = (index: string, name: string) => ({ index, name })
const alignments = ['lawful-good', 'neutral-good', 'chaotic-good', 'lawful-neutral', 'neutral', 'chaotic-neutral', 'lawful-evil', 'neutral-evil', 'chaotic-evil']
  .map((i) => ref(i, i))

const dragon: ApiMonsterSummary = {
  index: 'adult-gold-dragon', name: "Dragon d'or adulte", source: 'SRD', size: 'HUGE', type: ref('dragon', 'Dragon'), subtypes: [], swarmOfSize: null,
  alignment: { unaligned: false, options: [ref('lawful-good', 'Loyal Bon (LB)')] }, armorClass: 19, hitPoints: 256, challengeRating: 17, xp: 18000,
  legendary: true, imageUrl: null,
}

describe('monsterFormat', () => {
  it('formats numbers of the stat block', () => {
    expect(meters(30)).toBe('9 m')
    expect(meters(5)).toBe('1,5 m')
    expect(formatChallenge(0.125)).toBe('1/8')
    expect(formatChallenge(17)).toBe('17')
    expect(formatChallengeLine(dragon)).toMatch(/^17 \(18\s000 PX\)$/)
    expect(signed(3)).toBe('+3')
    expect(signed(-1)).toBe('−1')
    expect(formatHitPoints({ hitPoints: 135, hitDice: { count: 18, size: 10, bonus: 36 } })).toBe('135 (18d10 + 36)')
    expect(formatHitPoints({ hitPoints: 1, hitDice: { count: 1, size: 4, bonus: -1 } })).toBe('1 (1d4 − 1)')
  })

  it('writes the type and alignment line', () => {
    expect(formatTypeLine(dragon)).toBe('Dragon de taille Très grande, loyal bon')
    const swarm = { ...dragon, size: 'MEDIUM' as const, swarmOfSize: 'TINY' as const, type: ref('beast', 'Bête'), alignment: { unaligned: true, options: [] } }
    expect(formatTypeLine(swarm)).toBe('Nuée de créatures de taille Très petite (bête), de taille Moyenne, sans alignement')
    expect(formatAlignment({ unaligned: false, options: alignments })).toBe('tout alignement')
    expect(formatAlignment({ unaligned: false, options: [ref('neutral-good', 'Neutre bon (NB)'), ref('neutral-evil', 'Neutre mauvais (NM)')] }))
      .toBe('neutre bon ou neutre mauvais')
    expect(formatAlignment({ unaligned: false, options: alignments.filter((a) => a.index.endsWith('evil')) })).toBe('tout alignement mauvais')
    expect(formatAlignment({ unaligned: false, options: alignments.filter((a) => !a.index.endsWith('good')) })).toBe('tout alignement non bon')
    expect(formatAlignment({ unaligned: false, options: alignments.filter((a) => !a.index.startsWith('lawful')) })).toBe('tout alignement non loyal')
  })

  it('formats armor class, speeds and senses', () => {
    expect(formatArmorClass({ armorClasses: [
      { value: 12, source: 'DEXTERITY', armor: [], spell: null, condition: null, note: null },
      { value: 15, source: 'SPELL', armor: [], spell: ref('mage-armor', 'Armure de mage'), condition: null, note: null },
    ] })).toBe('12, 15 (avec armure de mage)')
    expect(formatArmorClass({ armorClasses: [{ value: 13, source: 'ARMOR', armor: [], spell: null, condition: null, note: "débris d'armure" }] }))
      .toBe("13 (débris d'armure)")
    expect(formatSpeeds({ walk: 40, fly: 80, swim: 40, hover: true })).toBe('12 m, vol 24 m (vol stationnaire), nage 12 m')
    expect(formatSenses({ senses: { blindsight: 60, blindBeyond: true, darkvision: 120 }, passivePerception: 27 }))
      .toBe('vision aveugle 18 m (aveugle au-delà de ce rayon), vision dans le noir 36 m, Perception passive 27')
  })

  it('groups damage modifiers that share a precision', () => {
    const type = (i: string, n: string) => ref(i, n)
    expect(formatDamageModifiers([
      { damageType: type('cold', 'Froid'), nonMagicalOnly: false, note: null },
      { damageType: type('bludgeoning', 'Contondant'), nonMagicalOnly: true, note: 'non argentées' },
      { damageType: type('piercing', 'Perforant'), nonMagicalOnly: true, note: 'non argentées' },
      { damageType: type('slashing', 'Tranchant'), nonMagicalOnly: true, note: 'non argentées' },
      { damageType: null, nonMagicalOnly: false, note: 'dégâts des sorts' },
    ])).toBe("froid ; contondant, perforant et tranchant d'attaques non magiques non argentées ; dégâts des sorts")
  })

  it('names usages without repeating them', () => {
    expect(formatUsage({ type: 'recharge', dice: '1d6', minValue: 5 })).toBe('Recharge 5–6')
    expect(formatUsage({ type: 'per_day', times: 3 })).toBe('3/jour')
    const action = { name: 'Souffles', usage: { type: 'recharge', dice: '1d6', minValue: 5 } } as ApiMonsterAction
    expect(actionTitle(action)).toBe('Souffles (Recharge 5–6)')
    expect(actionTitle({ ...action, name: 'Fire Breath (Recharge 5–6)' })).toBe('Fire Breath (Recharge 5–6)')
  })
})

describe('richText', () => {
  it('splits paragraphs and tables with their caption', () => {
    const text = 'Premier paragraphe.\n\nLeviers\n\n| Levier | Haut |\n\n|---|---|\n\n| 1 | Ouvre |\n\n| 2 | Ferme |\n\nFin.'
    expect(parseRichText(text)).toEqual([
      { type: 'paragraph', text: 'Premier paragraphe.' },
      { type: 'table', caption: 'Leviers', header: ['Levier', 'Haut'], rows: [['1', 'Ouvre'], ['2', 'Ferme']] },
      { type: 'paragraph', text: 'Fin.' },
    ])
    expect(parseRichText(null)).toEqual([])
  })
})
