<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-200 font-sans pt-20 pb-10">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-200 via-teal-400 to-emerald-200 bg-clip-text text-transparent font-serif mb-4">
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
              <option v-for="g in genders" :key="g" :value="g">
                {{ g }}
              </option>
            </select>
          </div>

          <!-- Generate Button -->
          <div class="flex items-end">
            <button 
              @click="generateNPC" 
              class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Générer
            </button>
          </div>
        </div>
      </div>

      <!-- Result Card -->
      <div v-if="npc" class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
        
        <div class="p-8">
          <!-- Header info: Name, Title, Basic ID -->
          <div class="flex flex-col md:flex-row justify-between items-start border-b border-zinc-800 pb-6 mb-6">
            <div>
              <h2 class="text-4xl font-serif text-white font-bold mb-2 tracking-tight">
                {{ npc.firstName }} <span class="text-emerald-200/80">{{ npc.lastName }}</span>
              </h2>
              <div class="flex flex-wrap gap-2 items-center text-sm mt-2">
                <span class="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                  {{ npc.gender }}
                </span>
                <span class="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                  {{ npc.age }} ans ({{ npc.ageCategory }})
                </span>
                <span class="px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 font-semibold border border-emerald-500/30">
                  {{ npc.race?.name || 'Humain' }}
                </span>
                <span v-if="npc.class" class="px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 font-semibold border border-purple-500/30">
                  {{ npc.class.name }}
                </span>
                <span v-else class="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 border-dashed">
                    Roturier
                </span>
                <span class="px-3 py-1 rounded-full bg-zinc-800 text-amber-500/80 italic border border-zinc-700/50">
                  {{ npc.alignment }}
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
import { loadRaces, loadClasses } from '@/utils/dataLoader'
import type { SRDRace, SRDClass } from '@/types/srd'
import { useAuthStore } from '@/stores/auth' // Changed store
import { useNpcStore } from '@/stores/npc'   // New store

const authStore = useAuthStore()
const npcStore = useNpcStore()
const router = useRouter()

// Interface definitions
interface GeneratedNPC {
  firstName: string
  lastName: string
  race: SRDRace
  class: SRDClass | null
  gender: string
  age: number
  ageCategory: string
  height: string
  weight: string
  bodyType: string
  profession: string
  socialStatus: string
  relations: string
  history: string
  stats: {
    FOR: number
    DEX: number
    CON: number
    INT: number
    SAG: number
    CHA: number
  }
  alignment: string
  personality: string
  motivation: string
  quirk: string
}

// ... interfaces ...

// State
const races = ref<SRDRace[]>([])
const classes = ref<SRDClass[]>([])
const loading = ref(true)

