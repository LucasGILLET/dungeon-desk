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
      <div v-if="errorMessage" class="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ errorMessage }}</span>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Adresse Email</label>
            <input id="email-address" name="email" type="email" autocomplete="email" required 
                v-model="email"
                class="appearance-none rounded-none relative block w-full px-3 py-3 border border-zinc-700 placeholder-zinc-500 text-zinc-300 bg-zinc-950/50 rounded-t-lg focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm transition-colors" 
                placeholder="Adresse Email" />
          </div>
          <div>
            <label for="password" class="sr-only">Mot de passe</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required 
                v-model="password"
                class="appearance-none rounded-none relative block w-full px-3 py-3 border border-zinc-700 placeholder-zinc-500 text-zinc-300 bg-zinc-950/50 rounded-b-lg focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm transition-colors" 
                placeholder="Mot de passe" />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-amber-600 focus:ring-amber-500 border-zinc-700 rounded bg-zinc-900">
            <label for="remember-me" class="ml-2 block text-sm text-zinc-400">
              Se souvenir de moi
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-amber-500 hover:text-amber-400">
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        <div>
          <button type="submit" :disabled="loading" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-amber-700 to-red-700 hover:from-amber-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all shadow-lg hover:shadow-amber-900/30">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <!-- Lock Icon -->
              <svg class="h-5 w-5 text-amber-300 group-hover:text-amber-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
            </span>
            <span v-if="loading">Connexion...</span>
            <span v-else>Ouvrir le portail</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleLogin = async () => {
    loading.value = true
    errorMessage.value = ''
    
    // Attempt login
    const result = await authStore.login(email.value, password.value)
    
    loading.value = false
    
    if (result.success) {
        router.push('/')
    } else {
        errorMessage.value = result.error
    }
}
</script>
