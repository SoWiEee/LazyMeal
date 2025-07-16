import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SelectView from '../views/SelectView.vue'
import WatchlistView from '../views/WatchlistView.vue'


const routes = [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/select',
      name: 'select',
      component: SelectView
    },
    {
      path: '/watchlist',
      name: 'watchlist',
      component: WatchlistView
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

export default router;