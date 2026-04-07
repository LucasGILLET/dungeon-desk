import type { SRDBackground, SRDClass, SRDFeature, SRDRace, SRDSubclass } from './srd';
import type { Subrace } from '@/utils/subrace';
import type { Character as ApiCharacter } from '@/api/generated/model/character';
import type { CharacterCreateInput } from '@/api/generated/model/characterCreateInput';
import type { CharacterData } from '@/api/generated/model/characterData';

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

// The JSON data structure stored in the database
// Mirrors the Zod schema on the backend
export interface CharacterSheet {
  abilities: AbilityScores;
  vision?: string;
  proficiencies: CharacterProficiencies;
  race: SRDRace;
  subrace?: SRDSubclass | Subrace | null;
  class: SRDClass;
  subclass?: SRDSubclass | null;
  background: SRDBackground;
  features: SRDFeature[];
  allTraits?: {
    index: string;
    name: string;
    url: string;
    category: string;
  }[];
  specialChoices?: Record<string, string[]>;
}

export type ApiCharacterModel = ApiCharacter;

// The full Character model used in the application state (UI)
// This interface is FLATTENED for ease of use in Vue components
export interface Character extends CharacterSheet {
  id?: number;
  name: string;
  level: number;
  userId?: number;
  createdAt?: string | Date; // Date from DB
  updatedAt?: string | Date;
}

export const mapApiCharacterToCharacter = (apiCharacter: ApiCharacterModel): Character => {
  const { name: _name, level: _level, ...rest } = (apiCharacter.data ?? {}) as Record<string, unknown>;

  return {
    ...(rest as Partial<Character>),
    id: apiCharacter.id,
    userId: apiCharacter.userId,
    name: apiCharacter.name,
    level: apiCharacter.level,
    createdAt: apiCharacter.createdAt,
    updatedAt: apiCharacter.updatedAt,
  } as Character;
};

export const toCharacterCreateInput = (character: Character): CharacterCreateInput => ({
  name: character.name,
  level: character.level,
  data: character as unknown as CharacterData,
});