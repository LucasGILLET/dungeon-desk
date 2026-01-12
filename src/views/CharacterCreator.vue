
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="w-full h-full mx-auto">
      <!-- Wizard principal -->
      <div class="h-full">
        <transition name="fade" mode="out-in">
          <component :is="currentStepComponent" 
            :character="character" 
            :selectedRace="character.race"
            @next="handleNext"
            @previous="handlePrev"
            @prev="handlePrev"
            @finalize="handleFinalize"
            @update:character="updateCharacter"
            :key="step"
          />
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StepAbilities from '@/components/CreateCharacterSteps/5-Caracteristics/StepAbilities.vue'
import StepRace from '@/components/CreateCharacterSteps/1-Race/StepRace.vue'
import StepBackground from '@/components/CreateCharacterSteps/4-Background/StepBackground.vue'
import StepClass from '@/components/CreateCharacterSteps/3-Class/StepClass.vue'
import StepSubrace from '@/components/CreateCharacterSteps/2-Subrace/StepSubrace.vue'
import StepSubclass from '@/components/CreateCharacterSteps/6-Subclass/StepSubclass.vue'
import StepProficiencies from '@/components/CreateCharacterSteps/7-Proficiencies/StepProficiencies.vue'
import StepSpecialChoices from '@/components/CreateCharacterSteps/8-SpecialChoices/StepSpecialChoices.vue'
import StepSummary from '@/components/CreateCharacterSteps/9-Summary/StepSummary.vue'
import { computed, reactive, ref } from 'vue'
import { getSubracesByParentRace } from '@/utils/subrace'
import type { SRDBackground, SRDClass, SRDRace, SRDSubclass } from '@/types/srd'

// Ajoutez ici les autres étapes au fur et à mesure
const steps = [
  StepRace,
  StepSubrace,
  StepClass,
  StepBackground,
  StepAbilities,
  StepSubclass,
  StepProficiencies,
  StepSpecialChoices,
  StepSummary
]

const step = ref(0)

const character = reactive({
  name: '',
  race: null as SRDRace | null,
  subrace: null as any,
  class: null as SRDClass | null,
  subclass: null as SRDSubclass | null,
  background: null as SRDBackground | null,
  abilities: {} as Record<string, number>,
  proficiencies: {} as Record<string, any>,
  allProficiencies: {} as Record<string, any>,
  specialChoices: {} as Record<string, string[]>,
  level: 1
})

const completion = computed(() => {
  return Math.round(((step.value + 1) / steps.length) * 100)
})

const currentStepComponent = computed(() => steps[step.value])

async function hasSubraces(raceIndex: string): Promise<boolean> {
  try {
    const subraces = await getSubracesByParentRace(raceIndex)
    return subraces.length > 0
  } catch {
    return false
  }
}

function updateCharacter(updatedCharacter: any) {
  Object.assign(character, updatedCharacter)
}

async function handleNext(payload: any) {
  console.log('handleNext payload:', payload, character)
  if (step.value === 0 && payload) {
    character.race = payload
    const raceHasSubraces = await hasSubraces(payload.index)
    if (!raceHasSubraces) {
      character.subrace = null
      step.value = 2
      return
    }
  }

  if (step.value === 1 && payload !== undefined) {
    character.subrace = payload
  }

  if (step.value === 2 && payload) {
    character.class = payload
  }

  if (step.value === 3 && payload) {
    character.background = payload
  }

  if (step.value === 4 && payload) {
    character.abilities = payload
  }

  if (step.value === 5) {
    character.subclass = payload
  }

  if (step.value === 6 && payload) {
    character.proficiencies = payload.selectedProficiencies
    character.allProficiencies = payload.allProficiencies
  }
  
  if (step.value < steps.length - 1) {
    step.value++
  }
}

function handlePrev() {
  if (step.value > 0) {
    step.value--
  }
}

function handleFinalize(finalCharacter: any) {
  console.log('🎉 Personnage finalisé :', finalCharacter)
  // Idées :
  // - Sauvegarder dans une base de données
  // - Rediriger vers la fiche de personnage
  // - Exporter en PDF
  // - etc.
}
</script>
