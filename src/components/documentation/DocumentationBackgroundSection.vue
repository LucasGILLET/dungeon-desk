<template>
  <section class="space-y-6">
    <section class="rounded-3xl border border-white/5 bg-white/3 p-5 md:p-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-amber-200">
          Background
        </span>
        <span class="text-xs uppercase tracking-[0.25em] text-zinc-500">Créer le background</span>
      </div>
      <h2 class="mt-4 text-2xl md:text-4xl font-serif font-bold text-white">Donner une raison claire d’aventure</h2>
      <p class="mt-4 max-w-3xl text-sm md:text-base leading-relaxed text-zinc-300">
        Le background sert à donner une raison claire d’aventure à ton personnage. Il n’a pas besoin d’être long, mais il doit être utile.
      </p>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <article
        v-for="card in cards"
        :key="card.title"
        class="rounded-2xl border border-white/5 bg-white/3 p-5 text-sm leading-relaxed text-zinc-300 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        :class="card.accent"
      >
        <p class="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{{ card.eyebrow }}</p>
        <h3 class="text-lg font-serif font-bold text-white">{{ card.title }}</h3>
        <p class="mt-3">{{ card.summary }}</p>
        <ul class="mt-4 space-y-2 text-xs text-zinc-400">
          <li v-for="bullet in card.bullets" :key="bullet" class="flex gap-2">
            <span class="mt-[0.35rem] h-1.5 w-1.5 rounded-full bg-amber-300/70 shrink-0"></span>
            <span>{{ bullet }}</span>
          </li>
        </ul>
        <div class="mt-4 rounded-xl border border-white/5 bg-black/20 p-4 text-xs leading-relaxed text-zinc-300">
          <span class="block text-[10px] uppercase tracking-[0.25em] text-amber-300/70 mb-2">À retenir</span>
          {{ card.advice }}
        </div>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
type DocCard = {
  title: string
  eyebrow: string
  summary: string
  bullets: string[]
  advice: string
  accent: string
}

const cards: DocCard[] = [
  {
    title: 'Une origine simple',
    eyebrow: 'Commencer proprement',
    summary: 'Décris d’où vient ton personnage et ce qu’il faisait avant l’aventure.',
    bullets: ['Origine', 'Métier ou ancien rôle', 'Lien avec le monde'],
    advice: 'Un bon background tient souvent en quelques phrases claires.',
    accent: 'from-zinc-400/20 via-white/5 to-transparent border-white/10'
  },
  {
    title: 'Une motivation forte',
    eyebrow: 'Ce qui le pousse à partir',
    summary: 'Donne au personnage une raison d’agir: protéger quelqu’un, chercher une vérité, fuir un passé, prouver quelque chose.',
    bullets: ['But concret', 'Conflit personnel', 'Objectif à moyen terme'],
    advice: 'Une motivation claire rend le personnage plus facile à jouer.',
    accent: 'from-amber-400/20 via-orange-500/10 to-transparent border-amber-500/20'
  },
  {
    title: 'Un trait marquant',
    eyebrow: 'Le détail qui reste',
    summary: 'Ajoute une habitude, une peur, une manie ou une relation importante pour rendre le personnage mémorable.',
    bullets: ['Une manie', 'Une peur', 'Une relation forte'],
    advice: 'Ce détail suffit souvent à rendre un personnage vivant.',
    accent: 'from-emerald-400/20 via-teal-500/10 to-transparent border-emerald-500/20'
  }
]
</script>