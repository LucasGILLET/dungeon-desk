import { describe, expect, it } from 'vitest'
import { criticalDice, rollAttack, rollDamage } from '@/utils/attackRolls'
import { actionDetailLines, averageDice, damageTypeText } from '@/utils/monsterFormat'
import type { ApiMonsterAction } from '@/utils/dataLoader'

// Tirages fixes : 0 → 1 sur le dé, 0.999 → la face la plus haute
const always = (value: number) => () => value
const ref = (index: string, name: string) => ({ index, name })

const claws: ApiMonsterAction = {
  name: 'Griffes', description: '', attack: { type: 'MELEE_WEAPON', bonus: 5, reachFt: 5, rangeFt: null }, save: null, usage: null, legendaryCost: null,
  damages: [{ dice: '2d6+3', damageType: ref('slashing', 'Tranchant'), alternativeGroup: null }, { dice: '1d4', damageType: ref('fire', 'Feu'), alternativeGroup: null }],
  multiattack: [], spellcasting: null,
}

describe('attack rolls', () => {
  it('rolls d20 + bonus and flags natural 20 and 1', () => {
    expect(rollAttack(5, always(0.999))).toEqual({ d20: 20, bonus: 5, total: 25, critical: true, fumble: false })
    expect(rollAttack(5, always(0))).toMatchObject({ d20: 1, total: 6, fumble: true })
  })

  it('doubles the dice, not the modifier, on a critical hit', () => {
    expect(criticalDice('2d6 + 3')).toBe('4d6+3')
    expect(criticalDice('d8')).toBe('2d8')
    expect(rollDamage(claws.damages, false, always(0.999))).toMatchObject({ total: 19, parts: [{ dice: '2d6+3', total: 15, type: 'tranchant' }, { dice: '1d4', total: 4, type: 'feu' }] })
    expect(rollDamage(claws.damages, true, always(0.999)).total).toBe(35) // 4d6+3 = 27, 2d4 = 8
  })
})

describe('generated stat block lines', () => {
  it('writes the attack and damage line like the French SRD', () => {
    expect(averageDice('2d6+3')).toBe(10)
    expect(damageTypeText(ref('slashing', 'Tranchant'))).toBe('dégâts tranchants')
    expect(damageTypeText(ref('acid', 'Acide'))).toBe("dégâts d'acide")
    expect(actionDetailLines(claws)).toEqual([
      'Attaque au corps à corps avec une arme : +5 au toucher, allonge 1,5 m, une cible.',
      'Dégâts : 10 (2d6+3) dégâts tranchants + 2 (1d4) dégâts de feu.',
    ])
  })

  it('adds the save, and nothing that the description already says', () => {
    const breath = { ...claws, attack: null, save: { ability: ref('dex', 'Dextérité'), dc: 13, success: 'HALF' as const }, damages: [claws.damages[1]!] }
    expect(actionDetailLines(breath)).toEqual(['Jet de sauvegarde de Dextérité DD 13.', 'Dégâts : 2 (1d4) dégâts de feu.'])
    const written = { ...claws, description: 'Attaque au corps à corps avec une arme : +5 au toucher. Dégâts : 10 (2d6 + 3) dégâts tranchants.' }
    expect(actionDetailLines(written)).toEqual([])
  })
})
