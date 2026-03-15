import type { SRDBackground, SRDClass, SRDFeature, SRDRace, SRDSubclass } from './srd';

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
  proficiencies: {
    skills: string[];
    languages: string[];
    tools?: string[];
  };
  race: SRDRace;
  subrace?: any; // To be refined with Subrace type
  class: SRDClass;
  subclass?: any; // To be refined
  background: SRDBackground;
  features: SRDFeature[];
  allProficiencies?: {
    skills: { name: string; id: string; description: string; category: string }[];
    languages: { name: string; id: string; description: string; category: string }[];
    tools: { name: string; id: string; description: string; category: string }[];
  };
  allTraits?: {
    index: string;
    name: string;
    url: string;
    category: string;
  }[];
  specialChoices?: Record<string, string[]>;
}

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