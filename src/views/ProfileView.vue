<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-200 font-sans pt-20 pb-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- En-tête -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-zinc-800 pb-6">
        <div>
           <h1 class="text-3xl font-bold bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 bg-clip-text text-transparent font-serif mb-2">
            Sanctuaire du Gardien
          </h1>
          <p class="text-zinc-400">Gérez vos créations et vos campagnes</p> 
        </div>
        <div class="flex items-center gap-4 mt-4 md:mt-0">
             <div class="text-right mr-4 hidden md:block">
                <div class="text-white font-bold">{{ authStore.user?.nickname || authStore.user?.name }}</div>
                <div class="text-xs text-zinc-500">{{ authStore.user?.email }}</div>
             </div>
             <button @click="handleLogout" class="bg-red-900/20 hover:bg-red-900/40 text-red-400 px-4 py-2 rounded-lg border border-red-900/50 transition-colors text-sm">
                Se Déconnecter
             </button>
        </div>
      </div>

      <!-- Contenu Principal -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1 space-y-4">
            <div class="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <h3 class="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Bibliothèque</h3>
                <nav class="space-y-2">
                    <button @click="viewMode = 'characters'" 
                            class="w-full text-left px-3 py-2 rounded-lg font-medium flex items-center justify-between transition-colors"
                            :class="viewMode === 'characters' ? 'bg-amber-900/30 text-amber-400 border border-amber-900/50' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'">
                        <span>Personnages (PJ)</span>
                        <span class="text-xs px-2 py-0.5 rounded-full" :class="viewMode === 'characters' ? 'bg-amber-900/50 text-amber-200' : 'bg-zinc-700'">{{ characterStore.characters.length }}</span>
                    </button>

                    <button @click="viewMode = 'npcs'" 
                            class="w-full text-left px-3 py-2 rounded-lg font-medium flex items-center justify-between transition-colors"
                            :class="viewMode === 'npcs' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'">
                        <span>PNJ</span>
                        <span class="text-xs px-2 py-0.5 rounded-full" :class="viewMode === 'npcs' ? 'bg-emerald-900/50 text-emerald-200' : 'bg-zinc-700'">{{ npcStore.npcs.length }}</span>
                    </button>
                    
                     <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors flex items-center justify-between opacity-50 cursor-not-allowed">
                        <span>Campagnes</span>
                        <span class="text-xs">Bientôt</span>
                    </button>
                </nav>
            </div>
            
             <div v-if="viewMode === 'npcs'" class="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-xl p-6 border border-emerald-900/30">
                <h3 class="text-emerald-400 font-serif font-bold mb-2">Besoin d'un nouveau PNJ ?</h3>
                <p class="text-sm text-zinc-400 mb-4">Le générateur est prêt à invoquer une nouvelle âme pour votre histoire.</p>
                <router-link to="/npc-generator" class="block text-center bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all">
                    Aller au Générateur
                </router-link>
            </div>

            <div v-else class="bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-xl p-6 border border-amber-900/30">
                <h3 class="text-amber-400 font-serif font-bold mb-2">Un nouveau Héros ?</h3>
                <p class="text-sm text-zinc-400 mb-4">Forgelez votre destin de A à Z avec notre créateur complet.</p>
                <router-link to="/character-creator" class="block text-center bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-lg text-sm font-bold shadow-lg shadow-amber-900/20 transition-all">
                    Créer un Personnage
                </router-link>
            </div>
        </div>

        <!-- Liste Principale -->
        <div class="lg:col-span-3">
            
            <!-- SECTION NPC -->
            <div v-if="viewMode === 'npcs'">
                <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>🎭</span> Vos Personnages Non-Joueurs
                </h2>

                <div v-if="npcStore.loading" class="flex justify-center py-20">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>

                <div v-else-if="npcStore.npcs.length === 0" class="bg-zinc-900/30 border border-zinc-800 border-dashed rounded-xl p-12 text-center">
                    <div class="text-5xl mb-4 grayscale opacity-30">📜</div>
                    <h3 class="text-lg font-medium text-zinc-300 mb-2">Votre codex PNJ est vide</h3>
                    <router-link to="/npc-generator" class="inline-flex items-center px-4 py-2 mt-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">
                        Créer un PNJ
                    </router-link>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div v-for="npc in npcStore.npcs" :key="npc.id" class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg overflow-hidden group transition-all hover:shadow-xl hover:shadow-black/50 flex flex-col">
                        <div class="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        <div class="p-5 flex-grow">
                             <div class="flex justify-between items-start mb-2">
                                 <div>
                                    <h3 class="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">{{ npc.name }}</h3>
                                    <div class="text-xs text-zinc-500">{{ new Date(npc.createdAt).toLocaleDateString() }}</div>
                                 </div>
                                  <span class="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                    {{ npc.race }}
                                </span>
                             </div>
                             <div class="space-y-1 my-3">
                                 <div class="flex items-center justify-between text-sm">
                                     <span class="text-zinc-500">Classe</span>
                                     <span class="text-zinc-300">{{ npc.class || 'Aucune' }}</span>
                                 </div>
                                 <div class="flex items-center justify-between text-sm">
                                     <span class="text-zinc-500">Métier</span>
                                     <span class="text-zinc-300 truncate max-w-[120px] text-right" :title="npc.data.profession">{{ npc.data.profession }}</span>
                                 </div>
                             </div>
                        </div>
                        <div class="bg-zinc-950/50 p-3 border-t border-zinc-800 flex justify-between items-center">
                            <span class="text-xs text-zinc-600">PNJ</span>
                            <button @click="deleteNpc(npc.id)" class="text-zinc-600 hover:text-red-500 p-1 transition-colors">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECTION CHARACTERS -->
            <div v-else>
                <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>⚔️</span> Vos Personnages (PJ)
                </h2>

                <div v-if="characterStore.loading" class="flex justify-center py-20">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                </div>

                <div v-else-if="characterStore.characters.length === 0" class="bg-zinc-900/30 border border-zinc-800 border-dashed rounded-xl p-12 text-center">
                    <div class="text-5xl mb-4 grayscale opacity-30">🛡️</div>
                    <h3 class="text-lg font-medium text-zinc-300 mb-2">Aucun héros n'a encore répondu à l'appel</h3>
                    <router-link to="/character-creator" class="inline-flex items-center px-4 py-2 mt-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">
                        Créer un Personnage
                    </router-link>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div v-for="char in characterStore.characters" :key="char.id" class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg overflow-hidden group transition-all hover:shadow-xl hover:shadow-black/50 flex flex-col">
                        <div class="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        <div class="p-5 flex-grow">
                             <div class="flex justify-between items-start mb-2">
                                 <div>
                                    <h3 class="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">{{ char.name }}</h3>
                                    <div class="text-xs text-zinc-500">{{ new Date(char.createdAt).toLocaleDateString() }}</div>
                                 </div>
                                  <span class="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                    Niv. {{ char.level }}
                                </span>
                             </div>
                             <div class="space-y-1 my-3">
                                 <div class="flex items-center justify-between text-sm">
                                     <span class="text-zinc-500">Race</span>
                                     <span class="text-zinc-300">{{ char.race }}</span>
                                 </div>
                                 <div class="flex items-center justify-between text-sm">
                                     <span class="text-zinc-500">Classe</span>
                                     <span class="text-zinc-300">{{ char.class }}</span>
                                 </div>
                                  <div class="flex items-center justify-between text-sm">
                                     <span class="text-zinc-500">Sous-classe</span>
                                     <span class="text-zinc-300 truncate max-w-[100px]">{{ char.data.subclass?.name || '-' }}</span>
                                 </div>
                             </div>
                        </div>
                        <div class="bg-zinc-950/50 p-3 border-t border-zinc-800 flex justify-between items-center">
                            <span class="text-xs text-zinc-600">Joueur</span>
                            <div class="flex gap-2">
                                <!-- Future: Edit/View buttons -->
                                <router-link :to="`/character/${char.id}`" class="text-xs font-medium text-zinc-400 hover:text-white transition-colors">Voir</router-link>
                                <button class="text-zinc-600 hover:text-red-500 p-1 transition-colors">🗑️</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useNpcStore } from '../stores/npc';
import { useCharacterStore } from '../stores/character';

const router = useRouter();
const authStore = useAuthStore();
const npcStore = useNpcStore();
const characterStore = useCharacterStore();

const viewMode = ref<'npcs' | 'characters'>('characters'); 

onMounted(async () => {
    // Le guard de route assure déjà l'authentification
    // Le token sera récupéré automatiquement par authenticatedFetch si nécessaire
    
    await Promise.all([
        npcStore.fetchNpcs().catch(e => console.error(e)),
        characterStore.fetchCharacters().catch(e => console.error(e))
    ]);
});

const handleLogout = () => {
    authStore.logout();
};

const deleteNpc = async (id: number) => {
    if(confirm('Êtes-vous sûr de vouloir supprimer ce PNJ ? Cette action est irréversible.')) {
        await npcStore.deleteNpc(id); 
    }
}
</script>
