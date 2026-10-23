<template>
  <div class="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-zinc-950 text-zinc-100">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-red-500/10 blur-3xl"></div>
      <div class="absolute right-[-10rem] top-24 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"></div>
    </div>

    <div class="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold tracking-tight text-amber-100 sm:text-5xl">Bestiaire</h1>
          <p class="mt-2 text-zinc-400">
            <template v-if="loading">Créatures du SRD 5.1</template><template v-else>{{ srdCount }} créatures du SRD 5.1</template><template v-if="mine.length"> · {{ mine.length }} monstre{{ mine.length > 1 ? 's' : '' }} maison</template>
          </p>
        </div>
        <router-link v-if="authStore.isAuthenticated" :to="{ name: 'homebrew-monster-new' }" class="ui-btn-primary">Créer un monstre</router-link>
      </header>

      <section class="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md sm:p-6">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <div class="lg:col-span-2">
            <label for="bestiary-search" class="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Recherche</label>
            <input id="bestiary-search" v-model="q" type="search" placeholder="Nom de la créature..." :class="field" />
          </div>
          <div>
            <label for="bestiary-type" class="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Type</label>
            <select id="bestiary-type" v-model="typeFilter" :class="field">
              <option value="">Tous</option>
              <option v-for="t in types" :key="t.index" :value="t.index">{{ t.name }}</option>
            </select>
          </div>
          <div>
            <label for="bestiary-size" class="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Taille</label>
            <select id="bestiary-size" v-model="sizeFilter" :class="field">
              <option value="">Toutes</option>
              <option v-for="s in SIZES" :key="s" :value="s">{{ SIZE_LABELS[s] }}</option>
            </select>
          </div>
          <div>
            <label for="bestiary-cr-min" class="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">FP min.</label>
            <select id="bestiary-cr-min" v-model.number="crMin" :class="field">
              <option v-for="cr in challenges" :key="cr" :value="cr">{{ formatChallenge(cr) }}</option>
            </select>
          </div>
          <div>
            <label for="bestiary-cr-max" class="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">FP max.</label>
            <select id="bestiary-cr-max" v-model.number="crMax" :class="field">
              <option v-for="cr in challenges" :key="cr" :value="cr">{{ formatChallenge(cr) }}</option>
            </select>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-300">
          <label class="flex items-center gap-2">
            <input v-model="legendaryOnly" type="checkbox" class="accent-amber-500" /> Créatures légendaires seulement
          </label>
          <label class="flex items-center gap-2">
            Trier par
            <select v-model="sortBy" class="rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-1.5 text-zinc-100">
              <option value="name">nom</option>
              <option value="cr">facteur de puissance</option>
            </select>
          </label>
          <label v-if="mine.length" class="flex items-center gap-2">
            Source
            <select v-model="sourceFilter" class="rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-1.5 text-zinc-100">
              <option value="">tous</option>
              <option value="srd">SRD</option>
              <option value="mine">mes monstres</option>
            </select>
          </label>
          <button v-if="hasFilters" type="button" class="ml-auto text-zinc-400 hover:text-amber-200" @click="resetFilters">Réinitialiser les filtres</button>
        </div>
      </section>

      <SkeletonCards v-if="loading" :count="9" label="Chargement du bestiaire…" />
      <p v-else-if="error" class="text-red-300">Impossible de charger le bestiaire : {{ error }}</p>

      <template v-else>
        <p class="mb-4 text-sm text-zinc-400">
          <span class="text-zinc-100">{{ filtered.length }}</span> créature{{ filtered.length > 1 ? 's' : '' }}
        </p>

        <section v-if="paginated.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <router-link
            v-for="m in paginated"
            :key="m.index"
            :to="{ name: m.source === 'HOMEBREW' ? 'homebrew-monster' : 'monster-view', params: { index: m.index } }"
            @mouseenter="prefetch(m)" @focus="prefetch(m)"
            class="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-amber-500/40 hover:bg-white/[0.05]"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <h2 class="truncate text-xl font-semibold text-amber-200 group-hover:text-amber-100">{{ m.name }}</h2>
                <p class="mt-1 text-sm text-zinc-400">{{ formatTypeLine(m) }}</p>
              </div>
              <div class="shrink-0 rounded-2xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-center">
                <p class="text-[10px] uppercase tracking-[0.25em] text-white/70">FP</p>
                <p class="text-lg font-semibold text-white">{{ formatChallenge(m.challengeRating) }}</p>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2 text-xs text-zinc-300">
              <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1">CA {{ m.armorClass }}</span>
              <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1">PV {{ m.hitPoints }}</span>
              <span v-if="m.legendary" class="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-200">Légendaire</span>
              <span v-if="m.source === 'HOMEBREW'" class="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-violet-200">Maison</span>
            </div>
          </router-link>
        </section>

        <section v-else class="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <p class="text-lg font-semibold text-zinc-100">Aucune créature ne correspond à vos filtres.</p>
          <button type="button" class="mt-5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:border-amber-500/40 hover:text-amber-200" @click="resetFilters">
            Réinitialiser
          </button>
        </section>

        <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2 text-sm">
          <button :disabled="page === 1" :class="pager" @click="page--">Précédent</button>
          <span class="rounded-full border border-white/10 bg-zinc-950/80 px-3 py-2">Page {{ page }} / {{ totalPages }}</span>
          <button :disabled="page === totalPages" :class="pager" @click="page++">Suivant</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonCards from '@/components/skeleton/SkeletonCards.vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { monstersApi } from '@/api/monsters'
