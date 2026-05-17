<template>
  <nav class="sticky top-0 z-50 w-full border-b border-garden-border bg-garden-void/80 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

      <!-- Logo -->
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-lg bg-garden-surface border border-garden-border
                    flex items-center justify-center text-sm select-none">🌱</div>
        <span class="font-display font-semibold text-garden-text text-lg tracking-tight">
          Guarden
        </span>
        <span class="hidden sm:inline text-garden-dim text-xs font-mono border border-garden-border
                     rounded px-1.5 py-0.5 uppercase tracking-widest">
          Sensor Dashboard
        </span>
      </div>

      <!-- Right side -->
      <div class="flex items-center gap-3">

        <!-- Login button (when not logged in) -->
        <router-link
          v-if="!isLoggedIn"
          to="/login"
          class="inline-flex font-mono text-[11px] uppercase tracking-widest
                 px-2.5 py-1 rounded border border-garden-border text-garden-dim
                 hover:text-garden-text hover:bg-garden-card transition-colors"
        >
          Login
        </router-link>

        <!-- Clock -->
        <div class="font-mono text-xs text-garden-dim tabular-nums hidden sm:block">
          {{ clock }}
        </div>

        <!-- Live dot -->
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full
                       bg-garden-live opacity-50"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-garden-live"></span>
        </span>

        <!-- User menu (when logged in) -->
        <div v-if="isLoggedIn" class="relative" ref="menuRef">
          <button
            class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-garden-border
                   bg-garden-card hover:bg-garden-base transition-colors"
            @click="menuOpen = !menuOpen"
          >
            <span class="hidden sm:inline font-mono text-[11px] text-garden-dim max-w-[100px] truncate">
              {{ displayName }}
            </span>
            <svg
              class="w-3 h-3 text-garden-muted transition-transform"
              :class="menuOpen ? 'rotate-180' : ''"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Dropdown -->
          <div
            v-if="menuOpen"
            class="absolute right-0 top-full mt-2 w-52 bg-garden-surface border
                   border-garden-border rounded-xl shadow-card overflow-hidden z-50 animate-fade-in"
          >
            <!-- User info -->
            <div class="px-4 py-3 border-b border-garden-border">
              <div class="font-sans font-medium text-garden-text text-sm truncate">
                {{ currentUser?.displayName || 'User' }}
              </div>
              <div class="font-mono text-[11px] text-garden-dim truncate">
                {{ currentUser?.email }}
              </div>
            </div>

            <!-- Sign out -->
            <button
              class="w-full flex items-center gap-2 px-4 py-2.5 font-mono text-xs
                     text-garden-danger hover:bg-garden-danger/5 transition-colors text-left"
              :disabled="signingOut"
              @click="handleLogout"
            >
              {{ signingOut ? 'Signing out…' : '→ Sign Out' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter }                   from 'vue-router'
import { useAuth }                               from '@/auth/useAuth'

const route  = useRoute()
const router = useRouter()
const { currentUser, isLoggedIn, logout } = useAuth()

// Clock
const clock = ref('')
let clockTimer = null

function tick() {
  clock.value = new Date().toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

onMounted(() => { tick(); clockTimer = setInterval(tick, 1000) })
onUnmounted(() => clearInterval(clockTimer))

// User display
const displayName = computed(() =>
  currentUser.value?.displayName || currentUser.value?.email || 'User'
)

// User menu
const menuOpen   = ref(false)
const menuRef    = ref(null)
const signingOut = ref(false)

function handleOutsideClick(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) menuOpen.value = false
}

onMounted(()  => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))

async function handleLogout() {
  signingOut.value = true
  menuOpen.value   = false
  try {
    await logout()
    router.push('/login')
  } finally {
    signingOut.value = false
  }
}
</script>
