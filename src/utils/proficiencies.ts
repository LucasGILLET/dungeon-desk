export interface ProficiencyChoice {
  id: string
  name: string
  category: 'skill' | 'language' | 'tool' | 'weapon' | 'armor'
  description?: string
}

export interface ProficiencyData {
  automaticProficiencies: ProficiencyChoice[]
  choiceGroups: {
    id: string
    name: string
    count: number
    choices: ProficiencyChoice[]
    unavailableChoices?: string[] // IDs des choix déjà acquis automatiquement
  }[]
}

// Compétences disponibles en D&D 5e
export const allSkills: ProficiencyChoice[] = [
  { id: 'acrobaties', name: 'Acrobaties', category: 'skill', description: 'Votre agilité et votre équilibre. Basé sur la Dextérité.' },
  { id: 'arcane', name: 'Arcanes', category: 'skill', description: 'Vos connaissances sur la magie, les sorts et les objets magiques. Basé sur l\'Intelligence.' },
  { id: 'athletisme', name: 'Athlétisme', category: 'skill', description: 'Votre force physique appliquée à des situations particulières. Basé sur la Force.' },
  { id: 'discretion', name: 'Discrétion', category: 'skill', description: 'Votre capacité à éviter d\'être remarqué. Basé sur la Dextérité.' },
  { id: 'dressage', name: 'Dressage', category: 'skill', description: 'Votre capacité à calmer les animaux domestiques, ou à deviner leurs intentions. Basé sur la Sagesse.' },
  { id: 'escamotage', name: 'Escamotage', category: 'skill', description: 'Votre agilité manuelle et votre rapidité de main. Basé sur la Dextérité.' },
  { id: 'histoire', name: 'Histoire', category: 'skill', description: 'Vos connaissances sur les événements historiques. Basé sur l\'Intelligence.' },
  { id: 'intimidation', name: 'Intimidation', category: 'skill', description: 'Votre capacité à influencer par la menace. Basé sur le Charisme.' },
  { id: 'investigation', name: 'Investigation', category: 'skill', description: 'Votre capacité à chercher des indices et à faire des déductions. Basé sur l\'Intelligence.' },
  { id: 'medecine', name: 'Médecine', category: 'skill', description: 'Vos connaissances pour stabiliser un mourant ou diagnostiquer une maladie. Basé sur la Sagesse.' },
  { id: 'nature', name: 'Nature', category: 'skill', description: 'Vos connaissances sur le terrain, les plantes et les animaux. Basé sur l\'Intelligence.' },
  { id: 'perception', name: 'Perception', category: 'skill', description: 'Votre conscience de votre environnement. Basé sur la Sagesse.' },
  { id: 'perspicacite', name: 'Perspicacité', category: 'skill', description: 'Votre capacité à déterminer les vraies intentions d\'une créature. Basé sur la Sagesse.' },
  { id: 'persuasion', name: 'Persuasion', category: 'skill', description: 'Votre capacité à influencer avec tact, grâces sociales ou bonne nature. Basé sur le Charisme.' },
  { id: 'religion', name: 'Religion', category: 'skill', description: 'Vos connaissances sur les déités, rites et prières. Basé sur l\'Intelligence.' },
  { id: 'representation', name: 'Représentation', category: 'skill', description: 'Votre capacité à divertir un public avec musique, danse, théâtre ou conte. Basé sur le Charisme.' },
  { id: 'survie', name: 'Survie', category: 'skill', description: 'Votre capacité à suivre des pistes, chasser du gibier ou guider un groupe. Basé sur la Sagesse.' },
  { id: 'tromperie', name: 'Tromperie', category: 'skill', description: 'Votre capacité à dissimuler la vérité par des mensonges. Basé sur le Charisme.' }
]

