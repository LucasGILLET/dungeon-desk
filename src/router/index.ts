import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@auth0/auth0-vue';
import HomeView from '@/views/HomeView.vue'
import GMDashboard from '@/views/GMDashboard.vue'
import CharacterCreator from '@/views/CharacterCreator.vue'
import NPCGenerator from '@/views/NPCGenerator.vue'
import CombatCheatSheetView from '@/views/CombatCheatSheetView.vue'
import DocumentationView from '@/views/DocumentationView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SortView from '@/views/SortView.vue'
import SortsListView from '@/views/SortsListView.vue'
import BestiaryView from '@/views/BestiaryView.vue'
import MonsterView from '@/views/MonsterView.vue'
import MagicItemsView from '@/views/MagicItemsView.vue'
import MagicItemView from '@/views/MagicItemView.vue'
import RulesView from '@/views/RulesView.vue'
import CampaignView from '@/views/CampaignView.vue'
import JoinCampaignView from '@/views/JoinCampaignView.vue'

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
      component: ProfileView
    },
    {
      path: '/sorts',
      name: 'sorts-list',
      component: SortsListView
    },
    {
      path: '/sort/:index',
      name: 'sort-view',
      component: SortView
    },
    {
      path: '/bestiaire',
      name: 'bestiary',
      component: BestiaryView
    },
    {
      path: '/bestiaire/:index',
      name: 'monster-view',
      component: MonsterView
    },
    {
      path: '/objets-magiques',
      name: 'magic-items',
      component: MagicItemsView
    },
    {
      path: '/objets-magiques/:index',
      name: 'magic-item-view',
      component: MagicItemView
    },
    {
      path: '/regles',
      name: 'rules',
      component: RulesView
    },
    {
      path: '/documentation',
      name: 'documentation',
      component: DocumentationView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/gm-dashboard',
      name: 'gm-dashboard',
      component: GMDashboard
    },
    {
      path: '/campagnes/rejoindre/:code',
      name: 'join-campaign',
      component: JoinCampaignView
    },
    {
      path: '/campagnes/:id(\d+)',
      name: 'campaign',
      component: CampaignView
    },
    {
      path: '/character-creator',
      name: 'character-creator',
      component: CharacterCreator
    },
    {
      path: '/character/:id',
      name: 'character-sheet',
      component: () => import('@/views/CharacterSheetView.vue')
    },
    {
      path: '/character/:id/edit',
      name: 'character-edit',
      component: CharacterCreator
    },
    {
      path: '/npc-generator',
      name: 'npc-generator',
      component: NPCGenerator
    },    {
      path: '/combat-cheat-sheet',
      name: 'combat-cheat-sheet',
      component: CombatCheatSheetView
    },  
  ],
})

export default router
