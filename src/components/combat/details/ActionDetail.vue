<script setup lang="ts">
defineProps<{
  subCategory: 'attack' | null;
}>();

defineEmits<{
  (e: 'open-sub-category', value: 'attack'): void;
}>();
</script>

<template>
  <Transition
    mode="out-in"
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-8 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-8 opacity-0"
  >
    <!-- VUE PRINCIPALE ACTION -->
    <div v-if="!subCategory" key="menu" class="space-y-6">
        <p class="text-center text-zinc-400 italic mb-4">
        Choisis <strong class="text-white">une seule</strong> option par tour.
        </p>

        <div class="space-y-3">
        <!-- ATTAQUE (Bouton Cliquable) -->
        <button 
            @click="$emit('open-sub-category', 'attack')"
            class="w-full text-left bg-zinc-900 border border-emerald-500/50 rounded-xl p-4 hover:bg-zinc-800 transition-all active:scale-95 group relative overflow-hidden"
        >
            <div class="flex items-center justify-between mb-1 relative z-10">
                <div class="flex items-center gap-3">
                    <span class="bg-emerald-500/10 p-2 rounded text-xl group-hover:bg-emerald-500/20 transition-colors">⚔️</span>
                    <h3 class="font-bold text-emerald-400 text-lg uppercase group-hover:text-emerald-300">Attaquer</h3>
                </div>
                <span class="text-emerald-500/50 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">➔</span>
            </div>
              <p class="text-xs text-zinc-400 pl-[3.25rem] relative z-10">
                Clique pour voir les jets de dés et détails.
            </p>
            <!-- Background effect -->
            <div class="absolute right-[-20px] bottom-[-20px] text-8xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12 pointer-events-none">⚔️</div>
        </button>

        <!-- LANCER UN SORT -->
        <div class="bg-black/40 border border-zinc-700 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-2">
            <span class="bg-zinc-800 p-2 rounded text-xl">🪄</span>
            <h3 class="font-bold text-zinc-200 text-lg uppercase">Lancer un sort</h3>
            </div>
              <p class="text-xs text-zinc-400">
            Vérifie que le temps d'incantation est bien <strong class="text-white">"1 Action"</strong>.
            </p>
        </div>

        <!-- GRILLE AUTRES ACTIONS -->
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                <strong class="block text-emerald-400 mb-1">🛡️ Esquiver</strong>
                <p class="text-xs text-zinc-400">Vous vous tenez prêt à esquiver les attaques ennemis. Pendant ce tour, les ennemis ont un désavantage pour vous attaquer, et vous êtes avanatgés sur vos jets de sauvegarde de dextérité.</p>
            </div>
            <div class="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                <strong class="block text-emerald-400 mb-1">🔍 Chercher</strong>
                <p class="text-xs text-zinc-400">Vous effectuez un test de Perception ou d'Investigation pour trouver quelque chose.</p>
            </div>
            <div class="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                <strong class="block text-emerald-400 mb-1">🫣 Se désengager</strong>
                <p class="text-xs text-zinc-400">Votre déplacement ne provoque pas d'attaque d'opportunité pendant ce tour.</p>
            </div>
            <div class="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                <strong class="block text-emerald-400 mb-1">💨 Foncer</strong>
                <p class="text-xs text-zinc-400">Vous doublez votre vitesse de déplacement pour ce tour.</p>
            </div>
            <div class="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                <strong class="block text-emerald-400 mb-1">🤝 Aider</strong>
                <p class="text-xs text-zinc-400">Vous assistez une créature proche dans sa tâche, lui donnant un avantage sur celle-ci.</p>
            </div>
            <div class="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                <strong class="block text-emerald-400 mb-1">🫣 Se cacher</strong>
                <p class="text-xs text-zinc-400">Vous effectuez un test de Discrétion pour tenter de vous cacher de vos ennemis.</p>
            </div>
            <div class="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                <strong class="block text-emerald-400 mb-1">⏳ Se tenir prêt</strong>
                <p class="text-xs text-zinc-400">Vous attendez des conditions spécifiques pour agir, retardant votre action et déclenchant celle-ci en réaction à un événement.</p>
            </div>
            <div class="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                <strong class="block text-emerald-400 mb-1">🧪 Utiliser un objet</strong>
                <p class="text-xs text-zinc-400">Vous utilisez un objet non magique qui s'utilise au prix de votre action.</p>
            </div>
            <div class="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                <strong class="block text-emerald-400 mb-1">🧪 Utiliser un objet magique</strong>
                <p class="text-xs text-zinc-400">Vous utilisez un objet magique qui s'utilise au prix de votre action.</p>
            </div>
            <div class="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                <strong class="block text-emerald-400 mb-1">🧪 Utiliser une capacité spéciale</strong>
                <p class="text-xs text-zinc-400">Vous utilisez une aptitude de classe ou autre capacité spéciale qui s'utilise au prix d'une action.</p>
            </div>
        </div>
        </div>
    </div>

    <!-- SOUS-CATEGORIE: DETAILS ATTAQUE -->
    <div v-else-if="subCategory === 'attack'" key="attack" class="space-y-6">
        <div class="bg-emerald-900/10 border border-emerald-500/30 p-4 rounded-xl text-center">
            <h3 class="font-serif font-bold text-emerald-400 text-xl mb-4">La Séquence d'Attaque</h3>
            
            <div class="space-y-4">
                <!-- ÉTAPE 1 -->
                <div class="relative bg-zinc-900/50 p-4 rounded-lg border border-zinc-700">
                    <span class="absolute -top-3 -left-3 bg-emerald-600 w-8 h-8 flex items-center justify-center rounded-full font-bold text-white border-2 border-zinc-900">1</span>
                    <h4 class="font-bold text-white mb-2">Jet d'Attaque (Toucher)</h4>
                    <p class="text-xs text-zinc-400 mb-3">Est-ce que je touche l'armure ?</p>
                    <div class="bg-black/50 p-2 rounded text-emerald-300 font-mono text-sm border border-emerald-500/20 inline-block">
                        1d20 + Bonus d'Attaque
                    </div>
                    <div class="mt-2 text-xs text-zinc-500">
                        VS <span class="text-yellow-500 font-bold">CA</span> (Classe d'Armure) cible
                    </div>
                </div>

                <div class="text-zinc-600 text-xl font-bold">⬇️ Si ça touche ⬇️</div>

                <!-- ÉTAPE 2 -->
                <div class="relative bg-zinc-900/50 p-4 rounded-lg border border-zinc-700">
                      <span class="absolute -top-3 -left-3 bg-emerald-600 w-8 h-8 flex items-center justify-center rounded-full font-bold text-white border-2 border-zinc-900">2</span>
                    <h4 class="font-bold text-white mb-2">Jet de Dégâts (Blesser)</h4>
                    <p class="text-xs text-zinc-400 mb-3">Combien ça fait mal ?</p>
                    <div class="bg-black/50 p-2 rounded text-red-300 font-mono text-sm border border-red-500/20 inline-block">
                        Dé de l'arme + Bonus Carac
                    </div>
                      <div class="mt-2 text-xs text-zinc-500">
                        (Ex: 1d8 + 3)
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-4">
            <div class="bg-zinc-800 p-3 rounded-lg text-center">
                <strong class="block text-emerald-400 text-sm mb-1">Critique (20 Nat)</strong>
                <p class="text-[10px] text-zinc-400">Touche auto. Double les dés (pas le bonus).</p>
            </div>
            <div class="bg-zinc-800 p-3 rounded-lg text-center">
                <strong class="block text-red-400 text-sm mb-1">Échec (1 Nat)</strong>
                <p class="text-[10px] text-zinc-400">Rate automatiquement.</p>
            </div>
        </div>

        <div class="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl">
            <h4 class="font-bold text-white text-sm mb-2">Portée & Désavantage</h4>
            <ul class="text-xs text-zinc-400 space-y-2">
                <li>🛑 <strong>Corps à corps :</strong> Si tu tires à distance avec un ennemi collé à toi, tu as le <span class="text-red-400">Désavantage</span>.</li>
                <li>🏹 <strong>Portée longue :</strong> Tirer très loin (2e chiffre de la portée) = <span class="text-red-400">Désavantage</span>.</li>
            </ul>
        </div>
    </div>
  </Transition>
</template>
