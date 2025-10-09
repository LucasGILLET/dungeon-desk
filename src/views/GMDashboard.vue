<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <router-link to="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span class="text-lg">🎲</span>
              </div>
              <span class="text-lg font-semibold text-gray-900">DungeonDesk</span>
            </router-link>
            <span class="text-gray-400">|</span>
            <span class="text-red-600 font-medium">Assistant MJ</span>
          </div>
          <div class="flex items-center space-x-4">
            <button class="text-gray-600 hover:text-gray-900 transition-colors">
              Profil
            </button>
            <button class="text-gray-600 hover:text-gray-900 transition-colors">
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Header -->
    <div class="bg-gradient-to-r from-red-500 to-red-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center space-x-4">
          <span class="text-4xl">🧙‍♂️</span>
          <div>
            <h1 class="text-3xl font-bold">Tableau de Bord MJ</h1>
            <p class="text-red-100">Gérez vos campagnes, PNJ et quêtes en toute simplicité</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Actions rapides</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center group">
            <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">🗺️</div>
            <div class="font-semibold text-gray-900">Nouvelle Campagne</div>
            <div class="text-sm text-gray-600">Créer une campagne</div>
          </button>
          
          <button class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center group">
            <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</div>
            <div class="font-semibold text-gray-900">Générer PNJ</div>
            <div class="text-sm text-gray-600">Créer un personnage</div>
          </button>
          
          <button class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center group">
            <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">⚔️</div>
            <div class="font-semibold text-gray-900">Nouvelle Quête</div>
            <div class="text-sm text-gray-600">Créer une mission</div>
          </button>
          
          <button class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center group">
            <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">🎲</div>
            <div class="font-semibold text-gray-900">Session en Cours</div>
            <div class="text-sm text-gray-600">Gérer une partie</div>
          </button>
        </div>
      </div>

      <!-- Mes Campagnes -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-900">Mes Campagnes</h2>
          <button class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
            + Nouvelle Campagne
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Exemple de campagne -->
          <div class="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            <div class="h-32 bg-gradient-to-br from-purple-400 to-purple-600"></div>
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 mb-2">La Malédiction de Strahd</h3>
              <p class="text-gray-600 text-sm mb-3">Une campagne gothique dans les brumes de Barovie...</p>
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>4 joueurs</span>
                <span>Session 8</span>
              </div>
              <div class="flex space-x-2 mt-3">
                <button class="flex-1 bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors">
                  Ouvrir
                </button>
                <button class="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                  ⚙️
                </button>
              </div>
            </div>
          </div>

          <!-- Placeholder pour nouvelle campagne -->
          <div class="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 flex items-center justify-center h-64 hover:border-red-400 transition-colors cursor-pointer group">
            <div class="text-center">
              <div class="text-4xl mb-2 group-hover:scale-110 transition-transform">➕</div>
              <div class="font-semibold text-gray-600 group-hover:text-red-500 transition-colors">
                Créer une nouvelle campagne
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques et Outils -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- PNJ Récents -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">PNJ Récents</h3>
            <button class="text-red-500 hover:text-red-600 text-sm font-medium">
              Voir tous
            </button>
          </div>
          <div class="space-y-3">
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-semibold">TB</span>
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Tobias Bergamote</div>
                <div class="text-sm text-gray-600">Marchand • Humain</div>
              </div>
            </div>
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-green-600 font-semibold">EL</span>
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Elara Lunargent</div>
                <div class="text-sm text-gray-600">Prêtresse • Elfe</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quêtes Actives -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Quêtes Actives</h3>
            <button class="text-red-500 hover:text-red-600 text-sm font-medium">
              Voir toutes
            </button>
          </div>
          <div class="space-y-3">
            <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="font-medium text-gray-900">La Taverne Hantée</div>
                <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">En cours</span>
              </div>
              <div class="text-sm text-gray-600 mt-1">Enquête sur les événements étranges...</div>
            </div>
            <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="font-medium text-gray-900">Le Trésor Perdu</div>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Terminée</span>
              </div>
              <div class="text-sm text-gray-600 mt-1">Recherche d'un ancien trésor de pirate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Logique du tableau de bord MJ
</script>
