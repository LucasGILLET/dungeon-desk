<template>
  <section class="space-y-6">
    <section class="rounded-3xl border border-white/5 bg-white/3 p-5 md:p-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-amber-200">
          Classes
        </span>
        <span class="text-xs uppercase tracking-[0.25em] text-zinc-500">Choix de la classe</span>
      </div>
      <h2 class="mt-4 text-2xl md:text-4xl font-serif font-bold text-white">Choisir sa classe, sans se perdre</h2>
    </section>

    <section class="grid gap-4 p-5">
        <p>
            Choisir sa classe est une étape importante. Voyons ensemble les différentes options pour trouver celle qui correspond le mieux à ton style de jeu et à l’histoire que tu veux raconter avec ton personnage.
        </p>
    </section>
    <section class="grid gap-4 px-5 py-2">
      <h2 class="text-4xl text-amber-400">Les différents types de classes</h2>
      <p>Il existe deux grandes catégories de classes dans D&D 5e : les classes martiales et les classes de magie.</p>
    </section>

    <section class="grid gap-4 px-5">
      <h2 class="text-3xl text-amber-200">Les classes martiales</h2>
      <p>Les classes martiales regroupent toutes les classes spécialisées dans le combat rapproché et l'utilisation d'armes et d'armures. Elles sont généralement plus simple à prendre en main.</p>
      <p>Les classes martiales sont : Guerrier, Barbare, Paladin, Rôdeur, Moine et Roublard</p>
      <p>On peut également les sous-diviser en trois catégories : les classes de combat au corps à corps pur, les classes de mi-magiques et les classes basées sur la dextérité.</p>
    </section>

    <section class="grid gap-4 px-5">
        <h2 class="text-2xl text-amber-100">Les classes de combat au corps à corps pur</h2>
        <p>Ces classes sont centrées sur le combat en mêlée, avec une grande capacité à encaisser les dégâts et à infliger des coups puissants. Elles sont idéales pour les joueurs qui veulent être au cœur de l'action.</p>
    </section>

    <DocumentationCardGrid :cards="caccards" />

    <section class="grid gap-4 px-5">
        <h2 class="text-2xl text-amber-100">Les classes martiales mi-magiques</h2>
        <p>Ces classes combinent les compétences de combat rapproché des classes martiales avec une certaine capacité magique. Elles sont souvent plus complexes à maîtriser mais offrent une grande variété d'options tactiques.</p>
    </section>

    <DocumentationCardGrid :cards="halfCastersCards" />

    <section class="grid gap-4 px-5">
        <h2 class="text-2xl text-amber-100">Les classes martiales basées sur la dextérité</h2>
        <p>Les classes martiales basées sur la dextérité sont celles qui utilisent principalement leur agilité et leur précision pour infliger des dégâts. Elles ont généralement plus fragiles mais également plus difficiles à toucher.</p>
    </section>

    <DocumentationCardGrid :cards="dexCards" />

    <section class="grid gap-4 px-5 py-4">
        <h2 class="text-3xl text-amber-200">Les classes de magie</h2>
        <p>Les classes de magie sont celles qui utilisent principalement la magie pour infliger des dégâts, soutenir le groupe ou contrôler le champ de bataille. Elles sont souvent plus complexes à jouer, mais offrent une grande variété d'options tactiques.</p>
        <p>Les classes de magie sont : Magicien, Occultiste, Clerc, Druide, Barde et Ensorceleur</p>
        <p>Toutes les classes magiques sont par essences dotées d'une forme de polyvalence, plus ou moins prononcée. On peut ainsi en distinguer trois sous-catégories : les classes polyvalentes, les classes équilibrées et les classes spécialisées.</p>
    </section>

    <section class="grid gap-4 px-5">
        <h2 class="text-2xl text-amber-100">Les classes magiques polyvalentes</h2>
        <p>Les classes magiques polyvalentes sont celles qui peuvent utiliser le plus de sorts et s'adapter à différentes situations de combat. Ces classes sont généralement plus difficiles à maîtriser mais offrent une grande flexibilité.</p>
    </section>

    <DocumentationCardGrid :cards="polyCards" />

    <section class="grid gap-4 px-5">
        <h2 class="text-2xl text-amber-100">Les classes magiques équilibrées</h2>
        <p>Les classes magiques équilibrées sont celles qui offrent un bon équilibre entre leurs capacités de combat, de soutien et de contrôle. Elles sont généralement plus faciles à maîtriser que les classes polyvalentes ou spécialisées, mais offrent moins de flexibilité.</p>
    </section>

    <DocumentationCardGrid :cards="balancedCards" />

    <section class="grid gap-4 px-5">
        <h2 class="text-2xl text-amber-100">Les classes magiques spécialisées</h2>
        <p>Les classes magiques spécialisées sont celles qui excèlent dans un domaine particulier, comme le combat, le soutien ou le contrôle. Elles sont généralement plus difficiles à maîtriser mais offrent une grande puissance dans leur domaine d'expertise.</p>
    </section>

    <DocumentationCardGrid :cards="specialistsCards" />

  </section>
