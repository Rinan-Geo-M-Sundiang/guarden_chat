<template>
  <nav
    class="sticky top-0 z-50 w-full border-b border-garden-border bg-garden-void/80 backdrop-blur-md"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

      <!-- Logo + wordmark -->
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

      <!-- Right side: demo badge + live ticker -->
      <div class="flex items-center gap-3">
        <!-- Demo mode badge -->
        <div
          v-if="isDemoMode"
          class="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded
                 bg-garden-warn/10 text-garden-warn border border-garden-warn/20"
        >
          Demo Mode
        </div>

        <!-- System clock -->
        <div class="font-mono text-xs text-garden-dim tabular-nums hidden sm:block">
          {{ clock }}
        </div>

        <!-- Global live dot -->
        <span class="relative flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full
                   bg-garden-live opacity-50"
          ></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-garden-live"></span>
        </span>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { isDemoMode } from '@/firebase'

const clock = ref('')

let timer = null

function tick() {
  clock.value = new Date().toLocaleTimeString('en-PH', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
})

onUnmounted(() => clearInterval(timer))
</script>
