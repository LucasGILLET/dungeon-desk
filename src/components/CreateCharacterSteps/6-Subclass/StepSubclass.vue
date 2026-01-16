<template>
  <div class="flex flex-col h-full bg-zinc-950">
    <!-- Contenu défilable -->
    <div class="mb-24 flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
      <div class="max-w-7xl mx-auto">
        
        <!-- En-tête -->
        <div class="text-center mb-10 relative">
          <h2 class="text-3xl sm:text-4xl font-bold font-serif text-white mb-3 drop-shadow-md">
            Voie de Spécialisation
          </h2>
          <p class="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
            Définissez l'archétype qui guidera votre puissance en tant que <span class="text-amber-500 font-serif">{{ character.class.name }}</span>.
          </p>
          <div v-if="character.subrace" class="mt-4">
             <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 text-xs uppercase tracking-widest">
                {{ character.subrace.name }} • {{ character.class.name }}
             </span>
          </div>
        </div>

        <!-- Message si pas de sous-classe nécessaire -->
        <div v-if="!needsSubclass" class="flex flex-col items-center justify-center py-20 min-h-[400px]">
           <div class="w-24 h-24 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              ✨
           </div>
           <h3 class="text-2xl font-serif text-white mb-2">Aucun choix requis</h3>
           <p class="text-zinc-400 text-center max-w-lg leading-relaxed">
              Votre classe de <span class="text-amber-500">{{ character.class.name }}</span> ne nécessite pas de spécialisation au niveau 1.
              <br>Vous forgerez votre destinée lors de vos prochaines aventures.
           </p>
        </div>

        <!-- Grille des sous-classes -->
        <div v-else :class="['grid gap-6 pb-20', getGridColumns()]">
          <div 
            v-for="subclass in availableSubclasses" 
            :key="subclass.id"
            @click="selectedSubclass = subclass"
            class="group relative"
          >
             <div :class="[
               'h-full flex flex-col rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer bg-zinc-900',
               selectedSubclass?.id === subclass.id 
                 ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' 
                 : 'border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'
             ]">
                
                <!-- Header -->
                <div class="p-6 border-b border-zinc-800 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
                   <!-- Emoji BG decoration -->
                   <div class="absolute -right-4 -top-4 text-8xl opacity-5 select-none font-serif grayscale">{{ getSubclassEmoji(subclass.id) }}</div>
                   
                   <div class="relative z-10 flex flex-col items-center text-center">
                      <div class="text-4xl mb-3 filter drop-shadow-lg">{{ getSubclassEmoji(subclass.id) }}</div>
                      <h3 class="text-xl font-bold text-white font-serif mb-1">{{ subclass.name }}</h3>
                      <p class="text-zinc-500 text-xs uppercase tracking-wider">{{ subclass.source }}</p>
                   </div>
                </div>

                <!-- Content -->
                <div class="p-6 flex-1 flex flex-col">
                   <p class="text-zinc-400 text-sm leading-relaxed mb-6 italic">
                     {{ subclass.description }}
                   </p>

                   <!-- Features / Progression -->
                   <div class="mt-auto space-y-4">
                      <!-- Progression -->
                      <div v-if="subclass.levelProgression?.length" class="space-y-3">
                         <div class="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Capacités Initiales</div>
                         
                         <div v-for="progression in subclass.levelProgression" :key="progression.level" class="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800">
                            <div class="flex items-start gap-3">
                               <div class="bg-amber-900/20 text-amber-500 border border-amber-900/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap">Niv {{ progression.level }}</div>
                               <div class="flex-1 flex flex-wrap gap-1.5">
                                  <div v-for="(feature, idx) in progression.features" :key="idx" class="relative group/tooltip">
                                     <span 
                                        class="cursor-help px-2 py-0.5 rounded text-xs font-medium border transition-colors inline-block"
                                        :class="isSpellFeature(feature) ? 'bg-purple-900/20 text-purple-300 border-purple-800/30 hover:border-purple-500/50' : 'bg-blue-900/20 text-blue-300 border-blue-800/30 hover:border-blue-500/50'"
                                     >
                                        {{ getDisplayName(feature) }}
                                     </span>

                                     <!-- Tooltip -->
                                     <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-950 border border-zinc-700 rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                        <div class="font-bold text-xs mb-1" :class="isSpellFeature(feature) ? 'text-purple-300' : 'text-blue-300'">{{ getDisplayName(feature) }}</div>
                                        <div class="text-[10px] text-zinc-400 leading-relaxed">{{ getFeatureDescription(feature) }}</div>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <!-- Bonus Spells (if no progression shown) -->
                      <div v-else-if="subclass.bonusSpells?.length">
                         <div class="text-[10px] uppercase font-bold text-zinc-600 tracking-widest mb-2">Sorts Bonus</div>
                         <div class="flex flex-wrap gap-1.5">
                            <div v-for="(spell, idx) in subclass.bonusSpells" :key="idx" class="relative group/tooltip">
                               <span class="cursor-help bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-500 px-2 py-1 rounded text-xs transition-colors inline-block">
                                  {{ spell }}
                               </span>
                               <!-- Tooltip -->
                               <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-950 border border-zinc-700 rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                  <div class="font-bold text-xs mb-1 text-zinc-200">{{ spell }}</div>
                                  <div class="text-[10px] text-zinc-400 leading-relaxed">{{ getSpellDescription(spell) }}</div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <!-- Selection Checkmark -->
                <div v-if="selectedSubclass?.id === subclass.id" class="absolute top-4 right-4 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg animate-scale-in z-20">
                    <svg class="w-3.5 h-3.5 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      :current-step="6" 
      :total-steps="9"
      step-name="Sous-classe"
      :disable-next="needsSubclass && !selectedSubclass"
      @previous="$emit('prev')"
      @next="validateSubclass"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getLevel1SubclassClassIds } from '@/utils/classes'
