<template>
  <div class="min-h-screen bg-garden-void flex items-center justify-center p-4 relative overflow-hidden">

    <!-- Background blobs -->
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full
                  bg-garden-base opacity-70 blur-3xl"></div>
      <div class="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full
                  bg-garden-card opacity-80 blur-2xl"></div>
      <div class="absolute top-1/3 right-1/4 w-64 h-64 rounded-full
                  bg-garden-border opacity-30 blur-2xl"></div>
      <svg class="absolute top-12 right-12 opacity-10 w-24 h-24 text-garden-live"
           viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="50" rx="20" ry="42" transform="rotate(30 50 50)"/>
        <line x1="50" y1="10" x2="50" y2="90" stroke="white" stroke-width="2"/>
      </svg>
      <svg class="absolute bottom-16 left-16 opacity-10 w-20 h-20 text-garden-live"
           viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="50" rx="20" ry="42" transform="rotate(-20 50 50)"/>
      </svg>
    </div>

    <div class="relative w-full max-w-sm">

      <!-- Logo -->
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
          Sensor Dashboard · Create Account
        </p>
      </div>

      <!-- Success state -->
      <div
        v-if="success"
        class="bg-garden-surface border border-garden-border rounded-2xl shadow-card
               p-8 text-center space-y-4 animate-slide-up"
      >
        <div class="w-14 h-14 rounded-full bg-garden-live/10 border border-garden-live/30
                    flex items-center justify-center text-2xl mx-auto">
          ✓
        </div>
        <div>
          <h2 class="font-display font-semibold text-xl text-garden-text">Account Created</h2>
          <p class="text-sm text-garden-dim font-sans mt-1">
            You're in as a
            <span class="font-mono text-garden-okra text-[10px] uppercase tracking-wider
                         px-1.5 py-0.5 bg-garden-okra/10 rounded">viewer</span>.
          </p>
        </div>
        <p class="text-xs text-garden-dim font-sans">Redirecting to dashboard…</p>
        <div class="h-1 w-full bg-garden-border rounded-full overflow-hidden">
          <div
            class="h-full bg-garden-live rounded-full"
            style="animation: progress 2.2s ease-in-out forwards"
          ></div>
        </div>
      </div>

      <!-- Registration card -->
      <div
        v-else
        class="bg-garden-surface border border-garden-border rounded-2xl shadow-card
               overflow-hidden animate-slide-up"
      >
        <div class="p-8 space-y-5">

          <!-- Google -->
          <button
            class="w-full flex items-center justify-center gap-3 py-3 rounded-xl
                   border border-garden-border bg-garden-card font-sans text-sm
                   text-garden-text hover:bg-garden-base transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading"
            @click="handleGoogle"
          >
            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <!-- Divider -->
          <div class="flex items-center gap-3">
            <div class="flex-1 h-px bg-garden-border"></div>
            <span class="font-mono text-[10px] text-garden-dim uppercase tracking-widest">or</span>
            <div class="flex-1 h-px bg-garden-border"></div>
          </div>

          <!-- Fields -->
          <div class="space-y-3">

            <!-- Display name -->
            <div>
              <label class="block font-mono text-[10px] text-garden-dim uppercase tracking-widest mb-1.5">
                Display Name
              </label>
              <input
                v-model="displayName"
                type="text"
                autocomplete="name"
                placeholder="Your name"
                maxlength="64"
                class="w-full px-4 py-3 rounded-xl border bg-garden-card font-mono text-sm
                       text-garden-text placeholder-garden-muted focus:outline-none
                       focus:ring-1 transition-all"
                :class="fieldBorderClass(v$.displayName)"
                @blur="v$.displayName.$touch()"
              />
              <p v-if="v$.displayName.$error" class="mt-1 text-[11px] font-mono text-garden-danger">
                {{ v$.displayName.$errors[0].$message }}
              </p>
            </div>

            <!-- Email -->
            <div>
              <label class="block font-mono text-[10px] text-garden-dim uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                class="w-full px-4 py-3 rounded-xl border bg-garden-card font-mono text-sm
                       text-garden-text placeholder-garden-muted focus:outline-none
                       focus:ring-1 transition-all"
                :class="fieldBorderClass(v$.email)"
                @blur="v$.email.$touch()"
              />
              <p v-if="v$.email.$error" class="mt-1 text-[11px] font-mono text-garden-danger">
                {{ v$.email.$errors[0].$message }}
              </p>
            </div>

            <!-- Password -->
            <div>
              <label class="block font-mono text-[10px] text-garden-dim uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="At least 8 characters"
                  class="w-full px-4 py-3 pr-14 rounded-xl border bg-garden-card font-mono text-sm
                         text-garden-text placeholder-garden-muted focus:outline-none
                         focus:ring-1 transition-all"
                  :class="fieldBorderClass(v$.password)"
                  @blur="v$.password.$touch()"
                />
                <button
                  class="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px]
                         text-garden-dim hover:text-garden-text transition-colors"
                  type="button"
                  tabindex="-1"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'hide' : 'show' }}
                </button>
              </div>

              <!-- Strength bar -->
              <div class="mt-2 flex gap-1">
                <div
                  v-for="n in 4"
                  :key="n"
                  class="flex-1 h-1 rounded-full transition-all duration-300"
                  :class="strengthBarClass(n)"
                ></div>
              </div>
              <p class="mt-1 text-[10px] font-mono" :class="strengthLabelClass">
                {{ strengthLabel }}
              </p>

              <p v-if="v$.password.$error" class="mt-1 text-[11px] font-mono text-garden-danger">
                {{ v$.password.$errors[0].$message }}
              </p>
            </div>

            <!-- Confirm password -->
            <div>
              <label class="block font-mono text-[10px] text-garden-dim uppercase tracking-widest mb-1.5">
                Confirm Password
              </label>
              <input
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Re-enter password"
                class="w-full px-4 py-3 rounded-xl border bg-garden-card font-mono text-sm
                       text-garden-text placeholder-garden-muted focus:outline-none
                       focus:ring-1 transition-all"
                :class="fieldBorderClass(v$.confirmPassword)"
                @blur="v$.confirmPassword.$touch()"
                @keydown.enter="handleRegister"
              />
              <p v-if="v$.confirmPassword.$error" class="mt-1 text-[11px] font-mono text-garden-danger">
                {{ v$.confirmPassword.$errors[0].$message }}
              </p>
            </div>
          </div>

          <!-- Role notice -->
          <div class="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-garden-okra/5
                      border border-garden-okra/20">
            <span class="text-base mt-0.5 flex-shrink-0">🌿</span>
            <p class="font-sans text-[11px] text-garden-dim leading-relaxed">
              New accounts are assigned the
              <span class="font-mono text-garden-okra uppercase text-[10px] tracking-wider">viewer</span>
              role. An admin can promote you from the admin panel.
            </p>
          </div>

          <!-- Server error -->
          <p v-if="serverError" class="text-garden-danger text-xs font-mono">
            {{ serverError }}
          </p>

          <!-- Submit -->
          <button
            class="w-full py-3 rounded-xl font-sans font-medium text-sm transition-all
                   hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="loading ? 'bg-garden-border text-garden-dim' : 'bg-garden-text text-garden-void'"
            :disabled="loading || v$.$invalid"
            @click="handleRegister"
          >
            <span v-if="loading">Creating account…</span>
            <span v-else>Create Account</span>
          </button>

          <!-- Sign in link -->
          <p class="text-center font-sans text-xs text-garden-dim">
            Already have an account?
            <router-link
              to="/login"
              class="font-mono text-garden-live hover:underline underline-offset-2 transition-colors"
            >
              Sign in
            </router-link>
          </p>

        </div>
      </div>

      <p class="text-center font-mono text-[10px] text-garden-muted mt-6">
        Guarden · Holy Angel University · BS Computer Engineering · 2026
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed }  from 'vue'
import { useRouter }      from 'vue-router'
import { useVuelidate }   from '@vuelidate/core'
import {
  required,
  email as emailValidator,
  minLength,
  helpers,
}                         from '@vuelidate/validators'
import { auth, db }       from '@/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
}                         from 'firebase/auth'
import { ref as dbRef, set } from 'firebase/database'

