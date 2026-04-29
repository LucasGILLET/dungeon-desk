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
        label: 'Aide combat',
        to: '/combat-cheat-sheet'
      }
    ]
  },
  {
    label: 'Outils MJ',
    links: [
      {
        label: 'Générateur PNJ',
        to: '/npc-generator'
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
    label: 'Création de PJ',
    to: '/character-creator'
  },
  {
    label: 'Aide combat',
    to: '/combat-cheat-sheet'
  },
  {
    label: 'Générateur PNJ',
    to: '/npc-generator'
  }
]