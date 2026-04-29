<template>
  <section class="space-y-6">
    <section class="rounded-3xl border border-white/5 bg-white/3 p-5 md:p-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-sky-200">
          Combat
        </span>
        <span class="text-xs uppercase tracking-[0.25em] text-zinc-500">Conseils de combat</span>
      </div>
      <h2 class="mt-4 text-2xl md:text-4xl font-serif font-bold text-white">Garder le combat simple et lisible</h2>
      <p class="mt-4 max-w-3xl text-sm md:text-base leading-relaxed text-zinc-300">
        Avant de te perdre dans les détails, retiens surtout que le combat repose sur le positionnement, les actions et la gestion des ressources.
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
            <span class="mt-[0.35rem] h-1.5 w-1.5 rounded-full bg-sky-300/70 shrink-0"></span>
            <span>{{ bullet }}</span>
          </li>
        </ul>
        <div class="mt-4 rounded-xl border border-white/5 bg-black/20 p-4 text-xs leading-relaxed text-zinc-300">
          <span class="block text-[10px] uppercase tracking-[0.25em] text-sky-300/70 mb-2">À retenir</span>
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
    title: 'Commencer simple',
    eyebrow: 'Le premier réflexe',
    summary: 'Si tu débutes, concentre-toi sur une seule routine de combat au lieu de vouloir tout optimiser.',
    bullets: ['Lis ta fiche avant la partie', 'Choisis une action par tour', 'Pose des questions au MJ'],
    advice: 'La simplicité rend le combat beaucoup plus fluide pour les premières sessions.',
    accent: 'from-blue-400/20 via-sky-500/10 to-transparent border-blue-500/20'
  },
  {
    title: 'Bien se placer',
    eyebrow: 'Le vrai gain tactique',
    summary: 'Le placement compte souvent autant que les dégâts. Être au bon endroit peut changer tout un combat.',
    bullets: ['Protège les alliés fragiles', 'Évite les menaces inutiles', 'Cherche les angles favorables'],
    advice: 'Un bon placement vaut parfois plus qu’un gros jet de dégâts.',
    accent: 'from-cyan-400/20 via-teal-500/10 to-transparent border-cyan-500/20'
  },
  {
    title: 'Garder ses ressources',
    eyebrow: 'Ne pas tout claquer trop vite',
    summary: 'Les capacités limitées sont souvent les plus fortes. Il faut apprendre à les garder pour le bon moment.',
    bullets: ['Ne gaspille pas tes ressources', 'Garde une option d’urgence', 'Pense au prochain combat'],
    advice: 'Jouer proprement, c’est aussi savoir quand ne rien faire de spectaculaire.',
    accent: 'from-violet-400/20 via-fuchsia-500/10 to-transparent border-violet-500/20'
  }
]
</script>