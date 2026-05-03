<template>
  <div class="min-h-screen bg-garden-base text-garden-text font-sans">
    <AppNavBar />
    <Dashboard />
    <footer class="max-w-6xl mx-auto px-4 sm:px-6 py-6 border-t border-garden-border mt-8">
      <p class="text-xs font-mono text-garden-muted">
        Guarden · Holy Angel University · BS Computer Engineering · 2026
      </p>
    </footer>
  </div>
</template>

<script setup>
import AppNavBar  from '@/components/AppNavBar.vue'
import Dashboard  from '@/views/Dashboard.vue'
</script>