const router = useRouter()

// ── Form state ────────────────────────────────────────────────────────────────
const displayName     = ref('')
const email           = ref('')
const password        = ref('')
const confirmPassword = ref('')
const showPassword    = ref(false)
const loading         = ref(false)
const serverError     = ref('')
const success         = ref(false)

// ── Vuelidate rules ───────────────────────────────────────────────────────────
const mustMatch = helpers.withMessage(
  'Passwords do not match',
  (value) => value === password.value
)

const rules = {
  displayName: {
    required:  helpers.withMessage('Display name is required', required),
    minLength: helpers.withMessage('At least 2 characters', minLength(2)),
  },
  email: {
    required: helpers.withMessage('Email is required', required),
    email:    helpers.withMessage('Enter a valid email', emailValidator),
  },
  password: {
    required:  helpers.withMessage('Password is required', required),
    minLength: helpers.withMessage('At least 8 characters', minLength(8)),
  },
  confirmPassword: {
    required:  helpers.withMessage('Please confirm your password', required),
    mustMatch,
  },
}

const v$ = useVuelidate(rules, { displayName, email, password, confirmPassword })

// ── Field border helper ───────────────────────────────────────────────────────
function fieldBorderClass(field) {
  if (!field.$dirty)
    return 'border-garden-border focus:border-garden-live focus:ring-garden-live/30'
  if (field.$error)
    return 'border-garden-danger focus:border-garden-danger focus:ring-garden-danger/20'
  return 'border-garden-live/50 focus:border-garden-live focus:ring-garden-live/30'
}

