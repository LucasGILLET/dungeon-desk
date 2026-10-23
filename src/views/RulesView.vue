<template>
  <div class="relative min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200">
    <div class="relative mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-8">
      <header class="mb-8">
        <h1 class="font-serif text-4xl font-bold tracking-tight text-amber-100 sm:text-5xl">Règles du SRD</h1>
        <p class="mt-2 text-zinc-400">Règles de base de D&amp;D 5e (SRD 5.1)</p>
      </header>

      <p v-if="error" class="text-red-300">{{ error }}</p>

      <div v-else class="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8 xl:gap-10">
        <aside class="mb-6 h-fit lg:sticky lg:top-30 lg:mb-0 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <nav class="rounded-3xl border border-white/5 bg-zinc-900/80 p-4" aria-label="Sommaire des règles">
            <div v-for="chapter in chapters" :key="chapter.index" class="mb-4 last:mb-0">
              <p class="mb-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500">{{ chapter.name }}</p>
              <ul class="space-y-1">
                <li v-for="s in chapter.sections" :key="s.index">
                  <button
                    type="button"
                    class="w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors"
                    :class="s.index === currentIndex ? 'bg-amber-500/15 text-amber-100' : 'text-zinc-300 hover:bg-white/5 hover:text-amber-50'"
                    :aria-current="s.index === currentIndex ? 'page' : undefined"
                    @click="select(s.index)"
                  >{{ s.name }}</button>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <main>
          <article v-if="section" class="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p class="text-xs uppercase tracking-[0.25em] text-zinc-500">{{ section.chapter.name }}</p>
            <h2 class="mt-2 font-serif text-3xl font-bold text-amber-300">{{ section.name }}</h2>
            <MarkdownText :text="body" class="mt-6 text-zinc-300" />
            <div class="mt-8 flex justify-between gap-4 border-t border-white/10 pt-4 text-sm">
              <button v-if="previous" type="button" class="text-zinc-400 hover:text-amber-200" @click="select(previous.index)">← {{ previous.name }}</button>
              <span v-else></span>
              <button v-if="next" type="button" class="text-right text-zinc-400 hover:text-amber-200" @click="select(next.index)">{{ next.name }} →</button>
            </div>
          </article>
          <SkeletonText v-else :lines="12" label="Chargement de la règle…" />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonText from '@/components/skeleton/SkeletonText.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownText from '@/components/MarkdownText.vue'
import { loadRuleChapters, loadRuleSection, type ApiRuleChapter, type ApiRuleSection } from '@/utils/dataLoader'
import { stripLeadingHeading } from '@/utils/markdown'

const route = useRoute()
const router = useRouter()
const chapters = ref<ApiRuleChapter[]>([])
const section = ref<ApiRuleSection | null>(null)
const error = ref<string | null>(null)

// Sections dans l'ordre de lecture, pour précédent / suivant
const ordered = computed(() => chapters.value.flatMap((c) => c.sections))
const currentIndex = computed(() => {
  const wanted = String(route.query.section ?? '')
  return ordered.value.find((s) => s.index === wanted)?.index ?? ordered.value[0]?.index ?? null
})
const position = computed(() => ordered.value.findIndex((s) => s.index === currentIndex.value))
const previous = computed(() => (position.value > 0 ? ordered.value[position.value - 1] : null))
const next = computed(() => ordered.value[position.value + 1] ?? null)
// Le titre de la section est déjà affiché au-dessus du texte
const body = computed(() => (section.value ? stripLeadingHeading(section.value.description) : ''))

function select(index: string) {
  router.push({ name: 'rules', query: { section: index } })
}

watch(currentIndex, async (index) => {
  if (!index) return
  try {
    section.value = await loadRuleSection(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch {
    error.value = 'Impossible de charger cette section.'
  }
})

onMounted(async () => {
  try {
    chapters.value = await loadRuleChapters()
  } catch {
    error.value = 'Impossible de charger les règles.'
  }
})
</script>
