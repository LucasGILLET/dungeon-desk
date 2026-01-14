<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click="$emit('close')">
        <div class="bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border-2 border-white/20" @click.stop>
          <!-- Header -->
          <div class="p-6 border-b border-white/20">
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <img :src="getImageUrl(classe.index + '.jpg')" :alt="getTranslatedClassName(classe.name)" class="w-12 h-12 rounded-full object-cover">
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white">{{ getTranslatedClassName(classe.name) }}</h2>
                  <p class="text-orange-200">{{ getClassDifficulty(classe) }} • {{ isMartialClass(classe.index) ? 'Classe martiale' : 'Classe magique' }}</p>
                </div>
              </div>
              <button @click="$emit('close')" class="text-white/70 hover:text-white transition-colors">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 max-h-[calc(80vh)] overflow-hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full space-y-6 max-h-[calc(80vh)] overflow-y-auto">
              <!-- Informations principales -->
              <div class="">
                <!-- Description -->
                <div>
                  <h3 class="text-xl font-bold text-white mb-3">Description</h3>
                  <p class="text-orange-100 leading-relaxed">{{ getClassDescription(classe) }}</p>
                </div>

                <!-- Caractéristiques principales -->
                <div>
                  <h3 class="text-xl font-bold text-white mb-3">Caractéristiques principales</h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="stat in getClassMainStats(classe)"
                      :key="stat"
                      :class="[
                        'px-3 py-1 rounded-full text-sm font-medium border',
                        isMartialClass(classe.index)
                          ? 'bg-red-500/30 text-red-100 border-red-400/30'
                          : 'bg-purple-500/30 text-purple-100 border-purple-400/30'
                      ]"
                    >
                      {{ stat }}
                    </span>
                  </div>
                </div>

                <!-- Informations générales -->
                <div>
                  <h3 class="text-xl font-bold text-white mb-3">Informations générales</h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white/10 rounded-lg p-3">
                      <div class="text-orange-200 text-sm">Points de vie initiaux</div>
                      <div class="text-white font-bold text-lg">{{ classe.hit_die }}</div>
                    </div>
                    <div class="bg-white/10 rounded-lg p-3">
                      <div class="text-orange-200 text-sm">Sous-classes disponibles</div>
                      <div class="text-white font-bold text-lg">{{ classe.subclasses?.length || 0 }}</div>
                    </div>
                  </div>
                </div>

                <!-- Maîtrises -->
                <div>
                  <h3 class="text-xl font-bold text-white mb-3">Maîtrises</h3>
                  <div class="bg-white/10 rounded-lg p-3">
                    <div v-if="!classProficiencies" class="text-gray-400 text-sm">
                      Chargement des maîtrises...
                    </div>
                    <div v-else>
                      <!-- Armures et boucliers -->
                      <div v-if="categorizedProficiencies.armor.length > 0" class="mb-4">
                        <h4 class="text-orange-200 font-semibold mb-2">Armures et boucliers</h4>
                        <div class="flex flex-wrap gap-2">
                          <span
                            v-for="proficiency in categorizedProficiencies.armor"
                            :key="proficiency"
                            class="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/30 text-blue-100 border border-blue-400/30"
                          >
                            {{ proficiency }}
                          </span>
                        </div>
                      </div>
                      
                      <!-- Armes -->
                      <div v-if="categorizedProficiencies.weapons.length > 0" class="mb-4">
                        <h4 class="text-orange-200 font-semibold mb-2">Armes</h4>
                        <div class="flex flex-wrap gap-2">
                          <span
                            v-for="proficiency in categorizedProficiencies.weapons"
                            :key="proficiency"
                            class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/30 text-green-100 border border-green-400/30"
                          >
                            {{ proficiency }}
                          </span>
                        </div>
                      </div>
                      
                      <!-- Jets de sauvegarde -->
                      <div v-if="categorizedProficiencies.savingThrows.length > 0" class="mb-4">
                        <h4 class="text-orange-200 font-semibold mb-2">Jets de sauvegarde</h4>
                        <div class="flex flex-wrap gap-2">
                          <span
                            v-for="proficiency in categorizedProficiencies.savingThrows"
                            :key="proficiency"
                            class="px-3 py-1 rounded-full text-sm font-medium bg-red-500/30 text-red-100 border border-red-400/30"
                          >
                            {{ proficiency }}
                          </span>
                        </div>
                      </div>
                      
                      <!-- Autres maîtrises -->
                      <div v-if="categorizedProficiencies.other.length > 0">
                        <h4 class="text-orange-200 font-semibold mb-2">Autres</h4>
                        <div class="flex flex-wrap gap-2">
                          <span
                            v-for="proficiency in categorizedProficiencies.other"
                            :key="proficiency"
                            class="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/30 text-purple-100 border border-purple-400/30"
                          >
                            {{ proficiency }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Capacités -->
              <div class="">
                <h3 class="text-xl font-bold text-white mb-3">Capacités</h3>
                <div class="space-y-6 max-h-[calc(60vh)] overflow-y-auto">
                  <!-- Niveau 1 (mis en avant) -->
                  <div v-if="displayedFeatures[1] && displayedFeatures[1].length > 0">
                    <h4 class="text-lg font-bold text-orange-200 mb-3 flex items-center">
                      <span class="bg-orange-500/30 text-orange-100 px-3 py-1 rounded-full text-sm font-medium mr-3">
                        Niveau 1
                      </span>
                      <span>Capacités principales</span>
                    </h4>
                    <div class="space-y-3">
                      <div v-for="feature in displayedFeatures[1]" :key="feature.index"
                          class="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-400/30 rounded-lg p-4">
                        <div class="flex justify-between items-start mb-2">
                          <h5 class="text-orange-100 font-semibold">{{ feature.name }}</h5>
                        </div>
                        <div class="text-gray-300 text-sm">
                          <div v-for="desc in feature.desc" :key="desc" class="mb-2">
                            {{ desc }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Autres niveaux -->
                  <div v-for="level in Object.keys(displayedFeatures).filter(l => parseInt(l) > 1).sort((a, b) => parseInt(a) - parseInt(b))" :key="level">
                    <h4 class="text-lg font-semibold text-purple-200 mb-3">
                      Niveau {{ level }}
                    </h4>
                    <div class="space-y-3">
                      <div v-for="feature in displayedFeatures[parseInt(level)]" :key="feature.index"
                          class="bg-white/10 rounded-lg p-4">
                        <div class="flex justify-between items-start mb-2">
                          <h5 class="text-purple-200 font-semibold">{{ feature.name }}</h5>
                        </div>
                        <div class="text-gray-300 text-sm">
                          <div v-for="desc in feature.desc" :key="desc" class="mb-2">
                            {{ desc }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="Object.keys(displayedFeatures).length === 0" class="text-center text-gray-400 py-4">
                    <div class="text-sm">Aucune capacité disponible</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { SRDClass } from '@/types/srd'
import { getClassDescription, getClassMainStats, getClassDifficulty, isMartialClass } from '@/utils/classes'
import { getAllFeaturesByClass } from '@/utils/features'
import { getClassProficiencies, type ProficiencyData } from '@/utils/proficiencies'

interface Props {
  show: boolean
  classe: SRDClass
}

const props = defineProps<Props>()
defineEmits<{
  close: []
}>()

const getImageUrl = (file: string) => {
  return new URL(`../../../images/classes/${file}`, import.meta.url).href
}

const getTranslatedClassName = (englishName: string): string => {
  const translations: Record<string, string> = {
    'Barbarian': 'Barbare',
    'Bard': 'Barde',
    'Cleric': 'Clerc',
    'Druid': 'Druide',
    'Fighter': 'Guerrier',
    'Monk': 'Moine',
    'Paladin': 'Paladin',
    'Ranger': 'Rôdeur',
    'Rogue': 'Roublard',
    'Sorcerer': 'Ensorceleur',
    'Warlock': 'Occultiste',
    'Wizard': 'Magicien'
  }

  return translations[englishName] || englishName
}

const displayedFeatures = ref<Record<number, any[]>>({})
const classProficiencies = ref<string[] | null>(null)

const categorizedProficiencies = computed(() => {
  if (!classProficiencies.value) {
    return { armor: [], weapons: [], savingThrows: [], other: [] }
  }

  const armor: string[] = []
  const weapons: string[] = []
  const savingThrows: string[] = []
  const other: string[] = []

  classProficiencies.value.forEach(prof => {
    const lowerProf = prof.toLowerCase()
    if (lowerProf.includes('armure') || lowerProf.includes('bouclier')) {
      armor.push(prof)
    } else if (lowerProf.includes('jets de sauvegarde')) {
      savingThrows.push(prof)
    } else {
      weapons.push(prof)
    }
  })

  return { armor, weapons, savingThrows, other }
})

const loadFeatures = async () => {
  if (props.classe) {
    try {
      const allFeatures = await getAllFeaturesByClass(props.classe.index)
      
      const mainFeatures = allFeatures.filter(feature => 
        !feature.parent && 
        (!feature.subclass || feature.index.includes('archetype'))
      )
      
      const featuresByLevel: Record<number, any[]> = {}
      mainFeatures.forEach(feature => {
        if (!featuresByLevel[feature.level]) {
          featuresByLevel[feature.level] = []
        }
        featuresByLevel[feature.level]!.push(feature)
      })
      
      displayedFeatures.value = featuresByLevel

      const proficiencies = await getClassProficiencies(props.classe.index)
      classProficiencies.value = proficiencies

    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      displayedFeatures.value = {}
      classProficiencies.value = null
    }
  }
}

watch(() => props.classe, loadFeatures)
watch(() => props.show, (newShow) => {
  if (newShow) {
    console.log('Modale ouverte pour la classe:', props.classe?.name)
    loadFeatures()
  }
})

onMounted(() => {
  console.log('Composant monté')
  if (props.show && props.classe) {
    loadFeatures()
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>