// Langues disponibles en D&D 5e
export const allLanguages: ProficiencyChoice[] = [
  // Langues communes
  { id: 'commun', name: 'Commun', category: 'language', description: 'La langue universelle des humanoïdes civilisés.' },
  { id: 'elfique', name: 'Elfique', category: 'language', description: 'La langue gracieuse des elfes.' },
  { id: 'nain', name: 'Nain', category: 'language', description: 'La langue robuste des nains.' },
  { id: 'halfelin', name: 'Halfelin', category: 'language', description: 'La langue chaleureuse des halfelins.' },
  { id: 'gnome', name: 'Gnome', category: 'language', description: 'La langue inventive des gnomes.' },
  { id: 'orc', name: 'Orc', category: 'language', description: 'La langue brutale des orcs.' },
  { id: 'draconique', name: 'Draconique', category: 'language', description: 'La langue ancienne des dragons, utilisée en magie.' },
  
  // Langues exotiques
  { id: 'abyssal', name: 'Abyssal', category: 'language', description: 'La langue des démons.' },
  { id: 'celestiel', name: 'Célestiel', category: 'language', description: 'La langue des anges et des créatures célestes.' },
  { id: 'infernal', name: 'Infernal', category: 'language', description: 'La langue des diables et des plans inférieurs.' },
  { id: 'primordial', name: 'Primordial', category: 'language', description: 'La langue des élémentaires (inclut Aquatique, Aérien, Ignée, Terrestre).' },
  { id: 'sylvestre', name: 'Sylvestre', category: 'language', description: 'La langue des créatures féeriques.' },
  { id: 'geant', name: 'Géant', category: 'language', description: 'La langue des géants et leurs cousins.' },
  { id: 'gobelin', name: 'Gobelin', category: 'language', description: 'La langue des gobelinoïdes.' }
]

// Outils et instruments
export const allTools: ProficiencyChoice[] = [
  // Outils d'artisan
  { id: 'outils-alchimiste', name: 'Outils d\'alchimiste', category: 'tool', description: 'Pour créer des potions et des substances alchimiques.' },
  { id: 'outils-brasseur', name: 'Matériel de brasseur', category: 'tool', description: 'Pour brasser des bières et autres boissons.' },
  { id: 'outils-calligraphe', name: 'Outils de calligraphe', category: 'tool', description: 'Pour l\'écriture élégante et la copie de documents.' },
  { id: 'outils-charpentier', name: 'Outils de charpentier', category: 'tool', description: 'Pour travailler le bois et construire.' },
  { id: 'outils-cartographe', name: 'Outils de cartographe', category: 'tool', description: 'Pour créer des cartes et des plans.' },
  { id: 'outils-cordonnier', name: 'Outils de cordonnier', category: 'tool', description: 'Pour fabriquer et réparer chaussures et équipement de cuir.' },
  { id: 'outils-cuisine', name: 'Ustensiles de cuisine', category: 'tool', description: 'Pour préparer des repas délicieux et nourrissants.' },
  { id: 'outils-forgeron', name: 'Outils de forgeron', category: 'tool', description: 'Pour forger le métal et créer des armes et armures.' },
  { id: 'outils-bijoutier', name: 'Outils de bijoutier', category: 'tool', description: 'Pour travailler les métaux précieux et les gemmes.' },
  { id: 'outils-maconnerie', name: 'Outils de maçonnerie', category: 'tool', description: 'Pour tailler la pierre et construire en dur.' },
  { id: 'outils-peintre', name: 'Matériel de peintre', category: 'tool', description: 'Pour créer des œuvres d\'art et décorer.' },
  { id: 'outils-potier', name: 'Outils de potier', category: 'tool', description: 'Pour façonner l\'argile et créer des récipients.' },
  { id: 'outils-tisserand', name: 'Outils de tisserand', category: 'tool', description: 'Pour tisser des étoffes et créer des vêtements.' },
  { id: 'outils-souffleur-verre', name: 'Outils de souffleur de verre', category: 'tool', description: 'Pour créer des objets en verre.' },
  
  // Instruments de musique
  { id: 'cornemuse', name: 'Cornemuse', category: 'tool', description: 'Instrument à vent traditionnel.' },
  { id: 'flute', name: 'Flûte', category: 'tool', description: 'Instrument à vent mélodieux.' },
  { id: 'luth', name: 'Luth', category: 'tool', description: 'Instrument à cordes sophistiqué.' },
  { id: 'lyre', name: 'Lyre', category: 'tool', description: 'Petit instrument à cordes.' },
  { id: 'cor', name: 'Cor', category: 'tool', description: 'Instrument à vent puissant.' },
  { id: 'flute-de-pan', name: 'Flûte de Pan', category: 'tool', description: 'Instrument à vent rustique.' },
  { id: 'tambourin', name: 'Tambourin', category: 'tool', description: 'Petit tambour avec cymbalettes.' },
  { id: 'tambour', name: 'Tambour', category: 'tool', description: 'Instrument de percussion.' },
  { id: 'dulcimer', name: 'Dulcimer', category: 'tool', description: 'Instrument à cordes frappées.' },
  { id: 'vielle', name: 'Vielle', category: 'tool', description: 'Instrument à cordes frottées.' },
  
  // Kits et outils spécialisés
  { id: 'outils-voleur', name: 'Outils de voleur', category: 'tool', description: 'Pour crocheter les serrures et désamorcer les pièges.' },
  { id: 'kit-herboriste', name: 'Kit d\'herboriste', category: 'tool', description: 'Pour identifier et utiliser les plantes médicinales.' },
  { id: 'kit-contrefacon', name: 'Kit de contrefaçon', category: 'tool', description: 'Pour créer de faux documents et sceaux.' },
  { id: 'kit-deguisement', name: 'Kit de déguisement', category: 'tool', description: 'Pour changer d\'apparence et se faire passer pour quelqu\'un d\'autre.' },
  { id: 'kit-empoisonneur', name: 'Kit d\'empoisonneur', category: 'tool', description: 'Pour créer et identifier les poisons.' },
  { id: 'outils-navigation', name: 'Outils de navigation', category: 'tool', description: 'Pour naviguer en mer et s\'orienter.' },
  { id: 'vehicules-terrestres', name: 'Véhicules terrestres', category: 'tool', description: 'Maîtrise de la conduite d\'attelages et véhicules terrestres.' },
  { id: 'vehicules-marins', name: 'Véhicules marins', category: 'tool', description: 'Maîtrise de la navigation et conduite de navires.' }
]

