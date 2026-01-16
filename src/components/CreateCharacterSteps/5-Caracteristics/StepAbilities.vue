<template>
  <div class="flex flex-col h-full bg-zinc-950 overflow-hidden relative">
    
    <!-- Standard Header (Centered) -->
    <div class="pt-8 pb-2 px-6 text-center relative z-10 shrink-0">
        <h2 class="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 mb-3 font-serif drop-shadow-sm">
          Attributs Héroïques
        </h2>
        <div class="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-800 to-transparent mx-auto mb-4"></div>
        <p class="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
           Définissez les capacités naturelles de votre aventurier
        </p>
         
    </div>

    <!-- Action Bar (Specific to Abilities) -->
    <div class="shrink-0 px-4 py-2 relative z-10">
       <div class="max-w-4xl mx-auto bg-zinc-900/60 border border-zinc-700/50 rounded-xl p-2 sm:p-3 flex flex-col md:flex-row items-center justify-between gap-3 backdrop-blur-md shadow-lg">
           
           <!-- Left: Class Priorities -->
           <div class="flex items-center gap-3 text-sm">
               <div v-if="character.class" class="flex items-center gap-2">
                   <span class="text-zinc-400 font-medium text-xs uppercase tracking-wider hidden sm:inline">Priorité {{ character.class.name }}</span>
                   <div class="flex gap-1.5">
                      <span v-for="stat in getClassMainStats(character.class)" :key="stat" 
                            class="px-2 py-0.5 bg-blue-900/20 text-blue-300 border border-blue-500/30 rounded text-xs uppercase font-bold tracking-wide shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                        {{ stat }}
                      </span>
                   </div>
               </div>
               <div v-else class="text-zinc-500 text-xs italic">Classe non sélectionnée</div>
           </div>

           <!-- Center/Right: Points & Tools -->
           <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
               <!-- Points Counter -->
               <div class="flex items-center gap-3">
                  <div class="text-right leading-tight hidden sm:block">
                     <div class="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Capital</div>
                     <div class="text-xs text-amber-500 font-bold">Points</div>
                  </div>
                  <div class="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-950 text-amber-500 font-serif font-bold text-xl border border-amber-500/30 shadow-inner">
                     {{ remainingPoints }}
                  </div>
               </div>
               
               <div class="w-px h-8 bg-zinc-800 hidden sm:block"></div>

               <!-- Tools Buttons -->
               <div class="flex items-center gap-2">
                  <button @click="resetAbilities" class="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700 hover:border-zinc-500" title="Réinitialiser">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  </button>
                  <button @click="randomizeAbilities" class="p-2 text-purple-400 hover:text-purple-200 bg-purple-900/10 hover:bg-purple-900/30 rounded-lg transition-colors border border-purple-500/20 hover:border-purple-500/50" title="Aléatoire">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                  </button>
               </div>
           </div>
       </div>
    </div>

    <!-- Main Content: Compact Grid -->
    <div class="flex-1 px-4 py-2 sm:p-6 flex items-start justify-center overflow-y-auto custom-scrollbar">
       <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 w-full max-w-5xl pb-24">
          <div 
            v-for="ability in abilities" 
            :key="ability.name" 
            :class="[
              'relative rounded-xl p-3 md:p-4 border transition-all duration-300 group flex flex-col justify-between h-auto shadow-lg',
              isImportantStat(ability.name) 
                ? 'bg-gradient-to-br from-zinc-800 to-zinc-900/80 border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.05)]' 
                : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
            ]"
          >
            <!-- Card Header -->
            <div class="flex justify-between items-start mb-2">
               <div>
                  <h3 class="text-sm md:text-base font-bold font-serif tracking-wide"
                      :class="isImportantStat(ability.name) ? 'text-amber-100' : 'text-zinc-300'">
                    {{ ability.name }}
                  </h3>
                  <div class="text-[10px] text-zinc-500 italic truncate max-w-[120px]" :title="getAbilityDescription(ability.name)">
                     {{ getAbilityDescription(ability.name) }}
                  </div>
               </div>
               <div v-if="isImportantStat(ability.name)" title="Caractéristique Principale">
                  <span class="flex h-2 w-2 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
               </div>
            </div>

            <!-- Big Value Center -->
            <div class="flex items-baseline justify-center gap-1 my-2">
               <span class="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tighter drop-shadow-lg"
                 :class="{'text-amber-500': isImportantStat(ability.name)}">
                  {{ ability.value + getRacialBonus(ability.name) }}
               </span>
               <div class="flex flex-col -mb-1 ml-2">
                  <span class="text-[10px] uppercase font-black text-zinc-600 tracking-wider">MOD</span>
                  <span :class="[
                     'text-xs font-bold px-1.5 py-0.5 rounded border',
                     isImportantStat(ability.name) 
                        ? 'bg-amber-950/40 text-amber-400 border-amber-500/20' 
                        : 'bg-zinc-950/50 text-zinc-400 border-zinc-800'
                  ]">
                     {{ getFinalModifier(ability.name) >= 0 ? '+' : '' }}{{ getFinalModifier(ability.name) }}
                  </span>
               </div>
            </div>

            <!-- Controls Footer with Integrated Labels -->
            <div class="mt-2 bg-zinc-950/40 rounded-lg p-1.5 border border-zinc-800/50 flex flex-col gap-2">
               
               <!-- Buttons Row -->
               <div class="flex items-center justify-between gap-2">
                   <button 
                      @click="decreaseAbility(ability)"
                      :disabled="ability.value <= 8"
                      class="w-8 h-8 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 disabled:opacity-30 disabled:hover:bg-zinc-800 transition-colors border border-zinc-700"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4"></path></svg>
                   </button>

                   <div class="text-xs font-medium text-zinc-300">{{ ability.value }} <span class="text-[9px] text-zinc-600">pts</span></div>

                   <button 
                      @click="increaseAbility(ability)"
                      :disabled="ability.value >= 15 || remainingPoints <= 0"
                      class="w-8 h-8 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-green-400 disabled:opacity-30 disabled:hover:bg-zinc-800 transition-colors border border-zinc-700"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                   </button>
               </div>
               
               <!-- Bonus Info -->
               <div class="flex justify-between items-center px-1 text-[9px] font-medium border-t border-zinc-800/50 pt-1 mt-0.5">
                   <span class="text-zinc-500">Coût: {{ getAbilityPointCost(ability.value) }}</span>
                   <span v-if="getRacialBonus(ability.name) > 0" class="text-amber-500 bg-amber-950/30 px-1 rounded">
                     +{{ getRacialBonus(ability.name) }} Race
                  </span>
               </div>
            </div>

          </div>
       </div>
    </div>

    <!-- Navigation (Fixed Bottom) -->
    <StepNavigation 
      :current-step="5" 
      :total-steps="9"
      step-name="Caractéristiques"
      :disable-next="remainingPoints > 0"
      @previous="emit('prev')"
      @next="validateAbilities"
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
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import StepNavigation from '../StepNavigation.vue'
import type { SRDRace } from '@/types/srd'
import type { Character } from '@/stores/app'
import type { Ability } from '@/utils/abilities'
import { getAbilityPointCost, getAbilityDescription } from '@/utils/abilities'
import { getClassMainStats } from '@/utils/classes'


