<template>
  <div class="relative min-h-screen pt-20 text-zinc-200 font-sans selection:bg-amber-500/30">
      <!-- Particles Engine (Golden Threads) -->
      <vue-particles
        id="tsparticles"
        :options="particlesOptions"
      />

    <!-- Hero Section -->
    <div class="relative flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] overflow-hidden">
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 w-full flex flex-col h-full justify-center grow">
        <!-- Decoration Line -->
        <div class="flex items-center justify-center gap-4 mb-8 opacity-60">
          <div class="h-px w-16 bg-linear-to-r from-transparent to-amber-500"></div>
          <div class="w-2 h-2 rotate-45 bg-amber-500"></div>
          <div class="h-px w-16 bg-linear-to-l from-transparent to-amber-500"></div>
        </div>

        <h1 class="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight font-serif drop-shadow-2xl">
          Écrivez votre <br/>
          <span class="relative inline-block mt-2">
            <span class="absolute -inset-1 rounded-lg bg-linear-to-r from-amber-600/20 to-red-600/20 blur-xl"></span>
            <span class="relative bg-linear-to-r from-amber-200 via-orange-400 to-amber-200 bg-clip-text text-transparent bg-size-[200%_auto] animate-shine">
              Légende
            </span>
          </span>
        </h1>
        
        <p class="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light">
          Créez. Explorez. Jouez.
        </p>

      </div>
      
      <!-- Role Selection Buttons (Bottom aligned) -->
      <div class="relative z-10 w-full pb-16 pt-8">
        <div class="flex flex-col sm:flex-row justify-center gap-6 px-4">
          
          <a href="#players-section" class="relative group p-6 bg-zinc-900 border border-blue-900/50 hover:border-blue-500 rounded-xl overflow-hidden transition-all duration-300 w-full sm:w-48 text-center flex flex-col items-center gap-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20">
             <div class="absolute inset-0 bg-linear-to-b from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
             <div class="relative p-4 rounded-full bg-blue-950/30 border border-blue-900/30 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400 group-hover:text-white transition-colors">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
             </div>
             <span class="font-bold text-lg text-blue-100 group-hover:text-white font-serif tracking-wide">Je suis Joueur</span>
          </a>

          <a href="#gm-section" class="relative group p-6 bg-zinc-900 border border-red-900/50 hover:border-red-500 rounded-xl overflow-hidden transition-all duration-300 w-full sm:w-48 text-center flex flex-col items-center gap-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/20">
             <div class="absolute inset-0 bg-linear-to-b from-red-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
             <div class="relative p-4 rounded-full bg-red-950/30 border border-red-900/30 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400 group-hover:text-white transition-colors">
                  <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                </svg>
             </div>
             <span class="font-bold text-lg text-red-100 group-hover:text-white font-serif tracking-wide">Je suis MJ</span>
          </a>

        </div>
      </div>
    </div>


    <!-- Players Section -->
    <div id="players-section" class="relative min-h-180 flex items-center border-t border-white/5 bg-zinc-950/20 scroll-mt-20 z-10">
      <div class="absolute inset-0 bg-linear-to-br from-blue-950/80 via-zinc-950/95 to-blue-950/0 pointer-events-none opacity-50"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,58,138,0.15),transparent_0%)] pointer-events-none"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-24">
        <div class="text-center mb-16">
           <h2 class="text-3xl md:text-5xl font-bold text-blue-50 mb-6 font-serif tracking-tight">Pour les Aventuriers</h2>
           <p class="text-blue-200/40 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">Forgez votre héros et préparez-vous au combat.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Player Button -->
          <router-link
            to="/character-creator"
            class="group relative w-full overflow-hidden rounded-xl bg-zinc-900 border border-blue-900/50 hover:border-blue-500/50 transition-all duration-300"
          >
            <div class="absolute inset-0 bg-linear-to-br from-blue-900/20 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative px-6 py-8 flex flex-col items-center gap-6 text-center">
              <div class="shrink-0 w-20 h-20 rounded-full bg-blue-900/30 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(30,58,138,0.3)]">
                <IconSparkles class="w-10 h-10 text-zinc-400 group-hover:text-amber-400 transition-colors" />
              </div>
              <div class="min-w-0">
                <div class="text-blue-200 font-serif font-bold text-2xl group-hover:text-blue-100 transition-colors mb-2">Créer un Personnage</div>
                <div class="text-blue-400/60 text-sm font-medium uppercase tracking-wider">Forger son héros</div>
              </div>
            </div>
          </router-link>

          <!-- Combat Cheat Sheet Button -->
          <router-link
            to="/combat-cheat-sheet"
            class="group relative w-full overflow-hidden rounded-xl bg-zinc-900 border border-yellow-900/50 hover:border-yellow-500/50 transition-all duration-300"
          >
            <div class="absolute inset-0 bg-linear-to-br from-yellow-900/20 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative px-6 py-8 flex flex-col items-center gap-6 text-center">
              <div class="shrink-0 w-20 h-20 rounded-full bg-yellow-900/30 border border-yellow-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                <!-- Icon: Axe -->
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-200">
                  <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/>
                </svg>
              </div>
              <div class="min-w-0">
                <div class="text-yellow-200 font-serif font-bold text-2xl group-hover:text-yellow-100 transition-colors mb-2">Aide de Combat</div>
                <div class="text-yellow-400/60 text-sm font-medium uppercase tracking-wider">Les règles essentielles</div>
              </div>
            </div>
          </router-link>

          <router-link
            to="/documentation"
            class="group relative w-full overflow-hidden rounded-xl bg-zinc-900 border border-amber-900/50 hover:border-amber-500/50 transition-all duration-300"
          >
            <div class="absolute inset-0 bg-linear-to-br from-amber-900/20 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative px-6 py-8 flex flex-col items-center gap-6 text-center">
              <div class="shrink-0 w-20 h-20 rounded-full bg-amber-900/30 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(180,83,9,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-200">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>
                  <path d="M8 6h8"/>
                  <path d="M8 10h6"/>
                </svg>
              </div>
              <div class="min-w-0">
                <div class="text-amber-200 font-serif font-bold text-2xl group-hover:text-amber-100 transition-colors mb-2">Documentation</div>
                <div class="text-amber-400/60 text-sm font-medium uppercase tracking-wider">Guides et conseils</div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- GM Section -->
    <div id="gm-section" class="relative min-h-180 flex items-center bg-zinc-950/20 scroll-mt-47 z-10">
      <div class="absolute inset-0 bg-linear-to-tl from-red-950/80 via-zinc-950/95 to-red-950/0 pointer-events-none opacity-50"></div>
      <div class="absolute inset-0 bg-linear-to-r from-red-950/80 via-zinc-950/95 to-red-950/0 pointer-events-none"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pb-24 pt-0">
        <div class="text-center mb-16">
           <h2 class="text-3xl md:text-5xl font-bold text-red-50 mb-6 font-serif tracking-tight">Pour les Maîtres du Jeu</h2>
           <p class="text-red-200/40 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">Orchestrez vos mondes et donnez vie à vos histoires.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- GM Button -->
          <router-link
            to="/gm-dashboard" 
            class="group relative w-full overflow-hidden rounded-xl bg-zinc-900 border border-red-900/50 hover:border-red-500/50 transition-all duration-300"
          >
            <div class="absolute inset-0 bg-linear-to-br from-red-900/20 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative px-6 py-8 flex flex-col items-center gap-6 text-center">
              <div class="shrink-0 w-20 h-20 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(153,27,27,0.3)]">
                <!-- Icon: Scroll -->
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-200">
                  <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2Z"/><path d="M15 2v4h4"/><path d="M8 10h8"/><path d="M8 14h8"/>
                </svg>
              </div>
              <div class="min-w-0">
                <div class="text-red-200 font-serif font-bold text-2xl group-hover:text-red-100 transition-colors mb-2">Tableau de Bord MJ</div>
                <div class="text-red-400/60 text-sm font-medium uppercase tracking-wider">Tout gérer au même endroit</div>
              </div>
            </div>
          </router-link>

          <!-- NPC Generator Button -->
          <router-link
            to="/npc-generator"
            class="group relative w-full overflow-hidden rounded-xl bg-zinc-900 border border-emerald-900/50 hover:border-emerald-500/50 transition-all duration-300"
          >
            <div class="absolute inset-0 bg-linear-to-br from-emerald-900/20 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative px-6 py-8 flex flex-col items-center gap-6 text-center">
              <div class="shrink-0 w-20 h-20 rounded-full bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <!-- Icon: User/NPC -->
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-200">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="min-w-0">
                <div class="text-emerald-200 font-serif font-bold text-2xl group-hover:text-emerald-100 transition-colors mb-2">Générateur de PNJ</div>
                <div class="text-emerald-400/60 text-sm font-medium uppercase tracking-wider">Création rapide d'acteurs</div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>


    <!-- Footer -->
    <footer class="bg-black border-t border-white/10 relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(245,158,11,0.05),transparent_70%)]"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center gap-2">
           <!-- Icon: D20/Dice -->
            <img src="/favicon.svg" alt="DungeonDesk Logo" class="w-6 h-6 opacity-80" />
            <span class="font-serif font-bold text-amber-500/80">DungeonDesk</span>
          </div>
          <div class="text-zinc-600 text-sm">
            &copy; 2026 DungeonDesk. Forged in code & mana.
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

