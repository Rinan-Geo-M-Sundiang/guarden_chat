<template>
  <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

    <!-- Page header -->
    <header class="space-y-1 animate-fade-in">
      <p class="font-mono text-xs text-garden-dim uppercase tracking-widest">
        Real-time monitoring · {{ today }}
      </p>
      <h1 class="font-display text-3xl sm:text-4xl font-semibold text-garden-text leading-tight">
        Garden Overview
      </h1>
      <p class="font-sans text-garden-dim text-sm max-w-xl">
        Live sensor readings for all three cultivation zones.
        All values update automatically via Firebase.
      </p>
    </header>

    <!-- Summary strip -->
    <section class="grid grid-cols-3 gap-3 animate-fade-in" style="animation-delay:100ms">
      <div
        v-for="(stat, i) in summaryStats"
        :key="i"
        class="rounded-xl border border-garden-border bg-garden-surface px-4 py-3 space-y-0.5"
      >
        <div class="text-[10px] font-mono text-garden-dim uppercase tracking-widest">
          {{ stat.label }}
        </div>
        <div class="font-mono font-bold text-xl" :style="{ color: stat.color }">
          {{ stat.value }}
        </div>
      </div>
    </section>

    <!-- Pump relay controls (admin writes, viewer reads) -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in" style="animation-delay:150ms">
      <RelayControl
        :current-moisture="averages.moisture"
        :current-temperature="averages.temperature"
        :current-humidity="averages.humidity"
        :readonly="!isLoggedIn"
        title="Pump 1 Override"
      />
      <RelayControl
        :current-moisture="averages.moisture"
        :current-temperature="averages.temperature"
        :current-humidity="averages.humidity"
        :readonly="!isLoggedIn"
        controlPath="control/relay2"
        title="Pump 2 Override"
        :show-threshold-settings="false"
      />
    </section>

    <!-- Zone cards -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <ZoneCard
        v-for="(zone, i) in zones"
        :key="zone.id"
        :zone="zone"
        :delay="i * 120"
      />
    </section>

  </main>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import ZoneCard     from '@/components/ZoneCard.vue'
import RelayControl from '@/components/RelayControl.vue'
import { useSensorData } from '@/composables/useSensorData'
import { useAuth }  from '@/auth/useAuth'
import { db }       from '@/firebase'

const { zones }   = useSensorData()
const { isLoggedIn } = useAuth()

const today = computed(() =>
  new Date().toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
)

const averages = ref({ moisture: null, temperature: null, humidity: null })
let unsubAvg   = null

import('firebase/database').then(({ ref: dbRef, onValue, off }) => {
  const avgRef = dbRef(db, 'averages')
  const unsub  = onValue(avgRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      averages.value = {
        moisture:    data.moisture    ?? null,
        temperature: data.temperature ?? null,
        humidity:    data.humidity    ?? null,
      }
    }
  })
  unsubAvg = () => off(avgRef, 'value', unsub)
})

onUnmounted(() => { if (unsubAvg) unsubAvg() })

const summaryStats = computed(() => [
  {
    label: 'Avg. Soil Moisture',
    value: averages.value.moisture    !== null ? `${averages.value.moisture} %`     : '—',
    color: '#69F0AE',
  },
  {
    label: 'Avg. Temperature',
    value: averages.value.temperature !== null ? `${averages.value.temperature} °C` : '—',
    color: '#FFD740',
  },
  {
    label: 'Avg. Humidity',
    value: averages.value.humidity    !== null ? `${averages.value.humidity} %`     : '—',
    color: '#CE93D8',
  },
])
</script>
