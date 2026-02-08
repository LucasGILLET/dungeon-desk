<template>
  <div class="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div class="p-6 bg-sky-900/10 border border-sky-500/20 rounded-xl text-center">
        <span class="text-4xl mb-4 block">🦶</span>
        <h3 class="font-bold text-sky-400 text-xl mb-2">9m / 30ft</h3>
        <p class="text-zinc-400 text-sm">C'est la vitesse standard de la plupart des races.</p>
      </div>

      <ul class="space-y-3">
        <li class="bg-zinc-800 p-4 rounded-lg flex gap-4">
          <span class="text-2xl">✂️</span>
          <div class="text-sm">
            <strong class="block text-white mb-1">Fractionnable</strong>
            Tu peux bouger, attaquer, et finir ton mouvement après.
          </div>
        </li>
        <li class="bg-zinc-800 p-4 rounded-lg flex gap-4">
          <span class="text-2xl">🏔️</span>
          <div class="text-sm">
            <strong class="block text-white mb-1">Terrain difficile</strong>
            Sur terrain difficile, chaque mètre coûte le double.
          </div>
        </li>
        <li class="bg-zinc-800 p-4 rounded-lg flex gap-4">
          <span class="text-2xl">🤸</span>
          <div class="text-sm">
            <strong class="block text-white mb-1">Se relever</strong>
            Coûte la <span class="text-sky-400">moitié</span> de ta vitesse max.
          </div>
        </li>
      </ul>
  </div>
</template>