const props = defineProps<{
  character: Character
  selectedRace?: SRDRace | null
}>()

const emit = defineEmits<{
  next: [payload: Record<string, number>]
  prev: []
}>()

const TOTAL_POINTS = 27
const BASE_VALUE = 8

const abilities = ref<Ability[]>([
  { name: 'Force', value: 8 },
  { name: 'Dextérité', value: 8 },
  { name: 'Constitution', value: 8 },
  { name: 'Intelligence', value: 8 },
  { name: 'Sagesse', value: 8 },
  { name: 'Charisme', value: 8 }
])

// Vérifie si une caractéristique est importante pour la classe du personnage
function isImportantStat(abilityName: string): boolean {
  if (!props.character.class) return false
  const mainStats = getClassMainStats(props.character.class)
  return mainStats.includes(abilityName)
}

// Bonus raciaux maintenant récupérés depuis la sous-race sélectionnée
const remainingPoints = computed(() => {
  const usedPoints = abilities.value.reduce((total, ability) => {
    return total + getAbilityPointCost(ability.value)
  }, 0)
  return TOTAL_POINTS - usedPoints
})

function getRacialBonus(abilityName: string): number {
  let totalBonus = 0

  const abilityNameMap: Record<string, string> = {
    'Force': 'STR',
    'Dextérité': 'DEX',
    'Constitution': 'CON',
    'Intelligence': 'INT',
    'Sagesse': 'WIS',
    'Charisme': 'CHA'
  }

  const englishAbilityName = abilityNameMap[abilityName] || abilityName

  // Bonus de la race principale
  if (props.character.race?.ability_bonuses) {
    const raceBonus = props.character.race.ability_bonuses.find(
      (bonus: any) => bonus.ability_score.name === englishAbilityName
    )
    if (raceBonus) {
      totalBonus += raceBonus.bonus
    }
  }

  // Bonus de la sous-race
  if (props.character.subrace?.ability_bonuses && Array.isArray(props.character.subrace.ability_bonuses)) {
    const subraceBonus = props.character.subrace.ability_bonuses.find(
      (bonus: any) => bonus.ability_score.name === englishAbilityName
    )
    if (subraceBonus) {
      totalBonus += subraceBonus.bonus
    }
  }

  return totalBonus
}