// Fonction pour obtenir les maîtrises automatiques d'une race
export function getRaceProficiencies(raceId: string, subraceId?: string): ProficiencyData {
  const automatic: ProficiencyChoice[] = []
  const choiceGroups: { id: string; name: string; count: number; choices: ProficiencyChoice[] }[] = []

  // Maîtrises raciales automatiques basées sur les traits
  switch (raceId) {
    case 'elfe':
      automatic.push(allSkills.find(s => s.id === 'perception')!)
      if (subraceId === 'haut-elfe') {
        // Les hauts-elfes maîtrisent les armes elfiques + 1 sort mineur
        choiceGroups.push({
          id: 'haut-elfe-langue',
          name: 'Langue supplémentaire (Haut-elfe)',
          count: 1,
          choices: allLanguages.filter(l => !['commun', 'elfique'].includes(l.id))
        })
      }
      break
      
    case 'dwarf':
      // Maîtrise des outils d'artisan
      choiceGroups.push({
        id: 'nain-outils',
        name: 'Outils d\'artisan nain',
        count: 1,
        choices: [
          allTools.find(t => t.id === 'outils-forgeron')!,
          allTools.find(t => t.id === 'outils-brasseur')!,
          allTools.find(t => t.id === 'outils-maconnerie')!
        ]
      })
      break
      
    case 'halfelin':
      // Pas de maîtrises de compétences spéciales
      break
      
    case 'humain':
      if (subraceId === 'humain-variante') {
        choiceGroups.push({
          id: 'humain-competence',
          name: 'Compétence supplémentaire (Humain variante)',
          count: 1,
          choices: allSkills
        })
        choiceGroups.push({
          id: 'humain-langue',
          name: 'Langue supplémentaire (Humain variante)',
          count: 1,
          choices: allLanguages.filter(l => l.id !== 'commun')
        })
      }
      break
      
    case 'demi-elfe':
      choiceGroups.push({
        id: 'demi-elfe-competences',
        name: 'Compétences supplémentaires (Demi-elfe)',
        count: 2,
        choices: allSkills
      })
      break
      
    case 'demi-orc':
      automatic.push(allSkills.find(s => s.id === 'intimidation')!)
      break
      
    case 'gnome':
      if (subraceId === 'gnome-des-roches') {
        choiceGroups.push({
          id: 'gnome-outils',
          name: 'Outils d\'artisan (Gnome des roches)',
          count: 1,
          choices: allTools.filter(t => t.category === 'tool' && t.id.startsWith('outils-'))
        })
      } else if (subraceId === 'gnome-des-forets') {
        automatic.push(allSkills.find(s => s.id === 'dressage')!)
      }
      break
  }

  return { automaticProficiencies: automatic, choiceGroups }
}

