import type { SRDBackground, SRDClass, SRDFeature, SRDRace, SRDSubclass } from './srd';
import type { Subrace } from '@/utils/subrace';
import type { SubclassData } from '@/utils/subclasses';
import type { CharacterCreateInput } from '@/api/generated/model/characterCreateInput';
import type { CharacterCreateInputAbilityMethod } from '@/api/generated/model/characterCreateInputAbilityMethod';

export interface CharacterProficiency {
  name: string;
  id: string;
  description: string;
  category: string;
}

export interface CharacterProficiencies {
  skills: CharacterProficiency[];
  languages: CharacterProficiency[];
  tools: CharacterProficiency[];
}

// Base Ability Scores with English keys
export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

// Réponse à un choix (format de l'API) : une option, ou un élément de la réserve
export interface ChoiceAnswer {
  choiceId: number;
  optionId?: number | null;
  language?: string | null;
  equipment?: string | null;
}

// --- Aperçu calculé par le back (POST /characters/preview) --------------------

export interface PreviewChoiceItem {
  type: string;
  index: string | null;
  name: string;
  quantity: number;
  bonus: number | null;
  description: string | null;
}

export interface PreviewChoice {
  id: number;
  kind: string;
  choose: number;
  description: string;
  source: { type: string; index: string | null; name: string | null };
  parentOptionId: number | null;
  options: { id: number; label: string; items: PreviewChoiceItem[]; nestedChoiceId: number | null }[];
  pool: { type: 'ANY_LANGUAGE' | 'EQUIPMENT_CATEGORY'; category: { index: string; name: string } | null; candidates: { index: string; name: string }[] } | null;
}

export interface SheetAttack {
  kind: 'WEAPON' | 'SPELL';
  index: string;
  name: string;
  attackBonus: number | null;
  save: { dc: number; ability: string } | null;
  damage: string | null;
  versatileDamage: string | null;
  range: string | null;
  properties: string[];
  equipped: boolean;
}

export interface CharacterSheetValues {
  level: number;
  // Capacités et traits accordés par une option choisie (index) : « Tueur de colosses »
  grantedFeatures?: string[];
  grantedTraits?: string[];
  grantedTraitDetails?: { index: string; name: string; description: string }[];
  proficiencyBonus: number;
  maxHitPoints: number;
  abilityScores: Record<string, { base: number; bonus: number; total: number; modifier: number }>;
  pending: {
    subclasses: string[];
    abilityScoreImprovements: { class: string; level: number }[];
    choices: { choiceId: number; kind: string; remaining: number }[];
  };
  proficiencies: { index: string; name: string; type: string }[];
  expertise: { index: string; name: string }[];
  languages: { index: string; name: string }[];
  // Ressources (fiche et aperçu)
  hitDice?: { class: string; die: number; total: number; used: number }[];
  spellSlots?: number[]; // index 0 = sorts de niveau 1
  pactSlots?: { level: number; count: number } | null;
  spellcasting?: { class: string; ability: string; saveDC: number; attackBonus: number }[];
  armorClass?: { value: number; detail: string };
  // Armes de l'inventaire et sorts mineurs offensifs (jet d'attaque ou DD, dégâts)
  attacks?: SheetAttack[];
  featureResources?: { feature: string | null; trait: string | null; name: string; max: number; used: number; recharge: 'SHORT' | 'LONG' }[];
  // Sorts accordés sans être choisis (trait racial, sous-classe, choix) et résistances des traits
  grantedSpells?: GrantedSpell[];
  damageResistances?: { damageType: string; name: string; source: string }[];
  // Capacités, traits et sorts utilisables pendant le tour
  turnOptions?: TurnOption[];
}

export interface TurnOption {
  activation: 'ACTION' | 'BONUS_ACTION' | 'REACTION';
  source: 'FEATURE' | 'TRAIT' | 'SPELL';
  index: string;
  name: string;
  spellLevel: number | null;
}

export interface GrantedSpell {
  index: string;
  name: string;
  level: number;
  source: string; // « Ascendance infernale », « Domaine de la Vie »
  kind: 'TRAIT' | 'SUBCLASS' | 'FEATURE' | 'CHOICE';
  ability: string | null;
  saveDC: number | null;
  attackBonus: number | null;
  castAtLevel: number | null; // lancé comme un sort de ce niveau
  oncePerLongRest: boolean;
  atWill: boolean; // sans emplacement de sort
}

export interface StartingEquipment {
  items: { equipment: string | null; name: string | null; quantity: number }[];
  currencies: Record<string, number>;
}

