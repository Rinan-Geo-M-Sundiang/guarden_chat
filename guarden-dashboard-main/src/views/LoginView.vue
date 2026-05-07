<template>
  <div class="min-h-screen bg-garden-void flex items-center justify-center p-4 relative overflow-hidden">

    <!-- Botanical background blobs -->
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full
                  bg-garden-base opacity-70 blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full
                  bg-garden-card opacity-80 blur-2xl"></div>
      <div class="absolute top-1/2 left-1/4 w-64 h-64 rounded-full
                  bg-garden-border opacity-30 blur-2xl"></div>
      <!-- Decorative leaf marks -->
      <svg class="absolute top-12 left-12 opacity-10 w-24 h-24 text-garden-live"
           viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="50" rx="20" ry="42" transform="rotate(-30 50 50)"/>
        <line x1="50" y1="10" x2="50" y2="90" stroke="white" stroke-width="2"/>
      </svg>
      <svg class="absolute bottom-16 right-16 opacity-10 w-20 h-20 text-garden-live"
           viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="50" rx="20" ry="42" transform="rotate(20 50 50)"/>
      </svg>
    </div>

    <div class="relative w-full max-w-sm">

      <!-- Logo block -->
      <div class="text-center mb-8 animate-fade-in">
        <div class="w-16 h-16 rounded-2xl bg-garden-surface border border-garden-border
                    flex items-center justify-center text-3xl mx-auto mb-4 shadow-card
                    shadow-glow-okra">
          🌱
        </div>
        <h1 class="font-display font-semibold text-4xl text-garden-text tracking-tight">
          Guarden
        </h1>
        <p class="font-mono text-[10px] text-garden-dim uppercase tracking-[0.2em] mt-1">
          Sensor Dashboard · Sign In
        </p>
      </div>

      <!-- Card -->
      <div class="bg-garden-surface border border-garden-border rounded-2xl shadow-card
                  overflow-hidden animate-slide-up">

        <!-- ── Forgot-password view ── -->
        <div v-if="showForgot" class="p-8 space-y-5">
          <button class="text-xs font-mono text-garden-dim flex items-center gap-1
                         hover:text-garden-text transition-colors"
                  @click="showForgot = false">
            ← Back to Sign In
          </button>
          <div>
            <h2 class="font-display font-semibold text-xl text-garden-text">Reset Password</h2>
            <p class="text-xs text-garden-dim font-sans mt-1">
              Enter your email and we'll send a reset link.
            </p>
          </div>

          <div class="space-y-3">
            <input
              v-model="resetEmail"
              type="email"
              placeholder="your@email.com"
              class="w-full px-4 py-3 rounded-xl border border-garden-border bg-garden-card
                     font-mono text-sm text-garden-text placeholder-garden-muted
                     focus:outline-none focus:border-garden-live focus:ring-1
                     focus:ring-garden-live/30 transition-all"
              @keydown.enter="handleReset"
            />

            <p v-if="resetMsg" class="text-xs font-mono"
               :class="resetError ? 'text-garden-danger' : 'text-garden-good'">
              {{ resetMsg }}
            </p>

            <button
              class="w-full py-3 rounded-xl bg-garden-live text-white font-sans
                     font-medium text-sm transition-all hover:opacity-90
                     disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="resetLoading || !resetEmail"
              @click="handleReset"
            >
              <span v-if="resetLoading">Sending…</span>
              <span v-else>Send Reset Link</span>
            </button>
          </div>
        </div>

        <!-- ── Login view ── -->
        <div v-else class="p-8 space-y-5">

          <!-- Google button -->
          <button
            class="w-full flex items-center justify-center gap-3 py-3 rounded-xl
                   border border-garden-border bg-garden-card font-sans text-sm
                   text-garden-text hover:bg-garden-base transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading"
            @click="handleGoogle"
          >
            <!-- Google SVG icon -->
            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <!-- Divider -->
          <div class="flex items-center gap-3">
            <div class="flex-1 h-px bg-garden-border"></div>
            <span class="font-mono text-[10px] text-garden-dim uppercase tracking-widest">or</span>
            <div class="flex-1 h-px bg-garden-border"></div>
          </div>

          <!-- Email + Password fields -->
          <div class="space-y-3">
            <div>
              <label class="block font-mono text-[10px] text-garden-dim uppercase
                            tracking-widest mb-1.5">
                Email
              </label>
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                class="w-full px-4 py-3 rounded-xl border border-garden-border bg-garden-card
                       font-mono text-sm text-garden-text placeholder-garden-muted
                       focus:outline-none focus:border-garden-live focus:ring-1
                       focus:ring-garden-live/30 transition-all"
                @keydown.enter="handleEmail"
              />
            </div>

            <div>
              <label class="block font-mono text-[10px] text-garden-dim uppercase
                            tracking-widest mb-1.5">
                Password
              </label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full px-4 py-3 rounded-xl border border-garden-border bg-garden-card
                         font-mono text-sm text-garden-text placeholder-garden-muted pr-12
                         focus:outline-none focus:border-garden-live focus:ring-1
                         focus:ring-garden-live/30 transition-all"
                  @keydown.enter="handleEmail"
                />
                <button
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-garden-dim
                         hover:text-garden-text transition-colors text-xs font-mono"
                  type="button"
                  @click="showPassword = !showPassword"
                  tabindex="-1"
                >
                  {{ showPassword ? 'hide' : 'show' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Error message -->
          <p v-if="errorMsg" class="text-garden-danger text-xs font-mono -mt-1">
            {{ errorMsg }}
          </p>

          <!-- Sign In button -->
          <button
            class="w-full py-3 rounded-xl font-sans font-medium text-sm transition-all
                   hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="loading
              ? 'bg-garden-border text-garden-dim'
              : 'bg-garden-text text-garden-void'"
            :disabled="loading || !email || !password"
            @click="handleEmail"
          >
            <span v-if="loading">Signing in…</span>
            <span v-else>Sign In</span>
          </button>

          <!-- Forgot password link -->
          <div class="text-center">
            <button
              class="font-mono text-[11px] text-garden-dim hover:text-garden-text
                     underline underline-offset-2 transition-colors"
              @click="showForgot = true"
            >
              Forgot password?
            </button>
          </div>
        </div>
      </div>

      <!-- Footer note -->
      <p class="text-center font-mono text-[10px] text-garden-muted mt-6">
        Access is by invitation only. Contact your administrator.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref }        from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth }    from '@/auth/useAuth'