// Fonction pour obtenir les maîtrises d'une classe
export function getClassProficiencies(classId: string): ProficiencyData {
  const automatic: ProficiencyChoice[] = []
  const choiceGroups: { id: string; name: string; count: number; choices: ProficiencyChoice[] }[] = []

  switch (classId) {
    case 'guerrier':
    case 'fighter':
      choiceGroups.push({
        id: 'guerrier-competences',
        name: 'Compétences de classe (Guerrier)',
        count: 2,
        choices: ['acrobaties', 'dressage', 'histoire', 'intimidation', 'perception', 'survie']
          .map(id => allSkills.find(s => s.id === id)!)
      })
      break
      
    case 'roublard':
    case 'rogue':
      choiceGroups.push({
        id: 'roublard-competences',
        name: 'Compétences de classe (Roublard)',
        count: 4,
        choices: ['acrobaties', 'athletisme', 'discretion', 'escamotage', 'intimidation', 'investigation', 'perception', 'persuasion', 'perspicacite', 'representation', 'tromperie']
          .map(id => allSkills.find(s => s.id === id)!)
      })
      automatic.push(allTools.find(t => t.id === 'outils-voleur')!)
      break
      
    case 'magicien':
    case 'wizard':
      choiceGroups.push({
        id: 'magicien-competences',
        name: 'Compétences de classe (Magicien)',
        count: 2,
        choices: ['arcane', 'histoire', 'perspicacite', 'investigation', 'medecine', 'religion']
          .map(id => allSkills.find(s => s.id === id)!)
      })
      break
      
    case 'clerc':
    case 'cleric':
      choiceGroups.push({
        id: 'clerc-competences',
        name: 'Compétences de classe (Clerc)',
        count: 2,
        choices: ['histoire', 'medecine', 'perspicacite', 'persuasion', 'religion']
          .map(id => allSkills.find(s => s.id === id)!)
      })
      break
      
    case 'rodeur':
    case 'ranger':
      choiceGroups.push({
        id: 'rodeur-competences',
        name: 'Compétences de classe (Rôdeur)',
        count: 3,
        choices: ['athletisme', 'dressage', 'discretion', 'investigation', 'nature', 'perception', 'survie']
          .map(id => allSkills.find(s => s.id === id)!)
      })
      break
      
    case 'paladin':
      choiceGroups.push({
        id: 'paladin-competences',
        name: 'Compétences de classe (Paladin)',
        count: 2,
        choices: ['athletisme', 'intimidation', 'medecine', 'perspicacite', 'persuasion', 'religion']
          .map(id => allSkills.find(s => s.id === id)!)
      })
      break
      
    case 'barbare':
    case 'barbarian':
      choiceGroups.push({
        id: 'barbare-competences',
        name: 'Compétences de classe (Barbare)',
        count: 2,
        choices: ['dressage', 'athletisme', 'intimidation', 'nature', 'perception', 'survie']
          .map(id => allSkills.find(s => s.id === id)!)
      })
      break
      
    case 'barde':
    case 'bard':
      choiceGroups.push({
        id: 'barde-competences',
        name: 'Compétences de classe (Barde)',
        count: 3,
        choices: allSkills // Les bardes peuvent choisir n'importe quelle compétence
      })
      choiceGroups.push({
        id: 'barde-instruments',
        name: 'Instruments de musique (Barde)',
        count: 3,
        choices: allTools.filter(t => ['cornemuse', 'flute', 'luth', 'lyre', 'cor', 'flute-de-pan', 'tambourin', 'tambour', 'dulcimer', 'vielle'].includes(t.id))
      })
      break
      
    case 'moine':
    case 'monk':
      choiceGroups.push({
        id: 'moine-competences',
        name: 'Compétences de classe (Moine)',
        count: 2,
        choices: ['acrobaties', 'athletisme', 'histoire', 'perspicacite', 'religion', 'discretion']
          .map(id => allSkills.find(s => s.id === id)!)
      })
      choiceGroups.push({
        id: 'moine-outils',
        name: 'Outils d\'artisan ou instrument (Moine)',
        count: 1,
        choices: [...allTools.filter(t => t.id.startsWith('outils-')), ...allTools.filter(t => ['cornemuse', 'flute', 'luth', 'lyre', 'cor', 'flute-de-pan', 'tambourin', 'tambour', 'dulcimer', 'vielle'].includes(t.id))]
      })
      break
      
    case 'sorcier':
    case 'sorcerer':
      choiceGroups.push({
        id: 'sorcier-competences',
        name: 'Compétences de classe (Ensorceleur)',
        count: 2,
        choices: ['arcane', 'intimidation', 'perspicacite', 'persuasion', 'religion', 'tromperie']
          .map(id => allSkills.find(s => s.id === id)!)
      })
      break
      
    case 'occultiste':
    case 'warlock':
      choiceGroups.push({
        id: 'occultiste-competences',
        name: 'Compétences de classe (Occultiste)',
        count: 2,
        choices: ['arcane', 'histoire', 'intimidation', 'investigation', 'nature', 'religion']
          .map(id => allSkills.find(s => s.id === id)!)
      })
      break
      
    case 'druide':
    case 'druid':
      choiceGroups.push({
        id: 'druide-competences',
        name: 'Compétences de classe (Druide)',
        count: 2,
        choices: ['arcane', 'dressage', 'medecine', 'nature', 'perception', 'religion', 'survie']
          .map(id => allSkills.find(s => s.id === id)!)
      })
      break
  }

  return { automaticProficiencies: automatic, choiceGroups }
}

