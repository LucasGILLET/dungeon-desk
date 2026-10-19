import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

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
      component: HomeView
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue')
    },
    {
      path: '/sorts',
      name: 'sorts-list',
      component: () => import('@/views/SortsListView.vue')
    },
    {
      path: '/sort/:index',
      name: 'sort-view',
      component: () => import('@/views/SortView.vue')
    },
    {
      path: '/bestiary',
      name: 'bestiary',
      component: () => import('@/views/BestiaryView.vue')
    },
    {
      path: '/bestiary/:index',
      name: 'monster-view',
      component: () => import('@/views/MonsterView.vue')
    },
    {
      path: '/magic-items',
      name: 'magic-items',
      component: () => import('@/views/MagicItemsView.vue')
    },
    {
      path: '/magic-items/:index',
      name: 'magic-item-view',
      component: () => import('@/views/MagicItemView.vue')
    },
    {
      path: '/rules',
      name: 'rules',
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
      component: () => import('@/views/DocumentationView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue')
    },
    {
      path: '/gm-dashboard',
      name: 'gm-dashboard',
      component: () => import('@/views/GMDashboard.vue')
    },
    {
      path: '/campaigns/join/:code',
      name: 'join-campaign',
      component: () => import('@/views/JoinCampaignView.vue')
    },
    {
      // \\d dans la chaîne : « \d » seul y deviendrait « d » (aucun id ne correspondrait)
      path: '/campaigns/:id(\\d+)',
      name: 'campaign',
      component: () => import('@/views/CampaignView.vue')
    },
    {
      path: '/character-creator',
      name: 'character-creator',
      component: () => import('@/views/CharacterCreator.vue')
    },
    {
      path: '/character/:id',
      name: 'character-sheet',
      component: () => import('@/views/CharacterSheetView.vue')
    },
    {
      path: '/character/:id/edit',
      name: 'character-edit',
      component: () => import('@/views/CharacterCreator.vue')
    },
    {
      path: '/npc-generator',
      name: 'npc-generator',
      component: () => import('@/views/NPCGenerator.vue')
    },    {
      path: '/combat-cheat-sheet',
      name: 'combat-cheat-sheet',
      component: () => import('@/views/CombatCheatSheetView.vue')
    },  
  ],
})

export default router
