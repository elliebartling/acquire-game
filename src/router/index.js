import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/rules',
      name: 'rules',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/Auth.vue')
    },
    {
      path: '/player/:id',
      name: 'player',
      component: () => import('../views/ProfileView.vue')
    },
    {
      path: '/game/:id',
      name: 'game',
      component: () => import('../views/GameView.vue')
    },
    {
      path: '/devtest',
      name: 'devtest',
      component: () => import('../views/FunctionsInvoker.vue')
    },

  ]
})

export default router
