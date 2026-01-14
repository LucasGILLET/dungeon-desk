<template>
  <div>
    <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col relative">
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

      <div class="flex flex-col justify-center px-4 my-auto">

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
              <input type="text" v-model="character.name" 
                     placeholder="Nom à définir" 
                     class="text-2xl text-center mt-2 px-4 py-2 rounded-lg border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-400 w-64 mx-auto" />
              <p class="text-purple-200 text-lg">
                {{ character.subrace?.name || character.race?.name || 'Race' }} 
                <!-- {{ character.class || 'Classe' }} - Niveau {{ character.level }} -->
              </p>
              <!-- <p class="text-purple-300 text-base">{{ getBackgroundName() }}</p> -->
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
                    <div class="grid grid-cols-2 gap-2 mt-4 text-sm">
                      <div class="bg-white/10 rounded-lg p-2">
                        <div class="text-purple-200">Taille</div>
                        <div class="text-white font-medium">{{ character.race?.size }}</div>
                      </div>
                      <div class="bg-white/10 rounded-lg p-2">
                        <div class="text-purple-200">Vitesse</div>
                        <div class="text-white font-medium">{{ convertSpeedToMeters(character.race?.speed) }} m</div>
                      </div>
                      <div class="bg-white/10 rounded-lg p-2">
                        <div class="text-purple-200">Vision</div>
                        <div class="text-white font-medium">{{ getVisionDisplay() }}</div>
                      </div>
                      <div v-if="character && character.allProficiencies && character.allProficiencies?.languages.length > 0" class="bg-white/10 rounded-lg p-2">
                        <div class="text-purple-200">Langues</div>
                        <div class="text-white font-medium text-xs">{{ character.allProficiencies.languages.map(lang => lang.name).join(', ') }}</div>
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
                      <span class="text-white font-semibold">{{ character.class.name || 'Non sélectionnée' }}</span>
                    </div>
                    <div v-if="character.subclass" class="flex justify-between items-center">
                      <span class="text-purple-200">Sous-classe :</span>
                      <span class="text-white font-semibold">{{ character.subclass.name }}</span>
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
                <div v-if="character.allTraits?.length" class="bg-black/20 rounded-xl p-6">
                  <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                    ✨ Traits Raciaux
                  </h3>
                  <div class="max-h-96 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-black/20">
                    <div v-for="trait in character.allTraits" :key="trait.index" 
                        class="relative bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all duration-200 cursor-help group">
                      <div class="text-purple-100 text-sm font-semibold mb-2">{{ trait.name }}</div>
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

                <!-- Compétences et Maîtrises -->
                <div class="bg-black/20 rounded-xl p-6">
                  <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                    🎯 Compétences & Maîtrises
                  </h3>
                  <div class="space-y-4">
                    <!-- Compétences -->
                    <div v-if="skillsProficiencies.length > 0">
                      <h4 class="text-purple-200 text-sm font-semibold mb-2">Compétences</h4>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="skill in skillsProficiencies" :key="skill.id"
                              class="bg-blue-500/30 text-blue-100 px-2 py-1 rounded-md text-xs font-medium"
                              :title="skill.description">
                          {{ skill.name }}
                        </span>
                      </div>
                    </div>

                    <!-- Langues -->
                    <div v-if="languagesProficiencies.length > 0">
                      <h4 class="text-purple-200 text-sm font-semibold mb-2">Langues</h4>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="language in languagesProficiencies" :key="language.id"
                              class="bg-yellow-500/30 text-yellow-100 px-2 py-1 rounded-md text-xs font-medium"
                              :title="language.description">
                          {{ language.name }}
                        </span>
                      </div>
                    </div>

                    <!-- Outils -->
                    <div v-if="toolsProficiencies.length > 0">
                      <h4 class="text-purple-200 text-sm font-semibold mb-2">Outils</h4>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="tool in toolsProficiencies" :key="tool.id"
                              class="bg-green-500/30 text-green-100 px-2 py-1 rounded-md text-xs font-medium"
                              :title="tool.description">
                          {{ tool.name }}
                        </span>
                      </div>
                    </div>

                    <!-- Armes -->
                    <div v-if="weaponsProficiencies.length > 0">
                      <h4 class="text-purple-200 text-sm font-semibold mb-2">Armes</h4>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="weapon in weaponsProficiencies" :key="weapon.id"
                              class="bg-red-500/30 text-red-100 px-2 py-1 rounded-md text-xs font-medium"
                              :title="weapon.description">
                          {{ weapon.name }}
                        </span>
                      </div>
                    </div>

                    <!-- Armures -->
                    <div v-if="armorProficiencies.length > 0">
                      <h4 class="text-purple-200 text-sm font-semibold mb-2">Armures</h4>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="armor in armorProficiencies" :key="armor.id"
                              class="bg-gray-500/30 text-gray-100 px-2 py-1 rounded-md text-xs font-medium"
                              :title="armor.description">
                          {{ armor.name }}
                        </span>
                      </div>
                    </div>

                    <!-- Message si aucune maîtrise -->
                    <div v-if="!hasAnyProficiencies" class="text-center text-gray-400 py-4">
                      <div class="text-sm">Aucune compétence ou maîtrise définie</div>
                      <div class="text-xs mt-1">Les compétences seront ajoutées lors des étapes précédentes</div>
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

                <!-- Features de Classe -->
                <div class="bg-black/20 rounded-xl p-6">
                  <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                    ⚔️ Capacités de Classe (Niveau 1)
                  </h3>
                  <div class="max-h-96 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-black/20">
                    <div v-if="displayedFeatures.length > 0" v-for="feature in displayedFeatures" :key="feature.index"
                        class="bg-white/10 rounded-lg p-4">
                      <div class="flex justify-between items-start mb-2">
                        <h4 class="text-purple-200 font-semibold">{{ feature.name }}</h4>
                        <span class="text-xs bg-green-600/30 text-green-100 px-2 py-1 rounded">
                          Niveau {{ feature.level }}
                        </span>
                      </div>
                      <div class="text-gray-300 text-sm">
                        <div v-for="desc in feature.desc" :key="desc" class="mb-2">
                          {{ desc }}
                        </div>
                      </div>
                    </div>

                    <!-- Message si aucune feature -->
                    <div v-else class="text-center text-gray-400 py-4">
                      <div class="text-sm">Aucune capacité de classe disponible</div>
                      <div class="text-xs mt-1">Les capacités seront ajoutées selon la classe et le niveau</div>
                    </div>
                  </div>
                </div>

                <!-- Choix Spéciaux -->
                <div class="bg-black/20 rounded-xl p-6">
                  <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                    ⚡ Choix Spéciaux
                  </h3>
                  <div class="space-y-3">
                    <div v-if="specialChoicesDisplay.draconicAncestry" 
                        class="bg-white/10 rounded-lg p-3">
                      <div class="text-orange-200 text-sm font-semibold">Ascendance Draconique</div>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span v-for="ancestry in specialChoicesDisplay.draconicAncestry" :key="ancestry"
                              class="bg-orange-600/30 text-orange-100 px-2 py-1 rounded text-xs">
                          {{ ancestry }}
                        </span>
                      </div>
                    </div>

                    <div v-if="specialChoicesDisplay.fightingStyle" 
                        class="bg-white/10 rounded-lg p-3">
                      <div class="text-red-200 text-sm font-semibold">Style de Combat</div>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span v-for="style in specialChoicesDisplay.fightingStyle" :key="style"
                              class="bg-red-600/30 text-red-100 px-2 py-1 rounded text-xs">
                          {{ style }}
                        </span>
                      </div>
                    </div>

                    <div v-if="specialChoicesDisplay.favoredEnemies" 
                        class="bg-white/10 rounded-lg p-3">
                      <div class="text-green-200 text-sm font-semibold">Ennemis Jurés</div>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span v-for="enemy in specialChoicesDisplay.favoredEnemies" :key="enemy"
                              class="bg-green-600/30 text-green-100 px-2 py-1 rounded text-xs">
                          {{ enemy }}
                        </span>
                      </div>
                    </div>

                    <div v-if="specialChoicesDisplay.naturalExplorer" 
                        class="bg-white/10 rounded-lg p-3">
                      <div class="text-blue-200 text-sm font-semibold">Explorateur-né</div>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span v-for="terrain in specialChoicesDisplay.naturalExplorer" :key="terrain"
                              class="bg-blue-600/30 text-blue-100 px-2 py-1 rounded text-xs">
                          {{ terrain }}
                        </span>
                      </div>
                    </div>

                    <div v-if="specialChoicesDisplay.expertise" 
                        class="bg-white/10 rounded-lg p-3">
                      <div class="text-purple-200 text-sm font-semibold">Expertise</div>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span v-for="skill in specialChoicesDisplay.expertise" :key="skill"
                              class="bg-purple-600/30 text-purple-100 px-2 py-1 rounded text-xs">
                          {{ skill }}
                        </span>
                      </div>
                    </div>

                    <!-- Autres choix spéciaux non catégorisés -->
                    <template v-for="(value, key) in specialChoicesDisplay" :key="key">
                      <div v-if="!['draconicAncestry', 'fightingStyle', 'favoredEnemies', 'naturalExplorer', 'expertise'].includes(key)" class="bg-white/10 rounded-lg p-3">
                        <div class="text-yellow-200 text-sm font-semibold">{{ key }}</div>
                        <div class="flex flex-wrap gap-1 mt-1">
                          <span v-for="item in value" :key="item"
                                class="bg-yellow-600/30 text-yellow-100 px-2 py-1 rounded text-xs">
                            {{ item }}
                          </span>
                        </div>
                      </div>
                    </template>

                    <!-- Message si aucun choix spécial -->
                    <div v-if="!hasSpecialChoices" class="text-center text-gray-400 py-4">
                      <div class="text-sm">Aucun choix spécial défini</div>
                      <div class="text-xs mt-1">Les choix spéciaux dépendent de la classe et sous-classe</div>
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
        :current-step="9" 
        :total-steps="9"
        step-name="Résumé final"
        @previous="$emit('prev')"
        @next="finalizeCharacter"
      />
      </div>
  </div>
      <!-- Modal de récapitulatif -->
      <CharacterSummaryModal
        :is-open="showSummary"
        :character="character"
        @close="showSummary = false"
      />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { getTraitDescriptionByIndex, getTraitDescriptionCombined, traitDescriptions } from '@/utils/traits'
