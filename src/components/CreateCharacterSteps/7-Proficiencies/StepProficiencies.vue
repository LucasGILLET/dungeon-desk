<template>
  <div class="flex flex-col h-full bg-zinc-950">
    <!-- Contenu défilable -->
    <div class="mb-24 flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
      <div class="max-w-6xl mx-auto space-y-10">

        <!-- En-tête -->
        <div class="text-center relative">
          <h2 class="text-3xl sm:text-4xl font-bold font-serif text-white mb-3 drop-shadow-md">
            Savoirs & Talents
          </h2>
          <p class="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
            Votre passé et votre entraînement vous ont conféré des compétences uniques.
          </p>
          <div class="mt-4 flex justify-center">
            <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 text-xs uppercase tracking-widest shadow-sm">
               {{ character.subrace?.name || character.race?.name }} • {{ character.class.name }}{{ character.background ? ` • ${character.background.name}` : '' }}
            </span>
          </div>
        </div>

        
        <!-- Maîtrises automatiques -->
        <div class="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-700/50 overflow-hidden">
          <div class="px-6 py-4 border-b border-zinc-700/50 bg-zinc-900/80 flex items-center justify-between">
             <h2 class="text-lg font-bold font-serif text-white flex items-center gap-2">
               <span class="text-amber-500">✦</span> Acquis Naturels
             </h2>
             <span class="text-[10px] uppercase text-zinc-500 tracking-widest font-bold">Passif</span>
          </div>
          
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Langues raciales automatiques -->
            <div>
              <h3 class="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"></path></svg>
                Langues raciales
              </h3>
              <div class="flex flex-wrap gap-2">
                <ProficiencyBadge
                  v-for="language in automaticRacialLanguages"
                  :key="language.name"
                  :name="language.name"
                  :description="language.description"
                  variant="default"
                />
              </div>
            </div>

            <!-- Compétences -->
            <div v-if="automaticSkills.length > 0">
              <h3 class="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                Compétences
              </h3>
              <div class="flex flex-wrap gap-2">
                <ProficiencyBadge
                  v-for="skill in automaticSkills"
                  :key="skill.id"
                  :name="skill.name"
                  :description="skill.description"
                  variant="skill"
                />
              </div>
            </div>

            <!-- Langues supplémentaires & Outils -->
            <div v-if="automaticLanguages.length > 0 || automaticTools.length > 0">
              <h3 class="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                Divers
              </h3>
              <div class="flex flex-wrap gap-2">
                <!-- Langues -->
                <ProficiencyBadge
                  v-for="language in automaticLanguages"
                  :key="language.id"
                  :name="language.name"
                  :description="language.description"
                  variant="language"
                />
                <!-- Outils -->
                <ProficiencyBadge
                  v-for="tool in automaticTools"
                  :key="tool.id"
                  :name="tool.name"
                  :description="tool.description"
                  variant="tool"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Choix à faire -->
        <div v-if="choiceGroups.length > 0" class="space-y-8 pb-12">
          <div v-for="(group, groupIndex) in choiceGroups" :key="group.id" class="animate-fade-in-up" :style="{ animationDelay: `${groupIndex * 100}ms` }">
            
            <div class="flex items-center justify-between mb-4">
               <div>
                  <h2 class="text-xl font-bold font-serif text-white flex items-center gap-2">
                     <span class="text-zinc-500 text-sm">#{{ groupIndex + 1 }}</span> {{ group.name }}
                  </h2>
               </div>
               <div class="px-3 py-1 rounded-full text-xs font-bold border transition-colors duration-300"
                    :class="(selections[group.id]?.length || 0) === group.count ? 'bg-amber-900/30 text-amber-500 border-amber-500/50' : 'bg-zinc-800 text-zinc-400 border-zinc-700'">
                  {{ selections[group.id]?.length || 0 }} / {{ group.count }} Choix
               </div>
            </div>

            <!-- Grid choices -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <div 
                v-for="choice in group.choices" 
                :key="choice.id"
                @click="!isUnavailable(group, choice.id) ? toggleSelection(group.id, choice, group.count) : null"
                class="group relative"
              >
                 <div :class="[
                  'h-full p-4 rounded-lg border-2 transition-all duration-200 flex flex-col',
                  isUnavailable(group, choice.id)
                    ? 'border-zinc-800 bg-zinc-900/40 opacity-40 cursor-not-allowed grayscale'
                    : isSelected(group.id, choice.id) 
                      ? 'border-amber-500 bg-zinc-800 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)] transform -translate-y-1' 
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-800 cursor-pointer'
                ]">
                  
                    <!-- Header with Icon & Name -->
                    <div class="flex items-start gap-3 mb-2">
                       <span class="text-xl filter drop-shadow-md pb-1">{{ getCategoryIcon(choice.category) }}</span>
                       <div class="flex-1">
                          <h3 class="font-bold text-sm leading-tight transition-colors"
                              :class="isSelected(group.id, choice.id) ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-100'">
                             {{ choice.name }}
                          </h3>
                          <span v-if="isUnavailable(group, choice.id)" class="text-[10px] text-zinc-500 uppercase tracking-wide">Acquis</span>
                       </div>
                    </div>
                    
                    <!-- Description -->
                    <p class="text-[11px] leading-relaxed mt-auto transition-colors"
                       :class="isSelected(group.id, choice.id) ? 'text-zinc-400' : 'text-zinc-500 group-hover:text-zinc-400'">
                       {{ choice.description }}
                    </p>

                    <!-- Selection Indicator -->
                    <div v-if="isSelected(group.id, choice.id)" 
                        class="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-zinc-950 z-10 animate-scale-in">
                      <svg class="w-3.5 h-3.5 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>

                 </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
               <div class="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500 ease-out"
                    :style="{ width: `${Math.min(100, ((selections[group.id]?.length || 0) / group.count) * 100)}%` }">
               </div>
            </div>

          </div>
        </div>

        <!-- Message si aucun choix nécessaire -->
        <div v-if="choiceGroups.length === 0" class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
           <div class="text-5xl mb-4 opacity-50 grayscale">✨</div>
           <h3 class="text-xl font-serif text-zinc-300 mb-2">Destinée Tracée</h3>
           <p class="text-zinc-500 text-center max-w-md">Toutes vos compétences sont déjà déterminées par vos origines.</p>
        </div>

      </div>
    </div>

    <!-- Navigation -->
    <StepNavigation 
      :current-step="7" 
      :total-steps="9"
      step-name="Maîtrises"
      :disable-next="!allChoicesComplete"
      @previous="$emit('prev')"
      @next="validateChoices"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ProficiencyBadge from './ProficiencyBadge.vue'
