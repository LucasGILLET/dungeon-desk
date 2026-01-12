<template>
  <div
    v-if="show && subrace"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    @click="close"
  >
    <div
      class="bg-white/95 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-2xl font-bold text-gray-800">{{ subrace.name }}</h3>
          <p class="text-gray-600">Sous-race de {{ getParentRaceName(subrace.race.index) }}</p>
        </div>
        <button
          @click="close"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Description -->
      <div class="mb-4">
        <h4 class="text-lg font-semibold text-gray-800 mb-2">Description</h4>
        <p class="text-gray-700 leading-relaxed">{{ getSubraceDescription(subrace) }}</p>
      </div>

      <!-- Bonus de caractéristiques -->
      <div class="mb-4">
        <h4 class="text-lg font-semibold text-gray-800 mb-2">Augmentation de caractéristiques</h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(bonus, stat) in getSubraceAbilityBonuses(subrace)"
            :key="stat"
            class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ stat }} +{{ bonus }}
          </span>
        </div>
      </div>

      <!-- Traits raciaux -->
      <div class="mb-4">
        <h4 class="text-lg font-semibold text-gray-800 mb-2">Traits raciaux</h4>
        <div class="space-y-3">
          <div
            v-for="trait in subrace.racial_traits"
            :key="trait.index"
            class="bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <h5 class="font-medium text-green-800 mb-1">{{ trait.name }}</h5>
            <p class="text-sm text-green-700 leading-relaxed">{{ getTraitDescription(trait.index, trait.name) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { loadTraits } from '@/utils/dataLoader'
import { getTraitDescriptionCombined } from '@/utils/traits'
import { getSubraceDescription, getSubraceAbilityBonuses } from '@/utils/subrace'
import type { SRDSubclass, SRDTrait } from '@/types/srd'

interface Props {
  show: boolean
  subrace: SRDSubclass | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const traits = ref<SRDTrait[]>([])

onMounted(async () => {
  try {
    traits.value = await loadTraits()
  } catch (error) {
    console.error('Erreur lors du chargement des traits:', error)
  }
})

function close() {
  emit('close')
}

function getTraitDescription(traitIndex: string, traitName: string): string {
  return getTraitDescriptionCombined(traits.value, traitIndex, traitName)
}

function getParentRaceName(raceIndex: string): string {
  const raceNames: Record<string, string> = {
    'dwarf': 'Nain',
    'elf': 'Elfe',
    'gnome': 'Gnome',
    'halfling': 'Halfelin'
  }
  return raceNames[raceIndex] || raceIndex
}
</script>

<style scoped>
.bg-white\/95 {
  background-color: rgba(255, 255, 255, 0.95);
}

.max-h-\[80vh\] {
  max-height: 80vh;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.6);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.8);
}
</style>