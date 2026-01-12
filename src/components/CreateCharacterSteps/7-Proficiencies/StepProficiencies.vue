<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
    <!-- En-tête -->
    <div class="text-center pt-8 pb-6">
      <h1 class="text-4xl font-bold text-white mb-2">🛠️ Maîtrises et Langues</h1>
      <p class="text-purple-100 text-lg">Finalisez les compétences de votre personnage</p>
      <div class="mt-3">
        <span class="bg-purple-500/30 text-purple-100 px-3 py-1 rounded-full text-sm font-medium border border-purple-400/30">
          {{ character.subrace?.name }} {{ character.class.name }}{{ character.background ? ` • ${character.background.name}` : '' }}
        </span>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="flex-1 px-6 pb-8">
      <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Maîtrises automatiques -->
        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center">
            ✅ Maîtrises automatiques
          </h2>
          <p class="text-purple-200 mb-4">Ces maîtrises vous sont accordées automatiquement par votre race, classe et historique.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Langues raciales automatiques -->
            <div class="bg-black/20 rounded-lg p-4">
              <h3 class="text-purple-300 font-semibold mb-2 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"></path>
                </svg>
                Langues raciales
              </h3>
              <div class="space-y-2">
                <div v-for="language in automaticRacialLanguages" :key="language.name" class="relative language-tooltip-container">
                  <div class="bg-blue-500/30 text-blue-100 px-3 py-2 mr-1 rounded-lg text-sm cursor-help"
                       @mouseenter="showTooltip"
                       @mouseleave="hideTooltip">
                    {{ language.name }}
                  </div>
                  <!-- Tooltip -->
                  <div class="language-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 transition-opacity duration-200 pointer-events-none z-30 w-64 text-left">
                    <div class="font-semibold mb-1 text-blue-300">{{ language.name }}</div>
                    <div class="text-xs text-gray-300 leading-relaxed">{{ language.description }}</div>
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Compétences -->
            <div v-if="automaticSkills.length > 0" class="bg-black/20 rounded-lg p-4">
              <h3 class="text-purple-300 font-semibold mb-2 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Compétences
              </h3>
              <div class="space-y-2">
                <div v-for="skill in automaticSkills" :key="skill.id" class="relative skill-tooltip-container">
                  <div class="bg-green-500/30 text-green-100 px-3 py-2 mr-1 rounded-lg text-sm cursor-help"
                       @mouseenter="showTooltip"
                       @mouseleave="hideTooltip">
                    {{ skill.name }}
                  </div>
                  <!-- Tooltip -->
                  <div class="skill-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 transition-opacity duration-200 pointer-events-none z-30 w-64 text-left">
                    <div class="font-semibold mb-1 text-green-300">{{ skill.name }}</div>
                    <div class="text-xs text-gray-300 leading-relaxed">{{ skill.description }}</div>
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Langues supplémentaires (classe/historique) -->
            <div v-if="automaticLanguages.length > 0" class="bg-black/20 rounded-lg p-4">
              <h3 class="text-purple-300 font-semibold mb-2 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                Autres langues
              </h3>
              <div class="space-y-2">
                <div v-for="language in automaticLanguages" :key="language.id" class="relative language-tooltip-container">
                  <div class="bg-cyan-500/30 text-cyan-100 px-3 py-2 rounded-lg text-sm cursor-help"
                       @mouseenter="showTooltip"
                       @mouseleave="hideTooltip">
                    {{ language.name }}
                  </div>
                  <!-- Tooltip -->
                  <div class="language-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 transition-opacity duration-200 pointer-events-none z-30 w-64 text-left">
                    <div class="font-semibold mb-1 text-cyan-300">{{ language.name }}</div>
                    <div class="text-xs text-gray-300 leading-relaxed">{{ language.description }}</div>
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Outils -->
            <div v-if="automaticTools.length > 0" class="bg-black/20 rounded-lg p-4">
              <h3 class="text-purple-300 font-semibold mb-2 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Outils et Instruments
              </h3>
              <div class="space-y-2">
                <div v-for="tool in automaticTools" :key="tool.id" class="relative tool-tooltip-container">
                  <div class="bg-orange-500/30 text-orange-100 px-3 py-2 rounded-lg text-sm cursor-help"
                       @mouseenter="showTooltip"
                       @mouseleave="hideTooltip">
                    {{ tool.name }}
                  </div>
                  <!-- Tooltip -->
                  <div class="tool-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 transition-opacity duration-200 pointer-events-none z-30 w-64 text-left">
                    <div class="font-semibold mb-1 text-orange-300">{{ tool.name }}</div>
                    <div class="text-xs text-gray-300 leading-relaxed">{{ tool.description }}</div>
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Choix à faire -->
        <div v-if="choiceGroups.length > 0" class="space-y-6">
          <div v-for="(group, groupIndex) in choiceGroups" :key="group.id" class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 class="text-xl font-bold text-white mb-4 flex items-center">
              🎯 {{ group.name }}
              <span class="ml-2 text-sm bg-purple-500/30 px-2 py-1 rounded-full">
                {{ selections[group.id]?.length || 0 }}/{{ group.count }}
              </span>
            </h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <div 
                v-for="choice in group.choices" 
                :key="choice.id"
                @click="!isUnavailable(group, choice.id) ? toggleSelection(group.id, choice, group.count) : null"
                :class="[
                  'relative bg-black/20 rounded-lg p-4 border-2 transition-all duration-300',
                  isUnavailable(group, choice.id)
                    ? 'border-gray-600 bg-gray-800/40 opacity-50 cursor-not-allowed'
                    : isSelected(group.id, choice.id) 
                      ? 'border-purple-400 bg-purple-500/20 cursor-pointer hover:scale-105' 
                      : 'border-white/20 hover:border-purple-300/60 cursor-pointer hover:scale-105'
                ]"
              >
                <!-- Badge de sélection -->
                <div v-if="isSelected(group.id, choice.id)" 
                     class="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>

                <!-- Badge "Déjà acquis" -->
                <div v-if="isUnavailable(group, choice.id)" 
                     class="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"></path>
                  </svg>
                </div>

                <!-- Icône selon le type -->
                <div class="text-2xl mb-2">
                  {{ getCategoryIcon(choice.category) }}
                </div>

                <!-- Nom -->
                <h3 :class="[
                  'font-semibold mb-1 text-sm',
                  isUnavailable(group, choice.id) ? 'text-gray-400' : 'text-white'
                ]">
                  {{ choice.name }}
                  <span v-if="isUnavailable(group, choice.id)" class="text-xs text-gray-500 block">(Déjà acquis)</span>
                </h3>
                
                <!-- Description -->
                <p :class="[
                  'text-xs leading-relaxed',
                  isUnavailable(group, choice.id) ? 'text-gray-500' : 'text-purple-200'
                ]">{{ choice.description }}</p>
              </div>
            </div>

            <!-- Indicateur de progression -->
            <div class="mt-4 bg-black/20 rounded-full h-2 overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300"
                :style="{ width: `${Math.min(100, ((selections[group.id]?.length || 0) / group.count) * 100)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Message si aucun choix nécessaire -->
        <div v-if="choiceGroups.length === 0" class="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold text-white mb-2">Parfait !</h2>
          <p class="text-purple-200">
            Toutes vos maîtrises sont déjà déterminées par vos choix précédents.
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <StepNavigation 
      :current-step="7" 
      :total-steps="9"
      step-name="Maîtrises et Langues"
      :disable-next="!allChoicesComplete"
      @previous="$emit('prev')"
      @next="validateChoices"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  getAllCharacterProficiencies, 
  getAutomaticLanguages,
  type ProficiencyChoice,
  type ProficiencyData
} from '@/utils/proficiencies'
import StepNavigation from '../StepNavigation.vue'

