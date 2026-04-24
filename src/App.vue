<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import AppNavigation from '@/components/AppNavigation.vue'
import DiceRollerPanel from '@/components/DiceRollerPanel.vue'
import { openDiceRoller } from '@/composables/useDiceRoller'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { closeGlobalMenuDrawer, toggleGlobalMenuDrawer, useGlobalMenuDrawer } from '@/composables/useGlobalMenuDrawer'

const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)
const { isOpen: isMobileMenuOpen } = useGlobalMenuDrawer()

function closeMobileMenu() {
  closeGlobalMenuDrawer()
}

function handleLogin() {
  authStore.login()
  closeMobileMenu()
}

function handleSignup() {
  authStore.login({ authorizationParams: { screen_hint: 'signup' } })
  closeMobileMenu()
}

function handleOpenDiceRoller() {
  openDiceRoller()
  closeMobileMenu()
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const isTypingField = Boolean(target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) || target?.isContentEditable

  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
    return
  }

  if (isTypingField) {
    return
  }

  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'r') {
    event.preventDefault()
    openDiceRoller()
  }
}

watch(isMobileMenuOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <AppNavigation />

  <div class="bg-zinc-950 pt-20">
    <RouterView />
  </div>
  <DiceRollerPanel />

  <Teleport to="body">
    <Transition name="global-menu">
      <div v-if="isMobileMenuOpen" :class="['fixed inset-0 z-120', 'xl:hidden']">
        <button
          type="button"
          class="absolute inset-0 bg-black/65 backdrop-blur-sm"
          aria-label="Fermer le menu"
          @click="closeMobileMenu"
        ></button>

        <aside class="absolute right-0 top-0 flex h-full w-[min(20rem,86vw)] flex-col border-l border-amber-900/30 bg-zinc-950/98 px-4 py-5 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
          <div class="flex items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div class="min-w-0">
              <p class="text-xs uppercase tracking-[0.35em] text-amber-300/70">Menu</p>
              <p class="mt-1 truncate font-serif text-lg text-amber-100">DungeonDesk</p>
            </div>
            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 transition-colors hover:border-amber-500/40 hover:text-amber-200"
              aria-label="Fermer le drawer"
              @click="closeMobileMenu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="mt-5 grid gap-2">
            <router-link to="/" class="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-amber-500/30 hover:bg-amber-500/10" @click="closeMobileMenu">
              <span>Accueil</span>
              <span class="text-amber-300/70">Home</span>
            </router-link>
            <router-link to="/character-creator" class="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-blue-500/30 hover:bg-blue-500/10" @click="closeMobileMenu">
              <span>Création Personnage</span>
              <span class="text-blue-300/70">PJ</span>
            </router-link>
            <router-link to="/npc-generator" class="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/10" @click="closeMobileMenu">
              <span>Générateur PNJ</span>
              <span class="text-emerald-300/70">PNJ</span>
            </router-link>
            <router-link to="/gm-dashboard" class="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-red-500/30 hover:bg-red-500/10" @click="closeMobileMenu">
              <span>Tableau MJ</span>
              <span class="text-red-300/70">GM</span>
            </router-link>
            <router-link to="/combat-cheat-sheet" class="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-yellow-500/30 hover:bg-yellow-500/10" @click="closeMobileMenu">
              <span>Aide de Combat</span>
              <span class="text-yellow-300/70">Combat</span>
            </router-link>
            <button @click="handleOpenDiceRoller" class="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-amber-500/30 hover:bg-amber-500/10">
              <span>Lancer les dés</span>
              <span class="text-amber-300/70">Dés</span>
            </button>
            <router-link v-if="isAuthenticated" to="/profile" class="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-amber-500/30 hover:bg-amber-500/10" @click="closeMobileMenu">
              <span>Mon profil</span>
              <span class="text-amber-300/70">Compte</span>
            </router-link>
          </div>

          <div class="mt-auto grid gap-2 border-t border-white/5 pt-4">
            <button @click="handleLogin" class="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-amber-500/30 hover:bg-amber-500/10">
              <span>Se connecter</span>
              <span class="text-amber-300/70">Connexion</span>
            </button>
            <button @click="handleSignup" class="flex items-center justify-between rounded-xl border border-amber-700/40 bg-linear-to-r from-amber-700/40 to-amber-600/40 px-4 py-3 text-sm font-semibold text-amber-50 transition-colors hover:from-amber-700/60 hover:to-amber-600/60">
              <span>S'inscrire</span>
              <span class="text-amber-100/80">Signup</span>
            </button>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>

  <button
    type="button"
    :class="[
      'fixed right-3 top-4 z-110 p-3 bg-zinc-900/90 text-amber-500 rounded-full hover:bg-zinc-800 hover:scale-110 hover:text-amber-400 transition-all border border-amber-500/30 shadow-lg shadow-black/50 backdrop-blur-sm group flex items-center justify-center print:hidden',
      'xl:hidden'
    ]"
    title="Ouvrir le menu"
    aria-label="Ouvrir le menu"
    :aria-expanded="isMobileMenuOpen"
    @click="toggleGlobalMenuDrawer"
  >
    <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 transition-transform group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"></line>
      <line x1="4" y1="12" x2="20" y2="12"></line>
      <line x1="4" y1="18" x2="20" y2="18"></line>
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 transition-transform group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>

</template>

<style scoped>
.global-menu-enter-active,
.global-menu-leave-active {
  transition: opacity 220ms ease;
}

.global-menu-enter-from,
.global-menu-leave-to {
  opacity: 0;
}

.global-menu-enter-active aside,
.global-menu-leave-active aside {
  transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
}

.global-menu-enter-from aside,
.global-menu-leave-to aside {
  transform: translateX(100%);
}
</style>
