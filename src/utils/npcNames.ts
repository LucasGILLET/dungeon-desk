// Noms de PNJ générés à partir des sonorités de chaque peuple (pas de liste de
// noms) : un début, des voyelles et des consonnes de liaison, une terminaison
// selon le genre. Chaque peuple a aussi sa forme de nom : clan des nains, clan
// avant le nom chez les drakéides, pas de nom de famille chez les demi-orcs…
type Random = () => number
type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY'

interface Phonology {
  starts: string[]
  vowels: string[]
  middles: string[]
  // Terminaisons par genre ; une seule liste pour un nom de famille
  endings: string[] | { MALE: string[]; FEMALE: string[] }
  // Nombre de voyelles avant la terminaison
  syllables: [number, number]
  length: [number, number]
  // Consonnes à la suite au plus (les noms draconiques en enchaînent beaucoup)
  maxConsonants?: number
}

export interface NpcName {
  firstName: string
  lastName: string
  // Nom complet dans la forme du peuple (« Thorek du clan Brisefer »)
  fullName: string
}

const pick = <T>(items: readonly T[], random: Random): T => items[Math.floor(random() * items.length)]!
const between = ([min, max]: [number, number], random: Random) => min + Math.floor(random() * (max - min + 1))
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const chance = (p: number, random: Random) => random() < p

const VOWELS = /[aeiouyàâäéèêëîïôöûüœ]/
const BAD = /merd|pute|nazi|bite|chi(?:e|é)|cul$|^con$|^cocu/

function valid(name: string, ph: Phonology): boolean {
  const consonantRun = new RegExp(`[^aeiouyàâäéèêëîïôöûüœ]{${(ph.maxConsonants ?? 2) + 1}}`)
  return name.length >= ph.length[0] && name.length <= ph.length[1]
    && !/(.)\1\1/.test(name) // trois lettres identiques
    && !/(..+)\1/.test(name) // syllabe répétée (« lala »)
    && !/([aeiouy])\1/.test(name.replace(/ee$/, '')) // voyelle doublée, sauf « -ee » final
    && !consonantRun.test(name)
    && !/gu[aou]/.test(name) // « gu » seulement devant e ou i
    && !BAD.test(name)
}

function word(ph: Phonology, gender: Gender, random: Random): string {
  const endings = Array.isArray(ph.endings)
    ? ph.endings
    : gender === 'NON_BINARY' ? pick([ph.endings.MALE, ph.endings.FEMALE], random) : ph.endings[gender]
  let name = ''
  for (let attempt = 0; attempt < 30; attempt++) {
    name = pick(ph.starts, random) + pick(ph.vowels, random)
    for (let i = 1; i < between(ph.syllables, random); i++) name += pick(ph.middles, random) + pick(ph.vowels, random)
    const ending = pick(endings, random)
    // Terminaison qui commence par une voyelle : elle remplace la dernière voyelle
    // (le « u » de « qu » reste)
    if (VOWELS.test(ending.charAt(0))) name = name.replace(/(q?)[aeiouyàâäéèêëîïôöûüœ]+$/, (_, q: string) => (q ? 'qu' : ''))
    name += ending
    if (valid(name, ph)) break
  }
  return capitalize(name)
}

// --- Sonorités de chaque peuple -----------------------------------------------------

const HUMAN: Phonology = {
  starts: ['b', 'br', 'ch', 'd', 'g', 'gu', 'h', 'j', 'l', 'm', 'r', 's', 't', 'th', 'v', 'al', 'am', 'ar', 'ed', 'el', 'er', 'fr', 'gr', 'p', 'cl', 'bl'],
  vowels: ['a', 'a', 'e', 'e', 'i', 'o', 'ou'],
  middles: ['b', 'd', 'g', 'l', 'll', 'm', 'n', 'r', 'rn', 'rd', 's', 'ss', 't', 'v', 'rt', 'nd', 'c', 'gu'],
  endings: {
    MALE: ['ard', 'bert', 'ric', 'mond', 'aud', 'in', 'an', 'ier', 'ert', 'on', 'ulf', 'as', 'ien', 'ald', 'oul', 'ain', 'aume', 'elin'],
    FEMALE: ['e', 'ine', 'elle', 'ilde', 'ise', 'ette', 'aude', 'ence', 'ane', 'ie', 'iane', 'onde', 'arde', 'ée', 'eline', 'ianne', 'ille'],
  },
  syllables: [1, 2],
  length: [3, 9],
}

