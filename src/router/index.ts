import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import GMDashboard from '@/views/GMDashboard.vue'
import CharacterCreator from '@/views/CharacterCreator.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
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
    }
  ],
})

export default router