import { 
  getAllCharacterProficiencies, 
  getAutomaticLanguages,
  getCategoryIcon,
  type ProficiencyChoice,
  type ProficiencyData
} from '@/utils/proficiencies'
import StepNavigation from '../StepNavigation.vue'
import type { SRDRace } from '@/types/srd'
import type { Character } from '@/stores/app'

const props = defineProps<{
  character: Character
  selectedRace?: SRDRace | null
}>()

const emit = defineEmits<{
  next: [payload: { selectedProficiencies: Record<string, ProficiencyChoice[]>, allProficiencies: {
    skills: ProficiencyChoice[]
    languages: ProficiencyChoice[]
    tools: ProficiencyChoice[]
  } }]
  prev: []
}>()

const proficiencyData = ref<ProficiencyData>({ automaticProficiencies: [], choiceGroups: [] })
const selections = ref<Record<string, ProficiencyChoice[]>>({})

const automaticProficiencies = computed(() => {
  return proficiencyData.value.automaticProficiencies
})
const automaticRacialLanguages = computed(() => {
  return getAutomaticLanguages(props.character.race)
})

const automaticSkills = computed(() => {
  return automaticProficiencies.value.filter(p => p.category === 'skill')
})

const automaticLanguages = computed(() => 
  automaticProficiencies.value.filter(p => p.category === 'language')
)

const automaticTools = computed(() => 
  automaticProficiencies.value.filter(p => p.category === 'tool')
)

const choiceGroups = computed(() => proficiencyData.value.choiceGroups)

const allChoicesComplete = computed(() => {
  return choiceGroups.value.every(group => 
    (selections.value[group.id]?.length || 0) === group.count
  )
})

function isSelected(groupId: string, choiceId: string): boolean {
  return selections.value[groupId]?.some(choice => choice.id === choiceId) || false
}

function isUnavailable(group: any, choiceId: string): boolean {
  return group.unavailableChoices?.includes(choiceId) || false
}

function toggleSelection(groupId: string, choice: ProficiencyChoice, maxCount: number) {
  if (!selections.value[groupId]) {
    selections.value[groupId] = []
  }

  const currentSelections = selections.value[groupId]
  const isCurrentlySelected = isSelected(groupId, choice.id)

  if (isCurrentlySelected) {
    // Retirer la sélection
    selections.value[groupId] = currentSelections.filter(c => c.id !== choice.id)
  } else {
    // Ajouter la sélection si on n'a pas atteint la limite
    if (currentSelections.length < maxCount) {
      selections.value[groupId] = [...currentSelections, choice]
    }
  }
}

function validateChoices() {
  const allProficiencies = {
    skills: [...automaticSkills.value],
    languages: [...automaticLanguages.value, ...automaticRacialLanguages.value],
    tools: [...automaticTools.value]
  }

  // Add selected choices
  Object.values(selections.value).flat().forEach(choice => {
    if (choice.category === 'skill') allProficiencies.skills.push(choice)
    else if (choice.category === 'language') allProficiencies.languages.push(choice)
    else if (choice.category === 'tool') allProficiencies.tools.push(choice)
  })

  emit('next', {
    selectedProficiencies: selections.value,
    allProficiencies
  })
}

onMounted(() => {
  proficiencyData.value = getAllCharacterProficiencies(
    props.character.race.index,
    props.character.subrace?.index,
    props.character.class.index,
    props.character.background.index
  )
})
</script>

<style scoped>
@keyframes fade-in-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes scale-in {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-scale-in {
  animation: scale-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

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
</style>
