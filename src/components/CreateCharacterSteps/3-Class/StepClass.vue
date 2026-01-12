<template>
  <div class="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex flex-col">

    <!-- Classes en deux lignes : martiales et magiques -->
    <div class="flex flex-col justify-center px-4 my-auto">
      <!-- Toutes les classes -->
      <div class="mb-6">
        <div v-if="loading" class="text-center">
          <div class="text-white">Chargement des classes...</div>
        </div>
        <div v-if="error" class="text-center">
          <div class="text-red-400">{{ error }}</div>
        </div>
        <div class="classes-container w-full grid grid-cols-6 gap-2 mb-4">
          <div 
            v-for="classe in classes" 
            :key="classe.index" 
            @click="selectClass(classe)"
            :class="[
              'class-card cursor-pointer bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 transition-all duration-100 ease-out',
              selectedClass?.index === classe.index 
                ? 'border-yellow-400 ring-4 ring-yellow-400/50 bg-white/25 opacity-100' 
                : 'border-white/20 hover:border-white/40 opacity-50'
            ]"
              :style="{ backgroundImage: `url(${getImageUrl(classe.index + '.jpg')})` }"

          >
            <!-- Contenu de la carte -->
            <div class="h-full flex flex-col items-center justify-center text-center">
              <!-- Image de la classe -->
              <div class="relative mb-4">
                <!-- Badge sélectionné -->
                <div 
                  v-if="selectedClass?.index === classe.index"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <svg class="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              
              <!-- Nom de la classe -->
              <h3 class="text-lg backdrop-brightness-50 font-bold text-white mb-2 class-name transition-all duration-300">
                {{ classe.name }}
              </h3>
              
              <!-- Description (visible au hover) -->
              <div class="class-details opacity-0 transition-all duration-300 overflow-hidden">
                <p class="text-sm text-orange-100 mb-3 leading-relaxed">
                  {{ getClassDescription(classe) }}
                </p>
                
                <!-- Caractéristiques principales -->
                <div class="flex flex-wrap justify-center gap-2 mb-3">
                  <span 
                    v-for="stat in getClassMainStats(classe)" 
                    :key="stat" 
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium border',
                      isMartialClass(classe.index) 
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
                      getClassDifficulty(classe) === 'Facile' ? 'bg-green-500/30 text-green-100 border border-green-400/30' :
                      getClassDifficulty(classe) === 'Moyen' ? 'bg-yellow-500/30 text-yellow-100 border border-yellow-400/30' :
                      'bg-red-500/30 text-red-100 border border-red-400/30'
                    ]"
                  >
                    {{ getClassDifficulty(classe) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <StepNavigation 
      :current-step="3" 
      :total-steps="9"
      step-name="Classe"
      :disable-next="!selectedClass"
      @previous="emit('prev')"
      @next="emit('next', selectedClass!)"
    />
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
  background-color: rgba(0, 0, 0, 0.5);
}

.class-card:hover .class-name {
  font-size: 1.25rem;
}

/* Animation plus fluide */
.class-card {
  transition: all 0.35s ease-out;
  background-size: cover;
  background-position: center;
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
  top: 140px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  transition: opacity 0.35s ease-out;
  max-height: 170px;
  overflow: hidden;
  padding: 1px;
  border-radius: 4px;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StepNavigation from '../StepNavigation.vue'
import { loadClasses } from '@/utils/dataLoader'
import type { SRDClass } from '@/types/srd'

const emit = defineEmits<{
  next: [classe: SRDClass]
  prev: []
}>()

const classes = ref<SRDClass[]>([])
const selectedClass = ref<SRDClass | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    classes.value = await loadClasses()
  } catch (err) {
    error.value = 'Erreur lors du chargement des classes'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const getImageUrl = (file: any) => {
  return new URL(`../../../images/classes/${file}`, import.meta.url).href
}

function selectClass(classe: SRDClass) {
  selectedClass.value = classe
}

function isMartialClass(classIndex: string): boolean {
  // Classes martiales selon D&D 5e
  return ['barbarian', 'fighter', 'monk', 'paladin', 'ranger', 'rogue'].includes(classIndex)
}

function getClassDifficulty(cls: SRDClass): 'Facile' | 'Moyen' | 'Difficile' {
  // Logique simple basée sur la complexité des classes
  const easyClasses = ['barbarian', 'fighter']
  const hardClasses = ['wizard', 'druid', 'sorcerer']
  
  if (easyClasses.includes(cls.index)) return 'Facile'
  if (hardClasses.includes(cls.index)) return 'Difficile'
  return 'Moyen'
}

function getClassDescription(cls: SRDClass): string {
  // Descriptions simples pour chaque classe
  const descriptions: Record<string, string> = {
    'barbarian': 'Combattant sauvage utilisant la rage comme arme.',
    'bard': 'Artiste magique, soutien polyvalent du groupe.',
    'cleric': 'Guérisseur divin, soutien et protection du groupe.',
    'druid': 'Gardien de la nature, magie et métamorphose.',
    'fighter': 'Maître des armes et de l\'armure, spécialiste du combat.',
    'monk': 'Artiste martial utilisant l\'énergie interne.',
    'paladin': 'Guerrier saint, alliant combat et magie divine.',
    'ranger': 'Chasseur expert, à l\'aise en nature et à distance.',
    'rogue': 'Expert en discrétion, crochetage et attaques sournoises.',
    'sorcerer': 'Magie innée puissante mais limitée en sorts.',
    'warlock': 'Pacte avec des entités d\'outre-monde pour la magie.',
    'wizard': 'Manipulateur de la magie arcane, puissant mais fragile.'
  }
  return descriptions[cls.index] || 'Classe de personnage D&D 5e.'
}

function getClassMainStats(cls: SRDClass): string[] {
  // Retourne les statistiques principales recommandées pour chaque classe
  const statsMap: Record<string, string[]> = {
    'barbarian': ['Force', 'Constitution'],
    'bard': ['Charisme', 'Dextérité'],
    'cleric': ['Sagesse', 'Constitution'],
    'druid': ['Sagesse', 'Constitution'],
    'fighter': ['Force', 'Constitution'],
    'monk': ['Dextérité', 'Sagesse'],
    'paladin': ['Force', 'Charisme'],
    'ranger': ['Dextérité', 'Sagesse'],
    'rogue': ['Dextérité', 'Intelligence'],
    'sorcerer': ['Charisme', 'Constitution'],
    'warlock': ['Charisme', 'Constitution'],
    'wizard': ['Intelligence', 'Constitution']
  }
  return statsMap[cls.index] || ['Force']
}
</script>
