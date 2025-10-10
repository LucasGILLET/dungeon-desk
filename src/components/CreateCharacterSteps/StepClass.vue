<template>
  <div class="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex flex-col">

    <!-- Classes en deux lignes : martiales et magiques -->
    <div class="flex flex-col justify-center px-4 my-auto">
      <!-- Toutes les classes -->
      <div class="mb-6">
        <div class="classes-container w-full grid grid-cols-6 gap-2 mb-4">
          <div 
            v-for="classe in allClasses" 
            :key="classe.id" 
            @click="selectClass(classe)"
            :class="[
              'class-card cursor-pointer bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 transition-all duration-100 ease-out',
              selectedClass?.id === classe.id 
                ? 'border-yellow-400 ring-4 ring-yellow-400/50 bg-white/25' 
                : 'border-white/20 hover:border-white/40'
            ]"
          >
            <!-- Contenu de la carte -->
            <div class="h-full flex flex-col items-center justify-center text-center">
              <!-- Image de la classe -->
              <div class="relative mb-4">
                <div class="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <span class="text-2xl">{{ getClassEmoji(classe.id) }}</span>
                </div>
                <!-- Badge sélectionné -->
                <div 
                  v-if="selectedClass?.id === classe.id"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <svg class="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              
              <!-- Nom de la classe -->
              <h3 class="text-lg font-bold text-white mb-2 class-name transition-all duration-300">
                {{ classe.name }}
              </h3>
              
              <!-- Description (visible au hover) -->
              <div class="class-details opacity-0 transition-all duration-300 overflow-hidden">
                <p class="text-sm text-orange-100 mb-3 leading-relaxed">
                  {{ classe.description }}
                </p>
                
                <!-- Caractéristiques principales -->
                <div class="flex flex-wrap justify-center gap-2 mb-3">
                  <span 
                    v-for="stat in classe.mainStats" 
                    :key="stat" 
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium border',
                      isMartialClass(classe.id) 
                        ? 'bg-red-500/30 text-red-100 border-red-400/30'
                        : 'bg-purple-500/30 text-purple-100 border-purple-400/30'
                    ]"
                  >
                    {{ stat }}
                  </span>
                </div>
                
                <!-- Difficulté -->
                <div class="flex justify-center">
                  <span 
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-bold',
                      classe.difficulty === 'Facile' ? 'bg-green-500/30 text-green-100 border border-green-400/30' :
                      classe.difficulty === 'Moyen' ? 'bg-yellow-500/30 text-yellow-100 border border-yellow-400/30' :
                      'bg-red-500/30 text-red-100 border border-red-400/30'
                    ]"
                  >
                    {{ classe.difficulty }}
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
              'opacity-50 cursor-not-allowed': !selectedClass
            }"
            @click="emit('next', selectedClass)"
          >
          <span class="flex items-center gap-2" >
            {{ selectedClass?.name ? "Continuer avec " + selectedClass.name : "Faites votre choix" }}
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
  height: 300px; /* Hauteur réduite pour un meilleur ajustement */
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
  max-height: 80px;
  overflow: hidden;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  next: [classe: any]
  prev: []
}>()

interface DndClass {
  id: string
  name: string
  description: string
  mainStats: string[]
  difficulty: 'Facile' | 'Moyen' | 'Difficile'
}

const classes: DndClass[] = [
  // Classes Martiales
  {
    id: 'guerrier',
    name: 'Guerrier',
    description: 'Maître des armes et de l\'armure, spécialiste du combat au corps à corps.',
    mainStats: ['Force', 'Constitution'],
    difficulty: 'Facile'
  },
  {
    id: 'roublard',
    name: 'Roublard',
    description: 'Expert en discrétion, crochetage et attaques sournoises.',
    mainStats: ['Dextérité', 'Intelligence'],
    difficulty: 'Moyen'
  },
  {
    id: 'rodeur',
    name: 'Rôdeur',
    description: 'Chasseur expert, à l\'aise en nature et à distance.',
    mainStats: ['Dextérité', 'Sagesse'],
    difficulty: 'Moyen'
  },
  {
    id: 'paladin',
    name: 'Paladin',
    description: 'Guerrier saint, alliant combat et magie divine.',
    mainStats: ['Force', 'Charisme'],
    difficulty: 'Moyen'
  },
  {
    id: 'barbare',
    name: 'Barbare',
    description: 'Combattant sauvage utilisant la rage comme arme.',
    mainStats: ['Force', 'Constitution'],
    difficulty: 'Facile'
  },
  {
    id: 'moine',
    name: 'Moine',
    description: 'Artiste martial utilisant l\'énergie interne.',
    mainStats: ['Dextérité', 'Sagesse'],
    difficulty: 'Difficile'
  },
  // Classes Magiques
  {
    id: 'magicien',
    name: 'Magicien',
    description: 'Manipulateur de la magie arcane, puissant mais fragile.',
    mainStats: ['Intelligence', 'Constitution'],
    difficulty: 'Difficile'
  },
  {
    id: 'clerc',
    name: 'Clerc',
    description: 'Guérisseur divin, soutien et protection du groupe.',
    mainStats: ['Sagesse', 'Constitution'],
    difficulty: 'Moyen'
  },
  {
    id: 'barde',
    name: 'Barde',
    description: 'Artiste magique, soutien polyvalent du groupe.',
    mainStats: ['Charisme', 'Dextérité'],
    difficulty: 'Moyen'
  },
  {
    id: 'sorcier',
    name: 'Ensorceleur',
    description: 'Magie innée puissante mais limitée en sorts.',
    mainStats: ['Charisme', 'Constitution'],
    difficulty: 'Difficile'
  },
  {
    id: 'occultiste',
    name: 'Occultiste',
    description: 'Pacte avec des entités d\'outre-monde pour la magie.',
    mainStats: ['Charisme', 'Constitution'],
    difficulty: 'Moyen'
  },
  {
    id: 'druide',
    name: 'Druide',
    description: 'Gardien de la nature, magie et métamorphose.',
    mainStats: ['Sagesse', 'Constitution'],
    difficulty: 'Difficile'
  }
]

// Séparation des classes en deux catégories
const martialClasses = classes.filter(c => 
  ['guerrier', 'roublard', 'rodeur', 'paladin', 'barbare', 'moine'].includes(c.id)
)

const magicalClasses = classes.filter(c => 
  ['magicien', 'clerc', 'barde', 'sorcier', 'occultiste', 'druide'].includes(c.id)
)

// Liste unifiée avec ordre : martiales puis magiques
const allClasses = [...martialClasses, ...magicalClasses]

const selectedClass = ref<DndClass | null>(null)

function selectClass(classe: DndClass) {
  selectedClass.value = classe
}

function isMartialClass(classId: string): boolean {
  return ['guerrier', 'roublard', 'rodeur', 'paladin', 'barbare', 'moine'].includes(classId)
}

function getClassEmoji(classId: string): string {
  const emojis: Record<string, string> = {
    'guerrier': '⚔️',
    'roublard': '🗡️',
    'magicien': '🔮',
    'clerc': '✨',
    'rodeur': '🏹',
    'paladin': '🛡️',
    'barde': '🎵',
    'barbare': '🪓',
    'sorcier': '⚡',
    'moine': '👊',
    'druide': '🌿',
    'demoniste': '👹'
  }
  return emojis[classId] || '❓'
}
</script>