export interface CharacterPreview {
  valid: boolean;
  errors: { path: string; message: string }[];
  sheet: CharacterSheetValues | null;
  choices: PreviewChoice[];
  startingEquipment: StartingEquipment;
}

// --- Personnage enregistré (API) ------------------------------------------------

export interface CharacterNames {
  race: string | null;
  subrace: string | null;
  background: string | null;
  classes: { class: string | null; subclass: string | null; level: number }[];
}

// GET /characters/:id : format d'échange + noms traduits + fiche calculée
export type SavedCharacter = CharacterCreateInput & {
  id: number;
  names: CharacterNames;
  sheet: CharacterSheetValues | null;
  warnings: { path: string; message: string }[];
  // GAME_MASTER : personnage d'un joueur de la campagne du MJ, en lecture seule
  access?: 'OWNER' | 'GAME_MASTER' | 'SHARED';
  // Lien de partage (propriétaire seulement) ; auteur d'une fiche partagée
  shareCode?: string | null;
  sharedBy?: string;
  createdAt: string;
  updatedAt: string;
};

// GET /characters : résumé pour les listes
export interface CharacterSummary {
  id: number;
  name: string;
  edition: string;
  race: string;
  subrace: string | null;
  classes: { class: string; subclass: string | null; level: number }[];
  level: number;
  names: CharacterNames;
  updatedAt: string;
}

// --- Personnage en cours de création (état du créateur) -------------------------

// Les objets SRD complets servent à l'affichage des étapes ; seuls leurs index
// partent vers l'API (voir toCharacterCreateInput).
export interface CharacterSheet {
  abilities: AbilityScores;
  // Achat de points, tableau standard, dés ou saisie libre
  abilityMethod?: CharacterCreateInputAbilityMethod;
  vision?: string;
  proficiencies: CharacterProficiencies;
  race: SRDRace;
  subrace?: SRDSubclass | Subrace | null;
  class: SRDClass;
  subclass?: SRDSubclass | SubclassData | null;
  background: SRDBackground;
  features: SRDFeature[];
  allTraits?: {
    index: string;
    name: string;
    url: string;
    category: string;
  }[];
  // Affichage des choix (récapitulatif, PDF), déduit de l'aperçu du back
  specialChoices?: Record<string, string[]>;
  // Réponses aux choix, envoyées à l'API
  choices?: ChoiceAnswer[];
  // Équipement de départ calculé par le back, ajouté à l'inventaire à la création
  startingEquipment?: StartingEquipment;
}

export interface Character extends CharacterSheet {
  id?: number;
  name: string;
  level: number;
  // Personnage relu depuis l'API : ce que le créateur ne modifie pas
  // (inventaire, état en partie, notes…) est conservé à la mise à jour
  saved?: SavedCharacter;
}

const index = (value: unknown): string | null => {
  const i = (value as { index?: string } | null | undefined)?.index;
  return i ? i : null;
};

// Personnage du créateur → format d'échange de l'API
export const toCharacterCreateInput = (character: Character): CharacterCreateInput => {
  const saved = character.saved;
  const classIndex = index(character.class)!;
  const subclass = index(character.subclass);
  const savedClass = saved?.classes.find((c) => c.class === classIndex);
  const isNew = !saved;

  return {
    // Ce que le créateur ne gère pas encore (inventaire, sorts, état…) vient du personnage enregistré
    ...(saved ? stripSaved(saved) : {}),
    edition: saved?.edition ?? '2014',
    name: character.name?.trim() || 'Personnage sans nom',
    race: index(character.race)!,
    subrace: index(character.subrace),
    background: index(character.background),
    abilityMethod: character.abilityMethod ?? saved?.abilityMethod ?? 'POINT_BUY',
    abilityScores: { ...character.abilities },
    classes: [{
      class: classIndex,
      subclass,
      hitDiceUsed: savedClass?.hitDiceUsed ?? 0,
      levels: savedClass?.levels ?? [{ level: 1, characterLevel: 1 }],
    }],
    choices: character.choices ?? [],
    ...(isNew && character.startingEquipment
      ? {
          items: character.startingEquipment.items.map((i) => ({ ...i, equipped: false, attuned: false })),
          currencies: character.startingEquipment.currencies,
        }
      : {}),
  };
};

// Champs de lecture seule renvoyés par l'API, à ne pas renvoyer
export function stripSaved(saved: SavedCharacter): CharacterCreateInput {
  const { id: _id, names: _names, sheet: _sheet, warnings: _warnings, access: _a, shareCode: _s, sharedBy: _b, createdAt: _c, updatedAt: _u, ...input } = saved;
  return input;
}
