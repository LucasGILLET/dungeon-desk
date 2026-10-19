import type { SRDRace } from '@/types/srd'

export function getRaceDescription(race: SRDRace): string {
  return race.summary || race.size_description || race.alignment
}

// « +2 DEX », et le bonus au choix du demi-elfe
export function getRaceStats(race: SRDRace): string[] {
  if (!race) return []
  const fixed = race.ability_bonuses.map((bonus) => `+${bonus.bonus} ${bonus.ability_score.name}`)
  const choice = race.ability_bonus_choice
  return choice ? [...fixed, `+${choice.bonus} dans ${choice.choose} autres caractéristiques (au choix)`] : fixed
}

export function getRaceTraits(race: SRDRace): string[] {
  return race.traits.map(trait => trait.name)
}

