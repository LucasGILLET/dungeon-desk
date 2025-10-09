<template>
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-4">
          <router-link to="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div class="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span class="text-lg">🎲</span>
            </div>
            <span class="text-lg font-semibold text-gray-900">DungeonDesk</span>
          </router-link>
          
          <span v-if="subtitle" class="text-gray-400">|</span>
          <span v-if="subtitle" :class="subtitleColor" class="font-medium">{{ subtitle }}</span>
        </div>

        <div class="flex items-center space-x-4">
          <slot name="actions">
            <button class="text-gray-600 hover:text-gray-900 transition-colors">
              Connexion
            </button>
            <button class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
              S'inscrire
            </button>
          </slot>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
interface Props {
  subtitle?: string
  subtitleColor?: string
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  subtitleColor: 'text-gray-600'
})
</script>
