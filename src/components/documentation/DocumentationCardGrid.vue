<template>
  <section :class="gridClass">
    <article
      v-for="card in cards"
      :key="card.title"
      class="rounded-2xl border border-white/5 bg-white/3 p-5 text-sm leading-relaxed text-zinc-300 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      :class="card.accent"
    >
      <p class="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{{ card.eyebrow }}</p>
      <h3 :class="titleClass">{{ card.title }}</h3>
      <p class="mt-3">{{ card.summary }}</p>
      <ul class="mt-4 space-y-2 text-xs text-zinc-400">
        <li v-for="bullet in card.bullets" :key="bullet" class="flex gap-2">
          <span class="mt-[0.35rem] h-1.5 w-1.5 rounded-full bg-amber-300/70 shrink-0"></span>
          <span>{{ bullet }}</span>
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
export type DocumentationCard = {
  title: string
  eyebrow: string
  summary: string
  bullets: string[]
  accent: string
}

withDefaults(defineProps<{
  cards: DocumentationCard[]
  gridClass?: string
  titleClass?: string
}>(), {
  gridClass: 'grid gap-4 md:grid-cols-2',
  titleClass: 'text-lg font-serif font-bold text-white'
})
</script>