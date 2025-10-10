<template>
  <div class="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex flex-col">

    <!-- Caractéristiques -->
    <div class="flex flex-col justify-center px-4 my-auto">
      <!-- Header avec points disponibles -->
      <div class="text-center mb-4">
        <h2 class="text-2xl font-bold text-white mb-2">Répartition des Caractéristiques</h2>
        <div v-if="character.subrace" class="mb-2">
          <span class="bg-purple-500/30 text-purple-100 px-3 py-1 rounded-full text-sm font-medium border border-purple-400/30">
            Race: {{ character.subrace.name }}
          </span>
        </div>
        <p class="text-green-100 text-base mb-2">
          Vous avez <span class="text-yellow-400 font-bold text-lg">{{ remainingPoints }}</span> points à répartir
        </p>
        <p class="text-green-200 text-xs">
          Minimum: 8 • Maximum: 15 • Les bonus raciaux s'ajoutent automatiquement
        </p>
      </div>

      <!-- Résumé des stats finales -->
      <div class="bg-black/20 backdrop-blur-md rounded-xl p-3 mb-4 max-w-4xl mx-auto border border-white/20">
        <h3 class="text-base font-bold text-white mb-2 text-center">📊 Résumé final</h3>
        <div class="grid grid-cols-6 gap-2">
          <div v-for="ability in abilities" :key="ability.name" class="text-center">
            <div class="text-xs text-gray-300 mb-1">{{ ability.name.substring(0, 3) }}</div>
            <div class="bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-lg py-1.5 border border-blue-400/40">
              <div class="text-base font-bold text-white">{{ ability.value + getRacialBonus(ability.name) }}</div>
              <div class="text-xs text-blue-200">({{ getFinalModifier(ability.name) >= 0 ? '+' : '' }}{{ getFinalModifier(ability.name) }})</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Grille des caractéristiques -->
      <div class="mb-4">
        <div class="abilities-container w-full grid grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div 
            v-for="ability in abilities" 
            :key="ability.name" 
            class="ability-card bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 border-white/20 transition-all duration-200"
          >
            <!-- Nom de la caractéristique -->
            <div class="text-center mb-3">
              <h3 class="text-lg font-bold text-white mb-1">{{ ability.name }}</h3>
              <p class="text-green-100 text-xs">{{ getAbilityDescription(ability.name) }}</p>
            </div>

            <!-- Contrôles de valeur -->
            <div class="flex items-center justify-center space-x-3">
              <!-- Bouton - -->
              <button 
                @click="decreaseAbility(ability)"
                :disabled="ability.value <= 8"
                :class="[
                  'w-8 h-8 rounded-full font-bold text-sm transition-all duration-200 self-center',
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
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500/40 to-purple-500/40 rounded-full flex flex-col items-center justify-center border-2 border-blue-400/60 mb-2 shadow-lg mx-auto">
                  <span class="text-xl font-bold text-white">{{ ability.value + getRacialBonus(ability.name) }}</span>
                  <span class="text-xs text-blue-200 font-bold">{{ getFinalModifier(ability.name) >= 0 ? '+' : '' }}{{ getFinalModifier(ability.name) }}</span>
                </div>
                
                <!-- Détails en petit -->
                <div class="bg-black/20 rounded-lg px-2 py-1 text-xs space-y-0.5">
                  <div class="text-green-200">
                    Base: {{ ability.value }} ({{ getModifier(ability.value) >= 0 ? '+' : '' }}{{ getModifier(ability.value) }})
                  </div>
                  <div v-if="getRacialBonus(ability.name) > 0" class="text-yellow-300 font-semibold">
                    + {{ getRacialBonus(ability.name) }} racial
                  </div>
                  <div v-else class="text-gray-400">
                    Aucun bonus racial
                  </div>
                </div>
              </div>

              <!-- Bouton + -->
              <button 
                @click="increaseAbility(ability)"
                :disabled="ability.value >= 15 || remainingPoints <= 0"
                :class="[
                  'w-8 h-8 rounded-full font-bold text-sm transition-all duration-200 self-center',
                  ability.value >= 15 || remainingPoints <= 0
                    ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-500/50 text-white hover:bg-green-500/70 hover:scale-110'
                ]"
              >
                +
              </button>
            </div>

            <!-- Coût en points -->
            <div class="text-center mt-2">
              <span class="text-xs text-green-200">
                Coût: {{ getPointCost(ability.value) }} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons de reset et random -->
      <div class="flex justify-center space-x-4 mb-3">
        <button 
          @click="resetAbilities"
          class="bg-gray-500/30 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-gray-500/50 transition-all duration-200 text-sm"
        >
          🔄 Reset
        </button>
        <button 
          @click="randomizeAbilities"
          class="bg-purple-500/30 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-purple-500/50 transition-all duration-200 text-sm"
        >
          🎲 Aléatoire
        </button>
      </div>
      
      <!-- Boutons de navigation -->
      <div class="flex justify-center space-x-6">
        <button 
          @click="emit('prev')"
          class="bg-gray-500/30 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-gray-500/50 transition-all duration-200 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
          </svg>
          Retour
        </button>
        
        <button 
          class="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-xl font-bold text-base shadow-2xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-100 hover:scale-105"
          :class="{
            'opacity-50 cursor-not-allowed': remainingPoints > 0
          }"
          @click="validateAbilities"
          :disabled="remainingPoints > 0"
        >
          <span class="flex items-center gap-2">
            {{ remainingPoints > 0 ? `Il reste ${remainingPoints} points` : "Confirmer les caractéristiques" }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </span>
        </button>
      </div>
    </div>
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

interface Ability {
  name: string
  value: number
}

interface Character {
  race: any
  subrace: any
  class: string
  background: string
  abilities: Record<string, number>
}

const props = defineProps<{
  character: Character
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

// Bonus raciaux maintenant récupérés depuis la sous-race sélectionnée
const remainingPoints = computed(() => {
  const usedPoints = abilities.value.reduce((total, ability) => {
    return total + getPointCost(ability.value)
  }, 0)
  return TOTAL_POINTS - usedPoints
})

function getRacialBonus(abilityName: string): number {
  if (!props.character.subrace?.abilityBonuses) return 0
  return props.character.subrace.abilityBonuses[abilityName] || 0
}

function getFinalModifier(abilityName: string): number {
  const ability = abilities.value.find(a => a.name === abilityName)
  if (!ability) return 0
  const finalValue = ability.value + getRacialBonus(abilityName)
  return getModifier(finalValue)
}

function getPointCost(value: number): number {
  // Système de coût D&D 5e : 8=0pts, 9=1pt, 10=2pts, 11=3pts, 12=4pts, 13=5pts, 14=7pts, 15=9pts
  const costs = [0, 1, 2, 3, 4, 5, 7, 9]
  return costs[value - 8] || 0
}

function getModifier(value: number): number {
  return Math.floor((value - 10) / 2)
}

function getAbilityDescription(name: string): string {
  const descriptions: Record<string, string> = {
    'Force': 'Puissance physique, combat au corps à corps',
    'Dextérité': 'Agilité, réflexes, attaques à distance',
    'Constitution': 'Endurance, points de vie, résistance',
    'Intelligence': 'Raisonnement, mémoire, magie arcane',
    'Sagesse': 'Perception, intuition, magie divine',
    'Charisme': 'Force de personnalité, persuasion'
  }
  return descriptions[name] || ''
}

function increaseAbility(ability: Ability) {
  if (ability.value < 15 && remainingPoints.value > 0) {
    const newValue = ability.value + 1
    const costDifference = getPointCost(newValue) - getPointCost(ability.value)
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
      const cost = getPointCost(newValue) - getPointCost(randomAbility.value)
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
    const abilityData = abilities.value.reduce((acc, ability) => {
      acc[ability.name.toLowerCase()] = ability.value
      return acc
    }, {} as Record<string, number>)
    
    emit('next', abilityData)
  }
}
</script>
