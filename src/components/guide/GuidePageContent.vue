<template>
  <section class="space-y-6">
    <section class="rounded-3xl border border-white/5 bg-white/3 p-5 md:p-6">
      <div class="flex flex-wrap items-center gap-3">
        <span
          v-if="page.shortTitle"
          class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em]"
          :class="accent.text"
        >{{ page.shortTitle }}</span>
        <span v-if="page.eyebrow" class="text-xs uppercase tracking-[0.25em] text-zinc-500">{{ page.eyebrow }}</span>
      </div>
      <h2 class="mt-4 font-serif text-2xl font-bold text-white md:text-4xl">{{ page.heading ?? page.title }}</h2>
    </section>

    <MarkdownText v-if="page.intro" :text="page.intro" class="px-5" />

    <template v-for="section in page.sections" :key="section.index">
      <section v-if="section.title || section.body" class="grid gap-4 px-5" :class="{ 'py-2': section.level === 1 }">
        <h2 v-if="section.title" :class="HEADING_CLASSES[section.level] ?? HEADING_CLASSES[1]">{{ section.title }}</h2>
        <MarkdownText v-if="section.body" :text="section.body" />
      </section>
      <section v-if="section.cards.length" class="grid gap-4 md:grid-cols-2" :class="{ 'xl:grid-cols-3': section.cards.length > 4 }">
        <GuideCardItem v-for="card in section.cards" :key="card.index" :card="card" />
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownText from '@/components/MarkdownText.vue'
import GuideCardItem from '@/components/guide/GuideCardItem.vue'
import type { ApiGuidePage } from '@/utils/dataLoader'
import { accentClasses } from '@/utils/guideAccent'

const props = defineProps<{ page: ApiGuidePage }>()
const accent = computed(() => accentClasses(props.page.accent, 'AMBER'))

// Titres de plus en plus petits selon le niveau de la section
const HEADING_CLASSES: Record<number, string> = {
  1: 'text-4xl text-amber-400',
  2: 'text-3xl text-amber-200',
  3: 'text-2xl text-amber-100',
}
</script>
