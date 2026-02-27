<template>
  <div class="min-h-screen bg-zinc-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
    <!-- Background Effects -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-[128px]"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[128px]"></div>
    </div>

    <div class="max-w-md w-full space-y-8 relative z-10 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 backdrop-blur-sm shadow-xl">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white font-serif tracking-wide">
          Bon retour, Voyageur
        </h2>
        <p class="mt-2 text-center text-sm text-zinc-400">
          Ou 
          <router-link to="/register" class="font-medium text-amber-500 hover:text-amber-400 underline transition-colors">
            commencez votre légende aujourd'hui
          </router-link>
        </p>
      </div>

      <div class="mt-8">
        <button @click="handleLogin" :disabled="loading" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-amber-700 to-red-700 hover:from-amber-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all shadow-lg hover:shadow-amber-900/30">
          <span class="absolute left-0 inset-y-0 flex items-center pl-3">
            <!-- Lock Icon -->
            <svg class="h-5 w-5 text-amber-300 group-hover:text-amber-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
          </span>
          <span v-if="loading">Redirection...</span>
          <span v-else>Se connecter avec Auth0</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const loading = ref(false)

const handleLogin = async () => {
    loading.value = true
    await authStore.login()
}
</script>
