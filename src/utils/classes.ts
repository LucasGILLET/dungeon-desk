import type { SRDClass } from '@/types/srd'

const DIFFICULTIES = { EASY: 'Facile', MEDIUM: 'Moyen', HARD: 'Difficile' } as const
export function getClassDifficulty(cls: SRDClass): 'Facile' | 'Moyen' | 'Difficile' {
  return DIFFICULTIES[cls.difficulty ?? 'MEDIUM']
}

export function getClassDescription(cls: SRDClass): string {
  return cls.summary ?? ''
}

// Caractéristiques à privilégier, dans l'ordre (« Force », « Constitution »)
export function getClassMainStats(cls: SRDClass): string[] {
  return (cls.recommended_abilities ?? []).map((a) => a.name)
}

// Classe martiale : pas d'incantation, ou demi-lanceur (paladin, rôdeur)
export function isMartialClass(cls: SRDClass): boolean {
  return !cls.caster_type || cls.caster_type === 'HALF' || cls.caster_type === 'THIRD'
}

