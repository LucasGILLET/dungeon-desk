<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
    <!-- Header -->
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">Test Tailwind CSS</h1>
      <p class="text-lg text-gray-600">Vérification que Tailwind fonctionne correctement</p>
    </header>

    <!-- Main content -->
    <div class="max-w-4xl mx-auto space-y-8">
      
      <!-- Colors Test -->
      <section class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Test des couleurs</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-red-500 h-16 rounded flex items-center justify-center text-white font-medium">Rouge</div>
          <div class="bg-green-500 h-16 rounded flex items-center justify-center text-white font-medium">Vert</div>
          <div class="bg-blue-500 h-16 rounded flex items-center justify-center text-white font-medium">Bleu</div>
          <div class="bg-purple-500 h-16 rounded flex items-center justify-center text-white font-medium">Violet</div>
        </div>
      </section>

      <!-- Typography Test -->
      <section class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Test de typographie</h2>
        <div class="space-y-3">
          <p class="text-xs text-gray-500">Texte très petit (text-xs)</p>
          <p class="text-sm text-gray-600">Texte petit (text-sm)</p>
          <p class="text-base text-gray-700">Texte normal (text-base)</p>
          <p class="text-lg text-gray-800">Texte large (text-lg)</p>
          <p class="text-xl font-medium text-gray-900">Texte extra large (text-xl)</p>
          <p class="text-2xl font-bold text-gray-900">Texte 2xl gras (text-2xl)</p>
        </div>
      </section>

      <!-- Flexbox Test -->
      <section class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Test Flexbox</h2>
        <div class="flex flex-wrap gap-4 justify-center items-center">
          <div class="bg-yellow-300 px-4 py-2 rounded">Item 1</div>
          <div class="bg-orange-300 px-4 py-2 rounded">Item 2</div>
          <div class="bg-pink-300 px-4 py-2 rounded">Item 3</div>
        </div>
      </section>

      <!-- Buttons Test -->
      <section class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Test des boutons</h2>
        <div class="flex flex-wrap gap-4">
          <button class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors">
            Bouton primaire
          </button>
          <button class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors">
            Bouton secondaire
          </button>
          <button class="border border-blue-500 text-blue-500 hover:bg-blue-50 font-medium py-2 px-4 rounded transition-colors">
            Bouton outline
          </button>
        </div>
      </section>

      <!-- Responsive Test -->
      <section class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Test responsive</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-indigo-100 p-4 rounded text-center">
            <p class="text-sm text-indigo-800">1 colonne sur mobile</p>
          </div>
          <div class="bg-indigo-100 p-4 rounded text-center">
            <p class="text-sm text-indigo-800">2 colonnes sur tablette</p>
          </div>
          <div class="bg-indigo-100 p-4 rounded text-center">
            <p class="text-sm text-indigo-800">3 colonnes sur desktop</p>
          </div>
        </div>
      </section>

      <!-- Success Message -->
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Succès !</strong>
        <span class="block sm:inline"> Si vous voyez cette page correctement stylée, Tailwind CSS fonctionne parfaitement.</span>
      </div>

    </div>
  </div>
</template>

<style scoped></style>
