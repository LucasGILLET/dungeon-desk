<template>
  <div class="h-full flex flex-col">
    <div class="mb-24 flex-1 flex flex-col relative pt-8 pb-2 overflow-hidden">
      
      <div class="flex flex-col px-4 h-full max-w-[1400px] mx-auto w-full">
        <!-- En-tête -->
        <div class="text-center mb-2 shrink-0 z-10">
          <h2 class="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 mb-3 font-serif drop-shadow-sm">
            Choisissez votre Voie
          </h2>
          <div class="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-800 to-transparent mx-auto mb-4"></div>
          <!-- <p class="text-xl text-zinc-400 font-light italic">Quelle sera votre légende ?</p> -->
          
          <div v-if="loading" class="text-amber-500/80 animate-pulse mt-4 font-serif">Consultation des tomes anciens...</div>
          <div v-if="error" class="text-red-400 mt-2">{{ error }}</div>
        </div>

        <!-- Scrollable Grid Container -->
        <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar py-4 pr-2">
           <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 auto-rows-fr">
            <div 
              v-for="classe in classes" 
              :key="classe.index" 
              @click="selectedClass = classe"
              :class="[
                'class-card group relative h-[319px] rounded-2xl overflow-hidden cursor-pointer border transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)',
                selectedClass?.index === classe.index 
                  ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.3)] scale-[1.02] z-20 grayscale-0' 
                  : 'border-zinc-800 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 hover:border-zinc-500 hover:scale-[1.01] hover:z-10 hover:shadow-xl'
              ]"
            >
              <!-- Background Image -->
              <div 
                class="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
                :class="selectedClass?.index === classe.index ? 'scale-110' : 'scale-100'"
                :style="{ backgroundImage: `url(${getImageUrl(classe.index + '.jpg')})` }"
              ></div>

              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/80 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80"></div>
              
              <!-- Selection Indicator Overlay -->
              <div 
                class="absolute inset-0 bg-amber-500/10 mix-blend-overlay transition-opacity duration-300" 
                :class="selectedClass?.index === classe.index ? 'opacity-100' : 'opacity-0'"
              ></div>

              <!-- Content Container -->
              <div class="absolute inset-0 p-5 flex flex-col justify-end">
                
                <!-- Top Right Icons/Badges (Absolute) -->
                <div class="absolute top-4 right-4 flex flex-col items-end gap-2 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100"
                     :class="selectedClass?.index === classe.index ? 'translate-y-0 opacity-100' : ''">
                  <!-- Button Details -->
                  <button 
                    @click.stop="openClassDetails(classe)"
                    class="w-8 h-8 bg-zinc-950/50 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-amber-600 rounded-full flex items-center justify-center border border-white/10 transition-colors"
                  >
                    <span class="font-serif italic font-bold">i</span>
                  </button>
                </div>

                <!-- Difficulty Badge (Top Left) -->
                <div class="absolute top-4 left-4">
                  <span 
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border backdrop-blur-sm"
                    :class="[
                      getClassDifficulty(classe) === 'Facile' ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30' :
                      getClassDifficulty(classe) === 'Moyen' ? 'bg-yellow-900/40 text-yellow-400 border-yellow-500/30' :
                      'bg-red-900/40 text-red-400 border-red-500/30'
                    ]"
                  >
                    {{ getClassDifficulty(classe) }}
                  </span>
                </div>

                <!-- Selection Checkmark -->
                <!-- <div v-if="selectedClass?.index === classe.index" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-black w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-in zoom-in duration-300">
                    <span class="text-xl">✓</span>
                </div> -->

                <!-- Text Content -->
                <div class="relative z-10 transform transition-transform duration-300 group-hover:-translate-y-2">
                  <!-- Type Badge (Martial vs Magic) -->
                  <div class="mb-2 opacity-80">
                     <span class="text-xs font-serif tracking-wider uppercase bg-gradient-to-r bg-clip-text text-transparent"
                           :class="isMartialClass(classe.index) ? 'from-red-400 to-orange-300' : 'from-purple-400 to-blue-300'">
                        {{ isMartialClass(classe.index) ? '⚔️ Martial' : '🔮 Magique' }}
                     </span>
                  </div>

                  <!-- Name -->
                  <h3 class="text-2xl font-bold text-zinc-100 mb-1 font-serif tracking-wide group-hover:text-amber-100 transition-colors drop-shadow-md">
                    {{ getTranslatedClassName(classe.name) }}
                  </h3>

                  <!-- Divider animation -->
                  <div class="w-0 group-hover:w-full h-px bg-amber-500/50 transition-all duration-500 mb-2"></div>

                  <!-- Collapsed/Expanded Content -->
                  <div class="overflow-hidden transition-all duration-500 ease-out max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100"
                       :class="selectedClass?.index === classe.index ? 'max-h-40 opacity-100' : ''">
                    <p class="text-sm text-zinc-400 leading-relaxed mb-3 line-clamp-3">
                      {{ getClassDescription(classe) }}
                    </p>

                    <!-- Main Stats Tags -->
                    <div class="flex flex-wrap gap-1.5">
                      <span 
                        v-for="stat in getClassMainStats(classe)" 
                        :key="stat" 
                        class="px-2 py-0.5 rounded text-[10px] font-bold border bg-zinc-900/60"
                        :class="isMartialClass(classe.index) ? 'text-red-200 border-red-900/50' : 'text-purple-200 border-purple-900/50'"
                      >
                        {{ stat }}
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
        :current-step="3" 
        :total-steps="9"
        step-name="Classe"
        :disable-next="!selectedClass"
        @previous="emit('prev')"
        @next="emit('next', selectedClass!)"
      />
    </div>

    <!-- Modal de détails de classe -->
    <ClassDetailsModal
      :show="showClassDetails"
      :classe="selectedDetailClass!"
      @close="closeClassDetails"
    />
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(82, 82, 91, 0.5); /* zinc-600 */
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(245, 158, 11, 0.5); /* amber-500 */
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StepNavigation from '../StepNavigation.vue'
import ClassDetailsModal from './ClassDetailsModal.vue'
import { loadClasses } from '@/utils/dataLoader'
import type { SRDClass, SRDRace } from '@/types/srd'
import type { Character } from '@/stores/app'
import { getClassDescription, getClassMainStats, getClassDifficulty, isMartialClass, getTranslatedClassName } from '@/utils/classes'

const props = defineProps<{
  character: Character
  selectedRace?: SRDRace | null
}>()

const emit = defineEmits<{
  next: [classe: SRDClass]
  prev: []
}>()

const classes = ref<SRDClass[]>([])
const selectedClass = ref<SRDClass | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showClassDetails = ref(false)
const selectedDetailClass = ref<SRDClass | null>(null)

onMounted(async () => {
  try {
    classes.value = await loadClasses()
  } catch (err) {
    error.value = 'Erreur lors du chargement des classes'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const getImageUrl = (file: any) => {
  return new URL(`../../../images/classes/${file}`, import.meta.url).href
}

const openClassDetails = (classe: SRDClass) => {
  selectedDetailClass.value = classe
  showClassDetails.value = true
}

const closeClassDetails = () => {
  showClassDetails.value = false
  selectedDetailClass.value = null
}

</script>
