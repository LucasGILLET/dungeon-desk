<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DocumentationClassesSection from '@/components/documentation/DocumentationClassesSection.vue'
import DocumentationRacesSection from '@/components/documentation/DocumentationRacesSection.vue'
import DocumentationCombatSection from '@/components/documentation/DocumentationCombatSection.vue'
import DocumentationBackgroundSection from '@/components/documentation/DocumentationBackgroundSection.vue'
import TableOfContents from '@/components/documentation/TableOfContents.vue'

type DocSectionKey = 'classes' | 'races' | 'combat' | 'background'

type DocSection = {
  key: DocSectionKey
  label: string
  shortLabel: string
  component: unknown
}

const sections: DocSection[] = [
  {
    key: 'classes',
    label: 'Choix de classe',
    shortLabel: 'Classes',
    component: DocumentationClassesSection
  },
  {
    key: 'races',
    label: 'Choix de race',
    shortLabel: 'Races',
    component: DocumentationRacesSection
  },
  // {
  //   key: 'combat',
  //   label: 'Conseils de combat',
  //   shortLabel: 'Combat',
  //   component: DocumentationCombatSection
  // },
  // {
  //   key: 'background',
  //   label: 'Créer le background',
  //   shortLabel: 'Background',
  //   component: DocumentationBackgroundSection
  // }
]

const route = useRoute()
const router = useRouter()
const currentSectionKey = ref<DocSectionKey>('classes')

function normalizeSection(section: unknown): DocSectionKey {
  return section === 'races' ? 'races' : 'classes'
}

watch(
  () => route.query.section,
  (section) => {
    currentSectionKey.value = normalizeSection(section)
  },
  { immediate: true }
)

const currentSection = computed(() => {
  return sections.find(section => section.key === currentSectionKey.value) ?? sections[0]!
})

watch(currentSectionKey, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

function selectSection(key: DocSectionKey) {
  currentSectionKey.value = key
  router.replace({
    query: {
      ...route.query,
      section: key
    }
  })
}
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
              <template v-for="section in sections" :key="section.key">
                <button
                  type="button"
                  @click="selectSection(section.key)"
                  class="w-full rounded-xl border px-3 py-2 text-left transition-all duration-200"
                  :class="currentSectionKey === section.key
                    ? 'rounded-b-md border-amber-500/40 bg-amber-500/10 text-amber-50 shadow-[0_0_16px_rgba(245,158,11,0.1)]'
                    : 'border-white/5 bg-white/5 text-zinc-200 hover:border-amber-500/25 hover:bg-amber-500/5 hover:text-amber-50'"
                >
                  <span class="block text-[13px] font-semibold leading-tight">{{ section.label }}</span>
                  <span class="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    {{ section.shortLabel }}
                  </span>
                </button>

                <TableOfContents
                  v-if="currentSectionKey === section.key"
                  target-selector="#documentation-content"
                  :observe-key="currentSectionKey"
                  title=""
                  class="-mt-1 rounded-t-md border-t-0"
                />
              </template>
            </div>
          </div>
        </aside>

        <main id="documentation-content" class="space-y-6 lg:col-start-2">
          <component :is="currentSection.component" />
        </main>
      </div>
    </div>
  </div>
</template>
