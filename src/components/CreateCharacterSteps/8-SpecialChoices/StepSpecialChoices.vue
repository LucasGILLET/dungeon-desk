<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
    <!-- En-tête -->
    <div class="text-center pt-8 pb-6">
      <h1 class="text-4xl font-bold text-white mb-2">⚡ Choix spéciaux</h1>
      <p class="text-purple-100 text-lg">Personnalisez les capacités uniques de votre personnage</p>
      <div class="mt-3">
        <span class="bg-purple-500/30 text-purple-100 px-3 py-1 rounded-full text-sm font-medium border border-purple-400/30">
          {{ character.race.name }} {{ character.class.name }}{{ character.subclass ? ` • ${character.subclass}` : '' }}
        </span>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="flex-1 px-6 pb-8">
      <div class="max-w-6xl mx-auto space-y-8">

        <div v-if="!hasAnyChoices" class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div class="text-6xl mb-4">✨</div>
          <h3 class="text-2xl font-bold text-white mb-3">Aucun choix spécial requis</h3>
          <p class="text-purple-200 text-lg">Votre combinaison de classe et sous-classe ne nécessite pas de choix spéciaux au niveau 1.</p>
          <p class="text-purple-300 text-sm mt-2">Vous débloquerez peut-être des options aux niveaux supérieurs !</p>
        </div>

        <div v-else class="space-y-6">
          <div v-for="choice in specialChoicesData.choices" :key="choice.id" 
               class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold text-white mb-2">{{ choice.name }}</h2>
              <p class="text-purple-200">{{ choice.description }}</p>
            </div>

            <div class="grid gap-4" :class="getGridClass(choice)">
              <div 
                v-for="option in choice.options"
                :key="option.id"
                class="bg-black/20 rounded-xl p-4 border transition-all duration-200 cursor-pointer"
                :class="{ 
                  'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/25': isSelected(choice.id, option.id),
                  'border-white/20 hover:border-purple-300 hover:bg-white/5': !isSelected(choice.id, option.id) && !isDisabled(choice, option),
                  'border-gray-600 bg-gray-800/40 opacity-50 cursor-not-allowed': isDisabled(choice, option)
                }"
                @click="selectOption(choice, option)"
              >
                <div class="flex items-start justify-between mb-3">
                  <h4 class="text-white font-semibold text-lg">{{ option.name }}</h4>
                  <div v-if="isSelected(choice.id, option.id)" 
                       class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                
                <p class="text-purple-200 text-sm mb-3 leading-relaxed">{{ option.description }}</p>
                
                <div v-if="option.effect" class="bg-purple-900/50 border border-purple-500/30 rounded-lg p-3">
                  <div class="flex items-start">
                    <svg class="w-4 h-4 text-purple-300 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    <div>
                      <span class="text-purple-300 font-medium text-xs uppercase tracking-wide">Effet</span>
                      <p class="text-purple-100 text-sm mt-1">{{ option.effect }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Indicateur de sélections multiples -->
            <div v-if="getMaxSelections(choice) > 1" 
                 class="text-center mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
              <span class="text-purple-200 font-medium">
                {{ getSelectionCount(choice.id) }} / {{ getMaxSelections(choice) }} sélectionnés
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <StepNavigation 
      :current-step="8" 
      :total-steps="9"
      step-name="Choix spéciaux"
      :disable-next="!allChoicesMade"
      @previous="$emit('previous')"
      @next="$emit('next')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { Character } from '../../../stores/app'
import { getRequiredSpecialChoices, type SpecialChoice, type SpecialChoiceOption } from '../../../utils/specialChoices'
import StepNavigation from '../StepNavigation.vue'

interface Props {
  character: Character
}

interface Emits {
  (e: 'update:character', character: Character): void
  (e: 'next'): void
  (e: 'previous'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// État local pour les sélections
const selections = reactive<Record<string, string[]>>({})

// Données des choix spéciaux requis
const specialChoicesData = computed(() => {
  return getRequiredSpecialChoices(props.character.class, props.character.subclass)
})

const hasAnyChoices = computed(() => {
  return specialChoicesData.value.choices.length > 0
})

// Vérifier si toutes les sélections obligatoires sont faites
const allChoicesMade = computed(() => {
  if (!hasAnyChoices.value) return true
  
  return specialChoicesData.value.choices.every(choice => {
    const selectionCount = getSelectionCount(choice.id)
    const maxSelections = getMaxSelections(choice)
    return selectionCount === maxSelections
  })
})

// Obtenir le nombre maximum de sélections pour un choix
function getMaxSelections(choice: SpecialChoice): number {
  switch (choice.category) {
    case 'expertise':
      return 2 // Le roublard choisit 2 expertises
    default:
      return 1
  }
}

// Obtenir le nombre de sélections actuelles pour un choix
function getSelectionCount(choiceId: string): number {
  return selections[choiceId]?.length || 0
}

// Vérifier si une option est sélectionnée
function isSelected(choiceId: string, optionId: string): boolean {
  return selections[choiceId]?.includes(optionId) || false
}

// Vérifier si une option est désactivée
function isDisabled(choice: SpecialChoice, option: SpecialChoiceOption): boolean {
  const currentSelections = getSelectionCount(choice.id)
  const maxSelections = getMaxSelections(choice)
  
  // Si on a atteint le maximum et que cette option n'est pas sélectionnée
  if (currentSelections >= maxSelections && !isSelected(choice.id, option.id)) {
    return true
  }

  // Logique spéciale pour l'expertise - seulement les compétences que le roublard maîtrise
  if (choice.category === 'expertise') {
    const character = props.character
    const allProficiencies = [
      ...(character.proficiencies?.skills || []),
      ...(character.proficiencies?.tools || [])
    ]
    
    // Convertir l'ID de l'option en format attendu
    const skillMap: Record<string, string> = {
      'outils-voleur': 'outils-de-voleur'
    }
    const mappedId = skillMap[option.id] || option.id
    
    return !allProficiencies.includes(mappedId)
  }
  
  return false
}

// Sélectionner/désélectionner une option
function selectOption(choice: SpecialChoice, option: SpecialChoiceOption): void {
  if (isDisabled(choice, option)) return

  if (!selections[choice.id]) {
    selections[choice.id] = []
  }

  const currentSelections = selections[choice.id]!
  const isCurrentlySelected = currentSelections.includes(option.id)
  const maxSelections = getMaxSelections(choice)

  if (isCurrentlySelected) {
    // Désélectionner
    const index = currentSelections.indexOf(option.id)
    currentSelections.splice(index, 1)
  } else {
    // Sélectionner
    if (maxSelections === 1) {
      // Remplacer la sélection actuelle
      selections[choice.id] = [option.id]
    } else {
      // Ajouter à la sélection multiple
      if (currentSelections.length < maxSelections) {
        currentSelections.push(option.id)
      }
    }
  }

  // Mettre à jour le personnage
  updateCharacter()
}

// Mettre à jour le personnage avec les sélections
function updateCharacter(): void {
  const updatedCharacter = { ...props.character }
  
  if (!updatedCharacter.specialChoices) {
    updatedCharacter.specialChoices = {}
  }

  // Copier toutes les sélections dans le personnage
  Object.keys(selections).forEach(choiceId => {
    const choiceSelections = selections[choiceId]
    if (choiceSelections && choiceSelections.length > 0) {
      updatedCharacter.specialChoices![choiceId] = [...choiceSelections]
    }
  })

  emit('update:character', updatedCharacter)
}

// Obtenir la classe CSS pour la grille selon le type de choix
function getGridClass(choice: SpecialChoice): string {
  switch (choice.category) {
    case 'draconic-ancestry':
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    case 'fighting-style':
      return 'grid-cols-1 md:grid-cols-2'
    case 'favored-enemy':
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    case 'natural-explorer':
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    case 'expertise':
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    default:
      return 'grid-cols-1 md:grid-cols-2'
  }
}

// Initialiser les sélections si elles existent déjà
if (props.character.specialChoices) {
  Object.keys(props.character.specialChoices).forEach(choiceId => {
    const existingChoices = props.character.specialChoices?.[choiceId]
    if (existingChoices) {
      selections[choiceId] = [...existingChoices]
    }
  })
}
</script>
