<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
    <!-- En-tête -->
    <div class="text-center pt-8 pb-6">
      <h1 class="text-4xl font-bold text-white mb-2">🎭 Récapitulatif du Personnage</h1>
      <p class="text-purple-100 text-lg">Vérifiez les détails de votre aventurier avant de commencer !</p>
    </div>

    <!-- Contenu principal -->
    <div class="flex-1 px-6 pb-8">
      <div class="max-w-6xl mx-auto">
        <!-- Carte principale du personnage -->
        <div class="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 shadow-2xl mb-6">
          <!-- Nom du personnage -->
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-white mb-2">{{ character.name || 'Nom à définir' }}</h2>
            <p class="text-purple-200 text-lg">
              {{ character.subrace?.name || character.race?.name || 'Race' }} 
              {{ character.class || 'Classe' }} - Niveau {{ character.level }}
            </p>
            <p class="text-purple-300 text-base">{{ getBackgroundName() }}</p>
          </div>

          <!-- Grille d'informations -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Informations de base -->
            <div class="space-y-6">
              <!-- Race et Sous-race -->
              <div class="bg-black/20 rounded-xl p-6">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                  🧬 Origine
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-purple-200">Race :</span>
                    <span class="text-white font-semibold">{{ character.race?.name || 'Non sélectionnée' }}</span>
                  </div>
                  <div v-if="character.subrace" class="flex justify-between items-center">
                    <span class="text-purple-200">Sous-race :</span>
                    <span class="text-white font-semibold">{{ character.subrace.name }}</span>
                  </div>
                  <div v-if="character.subrace" class="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div class="bg-white/10 rounded-lg p-2">
                      <div class="text-purple-200">Taille</div>
                      <div class="text-white font-medium">{{ character.subrace.size }}</div>
                    </div>
                    <div class="bg-white/10 rounded-lg p-2">
                      <div class="text-purple-200">Vitesse</div>
                      <div class="text-white font-medium">{{ character.subrace.speed }} m</div>
                    </div>
                    <div class="bg-white/10 rounded-lg p-2">
                      <div class="text-purple-200">Vision</div>
                      <div class="text-white font-medium">{{ getVisionDisplay() }}</div>
                    </div>
                    <div v-if="character.subrace.languages?.length" class="bg-white/10 rounded-lg p-2">
                      <div class="text-purple-200">Langues</div>
                      <div class="text-white font-medium text-xs">{{ character.subrace.languages.join(', ') }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Classe et Background -->
              <div class="bg-black/20 rounded-xl p-6">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                  ⚔️ Profession
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-purple-200">Classe :</span>
                    <span class="text-white font-semibold">{{ character.class || 'Non sélectionnée' }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-purple-200">Historique :</span>
                    <span class="text-white font-semibold">{{ getBackgroundName() }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-purple-200">Niveau :</span>
                    <span class="text-white font-semibold">{{ character.level }}</span>
                  </div>
                </div>
              </div>

              <!-- Traits raciaux -->
              <div v-if="character.subrace?.traits?.length" class="bg-black/20 rounded-xl p-6">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                  ✨ Traits Raciaux
                </h3>
                <div class="space-y-3">
                  <div v-for="trait in character.subrace.traits" :key="trait" 
                       class="relative bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all duration-200 cursor-help group">
                    <div class="text-purple-100 text-sm font-semibold mb-2">{{ trait }}</div>
                    <div class="text-white text-xs leading-relaxed">{{ getTraitDescription(trait) }}</div>
                    
                    <!-- Indicateur de survol -->
                    <div class="absolute top-2 right-2 text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Caractéristiques -->
            <div class="space-y-6">
              <!-- Stats principales -->
              <div class="bg-black/20 rounded-xl p-6">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                  📊 Caractéristiques
                </h3>
                <div class="grid grid-cols-2 gap-3">
                  <div v-for="ability in getAbilitiesDisplay()" :key="ability.name"
                       class="bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-lg p-3 border border-blue-400/40">
                    <div class="text-center">
                      <div class="text-purple-200 text-sm font-medium">{{ ability.name }}</div>
                      <div class="text-2xl font-bold text-white">{{ ability.final }}</div>
                      <div class="text-blue-200 text-xs">({{ ability.modifier >= 0 ? '+' : '' }}{{ ability.modifier }})</div>
                      <div class="text-xs text-green-300 mt-1">
                        {{ ability.base }}{{ ability.racial > 0 ? ` +${ability.racial}` : '' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Points de vie estimés -->
              <div class="bg-black/20 rounded-xl p-6">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                  ❤️ Statistiques de Combat
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-purple-200">Points de Vie (estimés) :</span>
                    <span class="text-red-300 font-bold text-lg">{{ getEstimatedHP() }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-purple-200">Classe d'Armure (base) :</span>
                    <span class="text-blue-300 font-bold">{{ getBaseAC() }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-purple-200">Initiative :</span>
                    <span class="text-green-300 font-bold">{{ getInitiative() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex justify-center space-x-6">
          <button 
            @click="$emit('prev')"
            class="bg-gray-500/30 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-gray-500/50 transition-all duration-200 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
            </svg>
            Retour
          </button>
          
          <button 
            @click="finalizeCharacter"
            class="bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 px-8 py-3 rounded-xl font-bold text-base shadow-2xl hover:from-green-300 hover:to-emerald-400 transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Créer le Personnage
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getTraitDescription } from '@/utils/traits'

interface Character {
  name: string
  race: any
  subrace: any
  class: string
  background: string
  abilities: Record<string, number>
  level: number
}

const props = defineProps<{
  character: Character
}>()

const emit = defineEmits(['prev', 'finalize'])

// Fonctions utilitaires
function getModifier(value: number): number {
  return Math.floor((value - 10) / 2)
}

function getAbilitiesDisplay() {
  const abilityNames = ['Force', 'Dextérité', 'Constitution', 'Intelligence', 'Sagesse', 'Charisme']
  
  return abilityNames.map(name => {
    const baseValue = props.character.abilities[name.toLowerCase()] || 8
    const racialBonus = props.character.subrace?.abilityBonuses?.[name] || 0
    const finalValue = baseValue + racialBonus
    
    return {
      name: name.substring(0, 3),
      base: baseValue,
      racial: racialBonus,
      final: finalValue,
      modifier: getModifier(finalValue)
    }
  })
}

function getVisionDisplay(): string {
  // Si une vision spécifique est définie dans la sous-race
  if (props.character.subrace?.vision) {
    return props.character.subrace.vision[0]
  }
  
  // Sinon, vision normale par défaut
  return 'Vision normale'
}

function getEstimatedHP(): number {
  // HP de base selon la classe (estimation)
  const classBaseHP: Record<string, number> = {
    'Barbare': 12,
    'Guerrier': 10,
    'Paladin': 10,
    'Rôdeur': 10,
    'Barde': 8,
    'Clerc': 8,
    'Druide': 8,
    'Moine': 8,
    'Voleur': 8,
    'Sorcier': 6,
    'Magicien': 6,
    'Ensorceleur': 6
  }
  
  const baseHP = classBaseHP[props.character.class] || 8
  const conModifier = getModifier(getAbilitiesDisplay().find(a => a.name === 'Con')?.final || 10)
  
  return baseHP + conModifier
}

function getBaseAC(): number {
  const dexModifier = getModifier(getAbilitiesDisplay().find(a => a.name === 'Dex')?.final || 10)
  return 10 + dexModifier
}

function getInitiative(): string {
  const dexModifier = getModifier(getAbilitiesDisplay().find(a => a.name === 'Dex')?.final || 10)
  return dexModifier >= 0 ? `+${dexModifier}` : `${dexModifier}`
}

function getBackgroundName(): string {
  const backgroundNames: Record<string, string> = {
    'acolyte': 'Acolyte',
    'artisan': 'Artisan de guilde',
    'artiste': 'Artiste',
    'charlatan': 'Charlatan',
    'criminel': 'Criminel',
    'ermite': 'Ermite',
    'héros-du-peuple': 'Héros du peuple',
    'noble': 'Noble',
    'sage': 'Sage',
    'sauvageon': 'Sauvageon',
    'soldat': 'Soldat'
  }
  
  return backgroundNames[props.character.background] || props.character.background || 'Non sélectionné'
}

function finalizeCharacter() {
  // Ici on pourrait sauvegarder le personnage, rediriger vers la fiche, etc.
  emit('finalize', props.character)
  console.log('Personnage finalisé :', props.character)
  
  // Pour l'instant, on affiche juste une alerte
  alert(`🎉 Personnage créé avec succès !\n\n${props.character.name || 'Votre aventurier'} est prêt pour l'aventure !`)
}
</script>

<style scoped>
/* Animations pour les cartes */
.bg-black\/20 {
  transition: all 0.3s ease;
}

.bg-black\/20:hover {
  background: rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}
</style>
