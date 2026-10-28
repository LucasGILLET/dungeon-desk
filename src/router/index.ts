import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { applyPageMeta, setRouteMeta, type PageMeta } from '@/utils/pageMeta'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    description?: string
    noindex?: boolean
    // Paramètres qui changent le contenu (?section= des règles) : gardés dans
    // l'adresse canonique ; les autres (filtres des listes) en sont retirés
    canonicalQuery?: string[]
  }
}

// Pages chargées à la demande (une par fichier JS), sauf l'accueil

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Always scroll to top on navigation (including query changes)
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      meta: { description: 'Créez et gérez vos personnages D&D 5e, consultez sorts, monstres et objets magiques, et menez vos campagnes avec les outils du MJ.' },
      component: HomeView
    },
    {
      path: '/profile',
      name: 'profile',
      meta: { title: 'Mon profil', noindex: true },
      component: () => import('@/views/ProfileView.vue')
    },
    {
      path: '/sorts',
      name: 'sorts-list',
      meta: { title: 'Sorts de D&D 5e', description: 'Tous les sorts de D&D 5e en français : recherche par nom, niveau, école et classe, avec description complète.' },
      component: () => import('@/views/SortsListView.vue')
    },
    {
      path: '/sort/:index',
      name: 'sort-view',
      meta: { title: 'Sort' },
      component: () => import('@/views/SortView.vue')
    },
    {
      path: '/bestiary',
      name: 'bestiary',
      meta: { title: 'Bestiaire D&D 5e', description: 'Le bestiaire de D&D 5e en français : statistiques, actions et facteur de puissance de chaque monstre.' },
      component: () => import('@/views/BestiaryView.vue')
    },
    {
      path: '/bestiary/:index',
      name: 'monster-view',
      meta: { title: 'Monstre' },
      component: () => import('@/views/MonsterView.vue')
    },
    // Monstres maison (connecté) : fiche, création (copie d'un monstre du SRD avec ?from=), modification
    {
      path: '/my-monsters/new',
      name: 'homebrew-monster-new',
      meta: { title: 'Nouveau monstre', noindex: true },
      component: () => import('@/views/MonsterFormView.vue')
    },
    {
      path: '/my-monsters/:index',
      name: 'homebrew-monster',
      meta: { title: 'Monstre maison', noindex: true },
      component: () => import('@/views/MonsterView.vue')
    },
    {
      path: '/my-monsters/:index/edit',
      name: 'homebrew-monster-edit',
      meta: { title: 'Modifier le monstre', noindex: true },
      component: () => import('@/views/MonsterFormView.vue')
    },
    {
      path: '/magic-items',
      name: 'magic-items',
      meta: { title: 'Objets magiques D&D 5e', description: 'Les objets magiques de D&D 5e en français : rareté, lien et description de chaque objet.' },
      component: () => import('@/views/MagicItemsView.vue')
    },
    {
      path: '/magic-items/:index',
      name: 'magic-item-view',
      meta: { title: 'Objet magique' },
      component: () => import('@/views/MagicItemView.vue')
    },
    {
      path: '/rules',
      name: 'rules',
      meta: { canonicalQuery: ['section'], title: 'Règles de D&D 5e', description: 'Les règles de D&D 5e en français : combat, magie, aventure, états et conditions.' },
      component: () => import('@/views/RulesView.vue')
    },
    // Anciennes adresses en français, gardées pour les liens déjà partagés
    { path: '/bestiaire/:index?', redirect: (to) => (to.params.index ? `/bestiary/${to.params.index}` : '/bestiary') },
    { path: '/objets-magiques/:index?', redirect: (to) => (to.params.index ? `/magic-items/${to.params.index}` : '/magic-items') },
    { path: '/regles', redirect: (to) => ({ path: '/rules', query: to.query }) },
    { path: '/campagnes/rejoindre/:code', redirect: (to) => `/campaigns/join/${to.params.code}` },
    { path: '/campagnes/:id', redirect: (to) => ({ path: `/campaigns/${to.params.id}`, query: to.query }) },
    {
      path: '/documentation',
      name: 'documentation',
      meta: { canonicalQuery: ['section'], title: 'Guide de Dungeon Desk', description: "Comment utiliser Dungeon Desk : création de personnage, fiche, campagnes et outils du MJ." },
      component: () => import('@/views/DocumentationView.vue')
    },
    {
      path: '/login',
      name: 'login',
      meta: { title: 'Connexion', noindex: true },
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      meta: { title: 'Inscription', noindex: true },
      component: () => import('@/views/RegisterView.vue')
    },
    {
      path: '/gm-dashboard',
      name: 'gm-dashboard',
      meta: { title: 'Tableau du MJ', noindex: true },
      component: () => import('@/views/GMDashboard.vue')
    },
    {
      path: '/campaigns/join/:code',
      name: 'join-campaign',
      meta: { title: 'Rejoindre une campagne', noindex: true },
      component: () => import('@/views/JoinCampaignView.vue')
    },
    {
      // \\d dans la chaîne : « \d » seul y deviendrait « d » (aucun id ne correspondrait)
      path: '/campaigns/:id(\\d+)',
      name: 'campaign',
      meta: { title: 'Campagne', noindex: true },
      component: () => import('@/views/CampaignView.vue')
    },
    {
      // Gestionnaire de combat du MJ
      path: '/campaigns/:id(\\d+)/combats/:combatId(\\d+)',
      name: 'combat-tracker',
      meta: { title: 'Combat', noindex: true },
      component: () => import('@/views/CombatTrackerView.vue')
    },
    {
      // Fiche de personnage partagée par son propriétaire (sans connexion)
      path: '/shared/:code',
      name: 'shared-character',
      meta: { title: 'Personnage partagé', noindex: true },
      component: () => import('@/views/SharedCharacterView.vue')
    },
    {
      // Vue des joueurs d'un combat (lien partagé par le MJ, sans connexion)
      path: '/combat/:code',
      name: 'combat-view',
      meta: { title: 'Combat en cours', noindex: true },
      component: () => import('@/views/CombatPlayerView.vue')
    },
    {
      path: '/character-creator',
      name: 'character-creator',
      meta: { title: 'Créateur de personnage D&D 5e', description: 'Créez votre personnage D&D 5e pas à pas : race, classe, historique, caractéristiques et choix, avec la fiche prête à jouer et son PDF.' },
      component: () => import('@/views/CharacterCreator.vue')
    },
    {
      path: '/character/:id',
      name: 'character-sheet',
      meta: { title: 'Fiche de personnage', noindex: true },
      component: () => import('@/views/CharacterSheetView.vue')
    },
    {
      path: '/character/:id/edit',
      name: 'character-edit',
      meta: { title: 'Modifier le personnage', noindex: true },
      component: () => import('@/views/CharacterCreator.vue')
    },
    {
      path: '/npc-generator',
      name: 'npc-generator',
      meta: { title: 'Générateur de PNJ', description: 'Générez des PNJ pour vos parties de D&D 5e : race, apparence, personnalité et accroches.' },
      component: () => import('@/views/NPCGenerator.vue')
    },
    {
      path: '/combat-cheat-sheet',
      name: 'combat-cheat-sheet',
      meta: { title: 'Aide-mémoire du combat', description: "L'aide-mémoire du combat de D&D 5e : actions, actions bonus, réactions et déplacements." },
      component: () => import('@/views/CombatCheatSheetView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      meta: { title: 'Page introuvable', noindex: true },
      component: () => import('@/views/NotFoundView.vue')
    },
  ],
})

// Titre de l'onglet, description et indexation de la page (précisés ensuite
// par les pages de détail : nom du sort, du monstre…)
router.afterEach((to) => {
  const meta: PageMeta = { title: to.meta.title, description: to.meta.description, noindex: to.meta.noindex }
  const query = new URLSearchParams()
  for (const key of to.meta.canonicalQuery ?? []) {
    if (typeof to.query[key] === 'string') query.set(key, to.query[key])
  }
  const qs = query.toString()
  const path = qs ? `${to.path}?${qs}` : to.path
  setRouteMeta(meta, path)
  applyPageMeta(meta, path)
})

export default router
