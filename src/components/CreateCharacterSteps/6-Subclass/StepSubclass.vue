<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 flex flex-col">
    <!-- En-tête -->
    <div class="text-center pt-8 pb-6">
      <h1 class="text-4xl font-bold text-white mb-2">⚡ Choix de la Sous-classe</h1>
      <p class="text-orange-100 text-lg">Spécialisez votre {{ character.class.name }} dès le niveau 1</p>
      <div v-if="character.subrace" class="mt-3">
        <span class="bg-orange-500/30 text-orange-100 px-3 py-1 rounded-full text-sm font-medium border border-orange-400/30">
          {{ character.subrace.name }} {{ character.class.name }}
        </span>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="flex-1 px-6 pb-8">
      <div class="max-w-6xl mx-auto">
        <!-- Grille des sous-classes -->
        <div :class="[
          'grid gap-6 mb-8',
          getGridColumns()
        ]">
          <div 
            v-for="subclass in availableSubclasses" 
            :key="subclass.id"
            @click="selectSubclass(subclass)"
            :class="[
              'subclass-card relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer group',
              selectedSubclass?.id === subclass.id 
                ? 'border-orange-400 bg-orange-500/20 transform scale-105' 
                : 'border-white/20 hover:border-orange-300/60 hover:bg-white/15'
            ]"
          >
            <!-- Badge de sélection -->
            <div v-if="selectedSubclass?.id === subclass.id" 
                 class="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <!-- Emoji et nom -->
            <div class="text-center mb-4">
              <div class="text-4xl mb-2">{{ getSubclassEmoji(subclass.id) }}</div>
              <h3 class="text-xl font-bold text-white mb-1">{{ subclass.name }}</h3>
              <p class="text-orange-200 text-sm">{{ subclass.source }}</p>
            </div>

            <!-- Description -->
            <div class="text-amber-100 text-sm leading-relaxed mb-4">
              {{ subclass.description }}
            </div>

            <!-- Caractéristiques de base -->
            <div class="space-y-3">
              <!-- Progression par niveau -->
              <div v-if="subclass.levelProgression?.length" class="bg-black/20 rounded-lg p-3">
                <h4 class="text-orange-300 text-xs font-semibold mb-2">📈 PROGRESSION</h4>
                <div class="space-y-2">
                  <div v-for="progression in subclass.levelProgression" :key="progression.level" class="text-white text-xs">
                    <div class="flex items-start gap-2">
                      <span class="bg-orange-500/30 text-orange-100 px-2 py-0.5 rounded text-xs font-semibold min-w-fit">
                        Niv {{ progression.level }}
                      </span>
                      <div class="flex-1">
                        <!-- Features -->
                        <div v-if="progression.features?.length" class="flex flex-wrap gap-1">
                          <div v-for="(feature, featureIndex) in progression.features" :key="`${progression.level}-feature-${feature}-${featureIndex}`" class="relative feature-tooltip-container">
                            <span :class="[
                              'px-2 py-0.5 rounded text-xs cursor-help feature-name',
                              getFeatureBadgeClasses(feature)
                            ]"
                                  @mouseenter="showFeatureTooltip"
                                  @mouseleave="hideFeatureTooltip">
                              {{ getDisplayName(feature) }}
                            </span>
                            <!-- Tooltip pour feature -->
                            <div class="feature-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 transition-opacity duration-200 pointer-events-none z-30 w-72 text-left">
                              <div :class="[
                                'font-semibold mb-1',
                                isSpellFeature(feature) ? 'text-purple-300' : 'text-blue-300'
                              ]">{{ getDisplayName(feature) }}</div>
                              <div class="text-xs text-gray-300 leading-relaxed">{{ getFeatureDescription(feature) }}</div>
                              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sorts supplémentaires (si pas de progression) -->
              <div v-else-if="subclass.bonusSpells?.length" class="bg-black/20 rounded-lg p-3">
                <h4 class="text-orange-300 text-xs font-semibold mb-2">📜 SORTS SUPPLÉMENTAIRES</h4>
                <div class="flex flex-wrap gap-1">
                  <div v-for="(spell, spellIndex) in subclass.bonusSpells" :key="`${subclass.id}-${spell}-${spellIndex}`" class="relative spell-tooltip-container">
                    <span class="bg-purple-500/30 text-purple-100 px-2 py-1 rounded text-xs cursor-help spell-name"
                          @mouseenter="showSpellTooltip"
                          @mouseleave="hideSpellTooltip">
                      {{ spell }}
                    </span>
                    <!-- Tooltip pour sort -->
                    <div class="spell-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 transition-opacity duration-200 pointer-events-none z-30 w-72 text-left">
                      <div class="font-semibold mb-1 text-purple-300">{{ spell }}</div>
                      <div class="text-xs text-gray-300 leading-relaxed">{{ getSpellDescription(spell) }}</div>
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message si pas de sous-classe nécessaire -->
        <div v-if="!needsSubclass" class="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <div class="text-6xl mb-4">✅</div>
          <h2 class="text-2xl font-bold text-white mb-2">Aucune sous-classe requise</h2>
          <p class="text-orange-200">
            La classe {{ character.class.name }} ne nécessite pas de choix de sous-classe au niveau 1.
          </p>
          <p class="text-orange-300 text-sm mt-2">
            Vous pourrez choisir votre spécialisation plus tard dans votre aventure !
          </p>
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

