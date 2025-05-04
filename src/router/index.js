import { createRouter, createWebHistory } from 'vue-router'
import ProductList from '../views/ProductList.vue'
import Panier from '../views/Panier.vue'
import Dashboard from '../views/Dashboard.vue'


const routes = 
[
  { path: '/', name: 'ProductList', component: ProductList },
  { path: '/panier', name: 'Panier', component: Panier },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },



]

const router = createRouter({
    history: createWebHistory(),
    routes,
  })
  
export default router