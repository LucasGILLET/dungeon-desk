<template>
  <div role="status" aria-live="polite" class="max-w-7xl mx-auto space-y-6">
    <!-- Fiche de personnage en cours de chargement : en-tête et trois colonnes -->
    <span class="sr-only">Chargement de la fiche…</span>
    <div class="space-y-2 border-b border-zinc-800 pb-5" aria-hidden="true">
      <div class="ui-skeleton h-3 w-28"></div>
      <div class="ui-skeleton h-10 w-72"></div>
      <div class="ui-skeleton h-4 w-96 max-w-full"></div>
    </div>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3" aria-hidden="true">
      <div v-for="col in 3" :key="col" class="space-y-6">
        <div v-for="panel in 2" :key="panel" class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div class="ui-skeleton mb-4 h-3 w-24"></div>
          <div v-if="col === 1 && panel === 1" class="grid grid-cols-3 gap-3">
            <div v-for="i in 6" :key="i" class="ui-skeleton h-16"></div>
          </div>
          <div v-else class="space-y-2">
            <div v-for="i in 5" :key="i" class="ui-skeleton h-3.5" :style="{ width: `${60 + ((i * col * 11) % 35)}%` }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
