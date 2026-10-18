<template>
  <div class="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-zinc-950 text-zinc-100">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-violet-500/10 blur-3xl"></div>
      <div class="absolute right-[-10rem] top-24 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl"></div>
    </div>

    <div class="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header class="mb-8">
        <h1 class="text-4xl font-bold tracking-tight text-amber-100 sm:text-5xl">Objets magiques</h1>
        <p class="mt-2 text-zinc-400">{{ items.length }} objets du SRD 5.1, variantes comprises</p>
      </header>

      <section class="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md sm:p-6">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div class="lg:col-span-2">
            <label for="items-search" class="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Recherche</label>
            <input id="items-search" v-model="q" type="search" placeholder="Nom de l'objet..." :class="field" />
          </div>
          <div>
            <label for="items-rarity" class="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Rareté</label>
            <select id="items-rarity" v-model="rarityFilter" :class="field">
              <option value="">Toutes</option>
              <option v-for="r in RARITIES.filter((r) => r !== 'VARIES')" :key="r" :value="r">{{ RARITY_LABELS[r] }}</option>
            </select>
          </div>
          <div>
            <label for="items-category" class="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Catégorie</label>
            <select id="items-category" v-model="categoryFilter" :class="field">
              <option value="">Toutes</option>
              <option v-for="c in categories" :key="c.index" :value="c.index">{{ c.name }}</option>
            </select>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-300">
          <label class="flex items-center gap-2">
            Lien
            <select v-model="attunementFilter" class="rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-1.5 text-zinc-100">
              <option value="">indifférent</option>
              <option value="yes">nécessite un lien</option>
              <option value="no">sans lien</option>
            </select>
          </label>
          <button v-if="hasFilters" type="button" class="ml-auto text-zinc-400 hover:text-amber-200" @click="resetFilters">Réinitialiser les filtres</button>
        </div>
      </section>

      <p v-if="loading" class="text-zinc-400">Chargement des objets magiques…</p>
      <p v-else-if="error" class="text-red-300">Impossible de charger les objets magiques : {{ error }}</p>

      <template v-else>
        <p class="mb-4 text-sm text-zinc-400">
          <span class="text-zinc-100">{{ filtered.length }}</span> objet{{ filtered.length > 1 ? 's' : '' }}
        </p>

        <section v-if="paginated.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <router-link
            v-for="item in paginated"
            :key="item.index"
            :to="{ name: 'magic-item-view', params: { index: item.index } }"
            class="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-amber-500/40 hover:bg-white/[0.05]"
          >
            <h2 class="text-xl font-semibold text-amber-200 group-hover:text-amber-100">{{ item.name }}</h2>
            <p class="mt-1 text-sm italic text-zinc-400">{{ item.subtitle }}</p>
            <div class="mt-4 flex flex-wrap gap-2 text-xs">
              <span :class="['rounded-full border px-3 py-1', RARITY_CLASSES[item.rarity]]">{{ rarityText(item) }}</span>
              <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300">{{ item.category.name }}</span>
              <span v-if="item.requiresAttunement" class="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-1 text-fuchsia-200">Lien</span>
            </div>
          </router-link>
        </section>

        <section v-else class="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <p class="text-lg font-semibold text-zinc-100">Aucun objet ne correspond à vos filtres.</p>
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadMagicItems, type ApiMagicItemSummary, type MagicItemRarity } from '@/utils/dataLoader'
import { RARITIES, RARITY_CLASSES, RARITY_LABELS } from '@/utils/monsterFormat'

const field = 'w-full rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10'
const pager = 'rounded-full border border-white/10 bg-white/5 px-4 py-2 transition-colors hover:border-amber-500/30 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-40'
const PAGE_SIZE = 24

const route = useRoute()
const router = useRouter()
const items = ref<ApiMagicItemSummary[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const q = ref('')
const rarityFilter = ref<MagicItemRarity | ''>('')
const categoryFilter = ref('')
const attunementFilter = ref<'' | 'yes' | 'no'>('')
const page = ref(1)

// Les variantes ("Arme, +1") sont regroupées sous leur objet générique, sauf
// quand on filtre par rareté : l'objet générique n'a pas de rareté propre.
const visibleItems = computed(() => items.value.filter((i) => !i.variantOf))
const variantsOf = computed(() => {
  const map = new Map<string, ApiMagicItemSummary[]>()
  for (const i of items.value) if (i.variantOf) map.set(i.variantOf, [...(map.get(i.variantOf) ?? []), i])
  return map
})
const rarityText = (item: ApiMagicItemSummary) => {
  if (item.rarity !== 'VARIES') return RARITY_LABELS[item.rarity]
  const rarities = [...new Set((variantsOf.value.get(item.index) ?? []).map((v) => v.rarity))]
  return rarities.length ? rarities.map((r) => RARITY_LABELS[r].toLowerCase()).join(' à ').replace(/^./, (c) => c.toUpperCase()) : RARITY_LABELS.VARIES
}

const categories = computed(() => {
  const byIndex = new Map(items.value.map((i) => [i.category.index, i.category]))
  return [...byIndex.values()].sort((a, b) => a.name.localeCompare(b.name))
})

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const filtered = computed(() => {
  const query = normalize(q.value.trim())
  const source = rarityFilter.value ? items.value.filter((i) => i.rarity !== 'VARIES') : visibleItems.value
  return source
    .filter((i) => (!query || normalize(i.name).includes(query) || i.index.includes(query))
      && (!rarityFilter.value || i.rarity === rarityFilter.value)
      && (!categoryFilter.value || i.category.index === categoryFilter.value)
      && (!attunementFilter.value || i.requiresAttunement === (attunementFilter.value === 'yes')))
    .sort((a, b) => a.name.localeCompare(b.name))
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paginated = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
const hasFilters = computed(() => !!(q.value || rarityFilter.value || categoryFilter.value || attunementFilter.value))

function resetFilters() {
  q.value = ''
  rarityFilter.value = ''
  categoryFilter.value = ''
  attunementFilter.value = ''
}

watch([q, rarityFilter, categoryFilter, attunementFilter], () => { page.value = 1 })
watch([q, rarityFilter, categoryFilter, attunementFilter, page], () => {
  const query: Record<string, string> = {}
  if (q.value.trim()) query.q = q.value.trim()
  if (rarityFilter.value) query.rarity = rarityFilter.value
  if (categoryFilter.value) query.category = categoryFilter.value
  if (attunementFilter.value) query.attunement = attunementFilter.value
  if (page.value > 1) query.page = String(page.value)
  router.replace({ name: 'magic-items', query }).catch(() => {})
})

onMounted(async () => {
  try {
    items.value = await loadMagicItems()
    const qry = route.query
    q.value = qry.q ? String(qry.q) : ''
    rarityFilter.value = (qry.rarity ? String(qry.rarity) : '') as MagicItemRarity | ''
    categoryFilter.value = qry.category ? String(qry.category) : ''
    attunementFilter.value = (qry.attunement === 'yes' || qry.attunement === 'no' ? qry.attunement : '') as '' | 'yes' | 'no'
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