interface Character {
  name: string
  race: any
  subrace: any
  class: any
  subclass?: string
  background: any
  abilities: Record<string, number>
  level: number
}

const props = defineProps<{
  character: Character
}>()

const emit = defineEmits<{
  next: [payload: { selectedProficiencies: Record<string, ProficiencyChoice[]>, allProficiencies: {
    skills: ProficiencyChoice[]
    languages: ProficiencyChoice[]
    tools: ProficiencyChoice[]
  } }]
  prev: []
}>()

// Données des maîtrises
const proficiencyData = ref<ProficiencyData>({ automaticProficiencies: [], choiceGroups: [] })
const selections = ref<Record<string, ProficiencyChoice[]>>({})

// Computed pour organiser les maîtrises automatiques
const automaticProficiencies = computed(() => {
  return proficiencyData.value.automaticProficiencies
})
// Langues automatiques de la sous-race
const automaticRacialLanguages = computed(() => {
  return getAutomaticLanguages(props.character.race)
})

const automaticSkills = computed(() => {
  return automaticProficiencies.value.filter(p => p.category === 'skill')
})

const automaticLanguages = computed(() => 
  automaticProficiencies.value.filter(p => p.category === 'language')
)

const automaticTools = computed(() => 
  automaticProficiencies.value.filter(p => p.category === 'tool')
)

