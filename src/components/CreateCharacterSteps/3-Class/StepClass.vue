<template>
  <div class="h-full flex flex-col">
    <div class="mb-4 flex-1 flex flex-col relative pt-4 pb-2 overflow-hidden">
      
      <div class="flex flex-col px-4 h-full max-w-[1400px] mx-auto w-full">
        <!-- En-tête -->
        <div class="text-center mb-4 shrink-0 z-10">
          <h2 class="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 mb-2 font-serif drop-shadow-sm">
            Choisissez votre Voie
          </h2>
          <div class="h-0.5 w-16 bg-gradient-to-r from-transparent via-amber-800 to-transparent mx-auto mb-2"></div>
          
          <div v-if="loading" class="text-amber-500/80 animate-pulse mt-2 font-serif text-sm">Consultation des tomes anciens...</div>
          <div v-if="error" class="text-red-400 mt-2">{{ error }}</div>
        </div>

        <!-- Scrollable Grid Container -->
        <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar py-2 pr-2">
           
           <div class="mb-2 flex items-center gap-3">
              <span class="text-[10px] uppercase font-bold text-amber-500/80 tracking-widest pl-2">Guerriers & Combattants</span>
              <div class="h-px bg-amber-500/20 flex-1"></div>
           </div>
           
           <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 auto-rows-fr mb-4">
            <!-- Martials -->
            <div 
              v-for="classe in sortedClasses.filter(c => isMartialClass(c.index))" 
              :key="classe.index" 
              @click="selectedClass = classe"
              :class="[
                'class-card group relative h-[319px] rounded-xl overflow-hidden cursor-pointer border transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)',
                selectedClass?.index === classe.index 
                  ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.01] z-20 grayscale-0' 
                  : 'border-zinc-800 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 hover:border-zinc-500 hover:scale-[1.01] hover:z-10 hover:shadow-lg'
              ]"
            >
              <!-- Background Image -->
              <div 
                class="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
                :class="selectedClass?.index === classe.index ? 'scale-110' : 'scale-100'"
                :style="{ backgroundImage: `url(${getImageUrl(classe.index + '.png')})` }"
              ></div>

              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/80 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80"></div>
              
              <!-- Selection Indicator Overlay -->
              <div 
                class="absolute inset-0 bg-amber-500/10 mix-blend-overlay transition-opacity duration-300" 
                :class="selectedClass?.index === classe.index ? 'opacity-100' : 'opacity-0'"
              ></div>

              <!-- Content Container -->
              <div class="absolute inset-0 p-4 flex flex-col justify-end">
                
                <!-- Top Right Icons/Badges (Absolute) -->
                <div class="absolute top-3 right-3 flex flex-col items-end gap-2 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100"
                     :class="selectedClass?.index === classe.index ? 'translate-y-0 opacity-100' : ''">
                  <!-- Button Details -->
                  <button 
                    @click.stop="openClassDetails(classe)"
                    class="w-7 h-7 bg-zinc-950/60 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-amber-600 rounded-full flex items-center justify-center border border-white/10 transition-colors"
                  >
                    <span class="font-serif italic font-bold text-xs">i</span>
                  </button>
                </div>

                <!-- Difficulty Badge (Top Left) -->
                <div class="absolute top-3 left-3">
                  <span 
                    class="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-widest border backdrop-blur-sm shadow-sm"
                    :class="[
                      getClassDifficulty(classe) === 'Facile' ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30' :
                      getClassDifficulty(classe) === 'Moyen' ? 'bg-yellow-900/40 text-yellow-400 border-yellow-500/30' :
                      'bg-red-900/40 text-red-400 border-red-500/30'
                    ]"
                  >
                    {{ getClassDifficulty(classe) }}
                  </span>
                </div>

                <!-- Text Content -->
                <div class="relative z-10 transform transition-transform duration-300 group-hover:-translate-y-1">
                  <!-- Name -->
                  <h3 class="text-xl font-bold text-zinc-100 mb-0.5 font-serif tracking-wide group-hover:text-amber-100 transition-colors drop-shadow-md">
                    {{ getTranslatedClassName(classe.name) }}
                  </h3>

                  <!-- Divider animation -->
                  <div class="w-0 group-hover:w-full h-px bg-amber-500/50 transition-all duration-500 mb-1.5"></div>

                  <!-- Collapsed/Expanded Content -->
                  <div class="overflow-hidden transition-all duration-500 ease-out max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100"
                       :class="selectedClass?.index === classe.index ? 'max-h-32 opacity-100' : ''">
                    <p class="text-xs text-zinc-400 leading-relaxed mb-2 line-clamp-2">
                      {{ getClassDescription(classe) }}
                    </p>

                    <!-- Main Stats Tags -->
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="stat in getClassMainStats(classe)" 
                        :key="stat" 
                        class="px-1.5 py-0.5 rounded text-[9px] font-bold border bg-zinc-900/60"
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

           <div class="mb-2 mt-4 flex items-center gap-3">
              <span class="text-[10px] uppercase font-bold text-purple-400/80 tracking-widest pl-2">Mages & Incantateurs</span>
              <div class="h-px bg-purple-500/20 flex-1"></div>
           </div>

           <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 auto-rows-fr">
            <!-- Casters -->
            <div 
              v-for="classe in sortedClasses.filter(c => !isMartialClass(c.index))" 
              :key="classe.index" 
              @click="selectedClass = classe"
              :class="[
                'class-card group relative h-[319px] rounded-xl overflow-hidden cursor-pointer border transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)',
                selectedClass?.index === classe.index 
                  ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)] scale-[1.01] z-20 grayscale-0' 
                  : 'border-zinc-800 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 hover:border-zinc-500 hover:scale-[1.01] hover:z-10 hover:shadow-xl'
              ]"
            >
              <!-- Background Image -->
              <div 
                class="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
                :class="selectedClass?.index === classe.index ? 'scale-110' : 'scale-100'"
                :style="{ backgroundImage: `url(${getImageUrl(classe.index + '.png')})` }"
              ></div>

              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/80 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80"></div>
              
              <!-- Selection Indicator Overlay -->
              <div 
                class="absolute inset-0 bg-purple-500/10 mix-blend-overlay transition-opacity duration-300" 
                :class="selectedClass?.index === classe.index ? 'opacity-100' : 'opacity-0'"
              ></div>

              <!-- Content Container -->
              <div class="absolute inset-0 p-4 flex flex-col justify-end">
                
                <!-- Top Right Icons/Badges (Absolute) -->
                <div class="absolute top-3 right-3 flex flex-col items-end gap-2 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100"
                     :class="selectedClass?.index === classe.index ? 'translate-y-0 opacity-100' : ''">
                  <!-- Button Details -->
                  <button 
                    @click.stop="openClassDetails(classe)"
                    class="w-7 h-7 bg-zinc-950/60 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-purple-600 rounded-full flex items-center justify-center border border-white/10 transition-colors"
                  >
                    <span class="font-serif italic font-bold text-xs">i</span>
                  </button>
                </div>

                <!-- Difficulty Badge (Top Left) -->
                <div class="absolute top-3 left-3">
                  <span 
                    class="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-widest border backdrop-blur-sm shadow-sm"
                    :class="[
                      getClassDifficulty(classe) === 'Facile' ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30' :
                      getClassDifficulty(classe) === 'Moyen' ? 'bg-yellow-950/80 text-yellow-400 border-yellow-500/30' :
                      'bg-red-900/40 text-red-400 border-red-500/30'
                    ]"
                  >
                    {{ getClassDifficulty(classe) }}
                  </span>
                </div>


                <!-- Text Content -->
                <div class="relative z-10 transform transition-transform duration-300 group-hover:-translate-y-1">

                  <!-- Name -->
                  <h3 class="text-xl font-bold text-zinc-100 mb-0.5 font-serif tracking-wide group-hover:text-purple-100 transition-colors drop-shadow-md">
                    {{ getTranslatedClassName(classe.name) }}
                  </h3>

                  <!-- Divider animation -->
                  <div class="w-0 group-hover:w-full h-px bg-purple-500/50 transition-all duration-500 mb-1.5"></div>

                  <!-- Collapsed/Expanded Content -->
                  <div class="overflow-hidden transition-all duration-500 ease-out max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100"
                       :class="selectedClass?.index === classe.index ? 'max-h-32 opacity-100' : ''">
                    <p class="text-xs text-zinc-400 leading-relaxed mb-2 line-clamp-2">
                      {{ getClassDescription(classe) }}
                    </p>

                    <!-- Main Stats Tags -->
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="stat in getClassMainStats(classe)" 
                        :key="stat" 
                        class="px-1.5 py-0.5 rounded text-[9px] font-bold border bg-zinc-900/60"
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
import { ref, onMounted, computed } from 'vue'
import StepNavigation from '../StepNavigation.vue'
import ClassDetailsModal from './ClassDetailsModal.vue'
import { loadClasses } from '@/utils/dataLoader'
import type { SRDClass, SRDRace } from '@/types/srd'
import type { Character } from '@/types/character'
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
// Computed: sorted classes by role (Martial first, then Magic)
const difficultyOrder: Record<string, number> = {
  'Facile': 0,
  'Moyen': 1,
  'Difficile': 2
}

const getDifficultyValue = (cls: SRDClass) => difficultyOrder[getClassDifficulty(cls)] ?? 1

const sortedClasses = computed(() => {
  return [...classes.value].sort((a, b) => {
    // 1. Sort by Martial vs Magic
    const isAMartial = isMartialClass(a.index)
    const isBMartial = isMartialClass(b.index)
    
    if (isAMartial && !isBMartial) return -1
    if (!isAMartial && isBMartial) return 1

    // 2. Sort by Difficulty
    const diffA = getDifficultyValue(a)
    const diffB = getDifficultyValue(b)
    if (diffA !== diffB) return diffA - diffB
    
    // 3. Then alphabetically within groups
    return getTranslatedClassName(a.name).localeCompare(getTranslatedClassName(b.name))
  })
})

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
