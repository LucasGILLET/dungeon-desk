<template>
  <section class="space-y-6">
    <section class="rounded-3xl border border-white/5 bg-white/3 p-5 md:p-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-emerald-200">
          Races
        </span>
        <span class="text-xs uppercase tracking-[0.25em] text-zinc-500">Choix de la race</span>
      </div>
      <h2 class="mt-4 text-2xl md:text-4xl font-serif font-bold text-white">Choisir une race qui donne le bon ton</h2>
    </section>

    <section class="grid gap-4 p-5">
      <p>
        La première chose à choisir lors de la création de son personnage est sa race. Mais alors... quelle laquelle choisir pour débuter ? Voyons ensemble ce qu'il en est.
      </p>
    </section>

    <section class="grid gap-4 px-5 py-2">
      <h2 class="text-4xl text-amber-400">Qu'est-ce qu'une race ?</h2>
      <p>
        Dans Donjons et Dragons, chaque personnage appartient à une race spécifique. Certaines sont assez courantes, comme les hommes, elfes, halfelins et nains, tandis que d'autres sont bien plus rares, comme par exemple les tiefelins. Certaines races se divisent elles-même en sous-races comme par exemple les nains des montagnes et les nains des collines.
      </p>
      <p>
        Le choix de la race influe grandement sur l'identité de votre personnage : c'est à la fois votre point de départ et votre vitrine. Ce choix influera sur votre apparence générale et quelques talents détenus naturellement par votre personnage.
      </p>
    </section>

    <section class="grid gap-4 px-5 py-2">
      <h2 class="text-4xl text-amber-400">Comment choisir sa race ?</h2>
      <p>
        Trois points importants sont à prendre en compte pour choisir votre race. 
      </p>
      <p>
        Le plus important d'entre eux est votre vision du personnage que vous voulez incarner : quelle image avez-vous en tête ? Quel genre de personnage voulez-vous jouer ? Plutôt un petit voleur agile halfelin ou un guerrier massif demi-orc ?
      </p>
      <p>
        Si vous ne savez pas déjà quelle race vous convient le mieux avec le premier point, vous pouvez aussi vous baser sur les talents raciaux que chaque race possède. Par exemple, les elfes ont une vision nocturne qui leur permet de voir dans l'obscurité, tandis que les nains ont une résistance naturelle au poison.
      </p>
      <p>
        Enfin, vous pouvez aussi vous baser sur les statistiques dont aura besoin votre personnage : si vous savez dors et déjà que vous voulez jouer un barbare, opter pour une race qui augmente votre force et votre constitution comme le nain des montagnes ou le demi-orc peut être un bon choix.
      </p>
    </section>

    <section class="grid gap-4 px-5 py-2">
      <h2 class="text-4xl text-amber-400">Liste des races</h2>
    </section>



    <section class="grid gap-4 md:grid-cols-2">
      <article
        v-for="card in cards"
        :key="card.title"
        class="rounded-2xl border border-white/5 bg-white/3 p-5 text-sm leading-relaxed text-zinc-300 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        :class="card.accent"
      >
        <p class="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{{ card.eyebrow }}</p>
        <h3 class="text-lg font-serif font-bold text-white">{{ card.title }}</h3>
        <p class="mt-3">{{ card.summary }}</p>

        <div class="mt-4 rounded-xl border border-white/5 bg-black/20 p-4 text-xs leading-relaxed text-zinc-300">
          <span class="block text-[10px] uppercase tracking-[0.25em] text-emerald-300/70 mb-2">Caracteristiques physiques</span>
          <ul class="space-y-2 text-zinc-300/90">
            <li v-for="physical in card.physicalTraits" :key="physical" class="flex gap-2">
              <span class="mt-[0.35rem] h-1.5 w-1.5 rounded-full bg-emerald-300/70 shrink-0"></span>
              <span>{{ physical }}</span>
            </li>
          </ul>
        </div>

        <div class="mt-3 rounded-xl border border-white/5 bg-black/20 p-4 text-xs leading-relaxed text-zinc-300">
          <span class="block text-[10px] uppercase tracking-[0.25em] text-emerald-300/70 mb-2">Talents raciaux</span>
          <ul class="space-y-2 text-zinc-300/90">
            <li v-for="talent in card.racialTalents" :key="talent" class="flex gap-2">
              <span class="mt-[0.35rem] h-1.5 w-1.5 rounded-full bg-emerald-300/70 shrink-0"></span>
              <span>{{ talent }}</span>
            </li>
          </ul>
        </div>

        <div class="mt-3 rounded-xl border border-white/5 bg-black/20 p-4 text-xs leading-relaxed text-zinc-300">
          <span class="block text-[10px] uppercase tracking-[0.25em] text-emerald-300/70 mb-2">Bonus de stats</span>
          <ul class="space-y-2 text-zinc-300/90">
            <li v-for="bonus in card.statBonuses" :key="bonus" class="flex gap-2">
            <span class="mt-[0.35rem] h-1.5 w-1.5 rounded-full bg-emerald-300/70 shrink-0"></span>
              <span>{{ bonus }}</span>
            </li>
          </ul>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
type DocCard = {
  title: string
  eyebrow: string
  summary: string
  physicalTraits: string[]
  racialTalents: string[]
  statBonuses: string[]
  accent: string
}