// Computed pour les groupes de choix
const choiceGroups = computed(() => proficiencyData.value.choiceGroups)

// Vérifier si tous les choix sont complets
const allChoicesComplete = computed(() => {
  return choiceGroups.value.every(group => 
    (selections.value[group.id]?.length || 0) === group.count
  )
})

// Fonctions utilitaires
function getCategoryIcon(category: string): string {
  switch (category) {
    case 'skill': return '⚡'
    case 'language': return '💬'
    case 'tool': return '🔧'
    default: return '📋'
  }
}

function isSelected(groupId: string, choiceId: string): boolean {
  return selections.value[groupId]?.some(choice => choice.id === choiceId) || false
}

function isUnavailable(group: any, choiceId: string): boolean {
  return group.unavailableChoices?.includes(choiceId) || false
}

function toggleSelection(groupId: string, choice: ProficiencyChoice, maxCount: number) {
  if (!selections.value[groupId]) {
    selections.value[groupId] = []
  }

  const currentSelections = selections.value[groupId]
  const isCurrentlySelected = isSelected(groupId, choice.id)

  if (isCurrentlySelected) {
    // Retirer la sélection
    selections.value[groupId] = currentSelections.filter(c => c.id !== choice.id)
  } else {
    // Ajouter la sélection si on n'a pas atteint la limite
    if (currentSelections.length < maxCount) {
      selections.value[groupId] = [...currentSelections, choice]
    }
  }
}

function validateChoices() {
  if (allChoicesComplete.value) {
    // Regrouper toutes les maîtrises par catégorie

    const newSkills = selections.value && Object.keys(selections.value).map((groupId) => 
      selections.value[groupId]?.filter(choice => choice.category === 'skill') || []
    ).flat() || []

    const newLanguages = selections.value && Object.keys(selections.value).map((groupId) => 
      selections.value[groupId]?.filter(choice => choice.category === 'language') || []
    ).flat() || []

    const newTools = selections.value && Object.keys(selections.value).map((groupId) => 
      selections.value[groupId]?.filter(choice => choice.category === 'tool') || []
    ).flat() || []

    const allProficiencies = {
      skills: [
        ...automaticSkills.value,
        ...newSkills
      ],
      languages: [
        ...automaticRacialLanguages.value,
        ...automaticLanguages.value,
        ...newLanguages
      ],
      tools: [
        ...automaticTools.value,
        ...newTools
      ]
    }

    emit('next', {
      selectedProficiencies: selections.value,
      allProficiencies: allProficiencies
    })
  }
}

// Fonctions pour les tooltips
function showTooltip(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target && target.parentElement) {
    const tooltip = target.parentElement.querySelector('.skill-tooltip, .language-tooltip, .tool-tooltip')
    if (tooltip) {
      tooltip.classList.add('tooltip-visible')
    }
  }
}

function hideTooltip(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target && target.parentElement) {
    const tooltip = target.parentElement.querySelector('.skill-tooltip, .language-tooltip, .tool-tooltip')
    if (tooltip) {
      tooltip.classList.remove('tooltip-visible')
    }
  }
}

// Initialisation
onMounted(() => {
  proficiencyData.value = getAllCharacterProficiencies(
    props.character.race?.index,
    props.character.subrace?.index || props.character.subrace,
    props.character.class.index,
    props.character.background.index,
  )
  
  // Initialiser les sélections vides
  choiceGroups.value.forEach(group => {
    selections.value[group.id] = []
  })
})
</script>

<style scoped>
/* Styles spécifiques pour les tooltips */
.skill-tooltip-container,
.language-tooltip-container,
.tool-tooltip-container {
  display: inline-block;
}

.skill-tooltip,
.language-tooltip,
.tool-tooltip {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
}

.skill-tooltip.tooltip-visible,
.language-tooltip.tooltip-visible,
.tool-tooltip.tooltip-visible {
  opacity: 1;
  visibility: visible;
}

/* Animation des cartes */
.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Animation de la barre de progression */
.transition-all {
  transition: all 0.3s ease-in-out;
}
</style>