// ── Password strength ─────────────────────────────────────────────────────────
const passwordStrength = computed(() => {
  const p = password.value
  if (!p) return 0
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score++
  return score
})

const STRENGTH_COLORS = ['', 'bg-garden-danger', 'bg-garden-warn', 'bg-garden-warn', 'bg-garden-live']
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_TEXT   = ['', 'text-garden-danger', 'text-garden-warn', 'text-garden-warn', 'text-garden-live']

function strengthBarClass(n) {
  if (!password.value) return 'bg-garden-border'
  return n <= passwordStrength.value ? STRENGTH_COLORS[passwordStrength.value] : 'bg-garden-border'
}

const strengthLabel      = computed(() => password.value ? STRENGTH_LABELS[passwordStrength.value] : '')
const strengthLabelClass = computed(() => STRENGTH_TEXT[passwordStrength.value])

// ── Error helper ──────────────────────────────────────────────────────────────
function friendlyError(code) {
  const map = {
    'auth/email-already-in-use':   'An account with this email already exists.',
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/weak-password':          'Password must be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-closed-by-user':   'Google sign-up was cancelled.',
    'auth/too-many-requests':      'Too many attempts. Try again later.',
  }
  return map[code] ?? 'Something went wrong. Please try again.'
}

// ── Write viewer record to RTDB ───────────────────────────────────────────────
async function writeUserRecord(user, overrideName) {
  const node = {
    email:       user.email ?? '',
    displayName: overrideName ?? user.displayName ?? user.email ?? '',
    role:        'viewer',
    lastLogin:   Date.now(),
  }
  if (user.photoURL) node.photoURL = user.photoURL
  await set(dbRef(db, `users/${user.uid}`), node)
}

function showSuccessAndRedirect() {
  success.value = true
  setTimeout(() => router.push('/dashboard'), 2200)
}

// ── Email registration ────────────────────────────────────────────────────────
async function handleRegister() {
  serverError.value = ''
  await v$.value.$validate()
  if (v$.value.$invalid || loading.value) return

  loading.value = true
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value, password.value)
    await updateProfile(cred.user, { displayName: displayName.value.trim() })
    await cred.user.reload()
    await writeUserRecord(cred.user, displayName.value.trim())
    showSuccessAndRedirect()
  } catch (err) {
    serverError.value = friendlyError(err.code)
  } finally {
    loading.value = false
  }
}

// ── Google registration ───────────────────────────────────────────────────────
async function handleGoogle() {
  if (loading.value) return
  serverError.value = ''
  loading.value = true
  try {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider())
    await writeUserRecord(cred.user)
    showSuccessAndRedirect()
  } catch (err) {
    serverError.value = friendlyError(err.code)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes progress {
  from { width: 0% }
  to   { width: 100% }
}
</style>
