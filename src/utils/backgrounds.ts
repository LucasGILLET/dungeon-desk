import type { SRDBackground, SRDRace } from '@/types/srd'
import { translateSkillName } from './proficiencies'

export function getBackgroundSkills(background: SRDBackground): string[] {
  return background.starting_proficiencies?.map((proficiency: { name: string }) => 
    translateSkillName(proficiency.name)
  ) || []
}

export function getBackgroundDescription(background: SRDBackground): string {
  const descriptions: Record<string, string> = {
    'acolyte': 'Vous avez servi dans un temple, apprenant les rites sacrés et les connaissances religieuses.',
    'charlatan': 'Maître de la tromperie, vous savez convaincre les gens de croire en vos mensonges.',
    'criminal': 'Vous avez un passé criminel, connaissant les dessous de la société underground.',
    'entertainer': 'Vous divertissez les foules par votre art, musique, théâtre ou autre performance.',
    'folk-hero': 'Vous êtes un héros populaire, défendant les opprimés et luttant contre l\'injustice.',
    'guild-artisan': 'Membre d\'une guilde, vous maîtrisez un métier et avez des contacts professionnels.',
    'hermit': 'Vous avez vécu en isolement, méditant et découvrant d\'importantes vérités.',
    'noble': 'Issu de la noblesse, vous avez des manières raffinées et des contacts haut placés.',
    'outlander': 'Vous venez des terres sauvages, survivant en harmonie avec la nature.',
    'sage': 'Vous avez consacré votre vie à l\'étude, accumulant connaissances et sagesse.',
    'sailor': 'Vous avez navigué sur les océans, affrontant tempêtes et créatures marines.',
    'soldier': 'Vous avez servi dans une armée, apprenant discipline et tactiques militaires.',
    'urchin': 'Vous avez grandi dans les rues, apprenant à survivre par vos propres moyens.'
  }
  return descriptions[background.index] || 'Un background D&D 5e.'
}

export function getBackgroundName(backgroundIndex: string): string {
  const names: Record<string, string> = {
    'acolyte': 'Acolyte',
    'charlatan': 'Charlatan',
    'criminal': 'Criminel',
    'entertainer': 'Artiste',
    'folk-hero': 'Héros du Peuple',
    'guild-artisan': 'Artisan de Guilde',
    'hermit': 'Ermite',
    'noble': 'Noble',
    'outlander': 'Étranger',
    'sage': 'Sage',
    'sailor': 'Marin',
    'soldier': 'Soldat',
    'urchin': 'Enfant des Rues'
  }
  return names[backgroundIndex] || backgroundIndex
}

export function getBackgroundEmoji(backgroundIndex: string): string {
  const emojis: Record<string, string> = {
    'acolyte': '⛪',
    'charlatan': '🎭',
    'criminal': '🔓',
    'entertainer': '🎨',
    'folk-hero': '🏹',
    'guild-artisan': '🔨',
    'hermit': '🏔️',
    'noble': '👑',
    'outlander': '🏕️',
    'sage': '📚',
    'sailor': '⚓',
    'soldier': '⚔️',
    'urchin': '🏘️'
  }
  return emojis[backgroundIndex] || '❓'
}
