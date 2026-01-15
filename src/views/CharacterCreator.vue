
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
import { getAllFeaturesByClass } from '@/utils/features'
import type { SRDBackground, SRDClass, SRDFeature, SRDRace, SRDSubclass } from '@/types/srd'
import type { Character } from '@/stores/app'
import type { Subrace } from '@/utils/subrace'

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

const character = reactive<Character>({
  name: '',
  race: {} as SRDRace,
  subrace: {} as  Subrace,
  class: {} as  SRDClass,
  subclass: {} as  SRDSubclass,
  background: {} as SRDBackground,
  abilities: {} as {
    force: number
    dexterite: number
    constitution: number
    intelligence: number
    sagesse: number
    charisme: number
  },
  proficiencies: {} as {
    skills: string[]
    languages: string[]
    tools: string[]
  },
  allProficiencies: {} as {
    skills: { name: string; id: string; description: string; category: string }[]
    languages: { name: string; id: string; description: string; category: string }[]
    tools: { name: string; id: string; description: string; category: string }[]
  },
  allTraits: [] as {
    index: string
    name: string
    url: string
    category: string
  }[],
  specialChoices: {} as Record<string, string[]>,
  level: 1,
  vision: 'Vision normale',
  features: [] as SRDFeature[]
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
    payload.traits.forEach((trait: any) => {
      trait.category = "race"
    });
    character.allTraits = [...payload.traits]
    character.vision = character.allTraits.find(trait => trait.index === 'darkvision') ? 'Vision dans le noir (18m)' : 'Vision normale'
    const raceHasSubraces = await hasSubraces(payload.index)
    if (!raceHasSubraces) {
      character.subrace = {} as Subrace
      step.value = 2
      return
    }
  }

  if (step.value === 1 && payload !== undefined) {
    character.subrace = payload
    payload.racial_traits.forEach((trait: any) => {
      trait.category = "subrace"
    });
    character.allTraits = [...character.allTraits, ...payload.racial_traits]
    character.vision = character.allTraits.find(trait => trait.index === 'darkvision') ? 'Vision dans le noir (18m)' : 'Vision normale'
    character.vision = character.allTraits.find(trait => trait.index === 'superior-darkvision') ? 'Vision dans le noir suppérieure (36m)' : character.vision
  }

  if (step.value === 2 && payload) {
    character.class = payload
    try {
      const features = await getAllFeaturesByClass(payload.index)
      character.features = features
    } catch (error) {
      console.error('Erreur lors du chargement des features de classe:', error)
      character.features = []
    }
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