// Particles Configuration (Golden Threads)

const particlesOptions = {
  fullScreen: { enable: true, zIndex: 0 },
  fpsLimit: 60,
  particles: {
    number: {
      value: 20, 
      density: {
        enable: true,
        width: 800,
        height: 800
      }
    },
    color: {
      value: "#fbbf24"
    },
    shape: {
      type: "circle"
    },
    opacity: {
      value: 0.5,
      random: true, 
      animation: {
        enable: true,
        speed: 1,
        minimumValue: 0.1,
        sync: false
      }
    },
    size: {
      value: { min: 1, max: 2 },
      random: true
    },
    links: {
      enable: true,
      distance: 150,
      color: "#fbbf24",
      opacity: 0.3,
      width: 1
    },
    move: {
      enable: true,
      speed: 0.2,
      direction: "none",
      random: false,
      straight: false,
      outModes: {
        default: "out"
      }
    }
  },
  interactivity: {
    detectsOn: "window", 
    events: {
      onHover: {
        enable: true,
        // mode: "connect", // Creates constellations
        parallax: {
          enable: true,
          force: 60,
          smooth: 50
        }
      },
      resize: {
        enable: true,
        delay: 0.5
      }
    },
    modes: {
      connect: {
        radius: 180,
        links: {
          opacity: 0.5
        }
      }
    }
  },
  detectRetina: true,
  background: {
      color: "#09090b"
  }
}

// Simple Icon Components as functional components

const IconSparkles = () => h('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, [
  h('path', { d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" }),
  h('path', { d: "M3 3l3 3" }),
  h('path', { d: "M7 18l-3 3" }),
  h('path', { d: "M17 18l3 3" }),
  h('path', { d: "M20 3l-3 3" }),
])





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