import { useAuthStore } from '@/stores/auth'
import { loadMonster, loadMonsters, type ApiMonsterSummary, type Size } from '@/utils/dataLoader'
import { formatChallenge, formatTypeLine, SIZE_LABELS, SIZES } from '@/utils/monsterFormat'

// Fiche du SRD demandée au survol : gardée par le cache du dataLoader, le clic l'affiche sans attendre
const prefetch = (m: ApiMonsterSummary) => { if (m.source !== 'HOMEBREW') loadMonster(m.index).catch(() => {}) }

const field = 'w-full rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10'
const pager = 'rounded-full border border-white/10 bg-white/5 px-4 py-2 transition-colors hover:border-amber-500/30 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-40'
const PAGE_SIZE = 24

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const srd = ref<ApiMonsterSummary[]>([])
// Monstres maison de l'utilisateur connecté, en tête de liste
const mine = ref<ApiMonsterSummary[]>([])
const monsters = computed(() => [...mine.value, ...srd.value])
const srdCount = computed(() => srd.value.length)
const loading = ref(true)
const error = ref<string | null>(null)

// Filtres, conservés dans l'URL (retour depuis une fiche)
const q = ref('')
const typeFilter = ref('')
const sizeFilter = ref<Size | ''>('')
const crMin = ref(0)
const crMax = ref(30)
const legendaryOnly = ref(false)
const sourceFilter = ref<'' | 'srd' | 'mine'>('')
const sortBy = ref<'name' | 'cr'>('name')
const page = ref(1)

const challenges = computed(() => [...new Set(monsters.value.map((m) => m.challengeRating))].sort((a, b) => a - b))
const types = computed(() => {
  const byIndex = new Map(monsters.value.map((m) => [m.type.index, m.type]))
  return [...byIndex.values()].sort((a, b) => a.name.localeCompare(b.name))
})

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const filtered = computed(() => {
  const query = normalize(q.value.trim())
  return monsters.value
    .filter((m) => (!query || normalize(m.name).includes(query) || m.index.includes(query))
      && (!typeFilter.value || m.type.index === typeFilter.value)
      && (!sizeFilter.value || m.size === sizeFilter.value)
      && m.challengeRating >= crMin.value && m.challengeRating <= crMax.value
      && (!legendaryOnly.value || m.legendary)
      && (!sourceFilter.value || (sourceFilter.value === 'mine') === (m.source === 'HOMEBREW')))
    .sort((a, b) => (sortBy.value === 'cr' ? a.challengeRating - b.challengeRating : 0) || a.name.localeCompare(b.name))
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paginated = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
const maxChallenge = computed(() => challenges.value.at(-1) ?? 30)
const hasFilters = computed(() => !!(q.value || sourceFilter.value || typeFilter.value || sizeFilter.value || legendaryOnly.value || crMin.value > 0 || crMax.value < maxChallenge.value))

function resetFilters() {
  q.value = ''
  typeFilter.value = ''
  sizeFilter.value = ''
  crMin.value = 0
  crMax.value = maxChallenge.value
  legendaryOnly.value = false
  sourceFilter.value = ''
}

watch([q, typeFilter, sizeFilter, crMin, crMax, legendaryOnly, sourceFilter, sortBy], () => { page.value = 1 })
watch([q, typeFilter, sizeFilter, crMin, crMax, legendaryOnly, sourceFilter, sortBy, page], () => {
  const query: Record<string, string> = {}
  if (q.value.trim()) query.q = q.value.trim()
  if (typeFilter.value) query.type = typeFilter.value
  if (sizeFilter.value) query.size = sizeFilter.value
  if (crMin.value > 0) query.crMin = String(crMin.value)
  if (crMax.value < maxChallenge.value) query.crMax = String(crMax.value)
  if (legendaryOnly.value) query.legendary = '1'
  if (sourceFilter.value) query.source = sourceFilter.value
  if (sortBy.value !== 'name') query.sort = sortBy.value
  if (page.value > 1) query.page = String(page.value)
  router.replace({ name: 'bestiary', query }).catch(() => {})
})

onMounted(async () => {
  try {
    // Sans connexion (ou en cas d'erreur), le bestiaire du SRD seul
    const [srdRows, mineRows] = await Promise.all([
      loadMonsters(),
      authStore.isAuthenticated ? monstersApi.list().catch(() => []) : Promise.resolve([]),
    ])
    srd.value = srdRows
    mine.value = mineRows
    const qry = route.query
    q.value = qry.q ? String(qry.q) : ''
    typeFilter.value = qry.type ? String(qry.type) : ''
    sizeFilter.value = (qry.size ? String(qry.size) : '') as Size | ''
    crMin.value = qry.crMin ? Number(qry.crMin) : 0
    crMax.value = qry.crMax ? Number(qry.crMax) : maxChallenge.value
    legendaryOnly.value = qry.legendary === '1'
    sourceFilter.value = qry.source === 'mine' || qry.source === 'srd' ? qry.source : ''
    sortBy.value = qry.sort === 'cr' ? 'cr' : 'name'
    // Après le watcher qui remet la page à 1 quand un filtre change
    const wanted = Math.max(1, Number(qry.page) || 1)
    await nextTick()
    page.value = wanted
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})
</script>
