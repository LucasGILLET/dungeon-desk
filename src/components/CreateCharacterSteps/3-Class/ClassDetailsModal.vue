<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md" @click="$emit('close')">
        <div class="bg-zinc-900 border border-zinc-700/50 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col font-sans" @click.stop>
          
          <!-- Header (Styled dark) -->
          <div class="relative shrink-0 overflow-hidden border-b border-zinc-700 h-48 sm:h-56">
             <!-- blurred BG image -->
            <div 
              class="absolute inset-0 bg-cover bg-center blur-sm opacity-40 grayscale"
              :style="{ backgroundImage: `url(${getImageUrl(classe.index + '.png')})` }"
            ></div>
            <div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>

            <div class="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
              <div class="flex flex-col md:flex-row justify-between items-end gap-4">
                 <div class="flex items-end gap-6">
                    <!-- Icon / Portrait -->
                    <div class="w-24 h-24 rounded-xl border-2 border-zinc-600 shadow-xl overflow-hidden shrink-0 bg-zinc-800">
                         <img :src="getImageUrl(classe.index + '.png')" :alt="getTranslatedClassName(classe.name)" class="w-full h-full object-cover">
                    </div>
                    
                    <div class="mb-1">
                      <div class="flex items-center gap-3 mb-1">
                         <h2 class="text-4xl sm:text-5xl font-bold text-zinc-100 font-serif tracking-wide drop-shadow-md">{{ getTranslatedClassName(classe.name) }}</h2>
                      </div>
                      <div class="flex items-center gap-3 text-sm text-zinc-400 font-medium">
                        <span 
                            class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border"
                            :class="isMartialClass(classe.index) ? 'border-red-900 text-red-400 bg-red-900/10' : 'border-purple-900 text-purple-400 bg-purple-900/10'"
                        >
                            {{ isMartialClass(classe.index) ? 'Martial' : 'Magique' }}
                        </span>
                        <span>•</span>
                        <span class="text-amber-500 font-serif italic">{{ getClassDifficulty(classe) }}</span>
                      </div>
                    </div>
                 </div>

                 <!-- Close button -->
                 <button @click="$emit('close')" class="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors bg-black/20 hover:bg-zinc-800 rounded-lg p-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                 </button>
              </div>
            </div>
          </div>

          <!-- Content (Scrollable) -->
          <div class="flex-1 overflow-y-auto custom-scrollbar bg-zinc-900/50">
            <div class="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <!-- Left Column: Core Info & Proficiencies (4 cols) -->
              <div class="lg:col-span-4 space-y-8">
                
                <!-- Description -->
                <div>
                  <h3 class="text-sm uppercase tracking-[0.2em] text-zinc-500 font-bold mb-3 border-b border-zinc-800 pb-2">L'Essence</h3>
                  <p class="text-zinc-300 leading-relaxed font-light text-sm italic border-l-2 border-amber-600/50 pl-4">
                    "{{ getClassDescription(classe) }}"
                  </p>
                </div>

                 <!-- Stats -->
                <div>
                  <h3 class="text-sm uppercase tracking-[0.2em] text-zinc-500 font-bold mb-3 border-b border-zinc-800 pb-2">Atouts Majeurs</h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="stat in getClassMainStats(classe)"
                      :key="stat"
                      class="px-3 py-1.5 rounded-md text-xs font-bold border bg-zinc-800 text-zinc-300 border-zinc-700"
                    >
                      {{ stat }}
                    </span>
                  </div>
                </div>

                <!-- General Info Grid -->
                <div>
                   <h3 class="text-sm uppercase tracking-[0.2em] text-zinc-500 font-bold mb-3 border-b border-zinc-800 pb-2">Traits</h3>
                   <div class="grid grid-cols-2 gap-3">
                      <div class="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                        <div class="text-zinc-500 text-[10px] uppercase font-bold">Dé de Vie</div>
                        <div class="text-amber-500 font-serif font-bold text-xl">{{ classe.hit_die }}</div>
                      </div>
                      <div class="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                        <div class="text-zinc-500 text-[10px] uppercase font-bold">Sous-classes</div>
                        <div class="text-zinc-300 font-serif font-bold text-xl">{{ classe.subclasses?.length || 0 }}</div>
                      </div>
                   </div>
                </div>

                <!-- Proficiencies -->
                <div>
                  <h3 class="text-sm uppercase tracking-[0.2em] text-zinc-500 font-bold mb-4 border-b border-zinc-800 pb-2">Maîtrises</h3>
                  
                  <div v-if="!classProficiencies" class="text-zinc-600 text-sm animate-pulse">Recherche dans le grimoire...</div>
                  
                  <div v-else class="space-y-4">
                      <!-- Armures -->
                      <div v-if="categorizedProficiencies.armor.length > 0">
                        <h4 class="text-zinc-400 text-xs font-bold mb-2 flex items-center gap-2">
                           <span class="w-1 h-1 bg-amber-500 rounded-full"></span> Armures
                        </h4>
                        <div class="flex flex-wrap gap-1.5">
                          <span v-for="prof in categorizedProficiencies.armor" :key="prof" class="px-2 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-400 border border-zinc-700">{{ prof }}</span>
                        </div>
                      </div>

                       <!-- Armes -->
                      <div v-if="categorizedProficiencies.weapons.length > 0">
                        <h4 class="text-zinc-400 text-xs font-bold mb-2 flex items-center gap-2">
                           <span class="w-1 h-1 bg-red-500 rounded-full"></span> Armes
                        </h4>
                        <div class="flex flex-wrap gap-1.5">
                          <span v-for="prof in categorizedProficiencies.weapons" :key="prof" class="px-2 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-400 border border-zinc-700">{{ prof }}</span>
                        </div>
                      </div>
                      
                      <!-- Sauvegardes -->
                      <div v-if="categorizedProficiencies.savingThrows.length > 0">
                        <h4 class="text-zinc-400 text-xs font-bold mb-2 flex items-center gap-2">
                           <span class="w-1 h-1 bg-purple-500 rounded-full"></span> Sauvegardes
                        </h4>
                        <div class="flex flex-wrap gap-1.5">
                          <span v-for="prof in categorizedProficiencies.savingThrows" :key="prof" class="px-2 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-400 border border-zinc-700">{{ prof }}</span>
                        </div>
                      </div>
                  </div>
                </div>

              </div>

              <!-- Right Column: Features Progression (8 cols) -->
              <div class="lg:col-span-8">
                 <h3 class="text-sm uppercase tracking-[0.2em] text-zinc-500 font-bold mb-6 border-b border-zinc-800 pb-2 flex justify-between items-center">
                    Progression Héroïque
                 </h3>

                 <div class="space-y-8">
                    <!-- Niveau 1 (Highlighed) -->
                    <div v-if="displayedFeatures[1]" class="relative">
                        <div class="absolute -left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 to-transparent opacity-50"></div>
                        
                        <div class="flex items-center gap-3 mb-4">
                           <span class="bg-amber-600 text-zinc-950 font-bold px-3 py-1 rounded text-xs uppercase tracking-wider shadow-lg shadow-amber-900/50">Niveau 1</span>
                           <span class="text-amber-500/50 text-xs uppercase tracking-widest">Fondations</span>
                        </div>

                        <div class="grid grid-cols-1 gap-3">
                           <div v-for="feature in displayedFeatures[1]" :key="feature.index"
                                class="bg-zinc-800/40 border border-amber-900/30 rounded-lg p-5 hover:border-amber-500/30 transition-colors group">
                              <h5 class="text-amber-100 font-serif font-bold text-lg mb-2 group-hover:text-amber-400 transition-colors">{{ feature.name }}</h5>
                              <div class="text-zinc-400 text-sm leading-relaxed space-y-2">
                                 <p v-for="(desc, i) in feature.desc" :key="i" class="opacity-90">{{ desc }}</p>
                              </div>
                           </div>
                        </div>
                    </div>

                    <!-- Other Levels -->
                     <div v-for="level in Object.keys(displayedFeatures).filter(l => parseInt(l) > 1).sort((a, b) => parseInt(a) - parseInt(b))" :key="level" class="relative pl-4 border-l border-zinc-800">
                        <div class="flex items-center gap-3 mb-3 -ml-[21px]">
                           <div class="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-600"></div>
                           <span class="text-zinc-500 font-bold text-xs uppercase">Niveau {{ level }}</span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                           <div v-for="feature in displayedFeatures[parseInt(level)]" :key="feature.index"
                                class="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:bg-zinc-800/80 transition-colors">
                              <h5 class="text-zinc-300 font-serif font-bold text-sm mb-1">{{ feature.name }}</h5>
                               <!-- Tooltip/Expand logic could be added here for descriptions to keep it clean, currently just showing name or short desc if needed -->
                               <div class="text-zinc-500 text-xs line-clamp-2">
                                  {{ feature.desc[0] }}
                               </div>
                           </div>
                        </div>
                     </div>
                 </div>

                 <div v-if="Object.keys(displayedFeatures).length === 0" class="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
                    <p class="text-zinc-600 italic">Le savoir de cette classe est encore voilé de mystère...</p>
                 </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { SRDClass } from '@/types/srd'