import { getSubclassesByClassName, getSubclassEmoji, type SubclassData } from '@/utils/subclasses'
import { getSpellDescription } from '@/utils/spells'
import { getFeatureDescription } from '@/utils/features'
import StepNavigation from '../StepNavigation.vue'
import type { SRDRace } from '@/types/srd'
import type { Character } from '@/stores/app'

const props = defineProps<{
  character: Character
  selectedRace?: SRDRace | null
}>()

const emit = defineEmits<{
  next: [payload: any]
  prev: []
}>()

const selectedSubclass = ref<SubclassData | null>(null)
const level1SubclassClasses = ref<string[]>([])

onMounted(async () => {
  level1SubclassClasses.value = await getLevel1SubclassClassIds()
})

const needsSubclass = computed(() => {
  return level1SubclassClasses.value.includes(props.character.class.index)
})

const availableSubclasses = computed(() => {
  if (!needsSubclass.value) return []
  return getSubclassesByClassName(props.character.class)
})

function getGridColumns(): string {
  const count = availableSubclasses.value.length
  if (count <= 2) return 'grid-cols-1 lg:grid-cols-2'
  if (count <= 3) return 'grid-cols-1 lg:grid-cols-3'
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
}

function validateSubclass() {
  if (!needsSubclass.value) {
    emit('next', null)
  } else if (selectedSubclass.value) {
    emit('next', selectedSubclass.value)
  }
}

function getDisplayName(featureName: string): string {
  if (featureName.startsWith('Sorts de domaine')) {
    return 'Sorts de domaine'
  }
  if (featureName.startsWith('Sorts étendus')) {
    return 'Sorts étendus'
  }
  return featureName
}

function isSpellFeature(featureName: string): boolean {
  return featureName.startsWith('Sorts de domaine') || featureName.startsWith('Sorts étendus')
}
</script>

<style scoped>
@keyframes scale-in {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-scale-in {
  animation: scale-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>