</template>

<script setup lang="ts">
import DocumentationCardGrid from '@/components/documentation/DocumentationCardGrid.vue'
type DocCard = {
  title: string
  eyebrow: string
  summary: string
  bullets: string[]
  accent: string
}


const caccards : DocCard[] = [
  {
    title: 'Guerrier',
    eyebrow: 'Le spécialiste du combat',
    summary: 'Les Guerriers sont des combattants très spécialisés, capables d’utiliser aussi bien des épées et des boucliers que des arbalètes, et tout ce qu’il y a entre les deux ! Ils maîtrisent aussi pratiquement tous les types d’armures. Pense à un guerrier comme à un soldat spécialisé : très tactique et précis dans son style de combat.',
    bullets: ['Très polyvalent', 'Excellent avec les armes et les armures', 'Facile à prendre en main'],
    accent: 'from-slate-400/20 via-zinc-500/10 to-slate-500/10 border-slate-500/30'
  },
  {
    title: 'Barbare',
    eyebrow: 'La force brute',
    summary: 'La capacité principale d’un barbare s’appelle la « Rage », qui lui permet de canaliser toute sa colère dans ses prouesses au combat et de devenir une véritable force terrifiante sur le champ de bataille. D’un point de vue mécanique, la rage te permet d’infliger plus de dégâts tout en en subissant moins. Il y a quelques autres effets importants liés à la rage, mais ce sont les deux principaux. Les barbares sont aussi la seule classe à avoir un dé de vie en D12, ce qui signifie qu’ils ont en moyenne plus de points de vie que n’importe quelle autre classe.',
    bullets: ['Dégâts puissants', 'Très résistant', 'Style de jeu instinctif'],
    accent: 'from-red-500/20 via-orange-500/10 to-amber-500/10 border-red-500/30'
  },
]

const halfCastersCards: DocCard[] = [
  {
    title: 'Paladin',
    eyebrow: 'Le chevalier sacré',
    summary: 'Les paladins sont des guerriers dévoués qui tirent leurs pouvoirs d’un serment qu’ils ont prêté. Ce sont souvent les chevaliers classiques en armure étincelante, mais ce n’est pas obligatoire. Les paladins sont des demi-lanceurs de sorts, donc ils ont accès à quelques sorts. Ils ont aussi « Imposition des mains », qui leur permet de soigner. Ils ont également « Châtiment divin », qui leur permet d’infliger plus de dégâts avec leurs attaques.',
    bullets: ['Bon équilibre entre dégâts et soutien', 'Capacités de soin', 'Très fort en mêlée'],
    accent: 'from-amber-400/25 via-yellow-500/20 to-white/10 border-amber-500/30'
  },
  {
    title: 'Rôdeur',
    eyebrow: 'Le chasseur de la nature',
    summary: 'Les rôdeurs tirent leurs capacités de leur lien avec la nature. Comme les paladins, ce sont des demi-lanceurs de sorts, mais avec un accès à des sorts davantage liés à la nature. Ils utilisent leur connaissance de la nature pour soutenir le groupe et infliger plus de dégâts en combat. Beaucoup de gens sous-estiment le rôdeur en tant que source de dégâts, mais ils peuvent en infliger énormément. C’est aussi la classe idéale si tu veux un compagnon animal pour combattre à tes côtés.',
    bullets: ['Très bon en exploration', 'Dégâts constants', 'Aide beaucoup le groupe'],
    accent: 'from-emerald-400/25 via-teal-500/20 to-cyan-500/10 border-emerald-500/30'
  },
]

const dexCards: DocCard[] = [
  {
    title: 'Moine',
    eyebrow: 'L’artiste martial mobile',
    summary: 'Les moines sont des artistes martiaux agiles qui utilisent généralement leurs poings comme arme principale. Ils ont accès à des « points de ki », une ressource que tu peux dépenser pour faire des attaques supplémentaires, te déplacer davantage, effectuer des actions supplémentaires en action bonus, et plein d’autres choses. Un point important cependant : dans une campagne très axée sur le combat, le moine ne devrait probablement pas être la seule classe martiale du groupe. En effet, en moyenne, les moines ont moins de points de vie que les guerriers, barbares, paladins ou rôdeurs. Donc même s’ils sont agiles et difficiles à toucher, quand ils le sont, ils prennent cher.',
    bullets: ['Très mobile', 'Beaucoup d’options tactiques', 'Très bon pour harceler les ennemis'],
    accent: 'from-violet-400/25 via-fuchsia-500/20 to-slate-500/10 border-violet-500/30'
  },
  {
    title: 'Roublard',
    eyebrow: 'Furtivité et précision',
    summary: 'Les roublards : l’assassin silencieux tapi dans l’ombre. Comme les moines, ils sont agiles et rapides, mais là où les moines infligent de petits dégâts plusieurs fois par tour, les roublards infligent de gros dégâts en un seul coup grâce à leur « attaque sournoise ». Ils excellent aussi dans la discrétion, le vol et l’investigation.',
    bullets: ['Excellent en furtivité', 'Gros pic de dégâts', 'Très bon pour l’infiltration'],
    accent: 'from-zinc-400/25 via-slate-500/20 to-emerald-500/10 border-zinc-500/30'
  }
]

