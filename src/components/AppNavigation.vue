<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import DiceRollerTrigger from '@/components/DiceRollerTrigger.vue'
import { desktopNavigationGroups } from '@/config/navigation'

const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)
const route = useRoute()
const activeDesktopGroup = ref<string | null>(null)

function toggleDesktopGroup(groupLabel: string) {
  activeDesktopGroup.value = activeDesktopGroup.value === groupLabel ? null : groupLabel
}

function closeDesktopGroup() {
  activeDesktopGroup.value = null
}

watch(
  () => route.fullPath,
  () => {
    closeDesktopGroup()
  }
)
</script>

<template>
  <nav class="fixed inset-x-0 top-0 z-50 border-b border-amber-900/30 bg-zinc-950/80 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20 gap-2">
        <div class="flex gap-4">
          <router-link to="/" class="flex items-center space-x-3 group cursor-pointer min-w-0">
            <img src="/logo.svg" alt="DungeonDesk Logo" class="xl:block w-22 h-10 sm:w-40 sm:h-15 rounded-lg" />
          </router-link>

          <div class="font-serif hidden xl:flex items-center gap-2 rounded-2xl px-2 py-2">
            <div
              v-for="group in desktopNavigationGroups"
              :key="group.label"
              class="relative pb-3"
              @mouseenter="activeDesktopGroup = group.label"
              @mouseleave="closeDesktopGroup"
            >
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-zinc-200 transition-all duration-200 hover:border-white/15 hover:bg-white/10 hover:text-white"
                :aria-label="`Ouvrir la navigation ${group.label}`"
                :aria-expanded="activeDesktopGroup === group.label"
                @click="toggleDesktopGroup(group.label)"
              >
                <span>{{ group.label }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 opacity-70">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.942l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0l-4.24-4.24a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" />
                </svg>
              </button>

              <div
                :class="[
                  'absolute left-0 top-full z-50 w-72 rounded-2xl border border-white/10 bg-zinc-950/98 p-3 transition-all duration-200',
                  activeDesktopGroup === group.label
                    ? 'visible translate-y-0 opacity-100'
                    : 'pointer-events-none invisible translate-y-2 opacity-0'
                ]"
              >
                <p class="mb-2 px-2 text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  {{ group.label }}
                </p>

                <div class="grid gap-2">
                  <router-link
                    v-for="item in group.links"
                    :key="`${group.label}-${item.label}`"
                    :to="item.to"
                    active-class="border-white/15 bg-white/10 text-white"
                    class="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:border-white/10 hover:bg-white/10 hover:text-white"
                    @click="closeDesktopGroup"
                  >
                    <span class="min-w-0 truncate">{{ item.label }}</span>
                  </router-link>
                </div>
              </div>
            </div>
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
