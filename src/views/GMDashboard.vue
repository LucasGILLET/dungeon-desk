<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-amber-500/30 flex flex-col relative overflow-hidden">
    <!-- Background Effects -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-[128px]"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-[128px]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_100%)]"></div>
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E')"></div>    </div>

    <!-- Navigation -->
    <nav class="sticky top-0 z-50 border-b border-red-900/30 bg-zinc-950/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <router-link to="/" class="flex items-center space-x-3 group cursor-pointer hover:opacity-80 transition-opacity">
            <h1 class="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-amber-600 bg-clip-text text-transparent font-serif tracking-wide">
              Assistant MJ
            </h1>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Coming Soon Content -->
    <div class="flex-grow flex flex-col items-center justify-center p-4 z-10">
      <div class="relative max-w-lg w-full">
        <!-- Decorative Glow -->
        <div class="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl blur opacity-25"></div>
        
        <div class="relative bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center">
          
          <div class="w-20 h-20 mb-6 rounded-full bg-red-900/20 border border-red-500/20 flex items-center justify-center">
            <span class="text-4xl">🚧</span>
          </div>

          <h2 class="text-3xl font-bold text-white mb-4 font-serif">Zone Interdite</h2>
          
          <p class="text-lg text-zinc-400 mb-8 leading-relaxed">
            Cette section du donjon est encore en cours d'excavation par nos gobelins ingénieurs. Revenez plus tard, aventurier !
          </p>

          <router-link 
            to="/" 
            class="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-serif font-bold tracking-wide text-white transition-all duration-300 bg-red-900/50 rounded-lg hover:bg-red-800 border border-red-700/50 hover:border-red-500"
          >
            <span class="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
            <span class="relative flex items-center gap-2">
              <span>🛡️</span> Retour à l'accueil
            </span>
          </router-link>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pas de logique spécifique
</script>