const HUMAN_FAMILY: Phonology = {
  ...HUMAN,
  endings: ['ac', 'ard', 'court', 'mont', 'ville', 'ier', 'on', 'ault', 'eau', 'in', 'et', 'and', 'ois', 'ière', 'ay', 'oux', 'enet', 'aine', 'ot', 'aux', 'euil', 'ange'],
  syllables: [1, 2],
  length: [4, 10],
}

const ELF: Phonology = {
  starts: ['', '', 'th', 'l', 's', 'f', 'v', 'g', 'c', 'n', 'm', 'r', 'h', 'ph', 'sh', 'gl', 'el', 'aer', 'gal', 'sil', 'ar', 'il', 'and'],
  vowels: ['a', 'a', 'e', 'e', 'i', 'i', 'ae', 'ia', 'ie', 'y', 'ea', 'o', 'ë'],
  middles: ['l', 'll', 'r', 'n', 'nn', 'th', 's', 'v', 'd', 'dr', 'nd', 'lv', 'rh', 'ss', 'ph', 'lth', 'rn', 'm'],
  endings: {
    MALE: ['ion', 'or', 'ath', 'an', 'ar', 'ir', 'is', 'il', 'orn', 'as', 'en', 'ias', 'ael', 'ond', 'eth', 'uil', 'imar'],
    FEMALE: ['iel', 'a', 'ara', 'wyn', 'ith', 'ae', 'ielle', 'ia', 'ira', 'yth', 'ana', 'eth', 'ea', 'is', 'ëa', 'aia', 'alia', 'ienne'],
  },
  syllables: [1, 3],
  length: [4, 11],
}

const ELF_FAMILY: Phonology = {
  ...ELF,
  starts: ['am', 'gal', 'hol', 'li', 'mel', 'nai', 'sian', 'il', 'xil', 'al', 'ev', 'ys', 'aes', 'cael', 'ere', 'fen', 'ilph', 'ol', 'tha'],
  endings: ['iir', 'odel', 'ion', 'ient', 'amne', 'orn', 'ael', 'anis', 'ithil', 'elor', 'ari', 'alei', 'avel', 'issar', 'uin', 'yndor', 'enna'],
  syllables: [1, 2],
  length: [5, 12],
}

const DWARF: Phonology = {
  starts: ['b', 'br', 'd', 'dr', 'g', 'gr', 'k', 'kh', 't', 'th', 'tr', 'r', 'h', 'm', 'v', 'o', 'e', 'bal', 'dun', 'thor', 'har', 'mor', 'ror', 'gim', 'dol', 'bru', 'fl', 'n'],
  vowels: ['a', 'a', 'o', 'o', 'u', 'i', 'e'],
  middles: ['d', 'g', 'k', 'r', 'rd', 'rg', 'rk', 'rn', 'l', 'm', 'n', 'nd', 'nk', 'th', 'gr', 'br', 'dr', 'st', 'v', 'z'],
  endings: {
    MALE: ['in', 'ar', 'ik', 'or', 'ur', 'grim', 'dur', 'rik', 'ain', 'ek', 'olf', 'ak', 'um', 'orn', 'gar', 'dal', 'ost', 'imm'],
    FEMALE: ['a', 'ra', 'hild', 'dis', 'ryn', 'wynn', 'i', 'ina', 'eth', 'ia', 'unn', 'da', 'ga', 'gret', 'dra', 'ild', 'rra', 'ika'],
  },
  syllables: [1, 1],
  length: [3, 8],
}

const DWARF_CLAN: Phonology = {
  ...DWARF,
  endings: ['ack', 'unn', 'ek', 'ar', 'um', 'gar', 'ir', 'dek', 'rak', 'orr', 'ith', 'ul'],
  syllables: [1, 2],
  length: [5, 10],
  maxConsonants: 3,
}

