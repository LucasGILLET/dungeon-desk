<template>
  <div>
    <div class="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex flex-col relative">
    <!-- Bouton récapitulatif -->
    <button
      @click="showSummary = true"
      class="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full p-3 transition-all duration-200 shadow-lg"
      title="Voir le récapitulatif"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
    </button>

    <!-- Caractéristiques -->
    <div class="flex flex-col justify-center px-4 py-3 flex-1">
      <!-- Header avec points disponibles -->
      <div class="text-center mb-3">
        <h2 class="text-2xl font-bold text-white mb-2">Répartition des Caractéristiques</h2>
        <p class="text-green-100 text-base mb-1">
          Vous avez <span class="text-yellow-400 font-bold text-lg">{{ remainingPoints }}</span> points à répartir
        </p>
        <p class="text-green-200 text-xs">
          Minimum: 8 • Maximum: 15 • Les bonus raciaux s'ajoutent automatiquement
        </p>
      </div>

      <!-- Grille des caractéristiques -->
      <div class="mb-4">
        <div class="abilities-container w-full grid grid-cols-3 gap-3 max-w-4xl mx-auto">
          <div 
            v-for="ability in abilities" 
            :key="ability.name" 
            class="ability-card bg-white/10 backdrop-blur-md rounded-2xl p-3 border-2 border-white/20 transition-all duration-200"
          >
            <!-- Nom de la caractéristique -->
            <div class="text-center mb-2">
              <h3 class="text-base font-bold text-white mb-1">{{ ability.name }}</h3>
              <p class="text-green-100 text-xs leading-tight">{{ getAbilityDescription(ability.name) }}</p>
            </div>

            <!-- Contrôles de valeur -->
            <div class="flex items-center justify-center space-x-2">
              <!-- Bouton - -->
              <button 
                @click="decreaseAbility(ability)"
                :disabled="ability.value <= 8"
                :class="[
                  'w-7 h-7 rounded-full font-bold text-sm transition-all duration-200 self-center',
                  ability.value <= 8 
                    ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-500/50 text-white hover:bg-red-500/70 hover:scale-110'
                ]"
              >
                -
              </button>

              <!-- Valeur actuelle et finale -->
              <div class="text-center flex-1">
                <!-- Valeur finale mise en avant -->
                <div class="w-14 h-14 bg-gradient-to-br from-blue-500/40 to-purple-500/40 rounded-full flex flex-col items-center justify-center border-2 border-blue-400/60 mb-1 shadow-lg mx-auto">
                  <span class="text-lg font-bold text-white">{{ ability.value + getRacialBonus(ability.name) }}</span>
                  <span class="text-xs text-blue-200 font-bold">{{ getFinalModifier(ability.name) >= 0 ? '+' : '' }}{{ getFinalModifier(ability.name) }}</span>
                </div>
                
                <!-- Détails en petit -->
                <div class="bg-black/20 rounded-lg px-1 py-0.5 text-xs">
                  <div class="text-green-200">
                    Base: {{ ability.value }} ({{ getModifier(ability.value) >= 0 ? '+' : '' }}{{ getModifier(ability.value) }})
                  </div>
                  <div v-if="getRacialBonus(ability.name) > 0" class="text-yellow-300 font-semibold">
                    + {{ getRacialBonus(ability.name) }} racial
                  </div>
                </div>
              </div>

              <!-- Bouton + -->
              <button 
                @click="increaseAbility(ability)"
                :disabled="ability.value >= 15 || remainingPoints <= 0"
                :class="[
                  'w-7 h-7 rounded-full font-bold text-sm transition-all duration-200 self-center',
                  ability.value >= 15 || remainingPoints <= 0
                    ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-500/50 text-white hover:bg-green-500/70 hover:scale-110'
                ]"
              >
                +
              </button>
            </div>

            <!-- Coût en points -->
            <div class="text-center mt-1">
              <span class="text-xs text-green-200">
                Coût: {{ getAbilityPointCost(ability.value) }} pts
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Boutons de navigation -->
      <div class="flex justify-center space-x-6 mb-3">
        <button 
          @click="resetAbilities"
          class="bg-gray-500/30 text-white px-3 py-1 rounded-lg font-medium hover:bg-gray-500/50 transition-all duration-200 text-sm"
        >
          🔄 Reset
        </button>
        <button 
          @click="randomizeAbilities"
          class="bg-purple-500/30 text-white px-3 py-1 rounded-lg font-medium hover:bg-purple-500/50 transition-all duration-200 text-sm"
        >
          🎲 Aléatoire
        </button>
      </div>

      <!-- Résumé des stats finales -->
      <div class="bg-black/20 backdrop-blur-md rounded-xl p-5 max-w-6xl mx-auto border border-white/20">
        <h3 class="text-base font-bold text-white mb-2 text-center">📊 Résumé final</h3>
        <div class="grid grid-cols-6 gap-6">
          <div v-for="ability in abilities" :key="ability.name" class="text-center">
            <div class="text-xs text-gray-300 mb-1 font-medium">{{ ability.name.substring(0, 3) }}</div>
            <div class="bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-lg py-2 px-2 border border-blue-400/40">
              <div class="text-lg font-bold text-white">{{ ability.value + getRacialBonus(ability.name) }}</div>
            </div>
            <div class="text-xs text-blue-200 mt-1 font-semibold">({{ getFinalModifier(ability.name) >= 0 ? '+' : '' }}{{ getFinalModifier(ability.name) }})</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <StepNavigation 
      :current-step="5" 
      :total-steps="9"
      step-name="Caractéristiques"
      :disable-next="remainingPoints > 0"
      @previous="emit('prev')"
      @next="validateAbilities"
    />
  </div>

  <!-- Modal de récapitulatif -->
  <CharacterSummaryModal
    :is-open="showSummary"
    :character="character"
    @close="showSummary = false"
  />
  </div>
