<template>
  <div class="min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200">
    <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p v-if="notFound" class="mt-10 text-center text-zinc-400">Ce combat n'est pas (ou plus) partagé par le MJ.</p>
      <p v-else-if="!view && error" class="mt-10 text-center text-zinc-400">{{ error }}</p>
      <SkeletonCards v-else-if="!view" class="mt-10" :count="4" columns="grid-cols-1" compact label="Chargement du combat…" />

      <template v-else>
        <header class="text-center">
          <p class="text-xs uppercase tracking-[0.3em] text-zinc-500">{{ view.campaign }}</p>
          <h1 class="mt-1 font-serif text-4xl font-bold text-white">{{ view.name }}</h1>
          <p class="mt-3">
            <span class="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-lg font-semibold text-amber-200">Round {{ view.round }}</span>
            <span v-if="view.finished" class="ml-2 text-emerald-300">Combat terminé</span>
          </p>
          <p v-if="error" class="mt-2 text-xs text-red-300">Connexion perdue, nouvel essai…</p>
        </header>

        <ol class="mt-8 grid gap-3" aria-label="Ordre d'initiative">
          <li
            v-for="c in view.combatants" :key="c.id"
            :class="['flex items-center gap-4 rounded-2xl border p-4', c.id === view.currentId ? 'border-amber-500/60 bg-amber-500/[0.08]' : 'border-white/10 bg-white/[0.03]', c.health === 'DOWN' ? 'opacity-50' : '']"
            :aria-current="c.id === view.currentId ? 'step' : undefined"
          >
            <span class="w-10 text-center text-2xl font-bold text-zinc-300">{{ c.initiative ?? '—' }}</span>
            <div class="min-w-0 flex-1">
              <p class="text-lg font-semibold" :class="c.kind === 'CHARACTER' ? 'text-sky-200' : 'text-zinc-100'">
                {{ c.name }}<span v-if="c.id === view.currentId" class="ml-2 text-sm text-amber-300">← à son tour</span>
              </p>
              <p v-if="c.conditions.length" class="mt-1 flex flex-wrap gap-1">
                <span v-for="k in c.conditions" :key="k" class="rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-xs text-violet-200">{{ conditionName(k) }}</span>
              </p>
            </div>
            <!-- Personnages : PV ; créatures du MJ : état seulement -->
            <span v-if="c.hitPoints != null" class="text-right text-sm">
              <strong class="text-lg text-white">{{ c.hitPoints }}</strong><span class="text-zinc-500"> / {{ c.maxHitPoints }} PV</span>
              <span v-if="c.tempHitPoints" class="block text-xs text-sky-300">+{{ c.tempHitPoints }} temp.</span>
            </span>
            <span v-else-if="c.health" :class="['rounded-full border px-3 py-1 text-sm', HEALTH_CLASSES[c.health]]">{{ HEALTH_LABELS[c.health] }}</span>
          </li>
        </ol>
        <p class="mt-6 text-center text-xs text-zinc-600">Mis à jour automatiquement.</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonCards from '@/components/skeleton/SkeletonCards.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { usePageMeta } from '@/utils/pageMeta'
import { useRoute } from 'vue-router'
import { fetchCombatView, HEALTH_LABELS, type CombatView, type HealthLabel } from '@/api/campaigns'
import { loadConditions } from '@/utils/dataLoader'

const POLL_MS = 3000
const HEALTH_CLASSES: Record<HealthLabel, string> = {
  UNHURT: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  HURT: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  BLOODIED: 'border-red-500/40 bg-red-500/15 text-red-200',
  DOWN: 'border-zinc-600/40 bg-zinc-800 text-zinc-400',
}

const route = useRoute()
const view = ref<CombatView | null>(null)
usePageMeta(() => view.value && { title: view.value.name })
const notFound = ref(false)
const error = ref<string | null>(null)
const conditions = ref<{ index: string; name: string }[]>([])
const conditionName = (index: string) => conditions.value.find((c) => c.index === index)?.name ?? index
let timer: ReturnType<typeof setTimeout> | undefined

// Relu toutes les quelques secondes, sans temps réel : suffisant autour d'une table
async function refresh() {
  // Noms des états : rechargés tant qu'ils manquent (coupure réseau au premier essai)
  if (!conditions.value.length) loadConditions().then((rows) => (conditions.value = rows)).catch(() => {})
  try {
    const next = await fetchCombatView(String(route.params.code))
    if (!next) notFound.value = true
    else view.value = next
    error.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
  if (!notFound.value) timer = setTimeout(refresh, POLL_MS)
}

onMounted(refresh)
onBeforeUnmount(() => clearTimeout(timer))
</script>