import { loadTraits } from '@/utils/dataLoader'
import StepNavigation from '../StepNavigation.vue'
import CharacterSummaryModal from '../../CharacterSummaryModal.vue'
import type { SRDRace } from '@/types/srd'
import type { Character } from '@/stores/app'

const props = defineProps<{
  character: Character
  selectedRace?: SRDRace | null
}>()

const emit = defineEmits(['prev', 'finalize'])

const showSummary = ref(false)
const srdTraits = ref<any[]>([])

onMounted(async () => {
  try {
    srdTraits.value = await loadTraits()
  } catch (error) {
    console.error('Erreur lors du chargement des traits SRD:', error)
  }
})

const hasAnyProficiencies = computed(() => {
  const prof = props.character.allProficiencies
  if (!prof) return false
  
  return Object.keys(prof).some(key => {
    const items = (prof as Record<string, any>)[key]
    return Array.isArray(items) && items.length > 0
  })
})

const skillsProficiencies = computed(() => {
  const prof = props.character.allProficiencies
  if (!prof) return []
  
  const skills: any[] = []
  Object.keys(prof).forEach(key => {
    if (key.includes('competences') || key.includes('skills')) {
      const items = (prof as Record<string, any>)[key]
      if (Array.isArray(items)) {
        skills.push(...items)
      }
    }
  })
  return skills
})

