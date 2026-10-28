<template>
  <main class="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
    <div class="text-6xl mb-6 opacity-40">🎲</div>
    <h1 class="font-serif text-3xl sm:text-4xl font-bold text-amber-300">Page introuvable</h1>
    <p class="mt-3 max-w-md text-zinc-400">Un échec critique : cette page n'existe pas, ou plus. Le lien est peut-être ancien ou mal recopié.</p>
    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <router-link to="/" class="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-500">Retour à l'accueil</router-link>
      <router-link to="/sorts" class="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-200 hover:border-zinc-500">Les sorts</router-link>
      <router-link to="/bestiary" class="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-200 hover:border-zinc-500">Le bestiaire</router-link>
    </div>
  </main>
</template>
