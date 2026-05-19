<template>
  <div class="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-zinc-950 text-zinc-100">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-amber-500/10 blur-3xl"></div>
      <div class="absolute right-[-10rem] top-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
      <div class="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl"></div>
    </div>

    <div class="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header class="mb-8">
        <h1 class="text-4xl font-bold tracking-tight text-amber-100 sm:text-5xl">Liste des sorts</h1>
      </header>

      <section class="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-md sm:p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div class="flex-1">
            <label class="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Recherche</label>
            <input
              v-model="q"
              type="search"
              placeholder="Nom du sort..."
              class="w-full rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10"
            />
          </div>

          <div class="grid flex-1 gap-4 sm:grid-cols-3 lg:flex-[0_0_auto] lg:min-w-[40rem]">
            <div>
              <label class="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Niveau</label>
              <select v-model.number="levelFilter" class="w-full rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10">
                <option :value="-1">Tous</option>
                <option v-for="n in levels" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>

            <div>
              <label class="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">École</label>
              <select v-model="schoolFilter" class="w-full rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10">
                <option value="">Toutes</option>
                <option v-for="s in schools" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

            <div>
              <label class="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Classe</label>
              <select v-model="classFilter" class="w-full rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10">
                <option value="">Toutes</option>
                <option v-for="c in classes" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-zinc-400">
          Affichage de <span class="text-zinc-100">{{ paginated.length }}</span> sort{{ paginated.length > 1 ? 's' : '' }} sur <span class="text-zinc-100">{{ totalMatches }}</span>
        </p>

        <div class="flex items-center gap-2 text-sm text-zinc-400">
          <button @click="prevPage" :disabled="currentPage===1" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-40">Précédent</button>
          <span class="rounded-full border border-white/10 bg-zinc-950/80 px-3 py-2">Page {{ currentPage }} / {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage===totalPages" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-40">Suivant</button>
        </div>
      </section>

      <section v-if="paginated.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <router-link
          v-for="s in paginated"
          :key="s.index"
          :to="{ name: 'sort-view', params: { index: s.index } }"
          class="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-1 hover:border-amber-500/40 hover:bg-white/[0.05]"
        >
          <div class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-500/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>

          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h3 class="truncate text-xl font-semibold text-amber-200 transition-colors group-hover:text-amber-100">{{ s.name }}</h3>
              <p class="mt-1 text-sm text-zinc-400">{{ s.school?.name || 'Inconnue' }}</p>
            </div>

            <div :class="['shrink-0 rounded-2xl border px-3 py-2 text-center', levelBadgeClass(s.level)]">
              <p class="text-[10px] uppercase tracking-[0.25em] text-white/70">Niveau</p>
              <p class="text-lg font-semibold text-white">{{ s.level }}</p>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-2">
            <span
              v-for="c in s.classes || []"
              :key="c.index"
              class="rounded-full border border-amber-500/25 bg-amber-200/5 px-3 py-1 text-xs font-medium text-gray-300"
            >
              {{ c.name }}
            </span>
          </div>
        </router-link>
      </section>

      <section v-else class="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center shadow-[0_16px_50px_rgba(0,0,0,0.22)]">
        <p class="text-lg font-semibold text-zinc-100">Aucun sort ne correspond à vos filtres.</p>
        <p class="mt-2 text-sm text-zinc-400">Essayez de supprimer un filtre ou de réinitialiser la recherche.</p>
        <button
          type="button"
          class="mt-5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-200"
          @click="resetFilters"
        >
          Réinitialiser
        </button>
      </section>

      <div v-if="totalPages > 1" class="mt-8 flex flex-col items-center gap-4">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <button @click="prevPage" :disabled="currentPage===1" class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-40">Précédent</button>
          <template v-for="p in pageNumbers" :key="'bottom-'+p">
            <button @click="currentPage = p" :class="['min-w-11 rounded-full px-4 py-2 text-sm font-semibold transition-colors', currentPage===p ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/20' : 'border border-white/10 bg-white/5 text-zinc-100 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-100']">{{ p }}</button>
          </template>
          <button @click="nextPage" :disabled="currentPage===totalPages" class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-40">Suivant</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const q = ref('')
const levelFilter = ref(-1)
const schoolFilter = ref('')
const classFilter = ref('')

const spells = ref<any[]>([])

const pageSize = ref(24)
const currentPage = ref(1)

const route = useRoute()
const router = useRouter()

function levelBadgeClass(level: number | string) {
  const normalized = Number(level)

  const palette: Record<number, string> = {
    0: 'border-slate-400/30 bg-slate-400/12',
    1: 'border-emerald-400/30 bg-emerald-400/12',
    2: 'border-sky-400/30 bg-sky-400/12',
    3: 'border-cyan-400/30 bg-cyan-400/12',
    4: 'border-violet-400/30 bg-violet-400/12',
    5: 'border-amber-400/30 bg-amber-400/12',
    6: 'border-orange-400/30 bg-orange-400/12',
    7: 'border-rose-400/30 bg-rose-400/12',
    8: 'border-fuchsia-400/30 bg-fuchsia-400/12',
    9: 'border-red-400/30 bg-red-400/12',
  }

  return palette[normalized] ?? 'border-amber-400/30 bg-amber-400/12'
}

const activeFilterCount = computed(() => {
  let count = 0
  if (q.value.trim()) count += 1
  if (levelFilter.value !== -1) count += 1
  if (schoolFilter.value) count += 1
  if (classFilter.value) count += 1
  return count
})

const hasActiveFilters = computed(() => activeFilterCount.value > 0)

const levels = computed(() => {
  const set = new Set<number>()
  for (const s of spells.value) set.add(Number(s.level))
  return Array.from(set).sort((a, b) => a - b)
})

const schools = computed(() => {
  const set = new Set<string>()
  for (const s of spells.value) if (s.school?.name) set.add(s.school.name)
  return Array.from(set).sort()
})

const classes = computed(() => {
  const set = new Set<string>()
  for (const s of spells.value) if (s.classes) for (const c of s.classes) set.add(c.name)
  return Array.from(set).sort()
})

const filtered = computed(() => {
  return spells.value.filter(s => {
    if (q.value && !s.name.toLowerCase().includes(q.value.toLowerCase())) return false
    if (levelFilter.value !== -1 && Number(s.level) !== Number(levelFilter.value)) return false
    if (schoolFilter.value && s.school?.name !== schoolFilter.value) return false
    if (classFilter.value) {
      if (!s.classes || !s.classes.some((c: any) => c.name === classFilter.value)) return false
    }
    return true
  })
})

// Default sorting: by spell level asc, then name
const sortedFiltered = computed(() => {
  return filtered.value.slice().sort((a, b) => {
    const la = Number(a.level || 0)
    const lb = Number(b.level || 0)
    if (la !== lb) return la - lb
    return String(a.name || '').localeCompare(String(b.name || ''))
  })
})

const totalMatches = computed(() => sortedFiltered.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalMatches.value / pageSize.value)))

