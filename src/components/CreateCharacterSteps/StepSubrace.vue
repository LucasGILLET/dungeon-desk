<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
    <div class="flex flex-col justify-center px-4 my-auto">
      
      <!-- En-tête avec bouton retour -->
      <div class="text-center mb-8">
        <button 
          @click="$emit('previous')" 
          class="text-blue-300 hover:text-blue-100 transition-colors mb-4 flex items-center mx-auto"
        >
          <svg class="w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Retour aux races
        </button>
        
        <h2 class="text-4xl font-bold text-white mb-2">{{ selectedRace?.name }}</h2>
        <p class="text-xl text-blue-100">Choisissez votre sous-race</p>
      </div>
      
      <!-- Grille des sous-races -->
      <div class="subraces-container w-full max-w-7xl mx-auto mb-8">
        <div 
          :class="[
            'grid gap-6',
            availableSubraces.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' :
            availableSubraces.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
            availableSubraces.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          ]"
        >
          <div 
            v-for="subrace in availableSubraces" 
            :key="subrace.id" 
            @click="selectSubrace(subrace)"
            :class="[
              'subrace-card cursor-pointer bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 transition-all duration-300 ease-out',
              selectedSubrace?.id === subrace.id 
                ? 'border-yellow-400 ring-4 ring-yellow-400/50 bg-white/25' 
                : 'border-white/20 hover:border-white/40'
            ]"
          >
            <!-- Contenu de la carte -->
            <div class="h-full flex flex-col text-left">
              <!-- En-tête avec emoji et sélection -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                  <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mr-4">
                    <span class="text-3xl">{{ getSubraceEmoji(subrace.id) }}</span>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white mb-1">{{ subrace.name }}</h3>
                    <div class="flex items-center gap-2 text-sm">
                      <span class="bg-blue-500/30 text-blue-100 px-2 py-1 rounded text-xs">{{ subrace.size }}</span>
                      <span class="bg-green-500/30 text-green-100 px-2 py-1 rounded text-xs">{{ subrace.speed }}</span>
                    </div>
                  </div>
                </div>
                <!-- Badge sélectionné -->
                <div 
                  v-if="selectedSubrace?.id === subrace.id"
                  class="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <svg class="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              
              <!-- Description -->
              <p class="text-sm text-blue-100 mb-4 leading-relaxed">
                {{ subrace.description }}
              </p>
              
              <!-- Bonus de caractéristiques -->
              <div class="mb-4">
                <h4 class="text-sm font-semibold text-white mb-2">Augmentation de caractéristiques</h4>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="(bonus, stat) in subrace.abilityBonuses" 
                    :key="stat"
                    class="bg-yellow-500/30 text-yellow-100 px-3 py-1 rounded-full text-sm font-medium border border-yellow-400/30"
                  >
                    {{ stat }} +{{ bonus }}
                  </span>
                </div>
              </div>
              
              <!-- Vision -->
              <div class="mb-4">
                <h4 class="text-sm font-semibold text-white mb-2">Vision</h4>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="vision in subrace.vision" 
                    :key="vision"
                    class="bg-purple-500/30 text-purple-100 px-2 py-1 rounded text-xs"
                  >
                    {{ vision }}
                  </span>
                </div>
              </div>
              
              <!-- Langues -->
              <div class="mb-4">
                <h4 class="text-sm font-semibold text-white mb-2">Langues</h4>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="language in subrace.languages" 
                    :key="language"
                    class="bg-indigo-500/30 text-indigo-100 px-2 py-1 rounded text-xs"
                  >
                    {{ language }}
                  </span>
                </div>
              </div>
              
              <!-- Traits spéciaux -->
              <div class="flex-1">
                <h4 class="text-sm font-semibold text-white mb-2">Traits</h4>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="trait in subrace.traits" 
                    :key="trait"
                    class="relative bg-emerald-500/30 text-emerald-100 px-2 py-1 rounded text-xs leading-relaxed cursor-help group"
                  >
                    {{ trait }}
                    <!-- Tooltip personnalisé -->
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64 text-center">
                      {{ getTraitDescription(trait) }}
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bouton de validation -->
      <div class="flex justify-center">
        <button 
          class="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-100 hover:scale-105"
          :class="{
            'opacity-50 cursor-not-allowed': !selectedSubrace
          }"
          @click="validateSelection"
          :disabled="!selectedSubrace"
        >
          <span class="flex items-center gap-2">
            {{ selectedSubrace ? `Continuer avec ${selectedSubrace!.name}` : "Sélectionnez une sous-race" }}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation des sous-races */
