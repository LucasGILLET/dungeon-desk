export interface PDFCharacterData {
  name: string
  characterClass: string
  level: number
  background: string
  playerName: string
  race: string
  alignment: string
  experience: number
  
  // Ability Scores
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number

  // Saving throw proficiencies
  strengthCheck: boolean,
  dexterityCheck: boolean,
  constitutionCheck: boolean,
  intelligenceCheck: boolean,
  wisdomCheck: boolean,
  charismaCheck: boolean,

  // Skills (boolean proficiencies)
  acrobatics: boolean
  animalHandling: boolean
  arcana: boolean
  athletics: boolean
  deception: boolean
  history: boolean
  insight: boolean
  intimidation: boolean
  investigation: boolean
  medicine: boolean
  nature: boolean
  perception: boolean
  performance: boolean
  persuasion: boolean
  religion: boolean
  sleightOfHand: boolean
  stealth: boolean
  survival: boolean

  // Other stats
  armorClass: number
  initiative: number
  speed: number
  hpMax: number
  hpCurrent: number
  hitDice: string
  
  // Fluff / Narrative
  age?: string
  height?: string
  weight?: string
  eyes?: string
  skin?: string
  hair?: string
  backstory?: string
  traits?: string // Feats & Traits
  treasure?: string
  allies?: string
  imageUrl?: string // Base64 or URL
  factionName?: string
  factionSymbolUrl?: string

  attacks: {
    name: string
    bonus: string
    damage: string
  }[]
  appearance: string
  otherMasteries?: string
  equipment?: string
  pc?: number | string
  pa?: number | string
  pe?: number | string
  po?: number | string
  pp?: number | string
  featuresTraits?: string
  personalityTraits?: string
  ideals?: string
  bonds?: string
  flaws?: string
}

export const defaultPDFCharacter: PDFCharacterData = {
  name: "Aragorn",
  characterClass: "Ranger",
  level: 5,
  background: "Outlander",
  playerName: "Viggo",
  race: "Human",
  appearance: "Tall, rugged, with dark hair and a beard",
  alignment: "Neutral Good",
  experience: 0,
  strength: 18,
  dexterity: 14,
  constitution: 16,
  intelligence: 10,
  wisdom: 13,
  charisma: 12,
  strengthCheck: true,
  dexterityCheck: false,
  constitutionCheck: true,
  intelligenceCheck: false,
  wisdomCheck: false,
  charismaCheck: false,
  acrobatics: false,
  animalHandling: true,
  arcana: false,
  athletics: true,
  deception: false,
  history: false,
  insight: true,
  intimidation: false,
  investigation: false,
  medicine: false,
  nature: true,
  perception: true,
  performance: false,
  persuasion: false,
  religion: false,
  sleightOfHand: false,
  stealth: true,
  survival: true,
  armorClass: 16,
  initiative: 2,
  speed: 30,
  hpMax: 44,
  hpCurrent: 44,
  hitDice: "5d10",
  // Champs optionnels narratifs
  age: "87",
  height: "1m98",
  weight: "95kg",
  eyes: "Grey",
  skin: "Tanned",
  hair: "Dark",
  backstory: "Heir of Isildur, raised in Rivendell, leader of the Dunedain.",
  traits: "Brave, leader, tracker",
  treasure: "Anduril, Elven cloak, Ring of Barahir",
  allies: "Legolas, Gimli, Gandalf, Hobbits",
  imageUrl: "https://example.com/aragorn.png",
  factionName: "La Communauté de l'Anneau",
  factionSymbolUrl: "https://example.com/fellowship.png",
  // Attaques
  attacks: [
    { name: "Longsword", bonus: "+7", damage: "1d8+4" },
    { name: "Longbow", bonus: "+5", damage: "1d8+2" },
    { name: "Dagger", bonus: "+6", damage: "1d4+4" }
  ],
  // Champs additionnels pour le mapping PDF
  equipment: "Longsword, Longbow, Dagger, Leather armor, Backpack",
  pc: 10,
  pa: 5,
  pe: 0,
  po: 50,
  pp: 1,
  personalityTraits: "Loyal, reserved",
  ideals: "Protect the Free Peoples",
  bonds: "Sword reforged for his destiny",
  flaws: "Haunted by his ancestor's failure",
  featuresTraits: "Favored Enemy: Orcs, Natural Explorer",
  otherMasteries: "Languages : Common, Elvish"
}
