<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppNavigation from '@/components/AppNavigation.vue'
import DiceRollerPanel from '@/components/DiceRollerPanel.vue'
import GlobalSearch from '@/components/search/GlobalSearch.vue'
import { openGlobalSearch } from '@/composables/useGlobalSearch'
import { openDiceRoller } from '@/composables/useDiceRoller'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { closeGlobalMenuDrawer, toggleGlobalMenuDrawer, useGlobalMenuDrawer } from '@/composables/useGlobalMenuDrawer'
import { navigationGroups } from '@/config/navigation'

const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)
const mobileLinkClass = 'block rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-white/10 hover:bg-white/10 hover:text-white'
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

  // Ctrl+K (Cmd+K sur Mac) : recherche globale, même depuis un champ
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    closeMobileMenu()
    openGlobalSearch()
    return
  }

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

// Changement de page (lien du menu, retour arrière…) : le menu se ferme
const route = useRoute()
watch(() => route.fullPath, closeMobileMenu)

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

  <main class="bg-zinc-950 pt-20">
    <RouterView />
  </main>
  <DiceRollerPanel />
  <GlobalSearch />

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
            <router-link to="/" class="min-w-0" @click="closeMobileMenu">
              <img src="/logo.svg" alt="Dungeon Desk" class="h-10 w-auto">
            </router-link>
            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 transition-colors hover:border-amber-500/40 hover:text-amber-200"
              aria-label="Fermer le menu"
              @click="closeMobileMenu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Compte : profil si connecté, sinon connexion et inscription -->
          <div class="mt-4">
            <router-link v-if="isAuthenticated" to="/profile" class="flex items-center gap-3 rounded-xl border border-amber-900/30 bg-zinc-900/60 px-3 py-2.5 transition-colors hover:border-amber-500/40" active-class="border-amber-500/50" @click="closeMobileMenu">
              <span class="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-amber-500/30">
                <img v-if="user?.picture" :src="user.picture" alt="" class="h-full w-full object-cover">
                <span v-else class="flex h-full w-full items-center justify-center bg-amber-900/50 font-bold text-amber-500">{{ user?.name?.charAt(0) }}</span>
              </span>
              <span class="min-w-0">
                <span class="block truncate font-serif text-amber-100">{{ user?.name }}</span>
                <span class="block text-xs text-zinc-500">Mon profil</span>
              </span>
            </router-link>
            <div v-else class="grid grid-cols-2 gap-2">
              <button type="button" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-zinc-100 hover:border-amber-500/30" @click="handleLogin">Connexion</button>
              <button type="button" class="rounded-xl border border-amber-700/40 bg-linear-to-r from-amber-700/50 to-amber-600/50 px-3 py-2.5 text-sm font-semibold text-amber-50 hover:from-amber-700/70 hover:to-amber-600/70" @click="handleSignup">Inscription</button>
            </div>
          </div>

          <!-- Mêmes rubriques que la navigation du bureau -->
          <nav class="mt-5 flex-1 overflow-y-auto space-y-5" aria-label="Navigation principale">
            <router-link to="/" :class="mobileLinkClass" exact-active-class="border-amber-500/40! bg-amber-500/10! text-amber-100!" @click="closeMobileMenu">Accueil</router-link>
            <div v-for="group in navigationGroups" :key="group.label">
              <p class="mb-2 px-1 text-[10px] uppercase tracking-[0.28em] text-zinc-500">{{ group.label }}</p>
              <div class="grid gap-1.5">
                <router-link
                  v-for="item in group.links" :key="item.label" :to="item.to" :class="mobileLinkClass"
                  exact-active-class="border-amber-500/40! bg-amber-500/10! text-amber-100!" @click="closeMobileMenu"
                >{{ item.label }}</router-link>
              </div>
            </div>
          </nav>

          <div class="mt-4 border-t border-white/5 pt-4">
            <button type="button" :class="[mobileLinkClass, 'w-full text-left']" @click="handleOpenDiceRoller">🎲 Lancer les dés</button>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>

  <button
    type="button"
    class="fixed right-17 top-4 z-110 flex items-center justify-center rounded-full border border-amber-500/30 bg-zinc-900/90 p-3 text-amber-500 shadow-lg shadow-black/50 backdrop-blur-sm transition-all hover:scale-110 hover:bg-zinc-800 hover:text-amber-400 xl:hidden print:hidden"
    title="Rechercher"
    aria-label="Rechercher"
    @click="openGlobalSearch"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  </button>

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
