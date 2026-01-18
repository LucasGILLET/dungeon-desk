<template>
  <div class="block h-full bg-zinc-950">
    <!-- Contenu défilable -->
    <div class="mb-30 overflow-y-auto custom-scrollbar p-6 sm:p-8">
      <div class="max-w-5xl mx-auto space-y-10 pb-12">

        <!-- En-tête -->
        <div class="text-center relative pt-4">
          <h2 class="text-3xl sm:text-5xl font-bold font-serif text-white mb-6 drop-shadow-md">
            Votre Légende Commence
          </h2>
          <div class="max-w-md mx-auto relative group">
             <input type="text" v-model="character.name" 
                     placeholder="Nommez votre Héros..." 
                     class="w-full bg-transparent text-center text-3xl font-serif font-bold text-amber-500 placeholder-zinc-700 border-b-2 border-zinc-800 focus:border-amber-500 focus:outline-none py-2 transition-colors duration-300" />
             <div class="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none transition-opacity duration-300" :class="character.name ? 'opacity-0' : 'opacity-100'">
                <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
             </div>
          </div>
          <p class="text-zinc-500 mt-4 font-light text-sm uppercase tracking-widest">
             {{ character.race?.name }} {{ character.subrace.name ? `(${character.subrace.name})` : '' }} • {{ character.class.name }} {{ character.subclass ? `• ${character.subclass.name}` : '' }} • Niv. 1
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Colonne Gauche: Stats & Combat -->
            <div class="space-y-6">
                
                <!-- Caractéristiques -->
                <div class="bg-zinc-900/50 rounded-xl border border-zinc-700/50 p-6 backdrop-blur-sm shadow-xl">
                    <h3 class="text-lg font-bold font-serif text-zinc-200 mb-4 flex items-center gap-2">
                        <span class="text-amber-500">✦</span> Caractéristiques
                    </h3>
                    <div class="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div v-for="ability in getAbilitiesDisplay()" :key="ability.name"
                             class="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex flex-col items-center">
                            <span class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{{ ability.name }}</span>
                            <span class="text-2xl font-bold font-serif text-white">{{ ability.final }}</span>
                            <span class="text-xs font-bold px-2 py-0.5 rounded mt-1 min-w-[30px] text-center" 
                                  :class="ability.modifier >= 0 ? 'bg-zinc-800 text-zinc-300' : 'bg-red-900/20 text-red-500'">
                                {{ ability.modifier >= 0 ? '+' : '' }}{{ ability.modifier }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Combat Info -->
                <div class="bg-zinc-900/50 rounded-xl border border-zinc-700/50 p-6 backdrop-blur-sm shadow-xl">
                    <h3 class="text-lg font-bold font-serif text-zinc-200 mb-4 flex items-center gap-2">
                        <span class="text-amber-500">⚔️</span> Capacité de Survie
                    </h3>
                     <div class="flex justify-around items-center text-center">
                        <div>
                             <div class="text-3xl font-bold text-red-500 font-serif">{{ getEstimatedHP() }}</div>
                             <div class="text-[10px] uppercase text-zinc-500 tracking-wider mt-1 font-bold">PV Max</div>
                        </div>
                        <div class="h-10 w-px bg-zinc-800"></div>
                        <div>
                             <div class="text-3xl font-bold text-blue-400 font-serif">{{ getBaseAC() }}</div>
                             <div class="text-[10px] uppercase text-zinc-500 tracking-wider mt-1 font-bold">CA (Est.)</div>
                        </div>
                        <div class="h-10 w-px bg-zinc-800"></div>
                        <div>
                             <div class="text-3xl font-bold text-green-500 font-serif">{{ getInitiative() }}</div>
                             <div class="text-[10px] uppercase text-zinc-500 tracking-wider mt-1 font-bold">Initiative</div>
                        </div>
                     </div>
                </div>

                 <!-- Traits & Features List -->
                <div class="bg-zinc-900/50 rounded-xl border border-zinc-700/50 p-6 backdrop-blur-sm shadow-xl max-h-[500px] overflow-hidden flex flex-col">
                    <h3 class="text-lg font-bold font-serif text-zinc-200 mb-4 flex items-center gap-2">
                        <span class="text-amber-500">📜</span> Traits & Aptitudes
                    </h3>
                    <div class="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                         <!-- Traits Raciaux -->
                         <div v-for="trait in character.allTraits" :key="trait.index" class="group">
                            <div class="text-sm font-bold text-zinc-300 group-hover:text-amber-400 transition-colors mb-1">{{ trait.name }}</div>
                            <div class="text-xs text-zinc-500 leading-relaxed pl-3 border-l hover:border-zinc-600 border-zinc-800 transition-colors">{{ getTraitDescription(trait) }}</div>
                         </div>
                         
                         <div class="my-4 border-t border-zinc-800/50" v-if="character.allTraits?.length && displayedFeatures.length"></div>
                         
                         <!-- Features de Classe -->
                         <div v-for="feature in displayedFeatures" :key="feature.index" class="group">
                             <div class="flex justify-between items-baseline mb-1">
                                <span class="text-sm font-bold text-zinc-300 group-hover:text-amber-400 transition-colors">{{ feature.name }}</span>
                             </div>
                             <div class="text-xs text-zinc-500 leading-relaxed pl-3 border-l hover:border-zinc-600 border-zinc-800 transition-colors">
                                <p v-for="desc in feature.desc" :key="desc" class="mb-1 last:mb-0">{{ desc }}</p>
                             </div>
                         </div>

                         <div class="my-4 border-t border-zinc-800/50" v-if="(character.allTraits?.length || displayedFeatures.length) && character.background?.feature"></div>

                         <!-- Feature d'Historique -->
                         <div v-if="character.background?.feature" class="group">
                             <div class="flex justify-between items-baseline mb-1">
                                <span class="text-sm font-bold text-zinc-300 group-hover:text-amber-400 transition-colors">{{ character.background.feature.name }}</span>
                             </div>
                             <div class="text-xs text-zinc-500 leading-relaxed pl-3 border-l hover:border-zinc-600 border-zinc-800 transition-colors">
                                <p v-for="desc in character.background.feature.desc" :key="desc" class="mb-1 last:mb-0">{{ desc }}</p>
                             </div>
                         </div>
                    </div>
                </div>

            </div>

            <!-- Colonne Droite: Identité & Maîtrises -->
            <div class="space-y-6">
                <!-- Identité -->
               <div class="bg-zinc-900/50 rounded-xl border border-zinc-700/50 p-6 backdrop-blur-sm shadow-xl">
                    <h3 class="text-lg font-bold font-serif text-zinc-200 mb-4 flex items-center gap-2">
                        <span class="text-amber-500">👤</span> Identité
                    </h3>
                    <div class="space-y-4 text-sm">
                        <div class="flex justify-between border-b border-zinc-800 pb-2 hover:bg-zinc-900/50 transition-colors px-2 rounded">
                            <span class="text-zinc-500">Race</span>
                            <span class="text-zinc-300 font-medium">{{ character.race?.name }}</span>
                        </div>
                         <div v-if="character.subrace" class="flex justify-between border-b border-zinc-800 pb-2 hover:bg-zinc-900/50 transition-colors px-2 rounded">
                            <span class="text-zinc-500">Sous-race</span>
                            <span class="text-zinc-300 font-medium">{{ character.subrace.name }}</span>
                        </div>
                        <div class="flex justify-between border-b border-zinc-800 pb-2 hover:bg-zinc-900/50 transition-colors px-2 rounded">
                            <span class="text-zinc-500">Classe</span>
                            <span class="text-zinc-300 font-medium">{{ character.class.name }}</span>
                        </div>
                        <div v-if="character.subclass" class="flex justify-between border-b border-zinc-800 pb-2 hover:bg-zinc-900/50 transition-colors px-2 rounded">
                            <span class="text-zinc-500">Sous-classe</span>
                            <span class="text-zinc-300 font-medium">{{ character.subclass.name }}</span>
                        </div>
                        <div class="flex justify-between border-b border-zinc-800 pb-2 hover:bg-zinc-900/50 transition-colors px-2 rounded">
                            <span class="text-zinc-500">Historique</span>
                            <span class="text-zinc-300 font-medium">{{ getBackgroundName() }}</span>
                        </div>
                        <div class="flex justify-between items-center text-xs text-zinc-500 pt-2 px-2">
                           <div class="flex gap-4">
                              <span><strong class="text-zinc-400">{{ character.race?.size }}</strong> Taille</span>
                              <span><strong class="text-zinc-400">{{ convertSpeedToMeters(character.race?.speed) }}m</strong> Vitesse</span>
                           </div>
                           <span class="italic text-zinc-600">{{ getVisionDisplay() }}</span>
                        </div>
                    </div>
               </div>

               <!-- Maîtrises -->
               <div class="bg-zinc-900/50 rounded-xl border border-zinc-700/50 p-6 backdrop-blur-sm shadow-xl">
                    <h3 class="text-lg font-bold font-serif text-zinc-200 mb-4 flex items-center gap-2">
                        <span class="text-amber-500">🛠️</span> Maîtrises
                    </h3>
                    
                    <div class="space-y-5">
                        <div v-if="skillsProficiencies.length" class="space-y-2">
                            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Compétences</span>
                            <div class="flex flex-wrap gap-1.5">
                                <span v-for="skill in skillsProficiencies" :key="skill.id" 
                                      class="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                                    {{ skill.name }}
                                </span>
                            </div>
                        </div>

                         <div v-if="toolsProficiencies.length" class="space-y-2">
                            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Outils</span>
                            <div class="flex flex-wrap gap-1.5">
                                <span v-for="tool in toolsProficiencies" :key="tool.id" 
                                      class="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                                    {{ tool.name }}
                                </span>
                            </div>
                        </div>

                        <div v-if="languagesProficiencies.length" class="space-y-2">
                            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Langues</span>
                            <div class="flex flex-wrap gap-1.5">
                                <span v-for="lang in languagesProficiencies" :key="lang.id" 
                                      class="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                                    {{ lang.name }}
                                </span>
                            </div>
                        </div>

                         <div v-if="categorizedProficiencies.savingThrows.length > 0 && categorizedProficiencies.weapons" class="space-y-2">
                            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Équipement Martial</span>
                             <div class="flex flex-wrap gap-1.5">
                                <span v-for="w in categorizedProficiencies.weapons" :key="w" 
                                      class="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                                    {{ w }}
                                </span>
                            </div>
                         </div>

                          <div v-if="categorizedProficiencies.savingThrows.length > 0 && categorizedProficiencies.armor" class="space-y-2">
                            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Armures</span>
                             <div class="flex flex-wrap gap-1.5">
                                <span v-for="a in categorizedProficiencies.armor" :key="a" 
                                      class="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                                    {{ a }}
                                </span>
                            </div>
                         </div>


                          <div v-if="categorizedProficiencies.savingThrows.length > 0 && categorizedProficiencies.savingThrows" class="space-y-2">
                            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Jets de sauvegarde</span>
                             <div class="flex flex-wrap gap-1.5">
                                <span v-for="st in categorizedProficiencies.savingThrows" :key="st" 
                                      class="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                                    {{ st }}
                                </span>
                            </div>
                         </div>

                    </div>
               </div>
               
               <!-- Choix Spéciaux (Résumé) -->
               <div v-if="hasSpecialChoices" class="bg-zinc-900/50 rounded-xl border border-zinc-700/50 p-6 backdrop-blur-sm shadow-xl">
                   <h3 class="text-lg font-bold font-serif text-zinc-200 mb-4 flex items-center gap-2">
                        <span class="text-amber-500">⚡</span> Spécialisations
                    </h3>
                    <div class="space-y-4">
                         <div v-for="(items, key) in specialChoicesDisplay" :key="key" class="text-sm">
                             <div class="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{{ formatSpecialChoiceKey(key as string) }}</div>
                             <div class="flex flex-wrap gap-1.5">
                                <span v-for="item in items" :key="item"
                                      class="px-2.5 py-1 rounded bg-amber-900/10 text-amber-500 border border-amber-500/20 text-xs font-bold">
                                    {{ item }}
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
        :current-step="9" 
        :total-steps="9"
        step-name="Finalisation"
        @previous="$emit('prev')"
        @next="finalizeCharacter"
      />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { getTraitDescriptionCombined } from '@/utils/traits'
import { loadTraits } from '@/utils/dataLoader'
import StepNavigation from '../StepNavigation.vue'
import type { SRDRace } from '@/types/srd'
import type { Character } from '@/stores/app'

const props = defineProps<{
  character: Character
  selectedRace?: SRDRace | null
}>()

const emit = defineEmits(['prev', 'finalize'])

const srdTraits = ref<any[]>([])

onMounted(async () => {
  try {
    srdTraits.value = await loadTraits()
  } catch (error) {
    console.error('Erreur lors du chargement des traits SRD:', error)
  }
})

function formatSpecialChoiceKey(key: string): string {
    const map: Record<string, string> = {
        'fightingStyle': 'Style de Combat',
        'draconicAncestry': 'Ascendance Draconique',
        'favoredEnemies': 'Ennemis Jurés',
        'naturalExplorer': 'Explorateur-né',
        'expertise': 'Expertise'
    }
    return map[key] || key
}

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

const categorizedProficiencies = computed(() => {
  if (props.character.class.proficiencies === undefined) {
    return { armor: [], weapons: [], savingThrows: [] }
  }

  const armor: string[] = []
  const weapons: string[] = []
  const savingThrows: string[] = []

  props.character.class.proficiencies.forEach(prof => {
    const lowerProf = prof.index.toLowerCase()
    if (lowerProf.includes('armor') || lowerProf.includes('shield')) {
      armor.push(prof.name)
    } else if (lowerProf.includes('saving-throw')) {
      savingThrows.push(prof.name)
    } else {
      weapons.push(prof.name)
    }
  })

  return { armor, weapons, savingThrows }
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
  const abilityEnglishShortKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha']

  return abilityNames.map((name, index) => {
    const abilityKey = abilityNames[index] as keyof typeof props.character.abilities
    const abilityEnglishKey = abilityEnglishShortKeys[index]
    const baseValue: number = props.character.abilities[abilityKey] || 8

    const racialBonus = props.character.race.ability_bonuses?.find(bonus => bonus.ability_score.index === abilityEnglishKey)?.bonus || 0
    const subraceBonus = props.character.subrace?.abilityBonuses?.[name] || 0
    const finalValue = baseValue + racialBonus + subraceBonus
    
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
  if (!props.character.name) {
    alert("Veuillez donner un nom à votre personnage !");
    return;
  }
  emit('finalize', props.character)
  alert(`🎉 Personnage créé avec succès !\n\n${props.character.name} est prêt pour l'aventure !`)
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
</style>