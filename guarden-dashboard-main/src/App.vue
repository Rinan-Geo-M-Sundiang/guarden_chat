<template>
  <div class="min-h-screen bg-garden-void text-garden-text font-sans">

    <!-- Not configured — show setup notice instead of routing -->
    <template v-if="!isConfigured">
      <div class="min-h-screen flex items-center justify-center p-6">
        <div class="max-w-md text-center space-y-4">
          <div class="text-5xl">🌱</div>
          <h1 class="font-display text-2xl font-semibold text-garden-text">Firebase Not Configured</h1>
          <p class="text-garden-dim text-sm font-sans">
            Copy <code class="font-mono bg-garden-surface px-1 rounded">.env.example</code> to
            <code class="font-mono bg-garden-surface px-1 rounded">.env</code>
            and fill in your Firebase credentials, then restart the dev server.
          </p>
          <p class="font-mono text-xs text-garden-muted">
            Demo mode has been disabled because authentication is required.
          </p>
        </div>
      </div>
    </template>

    <!-- Normal app -->
    <template v-else>
      <AppNavBar v-if="showNav" />
      <router-view />
      <footer v-if="showNav" class="max-w-6xl mx-auto px-4 sm:px-6 py-6 border-t border-garden-border mt-8">
        <p class="text-xs font-mono text-garden-muted">
          Guarden · Holy Angel University · BS Computer Engineering · 2026
        </p>
      </footer>
    </template>

  </div>
</template>

<script setup>
import { computed }         from 'vue'
import { useRoute }         from 'vue-router'
import AppNavBar            from '@/components/AppNavBar.vue'
import { isConfigured }     from '@/firebase'

const route   = useRoute()
// Hide the navbar on the login page — it has its own minimal header
const showNav = computed(() => route.name !== 'login')
</script>
