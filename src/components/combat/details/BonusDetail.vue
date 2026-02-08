<template>
  <div class="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
    <div class="bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
      <h3 class="font-bold text-amber-500 mb-1">Pas automatique !</h3>
      <p class="text-sm text-zinc-300">
        Tu ne peux utiliser une action bonus <strong>QUE</strong> si une capacité te le permet.
      </p>
    </div>

    <h4 class="font-serif text-white border-b border-zinc-700 pb-2 mt-6">Les classiques</h4>
    <div class="space-y-2">
      <div class="p-3 bg-zinc-800 rounded border border-zinc-700">
        <div class="flex justify-between font-bold text-sm text-amber-200">
          <span>Combat à deux armes</span>
          <span>⚔️</span>
        </div>
        <p class="text-xs text-zinc-400 mt-1">Si tu attaques avec une arme légère en main principale, tu peux attaquer avec l'autre (sans bonus aux dégâts).</p>
      </div>
      <div class="p-3 bg-zinc-800 rounded border border-zinc-700">
        <div class="flex justify-between font-bold text-sm text-amber-200">
          <span>Sorts rapides</span>
          <span>⚡</span>
        </div>
        <p class="text-xs text-zinc-400 mt-1">Les sorts avec un temps d'incantation "1 Action Bonus" (ex: Misty Step, Healing Word).</p>
      </div>
      <div class="p-3 bg-zinc-800 rounded border border-zinc-700">
        <div class="flex justify-between font-bold text-sm text-amber-200">
          <span>Capacités de Classe</span>
          <span>🎓</span>
        </div>
        <p class="text-xs text-zinc-400 mt-1">Rage (Barbare), Ruse (Voleur), Inspiration Bardique...</p>
      </div>
    </div>
  </div>
</template>
