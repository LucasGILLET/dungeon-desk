// Passage entre le personnage du créateur (objets SRD complets, pour l'affichage)
// et l'API : aperçu calculé par le back, relecture d'un personnage enregistré.
import { previewCharacter } from '@/api/generated/endpoints';
import type { SRDBackground, SRDClass, SRDRace, SRDSubclass } from '@/types/srd';
import {
  toCharacterCreateInput,
  type ChoiceAnswer,
  type Character,
  type CharacterPreview,
  type CharacterProficiency,
  type SavedCharacter,
} from '@/types/character';
import { loadBackgrounds, loadClasses, loadRaces, loadSubraces } from './dataLoader';
import { loadSubclassesForClass } from './subclasses';

// Choix affichés comme « talents » dans le récapitulatif (le reste : maîtrises, langues, équipement)
const SPECIAL_KINDS = new Set(['SUBFEATURE', 'FAVORED_ENEMY', 'FAVORED_TERRAIN', 'EXPERTISE', 'SPELL']);
const TOOL_TYPES = new Set(['ARTISAN_TOOL', 'MUSICAL_INSTRUMENT', 'GAMING_SET', 'VEHICLE', 'OTHER']);

export async function fetchPreview(character: Character, choices: ChoiceAnswer[] = character.choices ?? []): Promise<CharacterPreview> {
  const response = await previewCharacter(toCharacterCreateInput({ ...character, choices }), { lang: 'fr' });
  return response.data as unknown as CharacterPreview;
}

// "Compétence : Arcanes" → "Arcanes"
const shortName = (name: string) => name.replace(/^[^:]+ : /, '');
const asProficiency = (p: { index: string; name: string }, category: string): CharacterProficiency => ({
  id: p.index, name: shortName(p.name), description: '', category,
});

// Recopie dans le personnage ce que l'aperçu calcule : maîtrises et langues
// complètes, choix spéciaux lisibles, équipement de départ
export function applyPreview(character: Character, preview: CharacterPreview, choices: ChoiceAnswer[] = character.choices ?? []) {
  const sheet = preview.sheet;
  if (sheet) {
    character.proficiencies = {
      skills: sheet.proficiencies.filter((p) => p.type === 'SKILL').map((p) => asProficiency(p, 'skill')),
      tools: sheet.proficiencies.filter((p) => TOOL_TYPES.has(p.type)).map((p) => asProficiency(p, 'tool')),
      languages: sheet.languages.map((l) => asProficiency(l, 'language')),
    };
  }

  const special: Record<string, string[]> = {};
  for (const choice of preview.choices) {
    const answers = choices.filter((a) => a.choiceId === choice.id);
    if (!answers.length) continue;
    if (choice.kind === 'ABILITY_SCORE_INCREASE') {
      special.halfElfAbilities = answers
        .map((a) => choice.options.find((o) => o.id === a.optionId)?.items[0]?.index)
        .filter((v): v is string => !!v);
      continue;
    }
    if (!SPECIAL_KINDS.has(choice.kind)) continue;
    const labels = answers.map((a) => choice.options.find((o) => o.id === a.optionId)?.label
      ?? choice.pool?.candidates.find((c) => c.index === (a.language ?? a.equipment))?.name
      ?? '?');
    const key = choice.source.name ?? choice.description;
    special[key] = [...(special[key] ?? []), ...labels];
  }
  character.specialChoices = special;
  character.startingEquipment = preview.startingEquipment;
}

// Personnage enregistré → personnage du créateur (objets SRD rechargés par index)
export async function fromSavedCharacter(saved: SavedCharacter): Promise<Character> {
  const [races, subraces, classes, backgrounds] = await Promise.all([loadRaces(), loadSubraces(), loadClasses(), loadBackgrounds()]);
  const first = saved.classes[0];
  const subclass = first?.subclass ? (await loadSubclassesForClass(first.class)).find((s) => s.index === first.subclass) ?? null : null;
  const character: Character = {
    id: saved.id,
    saved,
    name: saved.name,
    level: saved.sheet?.level ?? first?.levels.length ?? 1,
    race: races.find((r) => r.index === saved.race) ?? ({ index: saved.race, name: saved.names.race ?? saved.race } as SRDRace),
    subrace: (subraces.find((s) => s.index === saved.subrace) as SRDSubclass | undefined) ?? null,
    class: classes.find((c) => c.index === first?.class) ?? ({ index: first?.class, name: saved.names.classes[0]?.class } as SRDClass),
    subclass,
    background: backgrounds.find((b) => b.index === saved.background) ?? ({ index: saved.background, name: saved.names.background } as SRDBackground),
    abilities: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8, ...saved.abilityScores },
    abilityMethod: saved.abilityMethod,
    proficiencies: { skills: [], languages: [], tools: [] },
    choices: (saved.choices ?? []).map((c) => ({ choiceId: c.choiceId, optionId: c.optionId, language: c.language, equipment: c.equipment })),
    features: [],
    allTraits: [],
  };
  return character;
}