const HALFLING: Phonology = {
  starts: ['b', 'c', 'd', 'f', 'g', 'l', 'm', 'n', 'p', 'r', 't', 'w', 'al', 'an', 'el', 'os', 'mer', 'pip', 'rob', 'sam', 'lob', 'tob', 'ros', 'cor'],
  vowels: ['a', 'e', 'i', 'o', 'o', 'y', 'i', 'u'],
  middles: ['b', 'bb', 'd', 'l', 'll', 'm', 'n', 'nd', 'p', 'pp', 'r', 'rr', 's', 't', 'tt', 'v', 'lr'],
  endings: {
    MALE: ['o', 'in', 'ric', 'wick', 'by', 'an', 'en', 'ert', 'ry', 'ias', 'ond', 'ard', 'oc', 'ole', 'ac'],
    FEMALE: ['ie', 'a', 'ette', 'ly', 'ine', 'ée', 'elle', 'ia', 'y', 'ina', 'ise', 'enne', 'otte', 'ella'],
  },
  syllables: [1, 2],
  length: [3, 8],
}

const ORC: Phonology = {
  starts: ['b', 'd', 'g', 'gr', 'h', 'k', 'kr', 'm', 'n', 'r', 'sh', 'th', 'v', 'z', 'dr', 'br', 'u', 'o', 'gh', 'th', 'y'],
  vowels: ['a', 'a', 'u', 'u', 'o', 'e', 'i'],
  middles: ['g', 'gg', 'k', 'kk', 'r', 'rg', 'rk', 'sh', 'z', 'zg', 'th', 'm', 'n', 'd', 'b', 'gr', 'rz'],
  endings: {
    MALE: ['ak', 'ug', 'ash', 'uk', 'ar', 'ush', 'ok', 'og', 'az', 'rak', 'gar', 'ek', 'ruk', 'im', 'osh', 'aak', 'urg'],
    FEMALE: ['a', 'ga', 'ka', 'ra', 'sha', 'etta', 'ee', 'ika', 'za', 'rha', 'ula', 'ova', 'ette', 'ah', 'gra', 'tha'],
  },
  syllables: [1, 2],
  length: [3, 8],
}

const DRAGONBORN: Phonology = {
  starts: ['a', 'b', 'd', 'g', 'h', 'j', 'k', 'kr', 'm', 'n', 'p', 'r', 's', 'sh', 't', 'th', 'v', 'dh', 'gh', 'f', 'z'],
  vowels: ['a', 'a', 'e', 'i', 'o', 'u', 'y', 'ae'],
  middles: ['d', 'dr', 'j', 'jh', 'k', 'l', 'ld', 'm', 'n', 'r', 'rh', 's', 'sh', 'sk', 'th', 'v', 'x', 'z', 'ks', 'zh', 'rj'],
  endings: {
    MALE: ['an', 'ar', 'ash', 'asar', 'esh', 'ix', 'or', 'in', 'ed', 'ek', 'iss', 'on', 'ath', 'kas', 'iv', 'oth', 'ekar'],
    FEMALE: ['a', 'i', 'ra', 'ka', 'ya', 'eh', 'ith', 'ana', 'ena', 'ira', 'ys', 'ara', 'ideh', 'inn', 'ala'],
  },
  syllables: [1, 2],
  length: [3, 9],
  maxConsonants: 3,
}

const DRAGONBORN_CLAN: Phonology = {
  starts: ['cl', 'd', 'dh', 'k', 'kr', 'm', 'n', 'ph', 'sh', 'st', 'th', 'x', 'y', 'im', 'ch', 's', 'v', 'k', 'tr'],
  vowels: ['a', 'e', 'i', 'o', 'y', 'ae', 'ia', 'ei', 'e', 'i'],
  middles: ['nth', 'sh', 'th', 'll', 'rr', 'lth', 'kth', 'rkm', 'shk', 'xt', 'nd', 'ndr', 'sth', 'rgh', 'ldr', 'mb', 'm', 'r', 'n', 'k', 'l', 'd', 'z', 'sk', 'rh', 'pesh', 'lm'],
  endings: ['ion', 'ar', 'ior', 'iallor', 'ik', 'ev', 'ith', 'yst', 'uul', 'it', 'ilon', 'ysh', 'is', 'or', 'os', 'ath', 'eth', 'ilik', 'onis', 'ien'],
  syllables: [3, 4],
  length: [9, 17],
  maxConsonants: 4,
}

