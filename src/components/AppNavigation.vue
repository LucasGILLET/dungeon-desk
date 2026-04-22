<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import DiceRollerTrigger from '@/components/DiceRollerTrigger.vue'

const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)
</script>

<template>
  <nav class="fixed inset-x-0 top-0 z-50 border-b border-amber-900/30 bg-zinc-950/80 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20 gap-2">
        <div class="flex gap-4">
          <router-link to="/" class="flex items-center space-x-3 group cursor-pointer min-w-0">
            <img src="/logo.svg" alt="DungeonDesk Logo" class="xl:block w-22 h-10 sm:w-40 sm:h-15 rounded-lg" />
          </router-link>

          <div class="font-serif hidden xl:flex items-center gap-1 rounded-2xl px-2 py-2">
            <router-link to="/character-creator" active-class="border-amber-500/30 bg-amber-500/10 text-amber-50 shadow-[0_0_20px_rgba(245,158,11,0.12)]" class="rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-zinc-200/80 transition-all hover:-translate-y-0.5 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-50">Création PJ</router-link>
            <router-link to="/npc-generator" active-class="border-amber-500/30 bg-amber-500/10 text-amber-50 shadow-[0_0_20px_rgba(245,158,11,0.12)]" class="rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-zinc-200/80 transition-all hover:-translate-y-0.5 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-50">Générateur PNJ</router-link>
            <router-link to="/gm-dashboard" active-class="border-amber-500/30 bg-amber-500/10 text-amber-50 shadow-[0_0_20px_rgba(245,158,11,0.12)]" class="rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-zinc-200/80 transition-all hover:-translate-y-0.5 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-50">Tableau MJ</router-link>
            <router-link to="/combat-cheat-sheet" active-class="border-amber-500/30 bg-amber-500/10 text-amber-50 shadow-[0_0_20px_rgba(245,158,11,0.12)]" class="rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-zinc-200/80 transition-all hover:-translate-y-0.5 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-50">Aide Combat</router-link>
          </div>
        </div>

        <div class="hidden xl:flex items-center gap-2 sm:gap-4 shrink-0">
          <DiceRollerTrigger variant="inline" />
          <template v-if="!isAuthenticated">
            <button @click="authStore.login()" class="text-amber-100/70 hover:text-amber-400 font-serif tracking-wider transition-colors text-xs sm:text-sm uppercase">Connexion</button>
            <button @click="authStore.login({ authorizationParams: { screen_hint: 'signup' } })" class="relative px-3 sm:px-6 py-2 group overflow-hidden rounded-lg">
              <span class="absolute inset-0 w-full h-full bg-linear-to-r from-amber-700 to-amber-600 opacity-80 group-hover:opacity-100 transition-opacity"></span>
              <span class="absolute bottom-0 left-0 w-full h-1/4 bg-linear-to-t from-black/20 to-transparent"></span>
              <span class="relative text-amber-50 font-serif font-bold tracking-wide text-xs sm:text-sm flex items-center gap-2">
                <span class="hidden sm:inline">Rejoignez l'Aventure</span>
                <span class="sm:hidden">Inscription</span>
              </span>
            </button>
          </template>
          <template v-else>
            <router-link to="/profile" class="flex items-center gap-3 bg-zinc-900/50 border border-amber-900/30 px-4 py-2 rounded-full hover:bg-zinc-800 transition-colors">
              <div class="w-8 h-8 rounded-full overflow-hidden border border-amber-500/30">
                <img v-if="user?.picture" :src="user.picture" alt="Avatar" class="w-full h-full object-cover">
                <div v-else class="w-full h-full bg-amber-900/50 flex items-center justify-center text-amber-500 font-bold">
                  {{ user?.name?.charAt(0) }}
                </div>
              </div>
              <span class="text-amber-100 font-serif hidden sm:inline">{{ user?.name }}</span>
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
