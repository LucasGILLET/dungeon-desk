<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
    <!-- Navigation -->
    <nav class="bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span class="text-xl">🎲</span>
            </div>
            <h1 class="text-xl font-bold text-white">DungeonDesk</h1>
          </div>
          <div class="flex space-x-4">
            <button class="text-white/80 hover:text-white transition-colors">Connexion</button>
            <button class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
              S'inscrire
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-5xl md:text-7xl font-bold text-white mb-6">
            Votre aventure
            <span class="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              D&D
            </span>
            commence ici
          </h1>
          <p class="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
            DungeonDesk est la plateforme ultime pour maîtres du jeu et joueurs débutants. 
            Créez, gérez et partagez vos aventures D&D en toute simplicité.
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <router-link
              to="/gm-dashboard" 
              class="group bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div class="flex items-center space-x-3">
                <span class="text-2xl">🧙‍♂️</span>
                <div class="text-left">
                  <div>Je suis Maître du Jeu</div>
                  <div class="text-sm text-red-100">Gérer mes campagnes</div>
                </div>
              </div>
            </router-link>
            
            <router-link
              to="/character-creator"
              class="group bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div class="flex items-center space-x-3">
                <span class="text-2xl">🧝</span>
                <div class="text-left">
                  <div>Je suis Joueur</div>
                  <div class="text-sm text-blue-100">Créer mon personnage</div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="bg-black/20 backdrop-blur-sm border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-white mb-4">
            Tout ce dont vous avez besoin pour vos aventures
          </h2>
          <p class="text-xl text-white/70">
            Des outils simples et puissants pour enrichir votre expérience D&D
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 - MJ -->
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div class="text-4xl mb-4">🗺️</div>
            <h3 class="text-xl font-semibold text-white mb-3">Gestion de Campagnes</h3>
            <p class="text-white/70">
              Créez et organisez vos campagnes, gérez vos PNJ, quêtes et notes en un seul endroit.
            </p>
          </div>

          <!-- Feature 2 - Joueur -->
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div class="text-4xl mb-4">🧩</div>
            <h3 class="text-xl font-semibold text-white mb-3">Création de Personnage</h3>
            <p class="text-white/70">
              Assistant interactif pour créer votre personnage étape par étape, même pour les débutants.
            </p>
          </div>

          <!-- Feature 3 - Générateurs -->
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div class="text-4xl mb-4">👥</div>
            <h3 class="text-xl font-semibold text-white mb-3">Générateurs Intelligents</h3>
            <p class="text-white/70">
              PNJ, quêtes et scenarios générés automatiquement pour enrichir vos aventures.
            </p>
          </div>

          <!-- Feature 4 - Partage -->
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div class="text-4xl mb-4">🔗</div>
            <h3 class="text-xl font-semibold text-white mb-3">Collaboration</h3>
            <p class="text-white/70">
              Partagez facilement vos fiches de personnage et invitez des joueurs à vos campagnes.
            </p>
          </div>

          <!-- Feature 5 - Export -->
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div class="text-4xl mb-4">💾</div>
            <h3 class="text-xl font-semibold text-white mb-3">Export & Sauvegarde</h3>
            <p class="text-white/70">
              Exportez vos fiches en PDF et sauvegardez tout dans le cloud automatiquement.
            </p>
          </div>

          <!-- Feature 6 - Apprentissage -->
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div class="text-4xl mb-4">💡</div>
            <h3 class="text-xl font-semibold text-white mb-3">Guide pour Débutants</h3>
            <p class="text-white/70">
              Explications et conseils intégrés pour apprendre D&D en créant votre premier personnage.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-black/30 backdrop-blur-sm border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-white/60">
          <p>&copy; 2025 DungeonDesk. Créé avec ❤️ pour la communauté D&D.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Logique de la page d'accueil
</script>
