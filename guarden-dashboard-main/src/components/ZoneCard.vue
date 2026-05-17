<template>
  <article
    class="rounded-2xl border bg-garden-card shadow-card overflow-hidden
           transition-all duration-500 animate-slide-up"
    :class="[glowShadow, borderClass]"
    :style="{ animationDelay: `${delay}ms` }"
  >
    <!-- ── Header ─────────────────────────────────────────── -->
    <header
      class="flex items-center justify-between px-5 py-4 border-b border-garden-border"
    >
      <div class="flex items-center gap-3">
        <!-- Plant emoji badge -->
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center text-xl
                 border border-garden-border"
          :style="{ background: plantColorAlpha }"
        >{{ zone.emoji }}</div>

        <div>
          <div class="text-[10px] font-mono text-garden-dim uppercase tracking-widest">
            {{ zone.label }}
          </div>
          <div
            class="font-display font-semibold text-lg leading-tight"
            :style="{ color: plantColor }"
          >{{ zone.plant }}</div>
        </div>
      </div>

      <!-- Live indicator -->
      <div class="flex items-center gap-2">
        <span
          v-if="!zone.loading && !zone.error"
          class="relative flex h-2.5 w-2.5"
        >
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            :style="{ background: plantColor }"
          ></span>
          <span
            class="relative inline-flex rounded-full h-2.5 w-2.5"
            :style="{ background: plantColor }"
          ></span>
        </span>

        <span class="text-xs font-mono text-garden-dim">
          <template v-if="zone.loading">syncing…</template>
          <template v-else-if="zone.error">error</template>
          <template v-else>{{ lastUpdated }}</template>
        </span>
      </div>
    </header>

    <!-- ── Loading skeleton ──────────────────────────────── -->
    <div v-if="zone.loading" class="px-5 py-8 flex justify-center">
      <div class="flex gap-3 items-center text-garden-dim text-sm font-mono">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Awaiting sensor data…
      </div>
    </div>

    <!-- ── Error state ────────────────────────────────────── -->
    <div v-else-if="zone.error" class="px-5 py-6 text-center">
      <p class="text-garden-danger font-mono text-sm">{{ zone.error }}</p>
      <p class="text-garden-dim text-xs mt-1">Check Firebase path: sensors/{{ zone.id }}</p>
    </div>

    <!-- ── Sensor readings ────────────────────────────────── -->
    <div v-else class="px-5 py-5 space-y-5">
      <!-- Moisture ring (primary) -->
      <div class="flex justify-center">
        <SensorGauge
          :value="zone.sensors.moisture"
          :min="0"
          :max="100"
          unit="%"
          label="Soil Moisture"
          :color="plantColor"
          :status="moistureStatus"
          :size="140"
          :stroke-width="10"
        />
      </div>

      <!-- Temperature + Humidity stats -->
      <div class="grid grid-cols-2 gap-3">
        <SensorStat
          :value="zone.sensors.temperature"
          unit="°C"
          label="Temperature"
          :color="plantColor"
          :status="tempStatus"
        />
        <SensorStat
          :value="zone.sensors.humidity"
          unit="%"
          label="Humidity"
          :color="plantColor"
          :status="humidityStatus"
        />
      </div>

      <!-- Overall health band -->
      <div
        class="flex items-center gap-2 px-3 py-2 rounded-lg border border-garden-border"
        :class="overallBg"
      >
        <span class="text-base">{{ overallIcon }}</span>
        <span class="font-sans text-xs font-medium" :class="overallText">
          {{ overallMessage }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import SensorGauge from './SensorGauge.vue'
import SensorStat  from './SensorStat.vue'
import { getSensorStatus } from '@/composables/useSensorData'

const props = defineProps({
  zone:  { type: Object, required: true },
  delay: { type: Number, default: 0 },
})

// ── Plant colour map ───────────────────────────────────────────────────────
const COLOR_MAP = {
  tomato:   '#FF5252',
  okra:     '#69F0AE',
  eggplant: '#CE93D8',
}

const plantColor      = computed(() => COLOR_MAP[props.zone.colorKey] ?? '#C8E6C9')
const plantColorAlpha = computed(() => {
  const hex = plantColor.value.replace('#', '')
  const r   = parseInt(hex.slice(0, 2), 16)
  const g   = parseInt(hex.slice(2, 4), 16)
  const b   = parseInt(hex.slice(4, 6), 16)
  return `rgba(${r},${g},${b},0.10)`
})

const GLOW_MAP = {
  tomato:   'shadow-glow-tomato',
  okra:     'shadow-glow-okra',
  eggplant: 'shadow-glow-eggplant',
}

const glowShadow  = computed(() => GLOW_MAP[props.zone.colorKey] ?? '')
const borderClass = computed(() =>
  props.zone.loading || props.zone.error
    ? 'border-garden-border'
    : 'border-garden-border hover:border-opacity-80'
)

// ── Sensor status ──────────────────────────────────────────────────────────
const { thresholds } = props.zone

const moistureStatus = computed(() =>
  getSensorStatus(props.zone.sensors?.moisture, thresholds.moisture)
)
const tempStatus = computed(() =>
  getSensorStatus(props.zone.sensors?.temperature, thresholds.temperature)
)
const humidityStatus = computed(() =>
  getSensorStatus(props.zone.sensors?.humidity, thresholds.humidity)
)

// ── Overall health ─────────────────────────────────────────────────────────
const allStatuses = computed(() => [
  moistureStatus.value,
  tempStatus.value,
  humidityStatus.value,
])

const overallHealth = computed(() => {
  if (allStatuses.value.includes('high'))    return 'danger'
  if (allStatuses.value.includes('low'))     return 'warn'
  if (allStatuses.value.every(s => s === 'ok')) return 'ok'
  return 'unknown'
})

const OVERALL_MAP = {
  ok:      { icon: '✓', msg: 'All sensors within optimal range',  bg: 'bg-garden-good/5',   text: 'text-garden-good'   },
  warn:    { icon: '!', msg: 'One or more readings below optimal', bg: 'bg-garden-warn/5',   text: 'text-garden-warn'   },
  danger:  { icon: '⚠', msg: 'Reading exceeds safe threshold',    bg: 'bg-garden-danger/5', text: 'text-garden-danger' },
  unknown: { icon: '·', msg: 'Waiting for sensor data',           bg: 'bg-garden-muted/5',  text: 'text-garden-dim'    },
}

const overallIcon    = computed(() => OVERALL_MAP[overallHealth.value].icon)
const overallMessage = computed(() => OVERALL_MAP[overallHealth.value].msg)
const overallBg      = computed(() => OVERALL_MAP[overallHealth.value].bg)
const overallText    = computed(() => OVERALL_MAP[overallHealth.value].text)

// ── Timestamp ─────────────────────────────────────────────────────────────
const lastUpdated = computed(() => {
  const ts = props.zone.sensors?.updatedAt
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString('en-PH', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
})
</script>