const saveCharacter = async () => {
    if (!npc.value) return
    
    if (!authStore.token) { // Check auth from authStore
        if(confirm("Vous devez être connecté pour sauvegarder un personnage. Voulez-vous vous connecter ou créer un compte ?")) {
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


const selectedRace = ref<SRDRace | ''>('')
const selectedClass = ref<SRDClass | '' | 'random'>('')
const selectedGender = ref<string>('')
const npc = ref<GeneratedNPC | null>(null)

// Data Arrays
const alignments = ['Loyal Bon', 'Neutre Bon', 'Chaotique Bon', 'Loyal Neutre', 'Neutre', 'Chaotique Neutre', 'Loyal Mauvais', 'Neutre Mauvais', 'Chaotique Mauvais']

const namePrefixes = ['Thal', 'El', 'Dor', 'Val', 'Syl', 'Mor', 'Grim', 'Aro', 'Olo', 'Fen', 'Bor', 'Kal', 'Mer', 'Zar', 'Tor']
const nameSuffixes = ['or', 'ian', 'us', 'ar', 'en', 'is', 'a', 'ine', 'da', 'ra', 'th', 'dalle', 'mir', 'las', 'wyn']
const lastNames = ['Chantebrise', 'Vif-Esprit', 'Coeur-de-Fer', 'Sombreval', 'Lunea', 'Fort-Ecu', 'Pied-Léger', 'Barbe-Rousse', 'Vert-Feuille', 'Roc-Fendu', 'Aube-Claire', 'Nuit-Noire']

const genders = ['Homme', 'Femme', 'Non-binaire']
const bodyTypes = ['Fin', 'Athlétique', 'Corpulent', 'Musclé', 'Sec', 'Rondelet', 'Massif', 'Svelte', 'Courbé', 'Gigantesque', 'Chétif']
const socialStatuses = ['Misérable', 'Pauvre', 'Modeste', 'Aisé', 'Riche', 'Aristocrate']

// Race-specific Name Data
const raceNames: Record<string, { first: string[], last: string[] }> = {
  'Human': {
    first: ['Alden', 'Broc', 'Caldon', 'Drog', 'Kael', 'Paren', 'Rurik', 'Stedd', 'Ulf', 'Varis', 'Alethra', 'Bess', 'Cefrey', 'Kethra', 'Mara', 'Olma', 'Sila', 'Wela'],
    last: ['Amblecouronne', 'Buckman', 'Chantebrume', 'Dundragon', 'Evenwood', 'Grandmanteau', 'Greycastle', 'Havelock', 'Ironheart', 'Jass']
  },
  'Dwarf': {
    first: ['Adrik', 'Baern', 'Brottor', 'Dain', 'Eberk', 'Einkil', 'Fargrim', 'Gardain', 'Harbek', 'Kildrak', 'Morgran', 'Orsik', 'Oskar', 'Rangrim', 'Rurik', 'Taklinn', 'Thoradin', 'Thorin', 'Tordek', 'Traubon', 'Travok', 'Ulfgar', 'Veit', 'Vondal', 'Amber', 'Artin', 'Audhild', 'Bardryn', 'Dagnal', 'Diesa', 'Eldeth', 'Falkrunn', 'Finellen', 'Gunnloda', 'Gurdis', 'Helja', 'Hlin', 'Kathra', 'Kristryd', 'Ilde', 'Liftrasa', 'Mardred', 'Riswynn', 'Sannl', 'Torbera', 'Torgga', 'Vistra'],
    last: ['Balderk', 'Battlehammer', 'Brawnanvil', 'Dankil', 'Fireforge', 'Frostbeard', 'Gorunn', 'Holderhek', 'Ironfist', 'Loderr', 'Lutgehr', 'Rumnaheim', 'Strakeln', 'Torunn', 'Ungart']
  },
  'Elf': {
    first: ['Adran', 'Aelar', 'Aramil', 'Arannis', 'Aust', 'Beiro', 'Berrian', 'Carric', 'Enialis', 'Erdan', 'Erevan', 'Galinndan', 'Hadarai', 'Heian', 'Himo', 'Immeral', 'Ivellios', 'Laucian', 'Mindartis', 'Paelias', 'Peren', 'Quarion', 'Riardon', 'Rolen', 'Soveliss', 'Thamior', 'Tharivol', 'Theren', 'Varis', 'Adrie', 'Althaea', 'Anastrianna', 'Andraste', 'Antinua', 'Bethrynna', 'Birel', 'Caelynn', 'Drusilia', 'Enna', 'Felosial', 'Ielenia', 'Jelenneth', 'Keyleth', 'Leshanna', 'Lia', 'Meriele', 'Mialee', 'Naivara', 'Quelenna', 'Quillathe', 'Sariel', 'Shanairra', 'Shava', 'Silaqui', 'Theirastra', 'Thia', 'Vadania', 'Valanthe', 'Xanaphia'],
    last: ['Amakiir', 'Amastacia', 'Galanodel', 'Holimion', 'Ilphelkiir', 'Liadon', 'Meliamne', 'Naïlo', 'Siannodel', 'Xiloscient']
  },
  'Halfling': {
    first: ['Alton', 'Ander', 'Cade', 'Corrin', 'Eldon', 'Errich', 'Finnan', 'Garret', 'Lindal', 'Lyle', 'Merric', 'Milo', 'Osborn', 'Perrin', 'Reed', 'Roscoe', 'Wellby', 'Andry', 'Bree', 'Callie', 'Cora', 'Euphemia', 'Jillian', 'Kithri', 'Lavinia', 'Lidda', 'Merla', 'Nedda', 'Paela', 'Portia', 'Seraphina', 'Shaena', 'Trym', 'Vani', 'Verna'],
    last: ['Brossebroussaille', 'Bonnebarrique', 'Vertbouteille', 'Hautecolline', 'Soucolline', 'Théfeuille', 'Martel', 'Pied-Léger']
  },
  'Gnome': {
    first: ['Boddynock', 'Dimble', 'Fonkin', 'Gimble', 'Glim', 'Gerbo', 'Jebeddo', 'Namfoodle', 'Roondar', 'Seebo', 'Zook', 'Bimpnottin', 'Breena', 'Caramip', 'Carlin', 'Donella', 'Duvamil', 'Ella', 'Ellyjobell', 'Ellywick', 'Lilli', 'Loopmottin', 'Lorilla', 'Mardnab', 'Nissa', 'Nyx', 'Oda', 'Orla', 'Roywyn', 'Shamil', 'Tana', 'Waywocket', 'Zanna'],
    last: ['Beren', 'Daergel', 'Folkor', 'Garrick', 'Nackle', 'Murnig', 'Ningel', 'Raulnor', 'Scheppen', 'Timbers', 'Turen']
  },
  'Dragonborn': {
    first: ['Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Heskan', 'Kriv', 'Medrash', 'Mehen', 'Nadarr', 'Pandjed', 'Patrin', 'Rhogar', 'Shamash', 'Shedinn', 'Tarhun', 'Torinn', 'Akra', 'Biri', 'Daar', 'Farideh', 'Harann', 'Havilar', 'Jheri', 'Kava', 'Korinn', 'Mishann', 'Nala', 'Perra', 'Raiann', 'Sora', 'Surina', 'Thava', 'Uadjit'],
    last: ['Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Drachedandion', 'Fenkenkabradon', 'Kepeshkmolik', 'Kerrhylon', 'Kimbatuul', 'Linxakasendalor', 'Myastan', 'Nemmonis', 'Norixius', 'Ophinshtalajiir', 'Prexijandilin', 'Shestendeliath', 'Turnuroth', 'Verthisathurgiesh', 'Yarjerit']
  },
  'Tiefling': {
    first: ['Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Ekemon', 'Iados', 'Kairon', 'Leucis', 'Melech', 'Mordai', 'Morthos', 'Pelaios', 'Skamos', 'Therai', 'Akta', 'Anakis', 'Bryseis', 'Criella', 'Damaia', 'Ea', 'Kallista', 'Lerissa', 'Makaria', 'Nemeia', 'Orianna', 'Phelaia', 'Rieta'],
    last: ['Art', 'Charogne', 'Chant', 'Creed', 'Despair', 'Excellence', 'Fear', 'Glory', 'Hope', 'Ideal', 'Music', 'Nowhere', 'Open', 'Poetry', 'Quest', 'Random', 'Reverence', 'Sorrow', 'Temerity', 'Torment', 'Weary']
  },
  'Half-Orc': {
    first: ['Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh', 'Keth', 'Krusk', 'Mhurren', 'Ront', 'Shump', 'Thokk', 'Baggi', 'Emen', 'Engong', 'Kansif', 'Myev', 'Neega', 'Ovak', 'Ownka', 'Shautha', 'Sutha', 'Vola', 'Volen', 'Yevelda'],
    last: [] // Half-orcs often have no family name or use their human parent's
  }
}

const professions = [
  'Fermier', 'Forgeron', 'Aubergiste', 'Marchand', 'Garde', 'Scribe', 'Prêtre', 
  'Chasseur', 'Pêcheur', 'Mineur', 'Tisserand', 'Cordonnier', 'Maçon', 'Charpentier',
  'Cuisinier', 'Boulanger', 'Voleur', 'Mendiant', 'Herboriste', 'Alchimiste', 
  'Artiste', 'Soldat', 'Marin', 'Érudit', 'Magistrat', 'Apothicaire', 'Bucheron', 'Meunier', 'Ecuyer'
]
const relationTypes = [
  'Célibataire', 'Marié(e)', 'Veuf/Veuve', 'Divorcé(e)', 'Fiancé(e)',
  'Vit avec ses parents', 'Orphelin', 'A charge de famille nombreuse', 'A un frère jumeau', 'Sans attache', 'Membre d\'une guilde influente'
]

const personalities = [
    'Optimiste et joyeux', 'Renfrogné et méfiant', 'Curieux de tout', 'Arrogant et fier', 'Timide et réservé', 
    'Bavard impénitent', 'Sévère et discipliné', 'Flegmatique', 'Nerveux et agité', 'Mélancolique', 'Charismatique'
]
const motivations = [
    'Devenir riche', 'Protéger sa famille', 'Se venger d\'un affront', 'Découvrir un secret ancien', 
    'Gagner du pouvoir politique', 'Trouver l\'amour', 'Expiar une faute passée', 'Simplement survivre', 'Changer de vie'
]
const quirks = [
    'Joue avec une pièce entre ses doigts', 'Parle très fort', 'Renifle constamment', 'Bégaye quand il est nerveux', 
    'A une cicatrice distinctive', 'Collectionne les cailloux', 'Déteste les chats', 'Parle à son arme/outil',
    'A un tic de l\'oeil', 'Mange tout le temps', 'Sent le tabac froid', 'Répète la fin de ses phrases'
]

const origins = ['Né dans un village voisin', 'Vient de la capitale', 'A grandi dans la rue', 'Issu d\'une famille de marchands', 'Ancien aventurier rangé', 'Refugié de guerre', 'Enfant du pays', 'Vagabond sédentarisé']
const historyEvents = ['a tout perdu au jeu', 'a sauvé le village d\'un incendie', 'cherche son frère disparu', 'rêve de voyager', 'cache un lourd secret', 'est endetté jusqu\'au cou', 'vient de gagner un gros héritage', 'se cache de la milice']

// Add Logic for Race Rarity and Physical characteristics
const raceConfig: Record<string, { weight: number, baseHeight: number, heightVar: number, baseWeight: number, weightVar: number }> = {
  'Human': { weight: 40, baseHeight: 160, heightVar: 30, baseWeight: 60, weightVar: 30 },
  'Dwarf': { weight: 15, baseHeight: 120, heightVar: 15, baseWeight: 65, weightVar: 25 },
  'Elf': { weight: 15, baseHeight: 160, heightVar: 20, baseWeight: 50, weightVar: 15 },
  'Halfling': { weight: 10, baseHeight: 90, heightVar: 15, baseWeight: 18, weightVar: 5 },
  'Dragonborn': { weight: 3, baseHeight: 180, heightVar: 25, baseWeight: 90, weightVar: 40 },
  'Gnome': { weight: 5, baseHeight: 95, heightVar: 15, baseWeight: 18, weightVar: 5 },
  'Half-Elf': { weight: 5, baseHeight: 160, heightVar: 25, baseWeight: 60, weightVar: 25 },
  'Half-Orc': { weight: 4, baseHeight: 175, heightVar: 30, baseWeight: 80, weightVar: 40 },
  'Tiefling': { weight: 3, baseHeight: 160, heightVar: 25, baseWeight: 60, weightVar: 25 },
}

// Logic
onMounted(async () => {
  try {
    loading.value = true
    const [r, c] = await Promise.all([loadRaces(), loadClasses()])
    if (!r || r.length === 0) {
        console.warn("Aucune race chargée ! Vérifiez le fichier public/data/5e-SRD-Races.json");
    }
    races.value = r || []
    classes.value = c || []
  } catch (e) {
    console.error('Failed to load data in NPC Generator', e)
    alert("Erreur lors du chargement des données (Races/Classes). Vérifiez la console.")
  } finally {
    loading.value = false
  }
})

const rollStat = () => {
  // 4d6 keep 3 best
  const rolls = Array.from({length: 4}, () => Math.floor(Math.random() * 6) + 1)
  rolls.sort((a, b) => b - a)
  return rolls.slice(0, 3).reduce((a, b) => a + b, 0)
}

const generateName = (raceName: string = 'Human') => {
  const raceData = raceNames[raceName] || raceNames['Human']!
  
  if (Math.random() > 0.5 && raceData.first && raceData.first.length > 0) {
      // Use predefined race list
      return raceData.first[Math.floor(Math.random() * raceData.first.length)]!
  }

  // Fallback to random syllables generator
  const prefix = namePrefixes[Math.floor(Math.random() * namePrefixes.length)]
  const suffix = nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)]
  return `${prefix}${suffix}`.replace(/^\w/, c => c.toUpperCase())
}

const generateLastName = (raceName: string = 'Human') => {
    const raceData = raceNames[raceName] || raceNames['Human']!
    if (raceData.last && raceData.last.length > 0) {
        return raceData.last[Math.floor(Math.random() * raceData.last.length)]!
    }
    // If no last names (like Half-Orcs sometimes), generate random or take human
    return Math.random() > 0.5 ? lastNames[Math.floor(Math.random() * lastNames.length)]! : ''
}

const generateAge = () => {
  const roll = Math.random()
  if (roll < 0.2) return { val: 16 + Math.floor(Math.random() * 9), cat: 'Jeune' }
  if (roll < 0.6) return { val: 25 + Math.floor(Math.random() * 25), cat: 'Adulte' }
  if (roll < 0.85) return { val: 50 + Math.floor(Math.random() * 20), cat: 'Mûr' }
  return { val: 70 + Math.floor(Math.random() * 20), cat: 'Vieux' }
}

const generateHeightWeight = (raceName: string = '') => {
  const config = raceConfig[raceName] || raceConfig['Human']!
  
  const h = config.baseHeight + Math.floor(Math.random() * config.heightVar)
  const w = config.baseWeight + Math.floor(Math.random() * config.weightVar)
  
  return { height: `${h} cm`, weight: `${w} kg` }
}

const getWeightedRace = (availableRaces: SRDRace[]): SRDRace => {
  const validRaces = availableRaces.filter(r => r.name);
  if (validRaces.length === 0) return availableRaces[0]!;

  const weightedItems = validRaces.map(r => ({
     race: r,
     weight: raceConfig[r.name]?.weight || 1 
  }));
  
  const totalWeight = weightedItems.reduce((acc, item) => acc + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of weightedItems) {
    random -= item.weight;
    if (random <= 0) return item.race;
  }
  return validRaces[0]!;
}

const generateNPC = () => {
  if (races.value.length === 0) return

  // Use weighted random if no race selected
  const race = selectedRace.value || getWeightedRace(races.value)
  
  // Class selection logic
  let cls: SRDClass | null = null
  if (typeof selectedClass.value === 'object' && selectedClass.value !== null) {
    cls = selectedClass.value
  } else if (selectedClass.value === 'random') {
    cls = classes.value.length > 0 ? classes.value[Math.floor(Math.random() * classes.value.length)]! : null
  }
  // if '' -> cls remains null (Roturier)

  const gender = selectedGender.value || genders[Math.floor(Math.random() * genders.length)]!
  const ageData = generateAge()
  const phys = generateHeightWeight(race.name)
  const hist = `${origins[Math.floor(Math.random() * origins.length)]} et ${historyEvents[Math.floor(Math.random() * historyEvents.length)]}.`

  npc.value = {
    firstName: generateName(race.name),
    lastName: generateLastName(race.name),
    race: race,
    class: cls,
    gender: gender,
    age: ageData.val,
    ageCategory: ageData.cat,
    height: phys.height,
    weight: phys.weight,
    bodyType: bodyTypes[Math.floor(Math.random() * bodyTypes.length)]!,
    
    profession: professions[Math.floor(Math.random() * professions.length)]!,
    socialStatus: socialStatuses[Math.floor(Math.random() * socialStatuses.length)]!,
    relations: relationTypes[Math.floor(Math.random() * relationTypes.length)]!,
    history: hist,
    
    stats: {
      FOR: rollStat(),
      DEX: rollStat(),
      CON: rollStat(),
      INT: rollStat(),
      SAG: rollStat(),
      CHA: rollStat()
    },
    alignment: alignments[Math.floor(Math.random() * alignments.length)]!,
    personality: personalities[Math.floor(Math.random() * personalities.length)]!,
    motivation: motivations[Math.floor(Math.random() * motivations.length)]!,
    quirk: quirks[Math.floor(Math.random() * quirks.length)]!
  }
}
</script>