import { getClassDescription, getClassMainStats, getClassDifficulty, isMartialClass } from '@/utils/classes'
import { getAllFeaturesByClass } from '@/utils/features'
import { getClassProficiencies, type ProficiencyData } from '@/utils/proficiencies'

interface Props {
  show: boolean
  classe: SRDClass
}

const props = defineProps<Props>()
defineEmits<{
  close: []
}>()

const getImageUrl = (file: string) => {
  return new URL(`../../../images/classes/${file}`, import.meta.url).href
}

const getTranslatedClassName = (englishName: string): string => {
  const translations: Record<string, string> = {
    'Barbarian': 'Barbare',
    'Bard': 'Barde',
    'Cleric': 'Clerc',
    'Druid': 'Druide',
    'Fighter': 'Guerrier',
    'Monk': 'Moine',
    'Paladin': 'Paladin',
    'Ranger': 'Rôdeur',
    'Rogue': 'Roublard',
    'Sorcerer': 'Ensorceleur',
    'Warlock': 'Occultiste',
    'Wizard': 'Magicien'
  }

  return translations[englishName] || englishName
}

const displayedFeatures = ref<Record<number, any[]>>({})
const classProficiencies = ref<string[] | null>(null)

const categorizedProficiencies = computed(() => {
  if (!classProficiencies.value) {
    return { armor: [], weapons: [], savingThrows: [], other: [] }
  }

  const armor: string[] = []
  const weapons: string[] = []
  const savingThrows: string[] = []
  const other: string[] = []

  classProficiencies.value.forEach(prof => {
    const lowerProf = prof.toLowerCase()
    if (lowerProf.includes('armure') || lowerProf.includes('bouclier')) {
      armor.push(prof)
    } else if (lowerProf.includes('jets de sauvegarde')) {
      savingThrows.push(prof)
    } else {
      weapons.push(prof)
    }
  })

  return { armor, weapons, savingThrows, other }
})

const loadFeatures = async () => {
  if (props.classe) {
    try {
      const allFeatures = await getAllFeaturesByClass(props.classe.index)
      
      const mainFeatures = allFeatures.filter(feature => 
        !feature.parent && 
        (!feature.subclass || feature.index.includes('archetype'))
      )
      
      const featuresByLevel: Record<number, any[]> = {}
      mainFeatures.forEach(feature => {
        if (!featuresByLevel[feature.level]) {
          featuresByLevel[feature.level] = []
        }
        featuresByLevel[feature.level]!.push(feature)
      })
      
      displayedFeatures.value = featuresByLevel

      const proficiencies = await getClassProficiencies(props.classe.index)
      classProficiencies.value = proficiencies

    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      displayedFeatures.value = {}
      classProficiencies.value = null
    }
  }
}

watch(() => props.classe, loadFeatures)
watch(() => props.show, (newShow) => {
  if (newShow) {
    loadFeatures()
  }
})

onMounted(() => {
  if (props.show && props.classe) {
    loadFeatures()
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>