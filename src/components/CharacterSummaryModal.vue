<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" @click="$emit('close')">
        <div class="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col relative animate-scale-up" @click.stop>
            
          <!-- Decorative header image/gradient -->
          <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-zinc-800 to-transparent opacity-50 pointer-events-none"></div>

          <!-- Header -->
          <div class="p-6 pb-4 border-b border-zinc-800 relative z-10 flex justify-between items-center bg-zinc-900/95 backdrop-blur-md">
            <h2 class="text-2xl md:text-3xl font-bold font-serif text-amber-500">Grimoire du Personnage</h2>
            <button
              @click="$emit('close')"
              class="text-zinc-500 hover:text-amber-500 hover:bg-zinc-800/50 rounded-full p-2 transition-all duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto custom-scrollbar space-y-8 relative z-0">
            
            <!-- Empty State -->
             <div v-if="!hasAnyData" class="text-center py-12 text-zinc-500 italic">
              <span class="text-4xl opacity-50 block mb-4">📜</span>
              Le parchemin est encore vierge...
            </div>

            <!-- Race & Subrace -->
            <div v-if="character.race.name" class="space-y-4">
                <h3 class="text-lg font-serif font-bold text-zinc-200 border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <span class="text-amber-500">🧬</span> Origines
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <!-- Race Card -->
                    <div class="bg-zinc-800/30 border border-zinc-700/50 p-4 rounded-lg hover:border-amber-500/30 transition-colors">
                        <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Race</div>
                        <div class="text-xl font-serif font-bold text-amber-500">{{ character.race.name }}</div>
                        <div class="text-sm text-zinc-400 mt-1 flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-zinc-600"></span>
                            {{ character.race.alignment }}
                        </div>
                    </div>
                     <!-- Subrace Card -->
                    <div v-if="character.subrace.name" class="bg-zinc-800/30 border border-zinc-700/50 p-4 rounded-lg hover:border-amber-500/30 transition-colors">
                        <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Sous-race</div>
                        <div class="text-xl font-serif font-bold text-amber-500">{{ character.subrace.name }}</div>
                        <div class="text-sm text-zinc-400 mt-1 line-clamp-2 italic">"{{ character.subrace.desc || '...' }}"</div>
                    </div>
                </div>
            </div>

            <!-- Class & Subclass -->
             <div v-if="character.class.name" class="space-y-4">
                <h3 class="text-lg font-serif font-bold text-zinc-200 border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <span class="text-amber-500">⚔️</span> Vocation
                </h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-zinc-800/30 border border-zinc-700/50 p-4 rounded-lg hover:border-amber-500/30 transition-colors">
                        <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Classe</div>
                        <div class="text-xl font-serif font-bold text-amber-500">{{ character.class.name }}</div>
                        <div class="text-sm text-zinc-400 mt-1 line-clamp-2">{{ getClassDescription(character.class) }}</div>
                    </div>
                     <div v-if="character.subclass" class="bg-zinc-800/30 border border-zinc-700/50 p-4 rounded-lg hover:border-amber-500/30 transition-colors">
                        <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Archétype</div>
                        <div class="text-xl font-serif font-bold text-amber-500">{{ character.subclass.name }}</div>
                         <div class="text-sm text-zinc-400 mt-1 line-clamp-2 italic">"{{ character.subclass.description || '...' }}"</div>
                    </div>
                </div>
            </div>

             <!-- Background -->
            <div v-if="character.background.name" class="space-y-4">
                <h3 class="text-lg font-serif font-bold text-zinc-200 border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <span class="text-amber-500">📖</span> Historique
                </h3>
                <div class="bg-zinc-800/30 border border-zinc-700/50 p-4 rounded-lg hover:border-amber-500/30 transition-colors">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                             <div class="text-xl font-serif font-bold text-amber-500">{{ character.background.name }}</div>
                        </div>
                    </div>
                    <div class="mt-3 pt-3 border-t border-zinc-800" v-if="character.background.starting_proficiencies?.length">
                         <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Compétences d'origine</div>
                         <div class="flex flex-wrap gap-2">
                            <span v-for="prof in character.background.starting_proficiencies" :key="prof.name" class="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-300">
                                {{ prof.name }}
                            </span>
                         </div>
                    </div>
                </div>
            </div>

             <!-- Abilities -->
            <div v-if="Object.keys(character.abilities).length > 0" class="space-y-4">
                <h3 class="text-lg font-serif font-bold text-zinc-200 border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <span class="text-amber-500">💪</span> Caractéristiques
                </h3>
                 <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    <div v-for="(value, ability) in character.abilities" :key="ability" class="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-center flex flex-col items-center justify-center aspect-square shadow-inner">
                        <div class="text-2xl font-bold text-amber-500 font-serif">{{ value }}</div>
                        <div class="text-[10px] uppercase tracking-wide text-zinc-500 font-bold max-w-full truncate px-1">{{ ability.substring(0,3) }}</div>
                    </div>
                 </div>
            </div>

            <!-- Proficiencies -->
             <div v-if="hasProficiencies" class="space-y-4">
                 <h3 class="text-lg font-serif font-bold text-zinc-200 border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <span class="text-amber-500">🎓</span> Maîtrises
                </h3>
                
                <div class="grid grid-cols-1 gap-4">
                    <div v-if="character.allProficiencies && character.allProficiencies.skills?.length" class="bg-zinc-800/20 p-4 rounded-lg">
                         <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                            <span class="w-1 h-1 rounded-full bg-amber-500"></span> Compétences
                         </div>
                         <div class="flex flex-wrap gap-2">
                            <span v-for="skill in character.allProficiencies.skills" :key="skill.name" class="px-2.5 py-1 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded text-xs text-zinc-300 transition-colors cursor-default">
                                {{ skill.name }}
                            </span>
                         </div>
                    </div>
                    <div v-if="character.allProficiencies && character.allProficiencies.tools?.length" class="bg-zinc-800/20 p-4 rounded-lg">
                         <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                            <span class="w-1 h-1 rounded-full bg-amber-500"></span> Outils
                         </div>
                         <div class="flex flex-wrap gap-2">
                            <span v-for="tool in character.allProficiencies.tools" :key="tool.name" class="px-2.5 py-1 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded text-xs text-zinc-300 transition-colors cursor-default">
                                {{ tool.name }}
                            </span>
                         </div>
                    </div>
                     <div v-if="character.allProficiencies && character.allProficiencies.languages?.length" class="bg-zinc-800/20 p-4 rounded-lg">
                         <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                            <span class="w-1 h-1 rounded-full bg-amber-500"></span> Langues
                         </div>
                         <div class="flex flex-wrap gap-2">
                            <span v-for="lang in character.allProficiencies.languages" :key="lang.name" class="px-2.5 py-1 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded text-xs text-zinc-300 transition-colors cursor-default">
                                {{ lang.name }}
                            </span>
                         </div>
                    </div>
                </div>
             </div>

             <!-- Special Choices -->
             <div v-if="character.specialChoices && Object.keys(character.specialChoices).length > 0" class="space-y-4">
                 <h3 class="text-lg font-serif font-bold text-zinc-200 border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <span class="text-amber-500">✨</span> Talents & Choix
                </h3>
                <div class="grid grid-cols-1 gap-3">
                    <div v-for="(choices, key) in character.specialChoices" :key="key" class="bg-zinc-800/30 border border-zinc-700/50 p-4 rounded-lg">
                        <div class="text-xs text-amber-500/80 uppercase tracking-widest mb-2 font-bold border-b border-zinc-800 pb-1">{{ key.toString().replace(/([A-Z])/g, ' $1').trim() }}</div>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="choice in choices" :key="choice" class="text-zinc-300 text-sm font-medium flex items-center gap-2">
                                <span class="text-amber-500">•</span> {{ choice }}
                            </span>
                        </div>
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
import { computed } from 'vue';
import type { Character } from '@/stores/app';
import { getClassDescription } from '@/utils/classes';

interface Props {
  isOpen: boolean
  character: Character
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

const hasAnyData = computed(() => {
    return props.character.race.name || 
           props.character.class.name || 
           props.character.background.name || 
           (props.character.abilities && Object.keys(props.character.abilities).length > 0)
})

const hasProficiencies = computed(() => {
    const p = props.character.allProficiencies
    if (!p) return false
    return (p.skills?.length ?? 0) > 0 || (p.tools?.length ?? 0) > 0 || (p.languages?.length ?? 0) > 0
})
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