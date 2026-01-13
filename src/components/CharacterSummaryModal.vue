<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold">Récapitulatif du Personnage</h2>
              <button
                @click="$emit('close')"
                class="text-white/80 hover:text-white transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Race -->
            <div v-if="character.race" class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Race</h3>
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span class="text-purple-600 font-bold text-lg">{{ character.race.name.charAt(0) }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ character.race.name }}</p>
                  <p class="text-sm text-gray-600">{{ character.race.alignment }}</p>
                </div>
              </div>
            </div>

            <!-- Subrace -->
            <div v-if="character.subrace" class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Sous-race</h3>
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 font-bold text-lg">{{ character.subrace.name.charAt(0) }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ character.subrace.name }}</p>
                  <p class="text-sm text-gray-600">{{ character.subrace.desc || 'Aucune description' }}</p>
                </div>
              </div>
            </div>

            <!-- Class -->
            <div v-if="character.class" class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Classe</h3>
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-600 font-bold text-lg">{{ character.class.name.charAt(0) }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ character.class.name }}</p>
                  <!-- <p class="text-sm text-gray-600">{{ character.class. }}d{{ character.class.hit_die }} PV</p> -->
                </div>
              </div>
            </div>

            <!-- Background -->
            <div v-if="character.background" class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Historique</h3>
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span class="text-yellow-600 font-bold text-lg">{{ character.background.name.charAt(0) }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ character.background.name }}</p>
                  <p class="text-sm text-gray-600">{{ character.background.starting_proficiencies.map(prof => prof.name).join(', ') || 'Aucune compétence' }}</p>
                </div>
              </div>
            </div>

            <!-- Abilities -->
            <div v-if="Object.keys(character.abilities).length > 0" class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Caractéristiques</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div v-for="(value, ability) in character.abilities" :key="ability" class="text-center">
                  <div class="bg-red-100 rounded-lg p-3">
                    <div class="text-2xl font-bold text-red-600">{{ value }}</div>
                    <div class="text-sm text-red-800 capitalize">{{ ability }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Subclass -->
            <div v-if="character.subclass" class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Sous-classe</h3>
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span class="text-indigo-600 font-bold text-lg">{{ character.subclass.name.charAt(0) }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ character.subclass.name }}</p>
                  <p class="text-sm text-gray-600">{{ character.subclass.desc?.[0] || 'Aucune description' }}</p>
                </div>
              </div>
            </div>

            <!-- Proficiencies -->
            <div v-if="character.allProficiencies && Object.keys(character.allProficiencies).length > 0" class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Maîtrises</h3>
              <div class="space-y-3">
                <div v-if="character.allProficiencies.skills?.length">
                  <p class="font-medium text-gray-700">Compétences:</p>
                  <p class="text-sm text-gray-600">{{ character.allProficiencies.skills.map((skill: any) => skill.name).join(', ') }}</p>
                </div>
                <div v-if="character.allProficiencies.languages?.length">
                  <p class="font-medium text-gray-700">Langues:</p>
                  <p class="text-sm text-gray-600">{{ character.allProficiencies.languages.map((language: any) => language.name).join(', ') }}</p>
                </div>
                <div v-if="character.allProficiencies.tools?.length">
                  <p class="font-medium text-gray-700">Outils:</p>
                  <p class="text-sm text-gray-600">{{ character.allProficiencies.tools.map((tool: any) => tool.name).join(', ') }}</p>
                </div>
              </div>
            </div>

            <!-- Special Choices -->
            <div v-if="character.specialChoices && Object.keys(character.specialChoices).length > 0" class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Choix Spéciaux</h3>
              <div class="space-y-2">
                <div v-for="(choices, key) in character.specialChoices" :key="key">
                  <p class="font-medium text-gray-700 capitalize">{{ key.toString().replace(/([A-Z])/g, ' $1').trim() }}:</p>
                  <p class="text-sm text-gray-600">{{ choices.join(', ') }}</p>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="!character.race && !character.class && !character.background && Object.keys(character.abilities).length === 0" class="text-center py-8">
              <p class="text-gray-500">Aucun choix effectué pour le moment.</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Character } from '@/stores/app';


interface Props {
  isOpen: boolean
  character: Character
}


const props = defineProps<Props>()

console.log('CharacterSummaryModal loaded', props.character);
    
defineEmits<{
  close: []
}>()
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