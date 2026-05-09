// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { watch }                          from 'vue'
import { currentUser, userRole, authLoading } from '@/auth/useAuth'

const routes = [
  { path: '/', redirect: '/dashboard' },

  {
    path:      '/login',
    name:      'login',
    component: () => import('@/views/LoginView.vue'),
    meta:      { requiresGuest: true },
  },

  {
    path:      '/register',
    name:      'register',
    component: () => import('@/views/RegisterView.vue'),
    meta:      { requiresGuest: true },
  },

  {
    path:      '/dashboard',
    name:      'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta:      { requiresAuth: true },
  },

  {
    path:      '/admin',
    name:      'admin',
    component: () => import('@/views/AdminView.vue'),
    meta:      { requiresAuth: true, requiresAdmin: true },
  },

  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

function waitForAuth() {
  if (!authLoading.value) return Promise.resolve()
  return new Promise((resolve) => {
    const stop = watch(authLoading, (loading) => {
      if (!loading) { stop(); resolve() }
    })
  })
}

router.beforeEach(async (to) => {
  await waitForAuth()

  const authed = !!currentUser.value
  const admin  = userRole.value === 'admin'

  if (to.meta.requiresAuth && !authed) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !admin) {
    return { name: 'dashboard' }
  }

  if (to.meta.requiresGuest && authed) {
    return { name: 'dashboard' }
  }
})

export default router