// Fonction pour obtenir les maîtrises d'un historique
export function getBackgroundProficiencies(backgroundId: string): ProficiencyData {
  const automatic: ProficiencyChoice[] = []
  const choiceGroups: { id: string; name: string; count: number; choices: ProficiencyChoice[] }[] = []

  switch (backgroundId) {
    case 'acolyte':
      automatic.push(
        allSkills.find(s => s.id === 'religion')!,
        allSkills.find(s => s.id === 'perspicacite')!
      )
      choiceGroups.push({
        id: 'acolyte-langues',
        name: 'Langues supplémentaires (Acolyte)',
        count: 2,
        choices: allLanguages.filter(l => l.id !== 'commun')
      })
      break
      
    case 'criminel':
    case 'criminal':
      automatic.push(
        allSkills.find(s => s.id === 'discretion')!,
        allSkills.find(s => s.id === 'tromperie')!,
        allTools.find(t => t.id === 'outils-voleur')!
      )
      choiceGroups.push({
        id: 'criminel-jeu',
        name: 'Kit de jeu (Criminel)',
        count: 1,
        choices: [
          { id: 'jeu-cartes', name: 'Jeu de cartes', category: 'tool', description: 'Pour jouer aux cartes et parier.' },
          { id: 'jeu-des', name: 'Jeu de dés', category: 'tool', description: 'Pour jouer aux dés et parier.' }
        ]
      })
      break
      
    case 'artisan':
    case 'guild-artisan':
      automatic.push(
        allSkills.find(s => s.id === 'perspicacite')!,
        allSkills.find(s => s.id === 'persuasion')!
      )
      choiceGroups.push({
        id: 'artisan-outils',
        name: 'Outils d\'artisan (Artisan de guilde)',
        count: 1,
        choices: allTools.filter(t => t.id.startsWith('outils-'))
      })
      choiceGroups.push({
        id: 'artisan-langue',
        name: 'Langue supplémentaire (Artisan de guilde)',
        count: 1,
        choices: allLanguages.filter(l => l.id !== 'commun')
      })
      break
      
    case 'noble':
      automatic.push(
        allSkills.find(s => s.id === 'histoire')!,
        allSkills.find(s => s.id === 'persuasion')!
      )
      choiceGroups.push({
        id: 'noble-jeu',
        name: 'Kit de jeu (Noble)',
        count: 1,
        choices: [
          { id: 'jeu-cartes', name: 'Jeu de cartes', category: 'tool', description: 'Pour jouer aux cartes et parier.' },
          { id: 'jeu-echecs', name: 'Jeu d\'échecs', category: 'tool', description: 'Jeu de stratégie noble.' }
        ]
      })
      choiceGroups.push({
        id: 'noble-langue',
        name: 'Langue supplémentaire (Noble)',
        count: 1,
        choices: allLanguages.filter(l => l.id !== 'commun')
      })
      break
      
    case 'sage':
      automatic.push(
        allSkills.find(s => s.id === 'arcane')!,
        allSkills.find(s => s.id === 'histoire')!
      )
      choiceGroups.push({
        id: 'sage-langues',
        name: 'Langues supplémentaires (Sage)',
        count: 2,
        choices: allLanguages.filter(l => l.id !== 'commun')
      })
      break
      
    case 'soldat':
    case 'soldier':
      automatic.push(
        allSkills.find(s => s.id === 'athletisme')!,
        allSkills.find(s => s.id === 'intimidation')!,
        allTools.find(t => t.id === 'vehicules-terrestres')!
      )
      choiceGroups.push({
        id: 'soldat-jeu',
        name: 'Kit de jeu (Soldat)',
        count: 1,
        choices: [
          { id: 'jeu-cartes', name: 'Jeu de cartes', category: 'tool', description: 'Pour jouer aux cartes et parier.' },
          { id: 'jeu-des', name: 'Jeu de dés', category: 'tool', description: 'Pour jouer aux dés et parier.' }
        ]
      })
      break
      
    case 'charlatan':
      automatic.push(
        allSkills.find(s => s.id === 'tromperie')!,
        allSkills.find(s => s.id === 'escamotage')!,
        allTools.find(t => t.id === 'kit-contrefacon')!,
        allTools.find(t => t.id === 'kit-deguisement')!
      )
      break
      
    case 'artiste':
    case 'entertainer':
      automatic.push(
        allSkills.find(s => s.id === 'representation')!,
        allSkills.find(s => s.id === 'acrobaties')!,
        allTools.find(t => t.id === 'kit-deguisement')!
      )
      choiceGroups.push({
        id: 'artiste-instrument',
        name: 'Instrument de musique (Artiste)',
        count: 1,
        choices: allTools.filter(t => ['cornemuse', 'flute', 'luth', 'lyre', 'cor', 'flute-de-pan', 'tambourin', 'tambour', 'dulcimer', 'vielle'].includes(t.id))
      })
      break
      
    case 'ermite':
    case 'hermit':
      automatic.push(
        allSkills.find(s => s.id === 'medecine')!,
        allSkills.find(s => s.id === 'religion')!,
        allTools.find(t => t.id === 'kit-herboriste')!
      )
      choiceGroups.push({
        id: 'ermite-langue',
        name: 'Langue supplémentaire (Ermite)',
        count: 1,
        choices: allLanguages.filter(l => l.id !== 'commun')
      })
      break
      
    case 'marin':
    case 'sailor':
      automatic.push(
        allSkills.find(s => s.id === 'athletisme')!,
        allSkills.find(s => s.id === 'perception')!,
        allTools.find(t => t.id === 'outils-navigation')!,
        allTools.find(t => t.id === 'vehicules-marins')!
      )
      break
      
    case 'enfant_rues':
    case 'urchin':
      automatic.push(
        allSkills.find(s => s.id === 'escamotage')!,
        allSkills.find(s => s.id === 'discretion')!,
        allTools.find(t => t.id === 'outils-voleur')!,
        allTools.find(t => t.id === 'kit-deguisement')!
      )
      break
      
    case 'chasseur':
    case 'outlander':
      automatic.push(
        allSkills.find(s => s.id === 'survie')!,
        allSkills.find(s => s.id === 'dressage')!
      )
      choiceGroups.push({
        id: 'chasseur-outils',
        name: 'Outils d\'artisan (Chasseur)',
        count: 1,
        choices: [
          allTools.find(t => t.id === 'outils-cordonnier')!,
          allTools.find(t => t.id === 'outils-cuisine')!
        ]
      })
      break
      
    case 'folk-hero':
      automatic.push(
        allSkills.find(s => s.id === 'dressage')!,
        allSkills.find(s => s.id === 'survie')!,
        allTools.find(t => t.id === 'vehicules-terrestres')!
      )
      choiceGroups.push({
        id: 'heros-outils',
        name: 'Outils d\'artisan (Héros du peuple)',
        count: 1,
        choices: allTools.filter(t => t.id.startsWith('outils-') && t.id !== 'outils-voleur' && t.id !== 'outils-navigation')
      })
      break
  }

  return { automaticProficiencies: automatic, choiceGroups }
}

