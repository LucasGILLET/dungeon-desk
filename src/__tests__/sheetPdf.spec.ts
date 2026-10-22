import { describe, expect, it } from 'vitest'
import { toSheetPdfData } from '@/utils/sheetPdf'
import type { CharacterSheetValues } from '@/types/character'

const scores = (values: Record<string, number>) =>
  Object.fromEntries(Object.entries(values).map(([k, v]) => [k, { base: v, bonus: 0, total: v, modifier: Math.floor((v - 10) / 2) }]))

const sheet: CharacterSheetValues = {
  level: 4,
  proficiencyBonus: 2,
  maxHitPoints: 34,
  abilityScores: scores({ str: 16, dex: 14, con: 14, int: 12, wis: 10, cha: 8 }),
  pending: { subclasses: [], abilityScoreImprovements: [], choices: [] },
  proficiencies: [
    { index: 'saving-throw-str', name: 'JS Force', type: 'SAVING_THROW' },
    { index: 'skill-athletics', name: 'Athlétisme', type: 'SKILL' },
    { index: 'skill-sleight-of-hand', name: 'Escamotage', type: 'SKILL' },
    { index: 'heavy-armor', name: 'Armures lourdes', type: 'ARMOR' },
  ],
  expertise: [],
  languages: [{ index: 'common', name: 'Commun' }],
  hitDice: [{ class: 'fighter', die: 10, total: 3, used: 0 }, { class: 'wizard', die: 6, total: 1, used: 0 }],
  armorClass: { value: 19, detail: 'Cotte de mailles 16 + 1 (Défense) + Bouclier 2' },
  attacks: [
    { kind: 'WEAPON', index: 'longsword', name: 'Épée longue', attackBonus: 5, save: null, damage: '1d8 + 3 tranchant', versatileDamage: null, range: null, properties: [], equipped: true },
    { kind: 'SPELL', index: 'sacred-flame', name: 'Flamme sacrée', attackBonus: null, save: { dc: 13, ability: 'dex' }, damage: '1d8 radiant', versatileDamage: null, range: null, properties: [], equipped: false },
  ],
}

const data = toSheetPdfData({
  input: {
    name: 'Brann', race: 'dwarf', abilityScores: { str: 16, dex: 14, con: 14, int: 12, wis: 10, cha: 8 },
    classes: [], items: [{ equipment: 'chain-mail', quantity: 1 }, { name: 'Potion de soins', quantity: 2 }, { magicItem: 'cloak-of-elvenkind', quantity: 1 }],
    currencies: { GP: 15, SP: 3 },
    personality: [{ kind: 'IDEAL', optionId: 7 }, { kind: 'FLAW', text: 'Trop fier' }],
    state: { experiencePoints: 2700, damageTaken: 4 } as never,
  },
  sheet,
  names: { race: 'Nain', subrace: 'Nain des collines', background: 'Soldat', classes: [{ class: 'Guerrier', subclass: 'Champion', level: 3 }, { class: 'Magicien', subclass: null, level: 1 }] },
  speedFeet: 25,
  features: [{ name: 'Second souffle' }, { name: 'Vision dans le noir' }],
  equipmentName: (i) => (i === 'chain-mail' ? 'Cotte de mailles' : undefined),
  magicItemName: (i) => (i === 'cloak-of-elvenkind' ? 'Cape elfique' : undefined),
  personalityText: (id) => (id === 7 ? 'Responsabilité' : undefined),
})

describe('toSheetPdfData', () => {
  it('reprend le niveau et les valeurs calculées par le back', () => {
    expect(data).toMatchObject({
      level: 4, classLevel: 'Guerrier (Champion) 3 / Magicien 1', race: 'Nain des collines', experience: 2700,
      armorClass: 19, hpMax: 34, hitDice: '3d10 + 1d6', speed: 7.5, initiative: 2, strength: 16,
    })
  })

  it('coche les maîtrises de sauvegarde et de compétence', () => {
    expect(data).toMatchObject({ strengthCheck: true, dexterityCheck: false, athletics: true, sleightOfHand: true, stealth: false })
  })

  it("liste l'équipement, la monnaie, les maîtrises et la personnalité", () => {
    expect(data.equipment).toBe('Cotte de mailles, Potion de soins ×2, Cape elfique')
    expect(data).toMatchObject({ po: 15, pa: 3, pc: 0, otherMasteries: 'Armures lourdes, Commun', ideals: 'Responsabilité', flaws: 'Trop fier' })
    expect(data.featuresTraits).toBe('Second souffle, Vision dans le noir')
  })

  it('remplit le tableau des attaques', () => {
    expect(data.attacks).toEqual([
      { name: 'Épée longue', bonus: '+5', damage: '1d8 + 3 tranchant' },
      { name: 'Flamme sacrée', bonus: 'DD 13', damage: '1d8 radiant' },
    ])
  })
})