const GNOME: Phonology = {
  starts: ['b', 'bl', 'd', 'f', 'fr', 'g', 'gl', 'j', 'k', 'm', 'n', 'p', 'r', 's', 't', 'w', 'z', 'al', 'el', 'or', 'ob', 'qu', 'wr'],
  vowels: ['a', 'e', 'i', 'o', 'u', 'i', 'o', 'y'],
  middles: ['b', 'bb', 'd', 'dd', 'g', 'k', 'l', 'll', 'm', 'mb', 'mp', 'n', 'nk', 'nd', 'p', 'pp', 'rn', 's', 't', 'tt', 'v', 'z', 'zz', 'ck', 'mbl', 'ngl'],
  endings: {
    MALE: ['ock', 'in', 'ble', 'ink', 'en', 'ick', 'on', 'iver', 'umble', 'orn', 'ap', 'obb', 'us', 'ix', 'wick', 'ens'],
    FEMALE: ['a', 'ina', 'ella', 'wyn', 'ie', 'ni', 'ilda', 'ette', 'ipa', 'ippa', 'yn', 'ana', 'oxy', 'ee', 'ottin', 'imbe'],
  },
  syllables: [1, 3],
  length: [3, 10],
  maxConsonants: 3,
}

const GNOME_CLAN: Phonology = {
  ...GNOME,
  endings: ['er', 'en', 'gel', 'kor', 'ick', 'kle', 'nig', 'nor', 'pen', 'ers', 'ble', 'nik', 'dle', 'gern', 'ckle'],
  syllables: [1, 2],
  length: [4, 10],
}

const INFERNAL: Phonology = {
  starts: ['a', 'ak', 'am', 'b', 'd', 'e', 'i', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 'sk', 't', 'th', 'x', 'z', 'kr', 'ph', 'val', 'mor', 'mel', 'br', 'cr'],
  vowels: ['a', 'e', 'i', 'o', 'a', 'ai', 'ae', 'eu', 'y'],
  middles: ['k', 'kh', 'l', 'm', 'n', 'r', 's', 'st', 'th', 'x', 'z', 'ph', 'd', 'ch', 'sh', 'nt', 'rm', 'lk', 'mn'],
  endings: {
    MALE: ['os', 'on', 'ai', 'ech', 'is', 'as', 'eos', 'ion', 'us', 'oth', 'akos', 'emon', 'ius', 'ar', 'iel'],
    FEMALE: ['ia', 'a', 'is', 'eis', 'ella', 'ara', 'ina', 'ys', 'iah', 'ira', 'ena', 'ise', 'aia', 'ith', 'akis'],
  },
  syllables: [1, 2],
  length: [3, 9],
}

// --- Noms composés (sens en français) ------------------------------------------------

// Clan nain : « Brisefer », « Poing-d'Acier », ou un nom en nain (« Torunn »)
const DWARF_CLAN_VERBS = ['Brise', 'Forge', 'Fend', 'Taille', 'Frappe', 'Garde', 'Bat', 'Casse', 'Tranche', 'Pique', 'Fond', 'Creuse', 'Sculpte']
const DWARF_CLAN_NOUNS = ['fer', 'pierre', 'roc', 'enclume', 'bouclier', 'hache', 'granit', 'mine', 'barbe', 'braise', 'acier', 'troll', 'gobelin', 'montagne', 'orage', 'gemme', 'marteau', 'feu', 'givre', 'bronze', 'cuivre', 'tonnerre', 'crâne', 'filon']
const DWARF_CLAN_BODY = ['Poing', 'Barbe', 'Cœur', 'Bras', 'Œil', 'Front', 'Main', 'Échine', 'Tête']
const DWARF_CLAN_MATTER = ['Fer', 'Granit', 'Pierre', 'Bronze', 'Acier', 'Braise', 'Mithral', 'Roc', 'Cuivre', 'Givre', 'Enclume', 'Or', 'Obsidienne']

// « de » ou « d' » devant une voyelle
const of = (word: string) => (/^[aeiouyéèêâîôœh]/i.test(word) ? `d'${word}` : `de ${word}`)

function dwarfClan(random: Random) {
  const roll = random()
  if (roll < 0.45) return pick(DWARF_CLAN_VERBS, random) + pick(DWARF_CLAN_NOUNS, random)
  if (roll < 0.75) return `${pick(DWARF_CLAN_BODY, random)}-${of(pick(DWARF_CLAN_MATTER, random)).replace(' ', '-')}`
  return word(DWARF_CLAN, 'MALE', random)
}

// Nom de famille halfelin : « Cueillenoisette », « Roulegalet »
const HALFLING_FAMILY_START = ['Bon', 'Vert', 'Haut', 'Sous', 'Cueille', 'Roule', 'Pique', 'Douce', 'Belle', 'Tourne', 'Mange', 'Chante', 'Sauté', 'Grand']
const HALFLING_FAMILY_END = ['baril', 'bouteille', 'colline', 'feuille', 'pomme', 'noisette', 'buisson', 'galet', 'brindille', 'tonneau', 'théière', 'miel', 'fougère', 'chardon', 'prune', 'racine', 'tarte', 'sentier', 'ruisseau', 'haie', 'trèfle', 'bruyère']