const paginated = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedFiltered.value.slice(start, start + pageSize.value)
})

const pageNumbers = computed(() => {
  const arr = [] as number[]
  for (let i = 1; i <= totalPages.value; i++) arr.push(i)
  return arr
})

function resetFilters() {
  q.value = ''
  levelFilter.value = -1
  schoolFilter.value = ''
  classFilter.value = ''
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// reset page when filters/search change
watch([q, levelFilter, schoolFilter, classFilter], () => {
  currentPage.value = 1
})

function buildQuery() {
  const query: Record<string, any> = {}
  if (q.value && q.value.trim()) query.q = q.value.trim()
  if (levelFilter.value !== -1) query.level = String(levelFilter.value)
  if (schoolFilter.value) query.school = schoolFilter.value
  if (classFilter.value) query.class = classFilter.value
  if (currentPage.value && currentPage.value > 1) query.page = String(currentPage.value)
  return query
}

function syncQueryToRoute() {
  const newQuery = buildQuery()
  // avoid unnecessary replace when identical
  const same = Object.keys(newQuery).length === Object.keys(route.query).length && Object.keys(newQuery).every(k => route.query[k] === newQuery[k])
  if (!same) {
    router.replace({ name: 'sorts-list', query: newQuery }).catch(() => {})
  }
}

// update route when filters or page change
watch([q, levelFilter, schoolFilter, classFilter, currentPage], () => {
  syncQueryToRoute()
})

// if route query changes (e.g. browser navigation), restore state
watch(() => route.query, (qry) => {
  if (qry.q !== undefined) q.value = String(qry.q)
  else q.value = ''

  if (qry.level !== undefined) levelFilter.value = Number(qry.level)
  else levelFilter.value = -1

  if (qry.school !== undefined) schoolFilter.value = String(qry.school)
  else schoolFilter.value = ''

  if (qry.class !== undefined) classFilter.value = String(qry.class)
  else classFilter.value = ''

  if (qry.page !== undefined) currentPage.value = Math.max(1, Number(qry.page) || 1)
  else currentPage.value = 1
})

onMounted(async () => {
  try {
    const res = await fetch('/data/fr/5e-SRD-Spells.json')
    const list = await res.json()
    spells.value = list
    // restore from query when first loading
    if (route && route.query) {
      const qry = route.query as Record<string, any>
      if (qry.q !== undefined) q.value = String(qry.q)
      if (qry.level !== undefined) levelFilter.value = Number(qry.level)
      if (qry.school !== undefined) schoolFilter.value = String(qry.school)
      if (qry.class !== undefined) classFilter.value = String(qry.class)
      if (qry.page !== undefined) currentPage.value = Math.max(1, Number(qry.page) || 1)
    }
  } catch (e) {
    console.error('Failed to load spells', e)
  }
})
</script>

<style scoped>
/* minimal spacing already handled by Tailwind classes */
</style>
