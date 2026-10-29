import { describe, expect, it } from 'vitest'
import { generateNpcName } from '@/utils/npcNames'

// Tirages reproductibles
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const RACES = ['human', 'elf', 'half-elf', 'dwarf', 'halfling', 'half-orc', 'dragonborn', 'gnome', 'tiefling']
const many = (race: string, gender: 'MALE' | 'FEMALE' | 'NON_BINARY' = 'MALE', count = 300) => {
  const random = seeded(race.length * 7 + gender.length)
  return Array.from({ length: count }, () => generateNpcName(race, gender, random))
}

describe('npcNames', () => {
  it.each(RACES)('generates varied, pronounceable %s names', (race) => {
    const names = [...many(race, 'MALE'), ...many(race, 'FEMALE'), ...many(race, 'NON_BINARY')]
    // Presque jamais deux fois le même (les noms de vertu des tieffelins sont des mots, ils reviennent)
    expect(new Set(names.map((n) => n.fullName)).size).toBeGreaterThan(names.length * (race === 'tiefling' ? 0.8 : 0.9))
    for (const { firstName, fullName } of names) {
      expect(firstName).toMatch(/^[A-ZÀ-ÝŒ]/)
      expect(firstName).not.toMatch(/(.)\1\1/)
      expect(fullName).toContain(firstName)
    }
  })

  it('follows the name form of each race', () => {
    for (const n of many('dwarf')) expect(n.fullName).toBe(`${n.firstName} du clan ${n.lastName}`)
    // Le clan d'abord, et il est long
    for (const n of many('dragonborn')) {
      expect(n.fullName).toBe(`${n.lastName} ${n.firstName}`)
      expect(n.lastName.length).toBeGreaterThanOrEqual(9)
    }
    // Demi-orcs : surtout un nom seul
    const orcs = many('half-orc')
    expect(orcs.filter((n) => !n.lastName).length).toBeGreaterThan(orcs.length * 0.7)
    expect(many('gnome').some((n) => n.fullName.includes(', dit « '))).toBe(true)
  })

  it('sounds different from one race to another', () => {
    const letters = (race: string) => many(race).map((n) => n.firstName).join('').toLowerCase()
    const count = (text: string, re: RegExp) => (text.match(re) ?? []).length / text.length
    // Les orcs ont des sons durs, les elfes des sons doux
    expect(count(letters('half-orc'), /[gkz]/g)).toBeGreaterThan(count(letters('elf'), /[gkz]/g) * 2)
    expect(count(letters('elf'), /[lr]/g)).toBeGreaterThan(count(letters('half-orc'), /[lr]/g))
  })

  it('gives a human name to a race it does not know (homebrew)', () => {
    const n = generateNpcName('star-spawn', 'FEMALE', seeded(1))
    expect(n.firstName).toMatch(/^[A-ZÀ-Ý]/)
    expect(n.lastName).not.toBe('')
  })
})