// Surnom de gnome : « Siffle-Rouage »
const GNOME_NICK_VERBS = ['Tourne', 'Serre', 'Siffle', 'Grince', 'Rafistole', 'Bricole', 'Ronge', 'Fouine', 'Gratte', 'Souffle', 'Démonte', 'Cogne']
const GNOME_NICK_NOUNS = ['Boulon', 'Rouage', 'Chaudron', 'Ressort', 'Engrenage', 'Étincelle', 'Marmite', 'Pignon', 'Écrou', 'Champignon', 'Grimoire', 'Soufflet', 'Pétard']

// Nom de vertu que se choisissent certains tieffelins
const TIEFLING_VIRTUES = ['Espoir', 'Chant', 'Gloire', 'Ferveur', 'Tourment', 'Désespoir', 'Crainte', 'Quête', 'Ruine', 'Silence', 'Merci', 'Errance', 'Fable', 'Aube', 'Cendre', 'Sacrifice', 'Destin', 'Révérence', 'Pénitence', 'Murmure', 'Patience', 'Audace']

function humanFamily(random: Random) {
  const name = word(HUMAN_FAMILY, 'MALE', random)
  // Une famille noble sur cinq : « de Valcourt », « d'Aubemont »
  return chance(0.2, random) ? of(name) : name
}

// --- Forme du nom de chaque peuple -----------------------------------------------------

const join = (...parts: string[]) => parts.filter(Boolean).join(' ')
const named = (firstName: string, lastName: string, fullName = join(firstName, lastName)): NpcName => ({ firstName, lastName, fullName })

function human(gender: Gender, random: Random) {
  return named(word(HUMAN, gender, random), humanFamily(random))
}

const FORMS: Record<string, (gender: Gender, random: Random) => NpcName> = {
  human,
  elf: (gender, random) => named(word(ELF, gender, random), word(ELF_FAMILY, gender, random)),
  'half-elf': (gender, random) => named(
    word(chance(0.5, random) ? ELF : HUMAN, gender, random),
    chance(0.5, random) ? word(ELF_FAMILY, gender, random) : humanFamily(random),
  ),
  dwarf: (gender, random) => {
    const first = word(DWARF, gender, random)
    const clan = dwarfClan(random)
    return named(first, clan, `${first} du clan ${clan}`)
  },
  halfling: (gender, random) => named(word(HALFLING, gender, random), pick(HALFLING_FAMILY_START, random) + pick(HALFLING_FAMILY_END, random)),
  // Pas de nom de famille chez les orcs ; élevé parmi les humains, un nom humain
  'half-orc': (gender, random) => (chance(0.2, random) ? human(gender, random) : named(word(ORC, gender, random), '')),
  // Le clan d'abord, puis le nom
  dragonborn: (gender, random) => {
    const first = word(DRAGONBORN, gender, random)
    const clan = word(DRAGONBORN_CLAN, gender, random)
    return named(first, clan, `${clan} ${first}`)
  },
  gnome: (gender, random) => {
    const first = word(GNOME, gender, random)
    const clan = word(GNOME_CLAN, gender, random)
    if (!chance(0.4, random)) return named(first, clan)
    const verb = pick(GNOME_NICK_VERBS, random)
    // Pas « Souffle-Soufflet »
    const noun = pick(GNOME_NICK_NOUNS.filter((n) => !n.startsWith(verb.slice(0, 5))), random)
    const nickname = `${verb}-${noun}`
    return named(first, clan, `${first} ${clan}, dit « ${nickname} »`)
  },
  // Nom infernal ou nom de vertu ; le nom de famille de la ville où il a grandi, s'il en a un
  tiefling: (gender, random) => named(
    chance(0.3, random) ? pick(TIEFLING_VIRTUES, random) : word(INFERNAL, gender, random),
    chance(0.5, random) ? humanFamily(random) : '',
  ),
}

// Peuple inconnu (contenu maison) : un nom humain
export function generateNpcName(race: string, gender: Gender, random: Random = Math.random): NpcName {
  return (FORMS[race] ?? human)(gender, random)
}
