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
      path: '/character-creator',
      name: 'character-creator',
      component: CharacterCreator
    },
    {
      path: '/character/:id',
      name: 'character-viewer',
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