const languagesProficiencies = computed(() => {
  const prof = props.character.allProficiencies
  if (!prof) return []
  
  const languages: any[] = []
  Object.keys(prof).forEach(key => {
    if (key.includes('langue') || key.includes('languages')) {
      const items = (prof as Record<string, any>)[key]
      if (Array.isArray(items)) {
        languages.push(...items)
      }
    }
  })
  return languages
})

const toolsProficiencies = computed(() => {
  const prof = props.character.allProficiencies
  if (!prof) return []
  
  const tools: any[] = []
  Object.keys(prof).forEach(key => {
    if (key.includes('outils') || key.includes('tools')) {
      const items = (prof as Record<string, any>)[key]
      if (Array.isArray(items)) {
        tools.push(...items)
      }
    }
  })
  return tools
})

const weaponsProficiencies = computed(() => {
  const prof = props.character.allProficiencies
  if (!prof) return []
  
  const weapons: any[] = []
  Object.keys(prof).forEach(key => {
    if (key.includes('armes') || key.includes('weapons')) {
      const items = (prof as Record<string, any>)[key]
      if (Array.isArray(items)) {
        weapons.push(...items)
      }
    }
  })
  return weapons
})

const armorProficiencies = computed(() => {
  const prof = props.character.allProficiencies
  if (!prof) return []
  
  const armor: any[] = []
  Object.keys(prof).forEach(key => {
    if (key.includes('armures') || key.includes('armor')) {
      const items = (prof as Record<string, any>)[key]
      if (Array.isArray(items)) {
        armor.push(...items)
      }
    }
  })
  return armor
})

const hasSpecialChoices = computed(() => {
  const choices = props.character.specialChoices
  if (!choices) return false
  
  // Vérifier s'il y a des données dans n'importe quelle clé
  return Object.keys(choices).some(key => {
    const items = choices[key]
    return Array.isArray(items) && items.length > 0
  })
})

