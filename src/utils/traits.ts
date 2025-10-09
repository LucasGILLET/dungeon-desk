// Descriptions des traits raciaux D&D 5e
export const traitDescriptions: Record<string, string> = {
  // Traits humains
  'Compétence supplémentaire': 'Vous maîtrisez une compétence supplémentaire de votre choix.',
  'Polyvalence humaine': 'Les humains s\'adaptent facilement à toutes les situations.',
  'Don gratuit': 'Vous obtenez un don de votre choix au niveau 1.',
  '+1 à deux caractéristiques au choix': 'Choisissez deux caractéristiques différentes et augmentez-les de +1 chacune.',
  
  // Traits elfiques
  'Sens aiguisés': 'Vous maîtrisez la compétence Perception.',
  'Ascendance féerique': 'Vous avez un avantage aux jets de sauvegarde contre les charmes et la magie ne peut pas vous endormir.',
  'Transe': '4 heures de méditation remplacent 8 heures de sommeil.',
  'Entraînement aux armes elfiques': 'Vous maîtrisez les épées longues, épées courtes, arcs longs et arcs courts.',
  'Sort mineur': 'Vous connaissez un sort mineur de magicien de votre choix.',
  'Vision dans le noir': 'Vous pouvez voir dans l\'obscurité totale sur une distance de 18 mètres comme s\'il s\'agissait d\'une lumière faible.',
  'Pied léger': 'Votre vitesse de base passe à 10,5 mètres.',
  'Camouflage naturel': 'Vous pouvez tenter de vous cacher même quand vous n\'êtes que légèrement obscurci par le feuillage, la pluie battante, la neige qui tombe, la brume et autres phénomènes naturels.',
  'Sensibilité au soleil': 'Désavantage aux jets d\'attaque et de Perception en plein soleil.',
  'Magie drow': 'Vous connaissez le sort mineur Lumières dansantes. Au niveau 3, Lueurs féeriques 1/jour. Au niveau 5, Ténèbres 1/jour.',
  'Entraînement aux armes drow': 'Vous maîtrisez les rapières, épées courtes et arbalètes de poing.',
  
  // Traits nains
  'Résistance naine': 'Avantage aux jets de sauvegarde contre le poison et résistance aux dégâts de poison.',
  'Connaissance de la pierre': 'Double bonus de maîtrise pour les jets d\'Intelligence (Histoire) liés à la pierre.',
  'Maîtrise des outils': 'Vous maîtrisez les outils d\'artisan de votre choix parmi : outils de forgeron, matériel de brasseur ou outils de maçon.',
  'Entraînement aux armes naines': 'Vous maîtrisez les haches d\'armes, hachettes, marteaux de jet et marteaux de guerre.',
  'Robustesse naine (+1 PV par niveau)': 'Votre maximum de points de vie augmente de 1 à chaque niveau.',
  'Ténacité naine': 'Votre maximum de points de vie augmente de 1 à chaque niveau.',
  'Maîtrise des armures légères et moyennes': 'Vous maîtrisez les armures légères et moyennes.',
  
  // Traits halfelins
  'Chance halfeline': 'Quand vous obtenez un 1 sur un d20, vous pouvez relancer le dé (vous devez utiliser le nouveau résultat).',
  'Bravoure': 'Avantage aux jets de sauvegarde contre la peur.',
  'Agilité halfeline': 'Vous pouvez traverser l\'espace de créatures d\'une taille supérieure à la vôtre.',
  'Discrétion naturelle': 'Vous pouvez tenter de vous cacher quand vous êtes obscurci par une créature d\'une taille supérieure à la vôtre.',
  'Résistance des robustes': 'Avantage aux jets de sauvegarde contre le poison et résistance aux dégâts de poison.',
  
  // Traits gnomes
  'Ruse gnome': 'Avantage aux jets de sauvegarde d\'Intelligence, Sagesse et Charisme contre la magie.',
  'Communication avec les petites bêtes': 'Par des sons et des gestes, vous pouvez communiquer des idées simples avec les bêtes de taille P ou plus petites.',
  'Communication avec les petits animaux': 'Par des sons et des gestes, vous pouvez communiquer des idées simples avec les bêtes de taille P ou plus petites.',
  'Illusion mineure': 'Vous connaissez le sort mineur Illusion mineure.',
  'Illusioniste-né': 'Vous connaissez le sort mineur Illusion mineure. L\'Intelligence est votre caractéristique d\'incantation.',
  'Connaissance de la nature': 'Vous maîtrisez la compétence Dressage ou Survie.',
  'Connaissance en ingénierie': 'Vous maîtrisez les outils d\'artisan de votre choix et doublez votre bonus de maîtrise pour les utiliser.',
  'Bricoleur': 'Vous pouvez fabriquer de petits objets mécaniques avec vos outils.',
  'Maîtrise des outils d\'artisan': 'Vous maîtrisez les outils d\'artisan de votre choix.',
  
  // Traits draconiques
  'Ascendance draconique': 'Votre souffle et résistance dépendent de votre ascendance draconique.',
  'Souffle draconique': 'Action pour utiliser un souffle destructeur en ligne ou cône.',
  'Résistance aux dégâts': 'Résistance au type de dégâts associé à votre ascendance draconique.',
  
  // Traits humains
  'Polyvalence': 'Vous obtenez deux compétences de votre choix.',
  'Compétences supplémentaires': 'Vous maîtrisez deux compétences de votre choix.',
  
  // Traits orcs
  'Attaques sauvages': 'Quand vous obtenez un critique avec une attaque de mêlée, vous pouvez lancer un dé de dégâts supplémentaire.',
  'Endurance implacable': 'Quand vous tombez à 0 point de vie sans mourir, vous pouvez tomber à 1 point de vie à la place (1/repos long).',
  'Menaces sauvages': 'Vous maîtrisez la compétence Intimidation.',
  'Menaçant': 'Vous maîtrisez la compétence Intimidation.',
  
  // Traits tieffelins
  'Résistance infernale': 'Résistance aux dégâts de feu.',
  'Héritage infernal': 'Vous connaissez le sort mineur Thaumaturgie.',
  'Ascendance infernale': 'Vous connaissez le sort mineur Thaumaturgie. Au niveau 3, vous pouvez lancer Réprimande infernale 1/jour comme un sort de niveau 2. Au niveau 5, vous pouvez aussi lancer Ténèbres 1/jour. Le Charisme est votre caractéristique d\'incantation.',
  'Magie infernale': 'Au niveau 3, Réprimande infernale 1/jour. Au niveau 5, Ténèbres 1/jour.'
}

// Fonction utilitaire pour obtenir la description d'un trait
export function getTraitDescription(traitName: string): string {
  return traitDescriptions[traitName] || 'Trait racial spécial'
}
