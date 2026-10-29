<template>
  <Teleport to="body">
    <Transition name="global-search">
      <div v-if="isOpen" class="fixed inset-0 z-130 flex items-start justify-center px-3 pt-4 sm:pt-[12vh]" @keydown="onKeydown">
        <button type="button" class="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Fermer la recherche" tabindex="-1" @click="closeGlobalSearch"></button>

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Rechercher"
          class="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-amber-900/40 bg-zinc-950/98 shadow-[0_24px_64px_rgba(0,0,0,0.6)] sm:max-h-[70vh]"
        >
          <div class="flex items-center gap-3 border-b border-white/5 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref="input"
              v-model="query"
              type="search"
              role="combobox"
              aria-autocomplete="list"
              aria-controls="global-search-results"
              :aria-expanded="results.length > 0"
              :aria-activedescendant="active >= 0 ? optionId(active) : undefined"
              placeholder="Sorts, monstres, objets, règles…"
              class="min-w-0 flex-1 bg-transparent py-4 text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              autocomplete="off"
              spellcheck="false"
            >
            <span v-if="loading" class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400" aria-hidden="true"></span>
            <button type="button" class="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200" @click="closeGlobalSearch">Échap</button>
          </div>

          <div id="global-search-results" role="listbox" aria-label="Résultats" class="overflow-y-auto overscroll-contain px-2 pb-2">
            <p v-if="error" class="px-3 py-6 text-center text-sm text-red-300" role="alert">{{ error }}</p>
            <p v-else-if="searched && !results.length" class="px-3 py-6 text-center text-sm text-zinc-400">Aucun résultat pour « {{ searched }} ».</p>
            <p v-else-if="!searched" class="px-3 py-6 text-center text-sm text-zinc-500">
              Accents et petites fautes de frappe sont tolérés ; les noms anglais marchent aussi.
            </p>

            <section v-for="group in groups" :key="group.kind" class="mt-3">
              <h3 class="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">{{ group.label }}</h3>
              <div v-for="r in group.results" :key="`${r.kind}-${r.index}`">
                <button
                  :id="optionId(position(r))"
                  type="button"
                  role="option"
                  :aria-selected="position(r) === active"
                  :aria-expanded="resultLink(r) ? undefined : expanded === key(r)"
                  :class="[
                    'flex w-full items-baseline gap-3 rounded-xl px-3 py-2 text-left transition-colors',
                    position(r) === active ? 'bg-amber-500/10 text-amber-50' : 'text-zinc-200 hover:bg-white/5',
                  ]"
                  @mousemove="active = position(r)"
                  @click="choose(r)"
                >
                  <span class="min-w-0 flex-1 truncate">
                    <span class="font-medium">{{ r.name }}</span>
                    <span v-if="r.matched" class="ml-2 text-xs text-zinc-500">{{ r.matched }}</span>
                  </span>
                  <span v-if="resultDetail(r)" class="shrink-0 text-xs text-zinc-500">{{ resultDetail(r) }}</span>
                  <svg v-if="!resultLink(r)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" :class="['h-4 w-4 shrink-0 self-center text-zinc-500 transition-transform', expanded === key(r) && 'rotate-180']" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.942l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0l-4.24-4.24a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" />
                  </svg>
                </button>
                <div v-if="expanded === key(r)" class="mx-3 mb-2 rounded-xl border border-white/5 bg-white/3 px-3 py-2 text-sm leading-relaxed text-zinc-300">
                  <MarkdownText v-if="r.text" :text="r.text" />
                  <p v-else class="text-zinc-500">Pas de description.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownText from '@/components/MarkdownText.vue'
import { searchSrd, type SearchResult } from '@/api/search'
import { closeGlobalSearch, useGlobalSearch } from '@/composables/useGlobalSearch'
import { groupResults, resultDetail, resultLink } from '@/utils/searchFormat'

const DEBOUNCE_MS = 200

const { isOpen } = useGlobalSearch()
const router = useRouter()
const route = useRoute()
const input = ref<HTMLInputElement | null>(null)
const query = ref('')
const results = ref<SearchResult[]>([])
// Recherche dont les résultats sont affichés
const searched = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const active = ref(-1)
const expanded = ref<string | null>(null)

const groups = computed(() => groupResults(results.value))
// Ordre des flèches du clavier : celui de l'affichage, groupe par groupe
const flat = computed(() => groups.value.flatMap((g) => g.results))
const key = (r: SearchResult) => `${r.kind}-${r.index}`
const position = (r: SearchResult) => flat.value.indexOf(r)
const optionId = (i: number) => `global-search-option-${i}`

let timer: ReturnType<typeof setTimeout> | undefined
let controller: AbortController | null = null

watch(query, (q) => {
  clearTimeout(timer)
  controller?.abort()
  const wanted = q.trim()
  if (wanted.length < 2) {
    results.value = []
    searched.value = ''
    loading.value = false
    error.value = null
    return
  }
  timer = setTimeout(() => run(wanted), DEBOUNCE_MS)
})

async function run(q: string) {
  controller = new AbortController()
  loading.value = true
  try {
    results.value = await searchSrd(q, controller.signal)
    searched.value = q
    error.value = null
    active.value = results.value.length ? 0 : -1
    expanded.value = null
  } catch (e) {
    if ((e as Error).name === 'AbortError') return
    error.value = 'La recherche est indisponible pour le moment.'
  }
  loading.value = false
}

function choose(r: SearchResult) {
  const link = resultLink(r)
  if (link) {
    closeGlobalSearch()
    router.push(link)
  } else {
    expanded.value = expanded.value === key(r) ? null : key(r)
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeGlobalSearch()
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    if (!flat.value.length) return
    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    active.value = (active.value + step + flat.value.length) % flat.value.length
    nextTick(() => document.getElementById(optionId(active.value))?.scrollIntoView({ block: 'nearest' }))
  } else if (event.key === 'Enter' && event.target === input.value) {
    const r = flat.value[active.value]
    if (r) {
      event.preventDefault()
      choose(r)
    }
  }
}

// À l'ouverture : la saisie prend le focus, la page ne défile plus derrière
watch(isOpen, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (!open) return
  await nextTick()
  input.value?.select()
})

watch(() => route.fullPath, closeGlobalSearch)
</script>

<style scoped>
.global-search-enter-active,
.global-search-leave-active {
  transition: opacity 160ms ease;
}
.global-search-enter-from,
.global-search-leave-to {
  opacity: 0;
}
</style>