const router = useRouter()
const route  = useRoute()
const { loginWithEmail, loginWithGoogle, resetPassword } = useAuth()

// ── State ─────────────────────────────────────────────────────────────────────
const email        = ref('')
const password     = ref('')
const showPassword = ref(false)
const loading      = ref(false)
const errorMsg     = ref('')

const showForgot  = ref(false)
const resetEmail  = ref('')
const resetLoading = ref(false)
const resetMsg    = ref('')
const resetError  = ref(false)

// ── Helpers ───────────────────────────────────────────────────────────────────
function friendlyError(code) {
  const map = {
    'auth/user-not-found':      'No account found with that email.',
    'auth/wrong-password':      'Incorrect password.',
    'auth/invalid-email':       'Please enter a valid email address.',
    'auth/too-many-requests':   'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/invalid-credential':  'Incorrect email or password.',
  }
  return map[code] ?? 'Something went wrong. Please try again.'
}

function redirectAfterLogin() {
  const dest = route.query.redirect
  router.push(dest && dest !== '/login' ? dest : '/dashboard')
}

// ── Handlers ──────────────────────────────────────────────────────────────────
async function handleEmail() {
  if (!email.value || !password.value || loading.value) return
  errorMsg.value = ''
  loading.value  = true
  try {
    await loginWithEmail(email.value, password.value)
    redirectAfterLogin()
  } catch (err) {
    errorMsg.value = friendlyError(err.code)
  } finally {
    loading.value = false
  }
}

async function handleGoogle() {
  if (loading.value) return
  errorMsg.value = ''
  loading.value  = true
  try {
    await loginWithGoogle()
    redirectAfterLogin()
  } catch (err) {
    errorMsg.value = friendlyError(err.code)
  } finally {
    loading.value = false
  }
}

async function handleReset() {
  if (!resetEmail.value || resetLoading.value) return
  resetMsg.value   = ''
  resetError.value = false
  resetLoading.value = true
  try {
    await resetPassword(resetEmail.value)
    resetMsg.value = 'Reset link sent! Check your inbox (and spam folder).'
  } catch (err) {
    resetError.value = true
    resetMsg.value   = friendlyError(err.code)
  } finally {
    resetLoading.value = false
  }
}
</script>
