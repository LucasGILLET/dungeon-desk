<template>
  <div
    v-if="show && subrace"
    class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
    @click="close"
  >
    <div
      class="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative animate-scale-up"
      @click.stop
    >
      <!-- Decorative header image/gradient -->
      <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-zinc-800 to-transparent opacity-50 pointer-events-none"></div>

      <!-- Header sticky -->
      <div class="p-6 pb-4 border-b border-zinc-800 relative z-10 flex justify-between items-start bg-zinc-900/95 backdrop-blur-md">
        <div>
          <h3 class="text-3xl font-bold font-serif text-white mb-1">{{ subrace.name }}</h3>
          <p class="text-zinc-400 text-sm flex items-center gap-1">
            Sous-race de <span class="text-zinc-200 font-semibold">{{ getParentRaceName(subrace.race.index) }}</span>
          </p>
        </div>
        <button
          @click="close"
          class="text-zinc-500 hover:text-amber-500 hover:bg-zinc-800/50 rounded-full p-2 transition-all duration-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="p-6 overflow-y-auto custom-scrollbar space-y-8 relative z-0">
        
        <!-- Description -->
        <div>
          <h4 class="text-lg font-serif font-bold text-amber-500 mb-2 flex items-center gap-2">
            <span class="text-lg opacity-80">📜</span> Description
          </h4>
          <p class="text-zinc-300 leading-relaxed text-sm">{{ getSubraceDescription(subrace) }}</p>
        </div>

        <!-- Bonus de caractéristiques -->
        <div>
          <h4 class="text-lg font-serif font-bold text-amber-500 mb-3 flex items-center gap-2">
             <span class="text-lg opacity-80">📊</span> Augmentation de caractéristiques
          </h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(bonus, stat) in getSubraceAbilityBonuses(subrace)"
              :key="stat"
              class="bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded border border-zinc-700 text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              {{ stat }} <span class="text-green-400 font-bold bg-green-900/20 px-1.5 rounded">+{{ bonus }}</span>
            </span>
          </div>
        </div>

        <!-- Traits raciaux -->
        <div>
          <h4 class="text-lg font-serif font-bold text-amber-500 mb-3 flex items-center gap-2">
             <span class="text-lg opacity-80">✨</span> Traits raciaux
          </h4>
          <div class="space-y-3">
            <div
              v-for="trait in subrace.racial_traits"
              :key="trait.index"
              class="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
            >
              <h5 class="font-bold text-zinc-200 mb-1 flex items-center gap-2 text-sm">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span>
                {{ trait.name }}
              </h5>
              <p class="text-xs text-zinc-400 leading-relaxed pl-3.5">{{ getTraitDescription(trait.index, trait.name) }}</p>
            </div>
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
/* Scrollbar personnalisée */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>