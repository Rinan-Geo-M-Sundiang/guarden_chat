<template>
  <div
    class="flex flex-col gap-1 px-4 py-3 rounded-lg border border-garden-border bg-garden-surface
           transition-all duration-300 hover:border-opacity-60"
    :style="{ borderColor: statusBorderColor }"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="text-xs font-sans text-garden-dim uppercase tracking-widest whitespace-nowrap">
        {{ label }}
      </span>
      <span
        class="text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 rounded"
        :class="statusClass"
      >{{ statusText }}</span>
    </div>

    <div class="flex items-end gap-1">
      <span
        class="font-mono font-bold leading-none transition-all duration-500"
        :style="{ color, fontSize: '1.75rem' }"
      >{{ displayValue }}</span>
      <span class="font-sans text-garden-dim text-sm pb-0.5">{{ unit }}</span>
    </div>

    <!-- Mini sparkline placeholder — expandable later -->
    <div class="h-px w-full rounded-full mt-1 opacity-40" :style="{ background: color }"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value:  { type: Number, default: null },
  unit:   { type: String, default: '' },
  label:  { type: String, default: '' },
  color:  { type: String, default: '#C8E6C9' },
  status: { type: String, default: 'ok' },
})

const displayValue = computed(() =>
  props.value === null ? '—' : String(props.value)
)

const STATUS_MAP = {
  ok:      { text: 'Normal',  classes: 'bg-garden-good/10 text-garden-good',   border: '#2A4030' },
  low:     { text: 'Low',     classes: 'bg-garden-warn/10 text-garden-warn',   border: '#FFD740' },
  high:    { text: 'High',    classes: 'bg-garden-danger/10 text-garden-danger', border: '#FF5252' },
  unknown: { text: 'No data', classes: 'bg-garden-muted/10 text-garden-dim',   border: '#2A4030' },
}

const statusText        = computed(() => STATUS_MAP[props.status]?.text    ?? '—')
const statusClass       = computed(() => STATUS_MAP[props.status]?.classes ?? '')
const statusBorderColor = computed(() => STATUS_MAP[props.status]?.border  ?? '#2A4030')
</script>