function getFinalModifier(abilityName: string): number {
  const ability = abilities.value.find(a => a.name === abilityName)
  if (!ability) return 0
  const finalValue = ability.value + getRacialBonus(abilityName)
  return getModifier(finalValue)
}



function getModifier(value: number): number {
  return Math.floor((value - 10) / 2)
}



function increaseAbility(ability: Ability) {
  if (ability.value < 15 && remainingPoints.value > 0) {
    const newValue = ability.value + 1
    // Vérification du coût (un point supplémentaire pour passer de 13 à 14 ou 14 à 15)
    // Le calcul se fait via le computed remainingPoints qui recalcule le coût total
    ability.value = newValue
  }
}

function decreaseAbility(ability: Ability) {
  if (ability.value > BASE_VALUE) {
    ability.value--
  }
}

function resetAbilities() {
  abilities.value.forEach(a => a.value = BASE_VALUE)
}

function randomizeAbilities() {
  resetAbilities()
  
  // Tableau de priorité basé sur la classe
  const mainStats = props.character.class ? getClassMainStats(props.character.class) : []
  
  // On mélange les capacités pour l'ordre d'attribution, mais on met les stats principales en premier
  const shuffledAbilities = [...abilities.value].sort((a, b) => {
    const aIsMain = mainStats.includes(a.name)
    const bIsMain = mainStats.includes(b.name)
    if (aIsMain && !bIsMain) return -1
    if (!aIsMain && bIsMain) return 1
    return Math.random() - 0.5
  })

  // On distribue les points
  while (remainingPoints.value > 0) {
    // On essaie d'augmenter une stat au hasard (pondéré vers les premières du tableau trié)
    // Plus l'index est bas, plus la chance est élevée
    const index = Math.floor(Math.abs(Math.random() - Math.random()) * shuffledAbilities.length)
    const ability = shuffledAbilities[index]
    
    // On augmente si possible (max 15)
    if (ability && ability.value < 15) {
        // Vérifier si on a assez de points pour le prochain niveau
        const cost = (ability.value >= 13) ? 2 : 1
        if (remainingPoints.value >= cost) {
            ability.value++
        } else {
            // Si on ne peut pas augmenter celle-ci à cause du coût, on essaie une autre
            // (cas rare en fin de points)
             const cheapAbility = shuffledAbilities.find(a => a.value < 13)
             if (cheapAbility) cheapAbility.value++
             else break // On ne peut plus rien faire
        }
    } else {
        // Déjà au max, on passe
        // Idéalement on continuerait la boucle sans rien faire
    }

    // Sécurité boucle infini si impossible de dépenser les derniers points
    if (remainingPoints.value === 0) break 
    // Si tous sont à 15 ou pas assez de points pour augmenter, on break
    // Simplification pour l'exemple
  }
}

function validateAbilities() {
  const payload: Record<string, number> = {}
  abilities.value.forEach(a => {
    payload[a.name] = a.value
  })
  emit('next', payload)
}

</script>