interface Character {
  name: string
  race: any
  subrace: any
  class: any
  subclass?: string
  background: string
  abilities: Record<string, number>
  level: number
}

const props = defineProps<{
  character: Character
}>()

const emit = defineEmits<{
  next: [payload: any]
  prev: []
}>()

const selectedSubclass = ref<SubclassData | null>(null)
const level1SubclassClasses = ref<string[]>([])

onMounted(async () => {
  // Classes qui nécessitent un choix de sous-classe au niveau 1
  level1SubclassClasses.value = await getLevel1SubclassClassIds()
})

const needsSubclass = computed(() => {
  console.log(props.character.class.index, level1SubclassClasses.value, level1SubclassClasses.value.includes(props.character.class.index))
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

function selectSubclass(subclass: SubclassData) {
  selectedSubclass.value = subclass
}

function validateSubclass() {
  if (!needsSubclass.value) {
    // Pas de sous-classe nécessaire, on continue
    emit('next', null)
  } else if (selectedSubclass.value) {
    // Sous-classe sélectionnée
    emit('next', selectedSubclass.value)
  }
}

// Fonctions pour gérer les tooltips de sorts
function showSpellTooltip(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target && target.parentElement) {
    const tooltip = target.parentElement.querySelector('.spell-tooltip')
    if (tooltip) {
      tooltip.classList.add('tooltip-visible')
    }
  }
}

function hideSpellTooltip(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target && target.parentElement) {
    const tooltip = target.parentElement.querySelector('.spell-tooltip')
    if (tooltip) {
      tooltip.classList.remove('tooltip-visible')
    }
  }
}

// Fonctions pour gérer les tooltips de features
function showFeatureTooltip(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target && target.parentElement) {
    const tooltip = target.parentElement.querySelector('.feature-tooltip')
    if (tooltip) {
      tooltip.classList.add('tooltip-visible')
    }
  }
}

function hideFeatureTooltip(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target && target.parentElement) {
    const tooltip = target.parentElement.querySelector('.feature-tooltip')
    if (tooltip) {
      tooltip.classList.remove('tooltip-visible')
    }
  }
}

// Fonction pour afficher un nom court dans l'interface
function getDisplayName(featureName: string): string {
  if (featureName.startsWith('Sorts de domaine')) {
    return 'Sorts de domaine'
  }
  if (featureName.startsWith('Sorts étendus')) {
    return 'Sorts étendus'
  }
  return featureName
}

// Fonction pour détecter si une feature est un sort
function isSpellFeature(featureName: string): boolean {
  return featureName.startsWith('Sorts de domaine') || featureName.startsWith('Sorts étendus')
}

// Fonction pour obtenir les classes CSS d'un badge de feature
function getFeatureBadgeClasses(featureName: string): string {
  if (isSpellFeature(featureName)) {
    return 'bg-purple-500/40 text-purple-100 border border-purple-400/30'
  }
  return 'bg-blue-500/30 text-blue-100'
}
</script>

<style scoped>
.subclass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.subclass-card.selected {
  box-shadow: 0 0 30px rgba(251, 146, 60, 0.4);
}

/* Styles spécifiques pour les tooltips de sorts */
.spell-tooltip-container {
  display: inline-block;
}

.spell-tooltip {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
}

.spell-tooltip.tooltip-visible {
  opacity: 1;
  visibility: visible;
}

/* Styles spécifiques pour les tooltips de features */
.feature-tooltip-container {
  display: inline-block;
}

.feature-tooltip {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
}

.feature-tooltip.tooltip-visible {
  opacity: 1;
  visibility: visible;
}

/* Empêcher les interactions de hover de la carte parent d'affecter les tooltips */
.subclass-card:hover .spell-tooltip:not(.tooltip-visible) {
  opacity: 0 !important;
  visibility: hidden !important;
}

.subclass-card:hover .feature-tooltip:not(.tooltip-visible) {
  opacity: 0 !important;
  visibility: hidden !important;
}
</style>
