import { createRouter, createWebHistory } from 'vue-router'
import AppView from '../App.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'selector',
      component: AppView
    }
  ]
})

export default router