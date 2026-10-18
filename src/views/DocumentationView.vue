<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GuidePageContent from '@/components/guide/GuidePageContent.vue'
import TableOfContents from '@/components/documentation/TableOfContents.vue'
import { loadGuide, loadGuides, type ApiGuidePage, type ApiGuideSummary } from '@/utils/dataLoader'

// Pages « Apprendre DnD » : guides publiés de l'API, sauf l'aide-mémoire de
// combat qui a sa propre page
const OWN_PAGES = new Set(['combat-cheat-sheet'])

const route = useRoute()
const router = useRouter()
const sections = ref<ApiGuideSummary[]>([])
const page = ref<ApiGuidePage | null>(null)
const error = ref<string | null>(null)

const currentSectionKey = computed(() => {
  const wanted = String(route.query.section ?? '')
  return sections.value.find((s) => s.index === wanted)?.index ?? sections.value[0]?.index ?? null
})

watch(currentSectionKey, async (key) => {
  if (!key) return
  try {
    page.value = await loadGuide(key)
    error.value = null
  } catch {
    error.value = 'Impossible de charger cette page.'
  }
  await nextTick()
  const el = document.getElementById('documentation-content')
  if (el && typeof el.scrollTo === 'function') el.scrollTo({ top: 0, behavior: 'smooth' })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
})

function selectSection(key: string) {
  router.replace({ query: { ...route.query, section: key } })
}

onMounted(async () => {
  try {
    sections.value = (await loadGuides()).filter((g) => !OWN_PAGES.has(g.index))
  } catch {
    error.value = 'Impossible de charger la documentation.'
  }
})
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200 font-sans selection:bg-amber-500/30 relative overflow-visible">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"></div>
      <div class="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 z-10">

      <div class="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8 xl:gap-10">
        <aside class="mt-10 lg:mt-0 lg:sticky lg:top-30 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-visible h-fit lg:col-start-1">
          <div class="rounded-3xl border border-white/5 bg-zinc-900/80 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
            <div class="mb-4">
              <p class="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Navigation</p>
              <h2 class="mt-2 text-lg font-serif font-bold text-amber-100">Changer de sujet</h2>
            </div>

            <div class="grid gap-2">
              <template v-for="section in sections" :key="section.index">
                <button
                  type="button"
                  @click="selectSection(section.index)"
                  class="w-full rounded-xl border px-3 py-2 text-left transition-all duration-200"
                  :class="currentSectionKey === section.index
                    ? 'rounded-b-md border-amber-500/40 bg-amber-500/10 text-amber-50 shadow-[0_0_16px_rgba(245,158,11,0.1)]'
                    : 'border-white/5 bg-white/5 text-zinc-200 hover:border-amber-500/25 hover:bg-amber-500/5 hover:text-amber-50'"
                >
                  <span class="block text-[13px] font-semibold leading-tight">{{ section.title }}</span>
                  <span class="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    {{ section.shortTitle }}
                  </span>
                </button>

                <TableOfContents
                  v-if="currentSectionKey === section.index && page?.index === section.index"
                  target-selector="#documentation-content"
                  :observe-key="page.index"
                  title=""
                  class="-mt-1 rounded-t-md border-t-0"
                />
              </template>
              <router-link
                :to="{ name: 'rules' }"
                class="w-full rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-left text-zinc-200 transition-all duration-200 hover:border-amber-500/25 hover:bg-amber-500/5 hover:text-amber-50"
              >
                <span class="block text-[13px] font-semibold leading-tight">Règles du SRD</span>
                <span class="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">Référence</span>
              </router-link>
            </div>
          </div>
        </aside>

        <main id="documentation-content" class="space-y-6 lg:col-start-2">
          <p v-if="error" class="text-red-300">{{ error }}</p>
          <GuidePageContent v-else-if="page" :page="page" />
          <p v-else class="text-zinc-400">Chargement…</p>
        </main>
      </div>
    </div>
  </div>
</template>
