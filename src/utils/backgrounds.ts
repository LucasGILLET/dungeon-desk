import type { SRDBackground, SRDRace } from '@/types/srd'

export function getBackgroundSkills(background: SRDBackground): string[] {
  // Noms traduits par l'API : "Compétence : Religion" → "Religion"
  return background.starting_proficiencies?.map((proficiency: { name: string }) =>
    proficiency.name.replace(/^[^:]+ : /, '')
  ) || []
}

export function getBackgroundDescription(background: SRDBackground): string {
  return background.summary ?? ''
}

export function getBackgroundEmoji(background: SRDBackground): string {
  return background.icon ?? '❓'
}