const specialChoicesDisplay = computed(() => {
  const choices = props.character.specialChoices
  if (!choices) return {}
  
  const result: Record<string, any> = {}
  
  Object.keys(choices).forEach(key => {
    const items = choices[key]
    if (Array.isArray(items) && items.length > 0) {
      // Convertir les clés kebab-case en format lisible
      if (key.includes('fighting-style') || key.includes('style-combat')) {
        result.fightingStyle = items
      } else if (key.includes('draconic-ancestry') || key.includes('ascendance-draconique')) {
        result.draconicAncestry = items
      } else if (key.includes('favored-enemies') || key.includes('ennemis-jures') || key.includes('favored-enemy')) {
        result.favoredEnemies = items
      } else if (key.includes('natural-explorer') || key.includes('explorateur-ne')) {
        result.naturalExplorer = items
      } else if (key.includes('expertise')) {
        result.expertise = items
      } else {
        // Fallback pour d'autres types de choix
        result[key] = items
      }
    }
  })
  
  return result
})

// Mapping des IDs de sous-classes français vers les index SRD anglais
function getSubclassSRDIndex(subclassId: string): string {
  const subclassMapping: Record<string, string> = {
    'lignee-draconique': 'draconic',
    'magie-sauvage': 'wild',
    'domaine-vie': 'life',
    'domaine-lumiere': 'light',
    'domaine-duperie': 'trickery',
    'domaine-nature': 'nature',
    'domaine-tempete': 'tempest',
    'cercle-terre': 'land',
    'cercle-lune': 'moon',
    'grand-ancien': 'great-old-one',
    'archifee': 'archfey',
    'fiélon': 'fiend'
  }
  
  return subclassMapping[subclassId] || subclassId
}

const sortedFeatures = computed(() => {
  if (!props.character.features) return []

  return [...props.character.features.filter(feature => {
    // Exclure les features avec parent
    if (feature.parent) return false
    
    // Garder les features de base (sans subclass)
    if (!feature.subclass) return true
    
    // Garder uniquement les features de la sous-classe actuelle du personnage
    if (props.character.subclass && feature.subclass) {
      const characterSubclassIndex = getSubclassSRDIndex(props.character.subclass.id!)
      return feature.subclass.index === characterSubclassIndex
    }
    
    return false
  })].sort((a, b) => a.level - b.level)
})

const displayedFeatures = computed(() => {
  if (!sortedFeatures.value) return []
  
  return sortedFeatures.value.filter(feature => feature.level === 1)
})

function getModifier(value: number): number {
  return Math.floor((value - 10) / 2)
}

function getAbilitiesDisplay() {
  const abilityNames = ['Force', 'Dextérité', 'Constitution', 'Intelligence', 'Sagesse', 'Charisme']
  const abilityKeys = ['force', 'dextérité', 'constitution', 'intelligence', 'sagesse', 'charisme']

  return abilityNames.map((name, index) => {
    const abilityKey = abilityKeys[index] as keyof typeof props.character.abilities
    const baseValue: number = props.character.abilities[abilityKey] || 8
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
  if (props.character.vision) {
    return props.character.vision
  }
  
  return 'Vision normale'
}

function getEstimatedHP(): number {
  const classBaseHP: Record<string, number> = {
    'Barbare': 12,
    'Guerrier': 10,
    'Paladin': 10,
    'Rôdeur': 10,
    'Barde': 8,
    'Clerc': 8,
    'Druide': 8,
    'Moine': 8,
    'Roublard': 8,
    'Ensorceleur': 6,
    'Magicien': 6,
    'Occultiste': 6
  }
  
  const baseHP = classBaseHP[props.character.class.hit_die] || 8
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
  
  return backgroundNames[props.character.background.name] || props.character.background.name || 'Non sélectionné'
}

function finalizeCharacter() {
  // Ici on pourrait sauvegarder le personnage, rediriger vers la fiche, etc.
  emit('finalize', props.character)
  // Pour l'instant, on affiche juste une alerte
  alert(`🎉 Personnage créé avec succès !\n\n${props.character.name || 'Votre aventurier'} est prêt pour l'aventure !`)
}

function getTraitDescription(trait: any): string {
  if (trait.desc && Array.isArray(trait.desc)) {
    return trait.desc.join(' ')
  }
  
  return getTraitDescriptionCombined(srdTraits.value, trait.index, trait.name)
}

function convertSpeedToMeters(speed: number): number {
  return Math.round((speed) * 0.3048)
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
