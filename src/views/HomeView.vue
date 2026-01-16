<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-amber-500/30">
    <!-- Background Effects -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[128px]"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[128px]"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_100%)]"></div>
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: url(&quot;data:image/svg+xml,%3Csvg)" width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'></div>
    </div>

    <!-- Navigation -->
    <nav class="sticky top-0 z-50 border-b border-amber-900/30 bg-zinc-950/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center space-x-3 group cursor-pointer">
            <div class="relative w-10 h-10 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <div class="absolute inset-0 bg-gradient-to-br from-amber-600 to-red-700 rounded-xl rotate-45 shadow-[0_0_15px_rgba(245,158,11,0.3)]"></div>
              <span class="relative text-xl z-10 text-amber-100">🐉</span>
            </div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent font-serif tracking-wide">
              DungeonDesk
            </h1>
          </div>
          <div class="flex space-x-6 items-center">
            <button class="text-amber-100/70 hover:text-amber-400 font-serif tracking-wider transition-colors text-sm uppercase">Connexion</button>
            <button class="relative px-6 py-2 group overflow-hidden rounded-lg">
              <span class="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-700 to-amber-600 opacity-80 group-hover:opacity-100 transition-opacity"></span>
              <span class="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black/20 to-transparent"></span>
              <span class="relative text-amber-50 font-serif font-bold tracking-wide text-sm flex items-center gap-2">
                Rejoignez l'Aventure
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <!-- Decoration Line -->
        <div class="flex items-center justify-center gap-4 mb-8 opacity-60">
          <div class="h-px w-16 bg-gradient-to-r from-transparent to-amber-500"></div>
          <div class="w-2 h-2 rotate-45 bg-amber-500"></div>
          <div class="h-px w-16 bg-gradient-to-l from-transparent to-amber-500"></div>
        </div>

        <h1 class="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight font-serif drop-shadow-2xl">
          Votre Épopée <br/>
          <span class="relative inline-block mt-2">
            <span class="absolute -inset-1 rounded-lg bg-gradient-to-r from-amber-600/20 to-red-600/20 blur-xl"></span>
            <span class="relative bg-gradient-to-r from-amber-200 via-orange-400 to-amber-200 bg-clip-text text-transparent bg-[200%_auto] animate-shine">
              Légendaire
            </span>
          </span>
        </h1>
        
        <p class="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          Forgelez votre destin. Maîtrisez le chaos. 
          <span class="text-amber-200/80">DungeonDesk</span> est l'artefact ultime pour Maîtres du Donjon et Aventuriers.
        </p>
        
        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <!-- GM Button -->
          <router-link
            to="/gm-dashboard" 
            class="group relative w-full sm:w-auto overflow-hidden rounded-xl bg-zinc-900 border border-red-900/50 hover:border-red-500/50 transition-all duration-300"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-red-900/20 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative px-8 py-5 flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(153,27,27,0.3)]">
                <span class="text-2xl">📜</span>
              </div>
              <div class="text-left">
                <div class="text-red-200 font-serif font-bold text-lg group-hover:text-red-100 transition-colors">Maître du Jeu</div>
                <div class="text-red-400/60 text-sm font-medium uppercase tracking-wider">Orchestrer le monde</div>
              </div>
            </div>
          </router-link>
          
          <!-- Player Button -->
          <router-link
            to="/character-creator"
            class="group relative w-full sm:w-auto overflow-hidden rounded-xl bg-zinc-900 border border-blue-900/50 hover:border-blue-500/50 transition-all duration-300"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative px-8 py-5 flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-blue-900/30 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(30,58,138,0.3)]">
                <span class="text-2xl">⚔️</span>
              </div>
              <div class="text-left">
                <div class="text-blue-200 font-serif font-bold text-lg group-hover:text-blue-100 transition-colors">Aventurier</div>
                <div class="text-blue-400/60 text-sm font-medium uppercase tracking-wider">Forger son héros</div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="relative bg-zinc-900/50 border-t border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-amber-50 mb-4 font-serif">
            L'Arsenal du Rôliste
          </h2>
          <div class="w-24 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto rounded-full mb-6"></div>
          <p class="text-xl text-zinc-400 max-w-2xl mx-auto">
            Une suite d'outils arcaniques conçus pour immortaliser vos légendes.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(feature, index) in features" :key="index" 
            class="group relative p-1 rounded-2xl bg-gradient-to-b from-white/5 to-transparent hover:from-amber-500/20 transition-all duration-500">
            <div class="relative h-full bg-zinc-950 rounded-xl p-8 border border-white/5 hover:border-amber-500/30 transition-colors shadow-lg">
              <div class="text-4xl mb-6 bg-zinc-900 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-amber-500/30 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all duration-300">
                {{ feature.icon }}
              </div>
              <h3 class="text-xl font-bold text-zinc-100 mb-3 font-serif group-hover:text-amber-200 transition-colors">
                {{ feature.title }}
              </h3>
              <p class="text-zinc-500 leading-relaxed text-sm group-hover:text-zinc-400 transition-colors">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-black border-t border-white/10 relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(245,158,11,0.05),transparent_70%)]"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🎲</span>
            <span class="font-serif font-bold text-amber-500/80">DungeonDesk</span>
          </div>
          <div class="text-zinc-600 text-sm">
            &copy; 2026 DungeonDesk. Forged in code & mana.
          </div>
          <div class="flex gap-4">
            <a href="#" class="text-zinc-500 hover:text-amber-400 transition-colors"><span class="sr-only">Twitter</span>🐦</a>
            <a href="#" class="text-zinc-500 hover:text-indigo-400 transition-colors"><span class="sr-only">Discord</span>💬</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const features = [
  {
    icon: '🗺️',
    title: 'Codex de Campagne',
    description: "Organisez vos mondes avec une précision cartographique. PNJ, lieux et intrigues interconnectés dans une toile vivante."
  },
  {
    icon: '✨',
    title: 'Forge d\'Âmes',
    description: "Un créateur de personnage intuitif qui guide vos choix, des origines humbles aux destinées épiques."
  },
  {
    icon: '🎲',
    title: 'Grimoire de Règles',
    description: "Accès instantané aux sorts, monstres et règles du SRD 5e. Ne brisez plus l'immersion pour chercher un point de règle."
  },
  {
    icon: '📜',
    title: 'Parchemins Partagés',
    description: "Invitez vos compagnons. Partagez des aides de jeu secrètes ou publiques en temps réel."
  },
  {
    icon: '🔮',
    title: 'Oracles Intelligents',
    description: "Générateurs procéduraux de butin, de tavernes et de rencontres pour combler les vides de l'improvisation."
  },
  {
    icon: '⚔️',
    title: 'Gestion de Combat',
    description: "Suivi d'initiative et de points de vie fluide pour que chaque affrontement reste intense et rapide."
  }
]
</script>

<style scoped>
.animate-shine {
  animation: shine 8s linear infinite;
}

@keyframes shine {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
</style>