const polyCards: DocCard[] = [
  {
    title: 'Magicien',
    eyebrow: 'Le maître de la magie',
    summary: 'Les magiciens sont les lanceurs de sorts les plus polyvalents, avec accès à une vaste gamme de sorts. Ils peuvent se spécialiser dans différents types de magie, comme la magie de feu, de glace, d’illusion, etc. Cependant, ils sont généralement plus fragiles que les classes martiales et doivent faire attention à leur positionnement en combat.',
    bullets: ['Très polyvalent', 'Accès à une grande variété de sorts', 'Peut se spécialiser dans différents types de magie'],
    accent: 'from-blue-400/25 via-sky-500/20 to-cyan-500/10 border-blue-500/30'
  },
  {
    title: 'Clerc',
    eyebrow: 'La voix d\'un dieu',
    summary: 'Les clercs sont des servants de dieux ou de forces divines, avec accès à une variété de sorts divins. Ils peuvent soigner les alliés, bénir les armes, et lutter contre les morts-vivants. Cependant, ils sont généralement moins polyvalents que les magiciens et doivent faire attention à leur positionnement en combat.',
    bullets: ['Soins et bénédiction', 'Lutte contre les morts-vivants', 'Positionnement important en combat'],
    accent: 'from-green-400/25 via-lime-500/20 to-emerald-500/10 border-green-500/30'
  },
]

const balancedCards: DocCard[] = [
    {
        title: 'Druide',
        eyebrow: 'Le gardien de la nature',
        summary: 'Les druides sont des protecteurs de la nature, avec accès à une variété de sorts liés à la nature. Ils peuvent se transformer en animaux grâce à leur « Forme Sauvage », ce qui leur donne une grande flexibilité en combat. Cependant, ils sont généralement moins résistants que les classes martiales et doivent faire attention à leur positionnement en combat.',
        bullets: ['Sorts liés à la nature', 'Forme Sauvage pour se transformer en animaux', 'Positionnement important en combat'],
        accent: 'from-green-400/25 via-lime-500/20 to-emerald-500/10 border-green-500/30'
    },
    {
        title: 'Barde',
        eyebrow: 'Le soutien polyvalent',
        summary: 'Les bardes sont des artistes et des conteurs, avec accès à une variété de sorts de soutien. Ils peuvent inspirer les alliés, charmer les ennemis, et utiliser leur musique pour influencer le champ de bataille. Cependant, ils sont généralement moins résistants que les classes martiales et doivent faire attention à leur positionnement en combat.',
        bullets: ['Sorts de soutien', 'Inspiration pour les alliés', 'Positionnement important en combat'],
        accent: 'from-pink-400/25 via-fuchsia-500/20 to-purple-500/10 border-pink-500/30'
    }, 
]

const specialistsCards: DocCard[] = [

  {
    title: 'Ensorceleur',
    eyebrow: 'Le lanceur de sorts inné',
    summary: 'Les ensorceleurs tirent leurs pouvoirs d’une source innée, comme un ancêtre puissant ou une lignée magique. Ils ont moins de sorts que les magiciens, mais ils peuvent les lancer plus souvent grâce à leur « points de sort ». Ils ont aussi des capacités uniques liées à leur lignée magique.',
    bullets: ['Lancement de sorts plus fréquent', 'Capacités uniques liées à la lignée', 'Moins de sorts que les magiciens'],
    accent: 'from-purple-400/25 via-pink-500/20 to-red-500/10 border-purple-500/30'
  },
    {
        title: 'Occultiste',
        eyebrow: 'Pacte avec des forces surnaturelles',
        summary: 'Les occultistes sont des praticiens de l’occulte, avec accès à une variété de sorts liés à la magie noire et aux forces surnaturelles. Ils peuvent invoquer des entités maléfiques et manipuler les énergies sombres. Cependant, ils sont généralement moins résistants que les classes martiales et doivent faire attention à leur positionnement en combat.',
        bullets: ['Sorts liés à l’occulte', 'Invoquer des entités maléfiques', 'Manipulation des énergies sombres'],
        accent: 'from-gray-400/25 via-zinc-500/20 to-slate-500/10 border-gray-500/30'
    }
]



</script>