// Fonction utilitaire pour obtenir les langues automatiques d'une race
export function getAutomaticLanguages(race: any): ProficiencyChoice[] {
  if (!race || !race.languages) {
    return []
  }
  
  return race.languages.map((language: any) => {
    // Mapper les noms de langues vers les objets ProficiencyChoice
    const languageId = language.name.toLowerCase()
      .replace('é', 'e')
      .replace(' ', '-')
    
    let foundLanguage = allLanguages.find(l => 
      l.name.toLowerCase() === language.name.toLowerCase() ||
      l.id === languageId
    )
    
    // Si on ne trouve pas la langue, on la crée
    if (!foundLanguage) {
      foundLanguage = {
        id: languageId,
        name: language.name,
        category: 'language',
        description: `La langue ${language.name.toLowerCase()}.`
      }
    }
    
    return foundLanguage
  })
}

// Fonction utilitaire pour combiner toutes les maîtrises d'un personnage
export function getAllCharacterProficiencies(
  raceId: string, 
  subraceId: string, 
  classId: string, 
  backgroundId: string,
): ProficiencyData {

  console.log("getAllCharacterProficiencies", raceId, subraceId, classId, backgroundId)

  const raceProficiencies = getRaceProficiencies(raceId, subraceId)
  const classProficiencies = getClassProficiencies(classId)
  const backgroundProficiencies = getBackgroundProficiencies(backgroundId)

  console.log("race proficiencies:", raceProficiencies, "class proficiencies:", classProficiencies, "background proficiencies:", backgroundProficiencies)

  const allAutomatic = [
    ...raceProficiencies.automaticProficiencies,
    ...classProficiencies.automaticProficiencies,
    ...backgroundProficiencies.automaticProficiencies
  ]

  // Créer une liste des compétences déjà acquises automatiquement
  const acquiredSkillIds = allAutomatic
    .filter(p => p.category === 'skill')
    .map(p => p.id)

  const acquiredLanguageIds = [
    ...allAutomatic.filter(p => p.category === 'language').map(p => p.id),
  ]

  const acquiredToolIds = allAutomatic
    .filter(p => p.category === 'tool')
    .map(p => p.id)

  // Marquer les choix déjà acquis comme indisponibles
  const allChoiceGroups = [
    ...raceProficiencies.choiceGroups.map(group => ({
      ...group,
      unavailableChoices: group.choices
        .filter(choice => {
          if (choice.category === 'skill') return acquiredSkillIds.includes(choice.id)
          if (choice.category === 'language') return acquiredLanguageIds.includes(choice.id)
          if (choice.category === 'tool') return acquiredToolIds.includes(choice.id)
          return false
        })
        .map(choice => choice.id)
    })),
    ...classProficiencies.choiceGroups.map(group => ({
      ...group,
      unavailableChoices: group.choices
        .filter(choice => {
          if (choice.category === 'skill') return acquiredSkillIds.includes(choice.id)
          if (choice.category === 'language') return acquiredLanguageIds.includes(choice.id)
          if (choice.category === 'tool') return acquiredToolIds.includes(choice.id)
          return false
        })
        .map(choice => choice.id)
    })),
    ...backgroundProficiencies.choiceGroups.map(group => ({
      ...group,
      unavailableChoices: group.choices
        .filter(choice => {
          if (choice.category === 'skill') return acquiredSkillIds.includes(choice.id)
          if (choice.category === 'language') return acquiredLanguageIds.includes(choice.id)
          if (choice.category === 'tool') return acquiredToolIds.includes(choice.id)
          return false
        })
        .map(choice => choice.id)
    }))
  ]

  return {
    automaticProficiencies: allAutomatic,
    choiceGroups: allChoiceGroups
  }
}