</template>

<style scoped>
.ability-card:hover {
  border-color: rgba(34, 197, 94, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.abilities-container {
  perspective: 1000px;
}

.ability-card {
  transform-style: preserve-3d;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import StepNavigation from '../StepNavigation.vue'
import CharacterSummaryModal from '../../CharacterSummaryModal.vue'
import type { SRDRace } from '@/types/srd'
import type { Character } from '@/stores/app'
import type { Ability } from '@/utils/abilities'
import { getAbilityPointCost, getAbilityDescription } from '@/utils/abilities'


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

const showSummary = ref(false)

// Bonus raciaux maintenant récupérés depuis la sous-race sélectionnée
const remainingPoints = computed(() => {
  const usedPoints = abilities.value.reduce((total, ability) => {
    return total + getAbilityPointCost(ability.value)
  }, 0)
  return TOTAL_POINTS - usedPoints
})

function getRacialBonus(abilityName: string): number {
  let totalBonus = 0

  // Fonction helper pour convertir les noms français vers anglais
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
  if (props.character.subrace?.abilityBonuses && Array.isArray(props.character.subrace.abilityBonuses)) {
    const subraceBonus = props.character.subrace.abilityBonuses.find(
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
    const costDifference = getAbilityPointCost(newValue) - getAbilityPointCost(ability.value)
    if (remainingPoints.value >= costDifference) {
      ability.value = newValue
    }
  }
}

function decreaseAbility(ability: Ability) {
  if (ability.value > 8) {
    ability.value--
  }
}

function resetAbilities() {
  abilities.value.forEach(ability => {
    ability.value = BASE_VALUE
  })
}

function randomizeAbilities() {
  resetAbilities()
  let pointsToSpend = TOTAL_POINTS
  
  while (pointsToSpend > 0) {
    const randomIndex = Math.floor(Math.random() * abilities.value.length)
    const randomAbility = abilities.value[randomIndex]
    
    if (randomAbility && randomAbility.value < 15) {
      const newValue = randomAbility.value + 1
      const cost = getAbilityPointCost(newValue) - getAbilityPointCost(randomAbility.value)
      if (pointsToSpend >= cost) {
        randomAbility.value = newValue
        pointsToSpend -= cost
      }
    }
    
    // Éviter les boucles infinies
    if (abilities.value.every(a => a.value >= 15)) break
  }
}

function validateAbilities() {
  if (remainingPoints.value === 0) {
    // Validation des valeurs finales après bonus raciaux/sous-raciaux
    const isValid = abilities.value.every(ability => {
      const finalValue = ability.value + getRacialBonus(ability.name)
      return finalValue >= 8 && finalValue <= 20
    })

    if (!isValid) {
      console.error('Erreur de validation: Les valeurs finales des caractéristiques doivent être entre 8 et 20')
      return
    }

    const abilityData = abilities.value.reduce((acc, ability) => {
      acc[ability.name.toLowerCase()] = ability.value + getRacialBonus(ability.name)
      return acc
    }, {} as Record<string, number>)

    emit('next', abilityData)
  }
}
</script>
