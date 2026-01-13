<template>
  <div
    v-if="show && race"
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
          <h3 class="text-2xl font-bold text-gray-800">{{ translateRaceName(race.name) }}</h3>
          <p class="text-gray-600">{{ race.size }} • Vitesse: {{ convertSpeedToMeters(race.speed) }}m</p>
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
        <p class="text-gray-700 leading-relaxed">{{ getRaceDescription(race) }}</p>
      </div>

      <!-- Bonus de caractéristiques -->
      <div class="mb-4">
        <h4 class="text-lg font-semibold text-gray-800 mb-2">Bonus de caractéristiques</h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="bonus in race.ability_bonuses"
            :key="bonus.ability_score.name"
            class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            +{{ bonus.bonus }} {{ translateAbilityScore(bonus.ability_score.name) }}
          </span>
        </div>
      </div>

      <!-- Traits -->
      <div class="mb-4">
        <h4 class="text-lg font-semibold text-gray-800 mb-2">Traits raciaux</h4>
        <div class="space-y-3">
          <div 
            v-for="trait in race.traits" 
            :key="trait.index"
            class="bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <h5 class="font-medium text-green-800 mb-1">{{ trait.name }}</h5>
            <p class="text-sm text-green-700 leading-relaxed">{{ getTraitDescription(trait.index) }}</p>
          </div>
        </div>
        </div>
      <!-- Langues -->
      <div class="mb-4">
        <h4 class="text-lg font-semibold text-gray-800 mb-2">Langues</h4>
        <p class="text-gray-700">{{ race.language_desc }}</p>
        <div class="flex flex-wrap gap-2 mt-2">
          <span
            v-for="lang in race.languages"
            :key="lang.index"
            class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ lang.name }}
          </span>
        </div>
      </div>

      <!-- Alignement et âge -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">Alignement typique</h4>
          <p class="text-gray-700">{{ race.alignment }}</p>
        </div>
        <div>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">Espérance de vie</h4>
          <p class="text-gray-700">{{ race.age }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { loadTraits } from '@/utils/dataLoader'
import type { SRDRace, SRDTrait } from '@/types/srd'
import { translateRaceName, getRaceDescription } from '@/utils/race'
import { translateAbilityScore } from '@/utils/abilities'

interface Props {
  show: boolean
  race: SRDRace | null
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

function getTraitDescription(traitIndex: string): string {
  const trait = traits.value.find(t => t.index === traitIndex)
  return trait ? trait.desc.join(' ') : 'Description non disponible'
}

function convertSpeedToMeters(feet: number): number {
  return Math.round(feet * 0.3048)
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