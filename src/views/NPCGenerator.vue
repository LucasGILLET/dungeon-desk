<template>
  <div class="min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200 font-sans pt-20 pb-10">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold bg-linear-to-r from-emerald-200 via-teal-400 to-emerald-200 bg-clip-text text-transparent font-serif mb-4">
          Générateur de PNJ Ultra-Complet
        </h1>
        <p class="text-zinc-400 text-lg">
          Créez instantanément des personnages complets avec historique, physique et personnalité.
        </p>
      </div>

      <!-- Controls -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 shadow-lg">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Race Filter -->
          <div>
            <label class="block text-sm font-medium text-zinc-400 mb-2">Race</label>
            <select v-model="selectedRace" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all">
              <option value="">Aléatoire</option>
              <option v-for="race in races" :key="race.index" :value="race">
                {{ race.name }}
              </option>
            </select>
          </div>

          <!-- Class Filter (Optional) -->
          <div>
            <label class="block text-sm font-medium text-zinc-400 mb-2">Classe (Optionnel)</label>
            <select v-model="selectedClass" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all">
              <option value="">Aucune (Roturier)</option>
              <option value="random">Aléatoire</option>
              <option v-for="cls in classes" :key="cls.index" :value="cls">
                {{ cls.name }}
              </option>
            </select>
          </div>
          
           <!-- Gender Filter (Optional) -->
           <div>
            <label class="block text-sm font-medium text-zinc-400 mb-2">Genre</label>
            <select v-model="selectedGender" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all">
              <option value="">Aléatoire</option>
              <option v-for="g in genders" :key="g.code" :value="g.code">
                {{ g.label }}
              </option>
            </select>
          </div>

          <!-- Generate Button -->
          <div class="flex items-end">
            <!-- Désactivé tant que les tables du générateur ne sont pas chargées -->
            <button
              @click="generateNPC"
              :disabled="loading || !races.length"
              class="w-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-wait disabled:opacity-50"
            >
              {{ loading ? 'Chargement…' : 'Générer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Result Card -->
      <div v-if="npc" class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative">
        <div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
        
        <div class="p-8">
          <!-- Header info: Name, Title, Basic ID -->
          <div class="flex flex-col md:flex-row justify-between items-start border-b border-zinc-800 pb-6 mb-6">
            <div>
              <h2 class="text-4xl font-serif text-white font-bold mb-2 tracking-tight">
                {{ npc.firstName }} <span class="text-emerald-200/80">{{ npc.lastName }}</span>
              </h2>
              <div class="flex flex-wrap gap-2 items-center text-sm mt-2">
                <span class="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                  {{ npc.genderLabel }}
                </span>
                <span class="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                  {{ npc.age }} ans ({{ npc.ageCategory }})
                </span>
                <span class="px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 font-semibold border border-emerald-500/30">
                  {{ npc.race.name }}
                </span>
                <span v-if="npc.class" class="px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 font-semibold border border-purple-500/30">
                  {{ npc.class.name }}
                </span>
                <span v-else class="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 border-dashed">
                    Roturier
                </span>
                <span class="px-3 py-1 rounded-full bg-zinc-800 text-amber-500/80 italic border border-zinc-700/50">
                  {{ npc.alignment?.name }}
                </span>
              </div>
            </div>
            
            <div class="mt-4 md:mt-0 md:text-right flex flex-col items-end gap-4">
              <button @click="saveCharacter" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2">
                <span>💾</span> Sauvegarder
              </button>
              <div>
                <div class="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-bold">Profession</div>
                <div class="text-2xl font-serif text-emerald-100">{{ npc.profession }}</div>
                <div class="text-sm text-zinc-400 mt-1">{{ npc.socialStatus }}</div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Column 1: Appearance & Stats -->
            <div class="space-y-6">
              <!-- Appearance Box -->
              <div class="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800">
                <h3 class="text-sm font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                  <span>👤</span> Apparence
                </h3>
                <ul class="space-y-2 text-sm text-zinc-300">
                  <li class="flex justify-between">
                    <span class="text-zinc-500">Taille:</span> 
                    <span>{{ npc.height }}</span>
                  </li>
                  <li class="flex justify-between">
                    <span class="text-zinc-500">Poids:</span>
                    <span>{{ npc.weight }}</span>
                  </li>
                  <li class="flex justify-between">
                    <span class="text-zinc-500">Corpulence:</span>
                    <span class="text-white">{{ npc.bodyType }}</span>
                  </li>
                </ul>
              </div>

               <!-- Stats Box -->
               <div>
                <h3 class="text-sm font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                  <span>📊</span> Caractéristiques
                </h3>
                <div class="grid grid-cols-3 gap-2">
                  <div v-for="(val, stat) in npc.stats" :key="stat" class="bg-zinc-950 p-2 rounded border border-zinc-800 text-center">
                    <div class="text-[10px] text-zinc-500 uppercase font-bold">{{ stat }}</div>
                    <div class="text-lg font-bold text-white leading-tight">{{ val }}</div>
                    <div class="text-[10px] text-zinc-400 font-mono">
                      {{ Math.floor((val - 10) / 2) >= 0 ? '+' : '' }}{{ Math.floor((val - 10) / 2) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Column 2: Social & Bio -->
            <div class="space-y-6 lg:col-span-2">
              
              <!-- Social & Relations -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div class="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800">
                    <h3 class="text-sm font-bold text-teal-500/80 uppercase mb-2">Social / Relations</h3>
                    <p class="text-zinc-300 text-sm mb-2"><span class="text-zinc-500">Famille:</span> {{ npc.relations }}</p>
                    <p class="text-zinc-300 text-sm"><span class="text-zinc-500">Statut:</span> {{ npc.socialStatus }}</p>
                 </div>
                 
                 <div class="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800">
                    <h3 class="text-sm font-bold text-teal-500/80 uppercase mb-2">Historique</h3>
                    <p class="text-zinc-300 text-sm italic">
                      {{ npc.history }}
                    </p>
                 </div>
              </div>

              <!-- Personality Details -->
              <div class="space-y-4">
                  <div>
                    <h3 class="text-lg font-serif text-teal-400 mb-1 flex items-center gap-2">
                      <span>🧠</span> Personnalité
                    </h3>
                    <p class="text-zinc-300">{{ npc.personality }}</p>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 class="text-lg font-serif text-teal-400 mb-1 flex items-center gap-2">
                        <span>🎯</span> Motivation
                        </h3>
                        <p class="text-zinc-300">{{ npc.motivation }}</p>
                    </div>

                    <div>
                        <h3 class="text-lg font-serif text-teal-400 mb-1 flex items-center gap-2">
                        <span>🧩</span> Particularité
                        </h3>
                        <p class="text-zinc-300">{{ npc.quirk }}</p>
                    </div>
                  </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-20 opacity-50">
        <div class="text-6xl mb-4">🐉</div>
        <p class="text-xl">Cliquez sur Générer pour invoquer un PNJ</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loadApiClasses, loadApiRaces, loadNpcTables, loadAlignments, type ApiNpcTables } from '@/utils/dataLoader'
import { GENDERS, generateNpc, type GeneratedNPC, type GenderCode, type NpcRace, type NpcRef } from '@/utils/npcGenerator'
import { useAuthStore } from '@/stores/auth'
import { useNpcStore } from '@/stores/npc'

const authStore = useAuthStore()
const npcStore = useNpcStore()
const router = useRouter()

// Données de jeu et tables du générateur (API)
const races = ref<NpcRace[]>([])
const classes = ref<NpcRef[]>([])
const alignments = ref<NpcRef[]>([])
const tables = ref<ApiNpcTables>({})
const loading = ref(true)
const genders = GENDERS

const selectedRace = ref<NpcRace | ''>('')
const selectedClass = ref<NpcRef | '' | 'random'>('')
const selectedGender = ref<GenderCode | ''>('')
const npc = ref<GeneratedNPC | null>(null)

const saveCharacter = async () => {
  if (!npc.value) return

  if (!authStore.token) {
    if (confirm("Vous devez être connecté pour sauvegarder un personnage. Voulez-vous vous connecter ou créer un compte ?")) {
      router.push('/login')
    }
    return
  }

  const result = await npcStore.saveNpc(npc.value)
  if (result.success) {
    alert("Le PNJ a été ajouté à votre liste dans votre profil !")
  } else {
    alert("Erreur lors de la sauvegarde : " + result.error)
  }
}

onMounted(async () => {
  try {
    loading.value = true
    const [r, c, a, t] = await Promise.all([loadApiRaces(), loadApiClasses(), loadAlignments(), loadNpcTables()])
    races.value = r
    classes.value = c.map((k) => ({ index: k.index, name: k.name }))
    alignments.value = a
    tables.value = t
  } catch (e) {
    console.error('Failed to load data in NPC Generator', e)
    alert("Erreur lors du chargement des données du générateur. Vérifiez que l'API répond.")
  } finally {
    loading.value = false
  }
})

const generateNPC = () => {
  if (races.value.length === 0) return
  npc.value = generateNpc({
    races: races.value,
    classes: classes.value,
    alignments: alignments.value,
    tables: tables.value,
    race: selectedRace.value ? selectedRace.value.index : null,
    class: selectedClass.value === 'random' ? 'random' : selectedClass.value ? selectedClass.value.index : null,
    gender: selectedGender.value || null,
  })
}
</script>
