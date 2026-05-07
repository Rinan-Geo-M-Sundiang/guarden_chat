// src/auth/useAuth.js
//
// Singleton reactive auth state shared across the entire app.
// Call initAuth() exactly once (in main.js) before mounting.
// Use useAuth() composable anywhere else.

import { ref, computed }                    from 'vue'
import { auth, db }                         from '@/firebase'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth'
import { ref as dbRef, set, get } from 'firebase/database'

// ── Singleton state (module-level, not inside function) ───────────────────────
export const currentUser = ref(null)
export const userRole    = ref(null)   // 'admin' | 'viewer' | null
export const authLoading = ref(true)

let _authReadyPromise = null

// ── One-time initializer — call in main.js ────────────────────────────────────
export function initAuth() {
  if (_authReadyPromise) return _authReadyPromise

  _authReadyPromise = new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser.value = user

        try {
          // Fetch role from RTDB
          const snap = await get(dbRef(db, `users/${user.uid}/role`))
          userRole.value = snap.exists() ? snap.val() : 'viewer'

          // Upsert profile fields (each has its own write rule in RTDB)
          const batch = [
            set(dbRef(db, `users/${user.uid}/email`),       user.email ?? ''),
            set(dbRef(db, `users/${user.uid}/displayName`), user.displayName ?? user.email ?? ''),
            set(dbRef(db, `users/${user.uid}/lastLogin`),   Date.now()),
          ]
          if (user.photoURL) {
            batch.push(set(dbRef(db, `users/${user.uid}/photoURL`), user.photoURL))
          }
          // Assign viewer role on first login (only if no role exists yet)
          if (!snap.exists()) {
            batch.push(set(dbRef(db, `users/${user.uid}/role`), 'viewer'))
          }
          await Promise.all(batch)
        } catch {
          // Role read may fail if RTDB rules deny access (shouldn't happen,
          // but fail safe to viewer so the user isn't locked out entirely)
          userRole.value = 'viewer'
        }
      } else {
        currentUser.value = null
        userRole.value    = null
      }

      authLoading.value = false
      resolve()
    })
  })

  return _authReadyPromise
}

// ── Composable — use everywhere ───────────────────────────────────────────────
export function useAuth() {
  const isAdmin  = computed(() => userRole.value === 'admin')
  const isViewer = computed(() => userRole.value === 'viewer')

  // ── Login ──────────────────────────────────────────────────────────────────
  async function loginWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function loginWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider())
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  async function logout() {
    return signOut(auth)
  }

  // ── Password reset — sends Firebase reset email ───────────────────────────
  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

  return {
    currentUser,
    userRole,
    authLoading,
    isAdmin,
    isViewer,
    loginWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
  }
}
