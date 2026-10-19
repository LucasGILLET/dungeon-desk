import type { RouteLocationRaw } from 'vue-router'

export type NavigationLink = {
  label: string
  to: RouteLocationRaw
}

export type NavigationGroup = {
  label: string
  links: NavigationLink[]
}

export const desktopNavigationGroups: NavigationGroup[] = [
  {
    label: 'Apprendre DnD',
    links: [
      {
        label: 'Choix de classe',
        to: { path: '/documentation', query: { section: 'classes' } }
      },
      {
        label: 'Choix de race',
        to: { path: '/documentation', query: { section: 'races' } }
      },
      {
        label: 'Règles du SRD',
        to: '/rules'
      }
    ]
  },
  {
    label: 'Outils joueur',
    links: [
      {
        label: 'Création de PJ',
        to: '/character-creator'
      },
      {
        label: 'Liste des sorts',
        to: '/sorts'
      },
      {
        label: 'Aide combat',
        to: '/combat-cheat-sheet'
      }
    ]
  },
  {
    label: 'Outils MJ',
    links: [
      {
        label: 'Mes campagnes',
        to: '/gm-dashboard'
      },
      {
        label: 'Générateur PNJ',
        to: '/npc-generator'
      },
      {
        label: 'Bestiaire',
        to: '/bestiary'
      },
      {
        label: 'Objets magiques',
        to: '/magic-items'
      }
    ]
  }
]

export const mobileNavigationLinks: NavigationLink[] = [
  {
    label: 'Apprendre DnD',
    to: '/documentation'
  },
  {
    label: 'Règles du SRD',
    to: '/rules'
  },
  {
    label: 'Création de PJ',
    to: '/character-creator'
  },
  {
    label: 'Liste des sorts',
    to: '/sorts'
  },
  {
    label: 'Aide combat',
    to: '/combat-cheat-sheet'
  },
  {
    label: 'Mes campagnes',
    to: '/gm-dashboard'
  },
  {
    label: 'Générateur PNJ',
    to: '/npc-generator'
  },
  {
    label: 'Bestiaire',
    to: '/bestiary'
  },
  {
    label: 'Objets magiques',
    to: '/magic-items'
  }
]