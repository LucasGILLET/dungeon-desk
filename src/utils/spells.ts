// Descriptions des sorts D&D 5e
export interface Spell {
  id: string
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  components: string
  duration: string
  description: string
  higherLevels?: string
}

export const spells: Spell[] = [
  // Sorts de niveau 0 (tours de magie)
  {
    id: 'dissonance-mentale',
    name: 'Dissonance mentale',
    level: 0,
    school: 'Enchantement',
    castingTime: '1 action',
    range: '18 mètres',
    components: 'V',
    duration: '1 round',
    description: 'Vous murmurez des mots discordants qui causent une douleur lancinante dans l\'esprit d\'une créature que vous pouvez voir à portée. Si la cible peut vous entendre (bien qu\'elle n\'ait pas besoin de vous comprendre), elle doit réussir un jet de sauvegarde de Sagesse ou subir 1d4 dégâts psychiques et avoir un désavantage à son prochain jet d\'attaque avant la fin de son prochain tour.',
    higherLevels: 'Les dégâts de ce sort augmentent de 1d4 quand vous atteignez le niveau 5 (2d4), le niveau 11 (3d4) et le niveau 17 (4d4).'
  },
  {
    id: 'lueurs-feeriques',
    name: 'Lueurs féeriques',
    level: 0,
    school: 'Évocation',
    castingTime: '1 action',
    range: '18 mètres',
    components: 'V',
    duration: 'Concentration, jusqu\'à 1 minute',
    description: 'Chaque objet dans un cube de 6 mètres d\'arête à portée est délimité par une lumière bleue, verte ou violette (à votre choix). Toute créature dans la zone quand le sort est lancé est également délimitée par la lumière si elle rate un jet de sauvegarde de Dextérité. Les objets et créatures affectés émettent une lumière faible dans un rayon de 3 mètres.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'mains-brulantes',
    name: 'Mains brûlantes',
    level: 1,
    school: 'Évocation',
    castingTime: '1 action',
    range: 'Personnelle (cône de 4,50 mètres)',
    components: 'V, S',
    duration: 'Instantanée',
    description: 'Alors que vous tenez vos mains avec les pouces qui se touchent et les doigts écartés, une mince nappe de flammes jaillit du bout de vos doigts étendus. Chaque créature dans un cône de 4,50 mètres doit effectuer un jet de sauvegarde de Dextérité. Une créature subit 3d6 dégâts de feu en cas d\'échec, ou la moitié de ces dégâts en cas de réussite.',
    higherLevels: 'Quand vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts augmentent de 1d6 pour chaque niveau d\'emplacement au-dessus du niveau 1.'
  },

  // Sorts de niveau 1
  {
    id: 'sommeil',
    name: 'Sommeil',
    level: 1,
    school: 'Enchantement',
    castingTime: '1 action',
    range: '27 mètres',
    components: 'V, S, M (une pincée de sable fin, des pétales de rose ou un grillon)',
    duration: '1 minute',
    description: 'Ce sort envoie des créatures dans un sommeil magique. Lancez 5d8 ; le total est le nombre de points de vie de créatures que ce sort peut affecter. Les créatures à 6 mètres ou moins d\'un point que vous choisissez à portée sont affectées par ordre croissant de leurs points de vie actuels (en ignorant les créatures inconscientes).',
    higherLevels: 'Quand vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, lancez 2d8 supplémentaires pour chaque niveau d\'emplacement au-dessus du niveau 1.'
  },
  {
    id: 'charme-personne',
    name: 'Charme-personne',
    level: 1,
    school: 'Enchantement',
    castingTime: '1 action',
    range: '9 mètres',
    components: 'V, S',
    duration: '1 heure',
    description: 'Un humanoïde que vous pouvez voir à portée doit effectuer un jet de sauvegarde de Sagesse. Si vous ou vos compagnons vous battez contre lui, il a un avantage au jet de sauvegarde. Si il rate son jet de sauvegarde, il est charmé par vous jusqu\'à ce que le sort se termine ou jusqu\'à ce que vous ou vos compagnons lui fassiez du mal.',
    higherLevels: 'Quand vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous pouvez cibler un humanoïde supplémentaire pour chaque niveau d\'emplacement au-dessus du niveau 1.'
  },
  {
    id: 'deguisement',
    name: 'Déguisement',
    level: 1,
    school: 'Illusion',
    castingTime: '1 action',
    range: 'Personnelle',
    components: 'V, S',
    duration: '1 heure',
    description: 'Vous vous faites paraître - y compris vos vêtements, armure, armes et autres possessions - différent jusqu\'à ce que le sort se termine ou jusqu\'à ce que vous utilisiez votre action pour le révoquer. Vous pouvez sembler 30 cm plus petit ou plus grand et pouvez paraître mince, gros ou entre les deux.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'bouclier-de-la-foi',
    name: 'Bouclier de la foi',
    level: 1,
    school: 'Abjuration',
    castingTime: '1 action bonus',
    range: '18 mètres',
    components: 'V, S, M (un petit parchemin avec un texte sacré écrit dessus)',
    duration: 'Concentration, jusqu\'à 10 minutes',
    description: 'Un champ scintillant apparaît et entoure une créature de votre choix à portée, lui accordant un bonus de +2 à la CA pour la durée.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'soin-des-blessures',
    name: 'Soin des blessures',
    level: 1,
    school: 'Évocation',
    castingTime: '1 action',
    range: 'Toucher',
    components: 'V, S',
    duration: 'Instantanée',
    description: 'Une créature que vous touchez récupère un nombre de points de vie égal à 1d8 + votre modificateur de caractéristique d\'incantation. Ce sort n\'a aucun effet sur les morts-vivants ou les créatures artificielles.',
    higherLevels: 'Quand vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, la guérison augmente de 1d8 pour chaque niveau d\'emplacement au-dessus du niveau 1.'
  },
  {
    id: 'benediction',
    name: 'Bénédiction',
    level: 1,
    school: 'Enchantement',
    castingTime: '1 action',
    range: '9 mètres',
    components: 'V, S, M (une aspersion d\'eau bénite)',
    duration: 'Concentration, jusqu\'à 1 minute',
    description: 'Vous bénissez jusqu\'à trois créatures de votre choix à portée. Chaque fois qu\'une cible effectue un jet d\'attaque ou un jet de sauvegarde avant que le sort se termine, la cible peut lancer un d4 et ajouter le nombre obtenu au jet d\'attaque ou de sauvegarde.',
    higherLevels: 'Quand vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d\'emplacement au-dessus du niveau 1.'
  },
  {
    id: 'injonction',
    name: 'Injonction',
    level: 1,
    school: 'Enchantement',
    castingTime: '1 action',
    range: '18 mètres',
    components: 'V',
    duration: '1 round',
    description: 'Vous prononcez un mot de commande d\'un mot à une créature que vous pouvez voir à portée. La cible doit réussir un jet de sauvegarde de Sagesse ou suivre la commande à son prochain tour. Le sort n\'a aucun effet si la cible est un mort-vivant, si elle ne comprend pas votre langue, ou si votre commande est directement nuisible pour elle.',
    higherLevels: 'Quand vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d\'emplacement au-dessus du niveau 1.'
  },

  // Sorts de niveau 2
  {
    id: 'suggestion',
    name: 'Suggestion',
    level: 2,
    school: 'Enchantement',
    castingTime: '1 action',
    range: '9 mètres',
    components: 'V, M (une langue de serpent et soit un peu de miel soit une goutte d\'huile douce)',
    duration: 'Concentration, jusqu\'à 8 heures',
    description: 'Vous suggérez un cours d\'activité (limité à une phrase ou deux) et influencez magiquement un humanoïde que vous pouvez voir à portée et qui peut vous entendre et vous comprendre. Les créatures qui ne peuvent pas être charmées sont immunisées à cet effet. La suggestion doit être formulée de manière à ce que le cours d\'action semble raisonnable.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'detection-des-pensees',
    name: 'Détection des pensées',
    level: 2,
    school: 'Divination',
    castingTime: '1 action',
    range: 'Personnelle',
    components: 'V, S, M (une pièce de cuivre)',
    duration: 'Concentration, jusqu\'à 1 minute',
    description: 'Pour la durée, vous pouvez lire les pensées de certaines créatures. Quand vous lancez le sort et par votre action à chaque tour jusqu\'à ce que le sort se termine, vous pouvez concentrer votre esprit sur n\'importe quelle créature que vous pouvez voir à 9 mètres de vous.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'image-miroir',
    name: 'Image miroir',
    level: 2,
    school: 'Illusion',
    castingTime: '1 action',
    range: 'Personnelle',
    components: 'V, S',
    duration: '1 minute',
    description: 'Trois doublons illusoires de vous-même apparaissent dans votre espace. Jusqu\'à la fin du sort, les doublons bougent avec vous et imitent vos actions, changeant de position de sorte qu\'il est impossible de savoir quelles images sont réelles et lesquelles sont des doublons.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'invisibilite',
    name: 'Invisibilité',
    level: 2,
    school: 'Illusion',
    castingTime: '1 action',
    range: 'Toucher',
    components: 'V, S, M (un cil encapsulé dans de la gomme arabique)',
    duration: 'Concentration, jusqu\'à 1 heure',
    description: 'Une créature que vous touchez devient invisible jusqu\'à ce que le sort se termine. Tout ce que la cible porte ou transporte est invisible tant que c\'est sur la personne de la cible. Le sort se termine pour une cible qui attaque ou lance un sort.',
    higherLevels: 'Quand vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d\'emplacement au-dessus du niveau 2.'
  },
  {
    id: 'bouclier',
    name: 'Bouclier',
    level: 1,
    school: 'Abjuration',
    castingTime: '1 réaction, que vous prenez quand vous êtes touché par une attaque ou ciblé par le sort projectile magique',
    range: 'Personnelle',
    components: 'V, S',
    duration: '1 round',
    description: 'Une barrière invisible de force magique apparaît et vous protège. Jusqu\'au début de votre prochain tour, vous avez un bonus de +5 à la CA, y compris contre l\'attaque déclencheuse, et vous ne subissez aucun dégât du sort projectile magique.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'faux-semblant',
    name: 'Faux-semblant',
    level: 2,
    school: 'Illusion',
    castingTime: '1 action',
    range: 'Personnelle',
    components: 'S',
    duration: '1 heure',
    description: 'Vous façonnez une illusion qui fait que vous, vos vêtements et votre équipement apparaissez différemment jusqu\'à ce que le sort se termine ou jusqu\'à ce que vous utilisiez votre action pour le révoquer. Vous pouvez sembler 30 cm plus petit ou plus grand et pouvez paraître maigre, gros ou entre les deux.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'vol',
    name: 'Vol',
    level: 3,
    school: 'Transmutation',
    castingTime: '1 action',
    range: 'Toucher',
    components: 'V, S, M (une plume d\'aile d\'oiseau)',
    duration: 'Concentration, jusqu\'à 10 minutes',
    description: 'Vous touchez une créature consentante. La cible gagne une vitesse de vol de 18 mètres pour la durée. Quand le sort se termine, la cible tombe si elle est encore en l\'air, à moins qu\'elle ne puisse arrêter la chute.',
    higherLevels: 'Quand vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d\'emplacement au-dessus du niveau 3.'
  },
  {
    id: 'detection-de-la-magie',
    name: 'Détection de la magie',
    level: 1,
    school: 'Divination (rituel)',
    castingTime: '1 action',
    range: 'Personnelle',
    components: 'V, S',
    duration: 'Concentration, jusqu\'à 10 minutes',
    description: 'Pour la durée, vous sentez la présence de magie à 9 mètres de vous. Si vous sentez la magie de cette façon, vous pouvez utiliser votre action pour voir une aura faible autour de toute créature ou objet visible dans la zone qui porte de la magie, et vous apprenez son école de magie, le cas échéant.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'flou',
    name: 'Flou',
    level: 2,
    school: 'Illusion',
    castingTime: '1 action',
    range: 'Personnelle',
    components: 'V',
    duration: 'Concentration, jusqu\'à 1 minute',
    description: 'Votre corps devient flou, se déplaçant et ondulant pour tous ceux qui peuvent vous voir. Pour la durée, toute créature a un désavantage aux jets d\'attaque contre vous. Un attaquant est immunisé à cet effet s\'il ne compte pas sur la vue, comme avec la vision aveugle, ou peut voir à travers les illusions, comme avec la vision parfaite.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'levitation',
    name: 'Lévitation',
    level: 2,
    school: 'Transmutation',
    castingTime: '1 action',
    range: '18 mètres',
    components: 'V, S, M (soit une petite boucle de cuir soit un morceau de fil de fer doré plié en forme de coupe avec une tige longue d\'un côté)',
    duration: 'Concentration, jusqu\'à 10 minutes',
    description: 'Une créature ou un objet de votre choix que vous pouvez voir à portée s\'élève verticalement, jusqu\'à 6 mètres, et reste suspendu là pour la durée. Le sort peut faire léviter une cible qui pèse jusqu\'à 250 kilos. Une créature non consentante qui réussit un jet de sauvegarde de Constitution n\'est pas affectée.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'sanctuaire',
    name: 'Sanctuaire',
    level: 1,
    school: 'Abjuration',
    castingTime: '1 action bonus',
    range: '9 mètres',
    components: 'V, S, M (un petit miroir en argent)',
    duration: '1 minute',
    description: 'Vous protégez une créature à portée contre les attaques. Jusqu\'à ce que le sort se termine, toute créature qui cible la créature protégée avec une attaque ou un sort nuisible doit d\'abord effectuer un jet de sauvegarde de Sagesse. En cas d\'échec, la créature doit choisir une nouvelle cible ou perdre l\'attaque ou le sort.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'restauration-partielle',
    name: 'Restauration partielle',
    level: 2,
    school: 'Abjuration',
    castingTime: '1 action',
    range: 'Toucher',
    components: 'V, S',
    duration: 'Instantanée',
    description: 'Vous touchez une créature et pouvez mettre fin soit à une maladie soit à une condition l\'affligeant. La condition peut être aveuglé, assourdi, paralysé ou empoisonné.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'revocation',
    name: 'Révocation',
    level: 3,
    school: 'Abjuration',
    castingTime: '1 action',
    range: '18 mètres',
    components: 'V, S, M (de l\'eau bénite ou de la poudre d\'argent et de fer d\'une valeur d\'au moins 100 po, que le sort consomme)',
    duration: 'Instantanée',
    description: 'Choisissez une créature que vous pouvez voir à portée. Vous devez effectuer un jet d\'attaque de sort à distance contre la créature. En cas de toucher, la créature doit effectuer un jet de sauvegarde de Charisme. En cas d\'échec, la créature est bannie.',
    higherLevels: 'Quand vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d\'emplacement au-dessus du niveau 3.'
  },
  {
    id: 'apaisement-des-emotions',
    name: 'Apaisement des émotions',
    level: 2,
    school: 'Enchantement',
    castingTime: '1 action',
    range: '18 mètres',
    components: 'V, S',
    duration: 'Concentration, jusqu\'à 1 minute',
    description: 'Vous tentez de supprimer les émotions fortes dans un groupe de personnes. Chaque humanoïde dans une sphère de 6 mètres de rayon centrée sur un point que vous choisissez à portée doit effectuer un jet de sauvegarde de Charisme ; une créature peut choisir d\'échouer à ce jet de sauvegarde si elle le souhaite.',
    higherLevels: 'Aucun.'
  },
  {
    id: 'cecite-surdite',
    name: 'Cécité/Surdité',
    level: 2,
    school: 'Nécromancie',
    castingTime: '1 action',
    range: '9 mètres',
    components: 'V',
    duration: '1 minute',
    description: 'Vous pouvez aveugler ou assourdir un ennemi. Choisissez une créature que vous pouvez voir à portée pour effectuer un jet de sauvegarde de Constitution. Si elle échoue, la cible est soit aveuglée soit assourdie (votre choix) pour la durée.',
    higherLevels: 'Quand vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d\'emplacement au-dessus du niveau 2.'
  },
  {
    id: 'fleau',
    name: 'Fléau',
    level: 1,
    school: 'Nécromancie',
    castingTime: '1 action',
    range: '9 mètres',
    components: 'V, S, M (une goutte de sang)',
    duration: 'Concentration, jusqu\'à 1 minute',
    description: 'Jusqu\'à trois créatures de votre choix que vous pouvez voir à portée doivent effectuer un jet de sauvegarde de Constitution. Chaque fois qu\'une cible qui a échoué le jet de sauvegarde effectue un jet d\'attaque ou un jet de sauvegarde avant que le sort se termine, la cible doit lancer un d4 et soustraire le nombre obtenu du jet d\'attaque ou de sauvegarde.',
    higherLevels: 'Quand vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d\'emplacement au-dessus du niveau 1.'
  },
  {
    id: 'blessure',
    name: 'Blessure',
    level: 1,
    school: 'Nécromancie',
    castingTime: '1 action',
    range: 'Toucher',
    components: 'V, S',
    duration: 'Instantanée',
    description: 'Effectuez une attaque de sort au corps à corps contre une créature que vous pouvez atteindre. En cas de toucher, la cible subit 3d10 dégâts nécrotiques.',
    higherLevels: 'Quand vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts augmentent de 1d10 pour chaque niveau d\'emplacement au-dessus du niveau 1.'
  }
]

// Fonction utilitaire pour obtenir la description d'un sort
export function getSpellDescription(spellName: string): string {
  const spell = spells.find(s => 
    s.name.toLowerCase() === spellName.toLowerCase() ||
    s.id === spellName.toLowerCase().replace(/[^a-z0-9]/g, '-')
  )
  
  if (!spell) {
    return `Sort "${spellName}" non trouvé dans la base de données.`
  }
  
  return `${spell.description}${spell.higherLevels ? ` ${spell.higherLevels}` : ''}`
}

// Fonction pour obtenir les détails complets d'un sort
export function getSpellDetails(spellName: string): Spell | null {
  return spells.find(s => 
    s.name.toLowerCase() === spellName.toLowerCase() ||
    s.id === spellName.toLowerCase().replace(/[^a-z0-9]/g, '-')
  ) || null
}

// Fonction pour obtenir tous les sorts d'un niveau donné
export function getSpellsByLevel(level: number): Spell[] {
  return spells.filter(s => s.level === level)
}

// Fonction pour obtenir tous les sorts d'une école donnée
export function getSpellsBySchool(school: string): Spell[] {
  return spells.filter(s => s.school.toLowerCase() === school.toLowerCase())
}
