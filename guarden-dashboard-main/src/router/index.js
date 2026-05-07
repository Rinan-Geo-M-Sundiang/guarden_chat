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

  // Catch-all → dashboard (auth guard will redirect to login if needed)
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ── Wait for Firebase Auth to emit its first state before guarding ────────────
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

  // Unauthenticated → login
  if (to.meta.requiresAuth && !authed) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Non-admin → block /admin, redirect to dashboard
  if (to.meta.requiresAdmin && !admin) {
    return { name: 'dashboard' }
  }

  // Already logged-in → skip login page
  if (to.meta.requiresGuest && authed) {
    return { name: 'dashboard' }
  }
})

export default router
