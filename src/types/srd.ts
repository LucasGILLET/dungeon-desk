// Types pour les données SRD D&D 5e

export interface SRDRace {
  index: string
  name: string
  speed: number
  ability_bonuses: Array<{
    ability_score: {
      index: string
      name: string
      url: string
    }
    bonus: number
  }>
  alignment: string
  age: string
  size: string
  size_description: string
  languages: Array<{
    index: string
    name: string
    url: string
  }>
  language_desc: string
  traits: Array<{
    index: string
    name: string
    url: string
  }>
  subraces?: Array<{
    index: string
    name: string
    url: string
  }>
  url: string
}

export interface SRDTrait {
  index: string
  name: string
  desc: string[]
  races: Array<{
    index: string
    name: string
    url: string
  }>
  subraces: Array<{
    index: string
    name: string
    url: string
  }>
  proficiencies: Array<{
    index: string
    name: string
    url: string
  }>
  url: string
}

export interface SRDClass {
  index: string
  name: string
  hit_die: number
  proficiency_choices: Array<{
    desc: string
    choose: number
    type: string
    from: {
      option_set_type: string
      options: Array<{
        option_type: string
        item: {
          index: string
          name: string
          url: string
        }
      }>
    }
  }>
  proficiencies: Array<{
    index: string
    name: string
    url: string
  }>
  saving_throws: Array<{
    index: string
    name: string
    url: string
  }>
  starting_equipment: Array<{
    equipment: {
      index: string
      name: string
      url: string
    }
    quantity: number
  }>
  class_levels: string
  subclasses: Array<{
    index: string
    name: string
    url: string
  }>
  spellcasting?: {
    level: number
    spellcasting_ability: {
      index: string
      name: string
      url: string
    }
    info: Array<{
      name: string
      desc: string[]
    }>
  }
  url: string
}

export interface SRDSubclass {
  index: string
  name: string
  race: {
    index: string
    name: string
    url: string
  }
  desc: string
  ability_bonuses: Array<{
    ability_score: {
      index: string
      name: string
      url: string
    }
    bonus: number
  }>
  racial_traits: Array<{
    index: string
    name: string
    url: string
  }>
  url: string
}

export interface SRDBackground {
  index: string
  name: string
  starting_proficiencies: Array<{
    index: string
    name: string
    url: string
  }>
  language_options?: {
    choose: number
    type: string
    from: {
      option_set_type: string
      options: Array<{
        option_type: string
        item: {
          index: string
          name: string
          url: string
        }
      }>
    }
  }
  starting_equipment: Array<{
    equipment: {
      index: string
      name: string
      url: string
    }
    quantity: number
  }>
  feature: {
    name: string
    desc: string[]
  }
  personality_traits: {
    choose: number
    type: string
    from: {
      option_set_type: string
      options: Array<{
        option_type: string
        desc: string
      }>
    }
  }
  ideals: {
    choose: number
    type: string
    from: {
      option_set_type: string
      options: Array<{
        option_type: string
        desc: string
        alignments: Array<{
          index: string
          name: string
          url: string
        }>
      }>
    }
  }
  bonds: {
    choose: number
    type: string
    from: {
      option_set_type: string
      options: Array<{
        option_type: string
        desc: string
      }>
    }
  }
  flaws: {
    choose: number
    type: string
    from: {
      option_set_type: string
      options: Array<{
        option_type: string
        desc: string
      }>
    }
  }
  url: string
}
