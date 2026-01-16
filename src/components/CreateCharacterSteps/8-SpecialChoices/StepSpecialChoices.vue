<template>
  <div class="flex flex-col h-full bg-zinc-950">
    <!-- Contenu défilable -->
    <div class="mb-24 flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
      <div class="max-w-6xl mx-auto space-y-10">

        <!-- En-tête -->
        <div class="text-center relative">
          <h2 class="text-3xl sm:text-4xl font-bold font-serif text-white mb-3 drop-shadow-md">
            Talents Uniques
          </h2>
          <p class="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
            Votre héritage et votre vocation vous offrent des capacités spéciales.
          </p>
          <div class="mt-4 flex justify-center">
            <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 text-xs uppercase tracking-widest shadow-sm">
               {{ character.race.name }} • {{ character.class.name }}{{ character.subclass ? ` • ${character.subclass.name}` : '' }}
            </span>
          </div>
        </div>

        <!-- No Choices State -->
        <div v-if="!hasAnyChoices" class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
           <div class="text-5xl mb-6 opacity-30 grayscale">✨</div>
           <h3 class="text-2xl font-serif text-zinc-300 mb-2">Aucun choix requis</h3>
           <p class="text-zinc-500 text-center max-w-md">
             Votre combinaison actuelle ne nécessite pas de décision supplémentaire pour le moment.
           </p>
        </div>

        <!-- Choices List -->
        <div v-else class="space-y-12 pb-12">
            <div v-for="(choice, index) in specialChoicesData.choices" :key="choice.id" 
               class="animate-fade-in-up" :style="{ animationDelay: `${index * 150}ms` }">
            
            <!-- Choice Header -->
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 border-b border-zinc-800 pb-4">
                <div>
                    <h2 class="text-2xl font-bold font-serif text-amber-500 mb-2">{{ choice.name }}</h2>
                    <p class="text-zinc-400 text-sm max-w-2xl leading-relaxed">{{ choice.description }}</p>
                </div>
                 <div class="flex-shrink-0">
                     <span class="px-3 py-1 rounded-full text-xs font-bold border transition-colors duration-300"
                        :class="getSelectionCount(choice.id) === getMaxSelections(choice) ? 'bg-amber-900/30 text-amber-500 border-amber-500/50' : 'bg-zinc-800 text-zinc-400 border-zinc-700'">
                      {{ getSelectionCount(choice.id) }} / {{ getMaxSelections(choice) }} Choix
                   </span>
                 </div>
            </div>

            <!-- Grid -->
            <div class="grid gap-4" :class="getGridClass(choice)">
              <div 
                v-for="option in choice.options"
                :key="option.id"
                @click="selectOption(choice, option)"
                class="group relative"
              >
                <!-- Card Inner -->
                 <div :class="[
                  'h-full p-5 rounded-lg border-2 transition-all duration-200 flex flex-col relative overflow-hidden',
                   isDisabled(choice, option)
                    ? 'border-zinc-800 bg-zinc-950/50 opacity-60 cursor-not-allowed grayscale'
                    : isSelected(choice.id, option.id)
                      ? 'border-amber-500 bg-zinc-900 shadow-[0_0_15px_rgba(245,158,11,0.15)] transform -translate-y-1'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-800 cursor-pointer hover:shadow-lg'
                ]">

                    <!-- Header -->
                    <div class="flex justify-between items-start mb-3 z-10">
                         <h4 class="font-serif font-bold text-lg leading-tight transition-colors"
                             :class="isSelected(choice.id, option.id) ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-100'">
                           {{ option.name }}
                         </h4>
                         
                         <!-- Selection Icon -->
                         <div v-if="isSelected(choice.id, option.id)" 
                             class="flex-shrink-0 ml-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-sm animate-scale-in">
                            <svg class="w-3.5 h-3.5 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                         </div>
                    </div>
                
                    <!-- Description -->
                    <p class="text-xs leading-relaxed mb-4 transition-colors z-10"
                        :class="isSelected(choice.id, option.id) ? 'text-zinc-400' : 'text-zinc-500 group-hover:text-zinc-400'">
                        {{ option.description }}
                    </p>
                    
                    <!-- Effect Badge (if any) -->
                    <div v-if="option.effect" class="mt-auto pt-3 border-t z-10"
                         :class="isSelected(choice.id, option.id) ? 'border-zinc-700' : 'border-zinc-800'">
                        <div class="flex items-start gap-2">
                           <span class="text-amber-500/80 mt-0.5">✦</span>
                           <div>
                              <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Effet</span>
                              <p class="text-xs text-zinc-300">{{ option.effect }}</p>
                           </div>
                        </div>
                    </div>

                    <!-- Lock/Requirement Warning (for Expertise mainly) -->
                     <div v-if="isDisabled(choice, option) && choice.category === 'expertise' && !isSelected(choice.id, option.id)" 
                          class="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/60 backdrop-blur-[2px]">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-red-400 px-3 py-1.5 bg-zinc-900/90 rounded border border-red-900/50 shadow-lg">
                           Non maîtrisé
                        </span>
                     </div>
                 </div>
              </div>
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
import type { SRDRace } from '@/types/srd'

interface Props {
  character: Character
  selectedRace?: SRDRace | null
}

interface Emits {
  (e: 'update:character', character: Character): void
  (e: 'next'): void
  (e: 'previous'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selections = reactive<Record<string, string[]>>({})

const specialChoicesData = computed(() => {
  return getRequiredSpecialChoices(props.character.class.index, props?.character?.subclass?.id)
})

const hasAnyChoices = computed(() => {
  return specialChoicesData.value.choices.length > 0
})

const allChoicesMade = computed(() => {
  if (!hasAnyChoices.value) return true
  
  return specialChoicesData.value.choices.every(choice => {
    const selectionCount = getSelectionCount(choice.id)
    const maxSelections = getMaxSelections(choice)
    return selectionCount === maxSelections
  })
})

function getMaxSelections(choice: SpecialChoice): number {
  switch (choice.category) {
    case 'expertise':
      return 2 // Le roublard choisit 2 expertises
    default:
      return 1
  }
}

function getSelectionCount(choiceId: string): number {
  return selections[choiceId]?.length || 0
}

function isSelected(choiceId: string, optionId: string): boolean {
  return selections[choiceId]?.includes(optionId) || false
}

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
    const skillMap: Record<string, string> = {
      'outils-voleur': 'outils-de-voleur'
    }
    const mappedId = skillMap[option.id] || option.id

    const listOfProficienciesIndexes = character.allProficiencies?.skills.map((prof: any) => prof.id)
    if (!listOfProficienciesIndexes) return true
    return !listOfProficienciesIndexes.includes(mappedId)
  }
  
  return false
}

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

  updateCharacter()
}

function updateCharacter(): void {
  const updatedCharacter = { ...props.character }

  if (!updatedCharacter.specialChoices) {
    updatedCharacter.specialChoices = {}
  }

  Object.keys(selections).forEach(choiceId => {
    const choiceSelections = selections[choiceId]
    if (choiceSelections && choiceSelections.length > 0) {
      updatedCharacter.specialChoices![choiceId] = [...choiceSelections]
    }
  })
  emit('update:character', updatedCharacter)
}

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

if (props.character.specialChoices) {
  Object.keys(props.character.specialChoices).forEach(choiceId => {
    const existingChoices = props.character.specialChoices?.[choiceId]
    if (existingChoices) {
      selections[choiceId] = [...existingChoices]
    }
  })
}
</script>
