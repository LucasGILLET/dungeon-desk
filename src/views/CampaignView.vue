<template>
  <div class="relative min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200">
    <div class="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <router-link :to="{ name: 'gm-dashboard' }" class="text-sm text-zinc-400 hover:text-amber-300">← Mes campagnes</router-link>

      <p v-if="!authStore.isAuthenticated" class="mt-8 text-zinc-300">Connectez-vous pour voir cette campagne.</p>
      <p v-else-if="error" class="mt-8 text-red-300">{{ error }}</p>
      <div v-else-if="!campaign" class="mt-8"><SkeletonText :lines="4" label="Chargement de la campagne…" /><SkeletonCards class="mt-8" :count="3" compact /></div>

      <template v-else>
        <header class="mt-4 mb-6">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="font-serif text-4xl font-bold text-amber-100">{{ campaign.name }}</h1>
            <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">{{ CAMPAIGN_STATUS_LABELS[campaign.status] }}</span>
            <span class="rounded-full border px-3 py-1 text-xs" :class="campaign.role === 'GM' ? 'border-red-500/30 text-red-200' : 'border-sky-500/30 text-sky-200'">
              {{ campaign.role === 'GM' ? 'Vous êtes le MJ' : 'Vous êtes joueur' }}
            </span>
          </div>
          <p v-if="campaign.theme" class="mt-1 text-zinc-400">{{ campaign.theme }}</p>
        </header>

        <nav class="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-3" aria-label="Sections de la campagne">
          <button
            v-for="t in tabs"
            :key="t.key"
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            :class="tab === t.key ? 'bg-red-900/50 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'"
            :aria-current="tab === t.key ? 'page' : undefined"
            @click="selectTab(t.key)"
          >{{ t.label }}<span v-if="t.count !== undefined" class="ml-1.5 text-xs text-zinc-500">{{ t.count }}</span></button>
        </nav>

        <CampaignOverview v-if="tab === 'overview'" :campaign="campaign" @changed="load" />
        <CampaignSessions v-else-if="tab === 'sessions'" :campaign="campaign" @changed="load" />
        <CampaignQuests v-else-if="tab === 'quests'" :campaign="campaign" @changed="load" />
        <CampaignNpcs v-else-if="tab === 'npcs'" :campaign="campaign" @changed="load" />
        <CampaignEncounters v-else-if="tab === 'encounters'" :campaign="campaign" @changed="load" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonCards from '@/components/skeleton/SkeletonCards.vue'
import SkeletonText from '@/components/skeleton/SkeletonText.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { usePageMeta } from '@/utils/pageMeta'
import { useRoute, useRouter } from 'vue-router'
import CampaignEncounters from '@/components/campaign/CampaignEncounters.vue'
import CampaignNpcs from '@/components/campaign/CampaignNpcs.vue'
import CampaignOverview from '@/components/campaign/CampaignOverview.vue'
import CampaignQuests from '@/components/campaign/CampaignQuests.vue'
import CampaignSessions from '@/components/campaign/CampaignSessions.vue'
import { CAMPAIGN_STATUS_LABELS, CampaignApiError, campaignsApi, type Campaign } from '@/api/campaigns'
import { useAuthStore } from '@/stores/auth'

type Tab = 'overview' | 'sessions' | 'quests' | 'npcs' | 'encounters'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const campaign = ref<Campaign | null>(null)
usePageMeta(() => campaign.value && { title: campaign.value.name })
const error = ref<string | null>(null)

// PNJ et rencontres : MJ seulement
const tabs = computed(() => {
  const c = campaign.value
  if (!c) return []
  const all: { key: Tab; label: string; count?: number; gmOnly?: boolean }[] = [
    { key: 'overview', label: 'Présentation' },
    { key: 'sessions', label: 'Séances', count: c.sessions.length },
    { key: 'quests', label: 'Quêtes', count: c.quests.length },
    { key: 'npcs', label: 'PNJ', count: c.npcs.length, gmOnly: true },
    { key: 'encounters', label: 'Rencontres', count: c.encounters.length, gmOnly: true },
  ]
  return all.filter((t) => !t.gmOnly || c.role === 'GM')
})
const tab = computed<Tab>(() => {
  const wanted = String(route.query.tab ?? '')
  return tabs.value.some((t) => t.key === wanted) ? (wanted as Tab) : 'overview'
})

function selectTab(key: Tab) {
  router.replace({ query: { ...route.query, tab: key === 'overview' ? undefined : key } })
}

async function load() {
  if (!authStore.isAuthenticated) return
  try {
    campaign.value = await campaignsApi.get(Number(route.params.id))
    error.value = null
  } catch (e) {
    error.value = e instanceof CampaignApiError && e.status === 404 ? 'Campagne introuvable, ou vous n\'en faites pas partie.' : 'Impossible de charger la campagne.'
  }
}

onMounted(load)
watch(() => [authStore.isAuthenticated, route.params.id], load)
</script>
