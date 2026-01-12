<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col">

    <!-- Historiques -->
    <div class="flex flex-col justify-center px-4 my-auto">
      <!-- Toutes les historiques -->
      <div class="mb-6">
        <div v-if="loading" class="text-center">
          <div class="text-white">Chargement des historiques...</div>
        </div>
        <div v-if="error" class="text-center">
          <div class="text-red-400">{{ error }}</div>
        </div>
        <div class="classes-container w-full grid grid-cols-7 gap-2 mb-4">
          <div 
            v-for="background in backgrounds" 
            :key="background.index" 
            @click="selectBackground(background)"
            :class="[
              'class-card cursor-pointer bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 transition-all duration-100 ease-out',
              selectedBackground?.index === background.index 
                ? 'border-yellow-400 ring-4 ring-yellow-400/50 bg-white/25' 
                : 'border-white/20 hover:border-white/40'
            ]"
          >
            <!-- Contenu de la carte -->
            <div class="h-full flex flex-col items-center justify-center text-center">
              <!-- Image de l'historique -->
              <div class="relative mb-4">
                <div class="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <span class="text-2xl">{{ getBackgroundEmoji(background.index) }}</span>
                </div>
                <!-- Badge sélectionné -->
                <div 
                  v-if="selectedBackground?.index === background.index"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <svg class="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              
              <!-- Nom de l'historique -->
              <h3 class="text-lg font-bold text-white mb-2 class-name transition-all duration-300">
                {{ getBackgroundName(background.index) }}
              </h3>
              
              <!-- Description (visible au hover) -->
              <div class="class-details opacity-0 transition-all duration-300 overflow-hidden">
                <p class="text-sm text-blue-100 mb-3 leading-relaxed">
                  {{ getBackgroundDescription(background) }}
                </p>
                
                <!-- Compétences -->
                <div class="flex flex-wrap justify-center gap-1 mb-3">
                  <span 
                    v-for="skill in getBackgroundSkills(background)" 
                    :key="skill" 
                    class="bg-indigo-500/30 text-indigo-100 px-2 py-1 rounded-full text-xs font-medium border border-indigo-400/30"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <StepNavigation 
      :current-step="4" 
      :total-steps="9"
      step-name="Historique"
      :disable-next="!selectedBackground"
      @previous="emit('prev')"
      @next="emit('next', selectedBackground!)"
    />
  </div>
</template>

<style scoped>
/* Effet d'agrandissement au hover */
.classes-container:hover .class-card {
  transform: scale(0.9);
  opacity: 0.4;
}

.classes-container:hover .class-card:hover {
  transform: scale(1.1);
  opacity: 1;
  z-index: 10;
}

/* Révélation du contenu au hover */
.class-card:hover .class-details {
  opacity: 1;
}

.class-card:hover .class-name {
  font-size: 1.25rem;
}

/* Animation plus fluide */
.class-card {
  transition: all 0.35s ease-out;
}

/* Stabilisation complète du contenu pour éviter les mouvements */
.class-card > div {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Positionnement absolu pour stabiliser complètement */
.class-card .relative {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
}

.class-card .class-name {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 90%;
  transition: font-size 0.35s ease-out;
}

.class-card .class-details {
  position: absolute;
  top: 130px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  transition: opacity 0.35s ease-out;
  max-height: 150px;
  overflow: hidden;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StepNavigation from '../StepNavigation.vue'
import { loadBackgrounds } from '@/utils/dataLoader'
import type { SRDBackground } from '@/types/srd'

const emit = defineEmits<{
  next: [background: SRDBackground]
  prev: []
}>()

const backgrounds = ref<SRDBackground[]>([])
const selectedBackground = ref<SRDBackground | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    backgrounds.value = await loadBackgrounds()
  } catch (err) {
    error.value = 'Erreur lors du chargement des historiques'
    console.error(err)
  } finally {
    loading.value = false
  }
})

function selectBackground(background: SRDBackground) {
  selectedBackground.value = background
}

function getBackgroundEmoji(backgroundIndex: string): string {
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

function getBackgroundName(backgroundIndex: string): string {
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

function translateSkillName(skillName: string): string {
  const skillTranslations: Record<string, string> = {
    'Skill: Insight': 'Perspicacité',
    'Skill: Religion': 'Religion',
    'Skill: Deception': 'Tromperie',
    'Skill: Sleight of Hand': 'Escamotage',
    'Skill: Stealth': 'Discrétion',
    'Skill: Acrobatics': 'Acrobaties',
    'Skill: Performance': 'Représentation',
    'Skill: Animal Handling': 'Dressage',
    'Skill: Survival': 'Survie',
    'Skill: Persuasion': 'Persuasion',
    'Skill: Athletics': 'Athlétisme',
    'Skill: Intimidation': 'Intimidation',
    'Skill: History': 'Histoire',
    'Skill: Arcana': 'Arcanes',
    'Skill: Medicine': 'Médecine',
    'Skill: Perception': 'Perception',
    'Skill: Nature': 'Nature',
    'Skill: Investigation': 'Investigation'
  }
  return skillTranslations[skillName] || skillName
}

function getBackgroundSkills(background: SRDBackground): string[] {
  return background.starting_proficiencies?.map((proficiency: { name: string }) => 
    translateSkillName(proficiency.name)
  ) || []
}

function getBackgroundDescription(background: SRDBackground): string {
  // Descriptions simples pour chaque background
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
</script>