const cards: DocCard[] = [
  {
    title: 'Humain',
    eyebrow: 'Polyvalence maximale',
    summary: 'Flexible et facile a integrer dans n\'importe quel concept de personnage.',
    physicalTraits: ['Taille moyenne (1m50 a 1m90)', 'Poids tres variable selon l\'origine', 'Maturite et longévité comparables au monde reel'],
    racialTalents: ['Polyvalence (competences et styles varies)', 'Version variante: don de niveau 1 possible', 'Adaptation facile a toutes les classes'],
    statBonuses: ['+1 dans toutes les caracteristiques'],
    accent: 'from-white/10 via-zinc-500/10 to-transparent border-white/10'
  },
  {
    title: 'Elfe',
    eyebrow: 'Agile et mystique',
    summary: 'Race raffinee, rapide et souvent liee a la magie ou a la perception.',
    physicalTraits: ['Taille moyenne et silhouette fine', 'Traits fins, oreilles pointues', 'Longue esperance de vie (plusieurs siecles)'],
    racialTalents: ['Vision dans le noir', 'Ascendance feerique (avantage contre charme)', 'Transe (repos en 4 heures)'],
    statBonuses: ['+2 Dextérité', 'Sous-races: bonus additionnel (ex: Intelligence, Sagesse ou Charisme)'],
    accent: 'from-emerald-400/20 via-cyan-500/10 to-transparent border-emerald-500/20'
  },
  {
    title: 'Nain',
    eyebrow: 'Robuste et tenace',
    summary: 'Solide et resistant, tres fiable pour les roles de premiere ligne.',
    physicalTraits: ['Petite taille (environ 1m20 a 1m50)', 'Corpulence dense et musculaire', 'Longue longevite (plus de 300 ans)'],
    racialTalents: ['Vision dans le noir', 'Resistance au poison nain', 'Maitrise d\'outils et d\'armes traditionnels'],
    statBonuses: ['+2 Constitution', 'Sous-races: +2 Force (montagne) ou +1 Sagesse (colline)'],
    accent: 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/20'
  },
  {
    title: 'Halfelin',
    eyebrow: 'Petit mais audacieux',
    summary: 'Excellent pour les personnages discrets, mobiles et difficiles a destabiliser.',
    physicalTraits: ['Petite taille (environ 90 cm)', 'Poids leger', 'Maturite rapide et vie d\'environ 150 ans'],
    racialTalents: ['Chance halfeline (relance des 1)', 'Brave (avantage contre peur)', 'Agilite halfeline (se faufiler entre creatures plus grandes)'],
    statBonuses: ['+2 Dextérité', 'Sous-races: +1 Charisme (pied-leger) ou +1 Constitution (robuste)'],
    accent: 'from-lime-400/20 via-emerald-500/10 to-transparent border-lime-500/20'
  },
  {
    title: 'Drakeide',
    eyebrow: 'Heritage draconique',
    summary: 'Race puissante et impressionnante, adaptee aux combattants offensifs.',
    physicalTraits: ['Grande taille (souvent pres de 2m)', 'Corps massif a ecailles', 'Presence physique marquante'],
    racialTalents: ['Souffle draconique', 'Resistance elementaire liee a la couleur', 'Langue draconique'],
    statBonuses: ['+2 Force', '+1 Charisme'],
    accent: 'from-red-500/20 via-orange-500/10 to-transparent border-red-500/20'
  },
  {
    title: 'Gnome',
    eyebrow: 'Ingenieux et curieux',
    summary: 'Ideal pour les personnages malins, techniques ou orientes magie.',
    physicalTraits: ['Tres petite taille (90 cm a 1m10)', 'Corps leger et vif', 'Longue vie (350 a 500 ans)'],
    racialTalents: ['Ruse gnome (avantage jets mentaux contre magie)', 'Vision dans le noir', 'Specialisation selon sous-race (inventivite ou magie)'],
    statBonuses: ['+2 Intelligence', 'Sous-races: +1 Dextérité (foret) ou +1 Constitution (roches)'],
    accent: 'from-sky-400/20 via-cyan-500/10 to-transparent border-sky-500/20'
  },
  {
    title: 'Demi-elfe',
    eyebrow: 'Equilibre social',
    summary: 'Excellent profil polyvalent, fort en interactions et adaptable.',
    physicalTraits: ['Taille moyenne', 'Traits melanges humains/elfiques', 'Longévité superieure a l\'humain'],
    racialTalents: ['Vision dans le noir', 'Ascendance feerique', 'Polyvalence de competences'],
    statBonuses: ['+2 Charisme', '+1 a deux autres caracteristiques au choix'],
    accent: 'from-fuchsia-400/20 via-violet-500/10 to-transparent border-fuchsia-500/20'
  },
  {
    title: 'Demi-orc',
    eyebrow: 'Puissance brutale',
    summary: 'Parfait pour les personnages aggressifs, resistants et intimidants.',
    physicalTraits: ['Grande taille et musculature forte', 'Canines visibles et allure imposante', 'Vie plus courte que la moyenne humaine'],
    racialTalents: ['Vision dans le noir', 'Endurance implacable (reste a 1 PV)', 'Attaques sauvages (degats critiques renforces)'],
    statBonuses: ['+2 Force', '+1 Constitution'],
    accent: 'from-emerald-500/20 via-lime-500/10 to-transparent border-emerald-500/20'
  },
  {
    title: 'Tieffelin',
    eyebrow: 'Sang infernal',
    summary: 'Race charismatique et magique, ideale pour les profils atypiques.',
    physicalTraits: ['Taille moyenne', 'Cornes, queue et traits infernaux', 'Grande diversite d\'apparences'],
    racialTalents: ['Vision dans le noir', 'Resistance au feu', 'Magie infernale progressive (thaumaturgie puis sorts)'],
    statBonuses: ['+2 Charisme', '+1 Intelligence'],
    accent: 'from-violet-500/20 via-rose-500/10 to-transparent border-violet-500/20'
  }
]
</script>