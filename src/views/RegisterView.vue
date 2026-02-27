<template>
  <div class="min-h-screen bg-zinc-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
    <!-- Background Effects -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-0 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-[128px]"></div>
        <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-[128px]"></div>
    </div>

    <div class="max-w-md w-full space-y-8 relative z-10 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 backdrop-blur-sm shadow-xl">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white font-serif tracking-wide">
          Inscrivez votre Nom
        </h2>
        <p class="mt-2 text-center text-sm text-zinc-400">
          Déjà inscrit dans les chroniques ? 
          <router-link to="/login" class="font-medium text-emerald-500 hover:text-emerald-400 underline transition-colors">
            Connectez-vous
          </router-link>
        </p>
      </div>
      <div v-if="errorMessage" class="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ errorMessage }}</span>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="name" class="sr-only">Nom du Joueur</label>
            <input id="name" name="name" type="text" required 
                v-model="name"
                class="appearance-none rounded-none relative block w-full px-3 py-3 border border-zinc-700 placeholder-zinc-500 text-zinc-300 bg-zinc-950/50 rounded-t-lg focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-colors" 
                placeholder="Nom du Joueur" />
          </div>
          <div>
            <label for="email-address" class="sr-only">Adresse Email</label>
            <input id="email-address" name="email" type="email" autocomplete="email" required 
                v-model="email"
                class="appearance-none rounded-none relative block w-full px-3 py-3 border border-zinc-700 placeholder-zinc-500 text-zinc-300 bg-zinc-950/50 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-colors" 
                placeholder="Adresse Email" />
          </div>
          <div>
            <label for="password" class="sr-only">Mot de passe</label>
            <input id="password" name="password" type="password" autocomplete="new-password" required 
                v-model="password"
                class="appearance-none rounded-none relative block w-full px-3 py-3 border border-zinc-700 placeholder-zinc-500 text-zinc-300 bg-zinc-950/50 rounded-b-lg focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-colors" 
                placeholder="Mot de passe" />
          </div>
        </div>

        <div class="flex items-center">
            <input id="terms" name="terms" type="checkbox" required class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-zinc-700 rounded bg-zinc-900">
            <label for="terms" class="ml-2 block text-sm text-zinc-400">
              J'accepte le <a href="#" class="text-emerald-500 hover:text-emerald-400">Code de Conduite</a> des aventuriers
            </label>
        </div>

        <div>
          <button type="submit" :disabled="loading" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-lg hover:shadow-emerald-900/30">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <!-- Pencil Icon -->
              <svg class="h-5 w-5 text-emerald-300 group-hover:text-emerald-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </span>
            <span v-if="loading">Création du profil...</span>
            <span v-else>Commencer l'aventure</span>
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

const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleRegister = async () => {
    loading.value = true
    errorMessage.value = ''

    const result = await authStore.register(name.value, email.value, password.value)
    
    loading.value = false

    if (result.success) {
        router.push('/login')
    } else {
        errorMessage.value = result.error
    }
}
</script>
