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

