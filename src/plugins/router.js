// src/plugins/router.js

import { createRouter, createWebHistory } from 'vue-router'
import generatedRoutes from 'virtual:generated-pages'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: generatedRoutes,
})

export default router