<template>
  <div class=" flex flex-col h-full bg-black/20">
    
    <!-- En-tête Centré (Style harmonisé) -->
    <div class="pt-8 pb-2 px-6 text-center relative z-10 shrink-0">
        <h2 class="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 mb-3 font-serif drop-shadow-sm">
          L'Origine de votre Héros
        </h2>
        <div class="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-800 to-transparent mx-auto mb-4"></div>
        <p class="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
          Quelle vie avez-vous menée avant le début de votre quête ?
        </p>


    </div>

    <!-- Contenu défilable -->
    <div class="mb-24 flex-1 overflow-y-auto custom-scrollbar px-12 py-4">
      <div class="w-full">
        
        <!-- Loading / Error States -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
          <div class="w-12 h-12 border-4 border-amber-900 border-t-amber-500 rounded-full animate-spin mb-4"></div>
          <p class="text-amber-500 font-serif text-sm animate-pulse">Consultation des archives...</p>
        </div>

        <div v-else-if="error" class="text-center py-20">
          <div class="inline-block bg-red-900/20 border border-red-500/50 rounded-lg p-6">
             <p class="text-red-400 font-serif">{{ error }}</p>
          </div>
        </div>

        <!-- Grille des Historiques Compacte -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 gap-4 px-6 overflow-auto">
          <div 
            v-for="background in backgrounds" 
            :key="background.index" 
            @click="selectedBackground = background"
            class="group relative h-full flex flex-col"
          >
             <!-- Card Container -->
             <div 
               :class="[
                 'h-full flex flex-col rounded-xl overflow-hidden backdrop-blur-sm border transition-all duration-300 cursor-pointer text-left',
                 selectedBackground?.index === background.index
                   ? 'bg-zinc-800/80 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50 scale-[1.02]'
                   : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/60'
               ]"
             >
                <!-- Card Header Compact -->
                <div class="p-3 border-b border-zinc-700/50 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent">
                  <h3 
                    class="text-base font-bold font-serif truncate pr-2 transition-colors"
                    :class="selectedBackground?.index === background.index ? 'text-amber-400' : 'text-zinc-200 group-hover:text-amber-200'"
                  >
                    {{ getBackgroundName(background.index) }}
                  </h3>
                  <div class="text-xl filter drop-shadow-md grayscale group-hover:grayscale-0 transition-all duration-300">
                    {{ getBackgroundEmoji(background.index) }}
                  </div>
                </div>

                <!-- Card Content -->
                <div class="p-3 flex-1 flex flex-col gap-3">
                   <!-- Description courte -->
                   <p class="text-xs text-zinc-400 leading-snug line-clamp-3 group-hover:text-zinc-300 transition-colors">
                      {{ getBackgroundDescription(background) }}
                   </p>

                   <!-- Skills Compact -->
                   <div class="mt-auto">
                      <div class="flex flex-wrap gap-1">
                        <span 
                          v-for="(skill, idx) in getBackgroundSkills(background).slice(0, 3)" 
                          :key="skill" 
                          class="bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium whitespace-nowrap group-hover:border-zinc-600 transition-colors"
                        >
                          {{ skill }}
                        </span>
                        <span v-if="getBackgroundSkills(background).length > 3" class="text-[10px] text-zinc-600 self-center">
                            +{{ getBackgroundSkills(background).length - 3 }}
                        </span>
                      </div>
                   </div>
                </div>

                <!-- Selection Indicator -->
                <div v-if="selectedBackground?.index === background.index" class="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-lg animate-scale-in z-20">
                    <svg class="w-3 h-3 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
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
/* Scrollbar personnalisée affinée */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes scale-in {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-scale-in {
  animation: scale-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StepNavigation from '../StepNavigation.vue'
import { loadBackgrounds } from '@/utils/dataLoader'
import type { SRDBackground, SRDRace } from '@/types/srd'
import type { Character } from '@/stores/app'
import { getBackgroundDescription, getBackgroundSkills, getBackgroundName, getBackgroundEmoji } from '@/utils/backgrounds'

const props = defineProps<{
  character: Character
  selectedRace?: SRDRace | null
}>()

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

</script>
