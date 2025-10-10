<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col">

    <!-- Historiques -->
    <div class="flex flex-col justify-center px-4 my-auto">
      <!-- Toutes les historiques -->
      <div class="mb-6">
        <div class="classes-container w-full grid grid-cols-6 gap-2 mb-4">
          <div 
            v-for="background in backgrounds" 
            :key="background.id" 
            @click="selectBackground(background)"
            :class="[
              'class-card cursor-pointer bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 transition-all duration-100 ease-out',
              selectedBackground?.id === background.id 
                ? 'border-yellow-400 ring-4 ring-yellow-400/50 bg-white/25' 
                : 'border-white/20 hover:border-white/40'
            ]"
          >
            <!-- Contenu de la carte -->
            <div class="h-full flex flex-col items-center justify-center text-center">
              <!-- Image de l'historique -->
              <div class="relative mb-4">
                <div class="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <span class="text-2xl">{{ getBackgroundEmoji(background.id) }}</span>
                </div>
                <!-- Badge sélectionné -->
                <div 
                  v-if="selectedBackground?.id === background.id"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <svg class="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              
              <!-- Nom de l'historique -->
              <h3 class="text-lg font-bold text-white mb-2 class-name transition-all duration-300">
                {{ background.name }}
              </h3>
              
              <!-- Description (visible au hover) -->
              <div class="class-details opacity-0 transition-all duration-300 overflow-hidden">
                <p class="text-sm text-blue-100 mb-3 leading-relaxed">
                  {{ background.description }}
                </p>
                
                <!-- Compétences -->
                <div class="flex flex-wrap justify-center gap-1 mb-3">
                  <span 
                    v-for="skill in background.skills" 
                    :key="skill" 
                    class="bg-indigo-500/30 text-indigo-100 px-2 py-1 rounded-full text-xs font-medium border border-indigo-400/30"
                  >
                    {{ skill }}
                  </span>
                </div>
                
                <!-- Équipement spécial -->
                <div class="flex justify-center">
                  <span class="bg-purple-500/30 text-purple-100 px-2 py-1 rounded-full text-xs font-medium border border-purple-400/30">
                    {{ background.equipment }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        
        <transition 
          enter-active-class="transition-all duration-100 ease-out"
          enter-from-class="opacity-0 translate-y-4 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
        >
          <button 
            class="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-100 hover:scale-105"
            :class="{
              'opacity-50 cursor-not-allowed': !selectedBackground
            }"
            @click="emit('next', selectedBackground)"
          >
          <span class="flex items-center gap-2" >
            {{ selectedBackground?.name ? "Continuer avec " + selectedBackground.name : "Faites votre choix" }}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </span>
        </button>
      </transition>
    </div>
    </div>
  </div>
</template>

<style scoped>
/* Effet d'agrandissement au hover */
.classes-container:hover .class-card {
  transform: scale(0.9);
  opacity: 0.4;
}

.classes-container:hover .class-card:hover {
  transform: scale(1.1);
  opacity: 1;
  z-index: 10;
}

/* Révélation du contenu au hover */
.class-card:hover .class-details {
  opacity: 1;
}

.class-card:hover .class-name {
  font-size: 1.25rem;
}

/* Animation plus fluide */
.class-card {
  transition: all 0.35s ease-out;
}

/* Stabilisation complète du contenu pour éviter les mouvements */
.class-card > div {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Positionnement absolu pour stabiliser complètement */
.class-card .relative {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
}

.class-card .class-name {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 90%;
  transition: font-size 0.35s ease-out;
}

.class-card .class-details {
  position: absolute;
  top: 130px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  transition: opacity 0.35s ease-out;
  max-height: 150px;
  overflow: hidden;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  next: [background: any]
  prev: []
}>()

interface DndBackground {
  id: string
  name: string
  description: string
  skills: string[]
  equipment: string
}

const backgrounds: DndBackground[] = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    description: 'Vous avez passé votre vie au service d\'un temple, apprenant les rites sacrés et les mystères divins.',
    skills: ['Religion', 'Perspicacité'],
    equipment: 'Symbole sacré'
  },
  {
    id: 'criminel',
    name: 'Criminel',
    description: 'Vous avez vécu en marge de la société, survivant grâce à vos activités illégales.',
    skills: ['Discrétion', 'Tromperie'],
    equipment: 'Outils de voleur'
  },
  {
    id: 'artisan',
    name: 'Artisan de Guilde',
    description: 'Membre d\'une guilde d\'artisans, vous maîtrisez un métier et connaissez les rouages du commerce.',
    skills: ['Perspicacité', 'Persuasion'],
    equipment: 'Outils d\'artisan'
  },
  {
    id: 'noble',
    name: 'Noble',
    description: 'Né dans la richesse et le privilège, vous comprenez les subtilités de la haute société.',
    skills: ['Histoire', 'Persuasion'],
    equipment: 'Sceau familial'
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Vous avez consacré votre vie à l\'étude, accumulant connaissances et sagesse.',
    skills: ['Arcanes', 'Histoire'],
    equipment: 'Parchemins'
  },
  {
    id: 'soldat',
    name: 'Soldat',
    description: 'Vous avez servi dans une armée, apprenant la discipline et les tactiques militaires.',
    skills: ['Athlétisme', 'Intimidation'],
    equipment: 'Insignes militaires'
  },
  {
    id: 'charlatan',
    name: 'Charlatan',
    description: 'Maître de la tromperie, vous savez convaincre les gens de croire en vos mensonges.',
    skills: ['Tromperie', 'Escamotage'],
    equipment: 'Kit de contrefaçon'
  },
  {
    id: 'artiste',
    name: 'Artiste',
    description: 'Vous divertissez les foules par votre art, que ce soit musique, théâtre ou autre.',
    skills: ['Spectacle', 'Acrobaties'],
    equipment: 'Instrument'
  },
  {
    id: 'ermite',
    name: 'Ermite',
    description: 'Vous avez vécu en isolement, méditant et découvrant d\'importantes vérités.',
    skills: ['Médecine', 'Religion'],
    equipment: 'Kit d\'herboriste'
  },
  {
    id: 'marin',
    name: 'Marin',
    description: 'Vous avez navigué sur les océans, affrontant tempêtes et créatures marines.',
    skills: ['Athlétisme', 'Perception'],
    equipment: 'Outils de navigateur'
  },
  {
    id: 'enfant_rues',
    name: 'Enfant des Rues',
    description: 'Vous avez grandi dans les rues, apprenant à survivre par vos propres moyens.',
    skills: ['Escamotage', 'Discrétion'],
    equipment: 'Couteau dissimulé'
  },
  {
    id: 'chasseur',
    name: 'Chasseur',
    description: 'Vous avez vécu en harmonie avec la nature, traquant le gibier et survivant en milieu sauvage.',
    skills: ['Survie', 'Dressage'],
    equipment: 'Piège à animaux'
  }
]

const selectedBackground = ref<DndBackground | null>(null)

function selectBackground(background: DndBackground) {
  selectedBackground.value = background
}

function getBackgroundEmoji(backgroundId: string): string {
  const emojis: Record<string, string> = {
    'acolyte': '⛪',
    'criminel': '🔓',
    'artisan': '🔨',
    'noble': '👑',
    'sage': '📚',
    'soldat': '⚔️',
    'charlatan': '🎭',
    'artiste': '🎨',
    'ermite': '🏔️',
    'marin': '⚓',
    'enfant_rues': '🏘️',
    'chasseur': '🏹'
  }
  return emojis[backgroundId] || '❓'
}
</script>