.subrace-card:hover {
  transform: none;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Animation plus fluide */
.subrace-card {
  transition: all 0.3s ease-out;
  min-height: 420px;
}

/* Stabilisation complète du contenu */
.subrace-card > div {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getTraitDescription } from '@/utils/traits'

interface Subrace {
  id: string
  name: string
  description: string
  abilityBonuses: Record<string, number>
  size: string
  speed: string
  vision: string[]
  languages: string[]
  traits: string[]
  parentRace: string
}

interface Race {
  id: string
  name: string
  description: string
  stats: string[]
}

// Props
const props = defineProps<{
  selectedRace: Race | null
}>()

// Événements
const emit = defineEmits<{
  next: [subrace: Subrace]
  previous: []
}>()

// État local
const selectedSubrace = ref<Subrace | null>(null)

// Toutes les sous-races disponibles
const subraces: Subrace[] = [
  // Sous-races humaines
  {
    id: 'humain-standard',
    name: 'Humain',
    description: 'Équilibré et polyvalent, bon dans tous les domaines.',
    abilityBonuses: { 'Force': 1, 'Dextérité': 1, 'Constitution': 1, 'Intelligence': 1, 'Sagesse': 1, 'Charisme': 1 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision normale'],
    languages: ['Commun', 'Une langue de votre choix'],
    traits: [],
    parentRace: 'humain'
  },
  {
    id: 'humain-variant',
    name: 'Humain (don)',
    description: 'Plus spécialisé avec un don gratuit au niveau 1. Choisissez deux caractéristiques différentes pour un bonus de +1 chacune.',
    abilityBonuses: { },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision normale'],
    languages: ['Commun', 'Une langue de votre choix'],
    traits: ['Don gratuit', 'Compétence supplémentaire', '+1 à deux caractéristiques au choix'],
    parentRace: 'humain'
  },
  
  // Sous-races elfiques
  {
    id: 'haut-elfe',
    name: 'Haut-elfe',
    description: 'Maîtres de la magie arcane et des traditions anciennes.',
    abilityBonuses: { 'Dextérité': 2, 'Intelligence': 1 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Elfique', 'Une langue de votre choix'],
    traits: ['Sens aiguisés', 'Ascendance féerique', 'Transe', 'Entraînement aux armes elfiques', 'Sort mineur'],
    parentRace: 'elfe'
  },
  {
    id: 'elfe-des-bois',
    name: 'Elfe des bois',
    description: 'Gardiens de la nature, experts en survie et discrétion.',
    abilityBonuses: { 'Dextérité': 2, 'Sagesse': 1 },
    size: 'M',
    speed: '10.5 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Elfique'],
    traits: ['Sens aiguisés', 'Ascendance féerique', 'Transe', 'Entraînement aux armes elfiques', 'Camouflage naturel'],
    parentRace: 'elfe'
  },
  {
    id: 'elfe-noir',
    name: 'Elfe noir',
    description: 'Elfes des ténèbres, maîtres de la magie noire.',
    abilityBonuses: { 'Dextérité': 2, 'Charisme': 1 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision dans le noir supérieure (36 m)'],
    languages: ['Commun', 'Elfique'],
    traits: ['Sens aiguisés', 'Ascendance féerique', 'Transe', 'Sensibilité au soleil', 'Magie drow', 'Entraînement aux armes drow'],
    parentRace: 'elfe'
  },
  
  // Sous-races naines
  {
    id: 'nain-des-collines',
    name: 'Nain des collines',
    description: 'Plus sages et résistants, avec une intuition naturelle.',
    abilityBonuses: { 'Constitution': 2, 'Sagesse': 1 },
    size: 'M',
    speed: '7.5 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Nain'],
    traits: ['Résistance naine', 'Entraînement aux armes naines', 'Connaissance de la pierre', 'Maîtrise des outils', 'Ténacité naine'],
    parentRace: 'nain'
  },
  {
    id: 'nain-des-montagnes',
    name: 'Nain des montagnes',
    description: 'Guerriers robustes, maîtres de l\'armure et du combat.',
    abilityBonuses: { 'Constitution': 2, 'Force': 2 },
    size: 'M',
    speed: '7.5 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Nain'],
    traits: ['Résistance naine', 'Entraînement aux armes naines', 'Connaissance de la pierre', 'Maîtrise des outils', 'Maîtrise des armures légères et moyennes'],
    parentRace: 'nain'
  },
  
  // Sous-races halfelins
  {
    id: 'halfelin-pied-leger',
    name: 'Halfelin pied-léger',
    description: 'Discrets et agiles, excellents pour l\'infiltration.',
    abilityBonuses: { 'Dextérité': 2, 'Charisme': 1 },
    size: 'P',
    speed: '7.5 m/round',
    vision: ['Vision normale'],
    languages: ['Commun', 'Halfelin'],
    traits: ['Chance halfeline', 'Bravoure', 'Agilité halfeline', 'Discrétion naturelle'],
    parentRace: 'halfelin'
  },
  {
    id: 'halfelin-robuste',
    name: 'Halfelin robuste',
    description: 'Plus résistants aux éléments et aux poisons.',
    abilityBonuses: { 'Dextérité': 2, 'Constitution': 1 },
    size: 'P',
    speed: '7.5 m/round',
    vision: ['Vision normale'],
    languages: ['Commun', 'Halfelin'],
    traits: ['Chance halfeline', 'Bravoure', 'Agilité halfeline', 'Résistance des robustes'],
    parentRace: 'halfelin'
  },
  
  // Sous-races gnomes
  {
    id: 'gnome-des-forets',
    name: 'Gnome des forêts',
    description: 'Petits mais ingénieux, dotés de magie naturelle.',
    abilityBonuses: { 'Intelligence': 2, 'Dextérité': 1 },
    size: 'P',
    speed: '7.5 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Gnome'],
    traits: ['Ruse gnome', 'Communication avec les petits animaux', 'Illusionniste-né'],
    parentRace: 'gnome'
  },
  {
    id: 'gnome-des-roches',
    name: 'Gnome des roches',
    description: 'Inventeurs et mécaniciens, maîtres de la technologie.',
    abilityBonuses: { 'Intelligence': 2, 'Constitution': 1 },
    size: 'P',
    speed: '7.5 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Gnome'],
    traits: ['Ruse gnome', 'Connaissance en ingénierie', 'Bricoleur'],
    parentRace: 'gnome'
  },
  
  // Autres races (une seule sous-race chacune)
  {
    id: 'drakeide-standard',
    name: 'Drakéide',
    description: 'Descendants des dragons, fiers et puissants.',
    abilityBonuses: { 'Force': 2, 'Charisme': 1 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision normale'],
    languages: ['Commun', 'Draconique'],
    traits: ['Ascendance draconique'],
    parentRace: 'drakéide'
  },
  {
    id: 'demi-elfe-standard',
    name: 'Demi-elfe',
    description: 'Héritiers de deux mondes, adaptables et charismatiques.',
    abilityBonuses: { 'Charisme': 2 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Elfique', 'Une langue de votre choix'],
    traits: ['Ascendance féerique', 'Polyvalence'],
    parentRace: 'demi-elfe'
  },
  {
    id: 'demi-orc-standard',
    name: 'Demi-orc',
    description: 'Puissants guerriers avec une rage intérieure.',
    abilityBonuses: { 'Force': 2, 'Constitution': 1 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Orc'],
    traits: ['Menaçant', 'Endurance implacable', 'Attaques sauvages'],
    parentRace: 'demi-orc'
  },
  {
    id: 'tieffelin-standard',
    name: 'Tieffelin',
    description: 'Marqués par l\'héritage infernal, mais non maléfiques.',
    abilityBonuses: { 'Charisme': 2, 'Intelligence': 1 },
    size: 'M',
    speed: '9 m/round',
    vision: ['Vision dans le noir (18 m)'],
    languages: ['Commun', 'Infernal'],
    traits: ['Résistance infernale', 'Ascendance infernale'],
    parentRace: 'tieffelin'
  }
]

// Sous-races disponibles pour la race sélectionnée
const availableSubraces = computed(() => {
  if (!props.selectedRace) return []
  return subraces.filter(subrace => subrace.parentRace === props.selectedRace!.id)
})

function selectSubrace(subrace: Subrace) {
  selectedSubrace.value = subrace
}

function validateSelection() {
  if (selectedSubrace.value) {
    emit('next', selectedSubrace.value)
  }
}

function getSubraceEmoji(subraceId: string): string {
  const emojis: Record<string, string> = {
    'humain-standard': '👤',
    'humain-variant': '🎯',
    'haut-elfe': '✨',
    'elfe-des-bois': '🌲',
    'elfe-noir': '🌙',
    'nain-des-collines': '🏔️',
    'nain-des-montagnes': '⛰️',
    'halfelin-pied-leger': '👣',
    'halfelin-robuste': '💪',
    'gnome-des-forets': '�',
    'gnome-des-roches': '⚙️',
    'drakeide-standard': '�',
    'demi-elfe-standard': '✨',
    'demi-orc-standard': '💪',
    'tieffelin-standard': '😈'
  }
  return emojis[subraceId] || '❓'
}

</script>
