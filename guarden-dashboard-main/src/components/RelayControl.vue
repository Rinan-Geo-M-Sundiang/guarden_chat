<template>
  <!-- ── Viewer read-only state ───────────────────────────────────────────── -->
  <div v-if="readonly" class="relay-control">
    <div class="relay-header">
      <span class="relay-label">Relay Status</span>
      <span :class="['relay-badge', relayOn ? 'badge-on' : 'badge-off']">
        {{ relayOn ? 'ACTIVE' : 'INACTIVE' }}
      </span>
    </div>
    <p class="relay-hint">
      {{ relayOn
        ? 'The relay is currently active. Watering in progress.'
        : 'Relay is off. Awaiting next watering cycle.' }}
    </p>
  </div>

  <!-- ── Admin full control ───────────────────────────────────────────────── -->
  <div v-else class="relay-control">
    <!-- Header -->
    <div class="relay-header">
      <span class="relay-label">{{ props.title }}</span>
      <span :class="['relay-badge', relayOn ? 'badge-on' : 'badge-off']">
        {{ relayOn ? 'FORCED ON' : (props.showThresholdSettings ? 'AUTO' : 'OFF') }}
      </span>
      <button
        v-if="props.showThresholdSettings"
        class="settings-btn"
        @click="showSettings = true"
        title="Configure thresholds"
      >⚙️</button>
    </div>

    <!-- Timer input -->
    <div v-if="!relayOn" class="timer-row">
      <label class="timer-label">Duration</label>
      <div class="timer-inputs">
        <div class="timer-field">
          <input v-model.number="inputMinutes" type="number" min="0" max="99" placeholder="0" class="time-input" />
          <span class="time-unit">min</span>
        </div>
        <span class="time-sep">:</span>
        <div class="timer-field">
          <input v-model.number="inputSeconds" type="number" min="0" max="59" placeholder="0" class="time-input" />
          <span class="time-unit">sec</span>
        </div>
      </div>
      <span v-if="durationError" class="duration-error">{{ durationError }}</span>
    </div>

    <!-- Countdown -->
    <div v-if="relayOn && countdown > 0" class="countdown-row">
      <span class="countdown-label">Auto-off in</span>
      <span class="countdown-value">{{ formattedCountdown }}</span>
    </div>

    <!-- Main button -->
    <button
      :class="['relay-btn', relayOn ? 'btn-active' : 'btn-idle']"
      :disabled="loading"
      @click="handleClick"
    >
      <span v-if="loading">⏳ Sending…</span>
      <span v-else-if="relayOn">⚡ Turn Relay OFF</span>
      <span v-else>⚡ Turn Relay ON</span>
    </button>

    <p class="relay-hint">
      {{ relayOn
        ? (props.showThresholdSettings
            ? 'Relay is active. ESP32 is ignoring temperature thresholds.'
            : 'Relay is active and will turn off automatically after the countdown.')
        : 'Set a duration then turn ON. Relay will auto-off when timer expires.' }}
    </p>

    <!-- Warning Modal -->
    <Teleport to="body">
      <div v-if="showWarningModal" class="modal-overlay" @click="closeWarning">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">⚠️ Unfavorable Conditions</h3>
            <button class="modal-close" @click="closeWarning">✕</button>
          </div>
          <div class="modal-body">
            <p>Current conditions may harm the plants:</p>
            <ul class="warning-list">
              <li v-if="warningReasons.moisture">
                🌱 Soil Moisture: {{ sensorValues.moisture }}% (above {{ thresholds.moistureWarn }}%)
              </li>
              <li v-if="warningReasons.temperature">
                🌡️ Temperature: {{ sensorValues.temperature }}°C (below {{ thresholds.temperatureWarn }}°C)
              </li>
              <li v-if="warningReasons.humidity">
                💧 Humidity: {{ sensorValues.humidity }}% (above {{ thresholds.humidityWarn }}%)
              </li>
            </ul>
            <p class="warning-proceed">Proceed anyway?</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeWarning">Cancel</button>
            <button class="btn-confirm" @click="proceedOverride">Proceed</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Settings Modal -->
    <Teleport to="body">
      <div v-if="showSettings" class="modal-overlay" @click="closeSettings">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">⚙️ Threshold Settings</h3>
            <button class="modal-close" @click="closeSettings">✕</button>
          </div>
          <div class="modal-body">
            <div class="settings-section">
              <h4>Auto Mode — Temperature</h4>
              <div class="threshold-group">
                <label>Temp ON (°C) — relay turns on above this</label>
                <input v-model.number="editThresholds.tempOn" type="number" step="0.5" />
              </div>
              <div class="threshold-group">
                <label>Temp OFF (°C) — relay turns off below this</label>
                <input v-model.number="editThresholds.tempOff" type="number" step="0.5" />
              </div>
            </div>

            <div class="settings-section">
              <h4>Auto Mode — Soil Moisture</h4>
              <div class="threshold-group">
                <label>Moisture ON (%) — relay turns on when soil drops below this</label>
                <input v-model.number="editThresholds.moistureOn" type="number" min="0" max="100" />
              </div>
              <div class="threshold-group">
                <label>Moisture OFF (%) — relay turns off when soil rises above this</label>
                <input v-model.number="editThresholds.moistureOff" type="number" min="0" max="100" />
              </div>
            </div>

            <div class="settings-section">
              <h4>Warning Thresholds</h4>
              <div class="threshold-group">
                <label>Moisture Warning (%)</label>
                <input v-model.number="editThresholds.moistureWarn" type="number" min="0" max="100" />
              </div>
              <div class="threshold-group">
                <label>Temperature Warning (°C)</label>
                <input v-model.number="editThresholds.temperatureWarn" type="number" step="0.5" />
              </div>
              <div class="threshold-group">
                <label>Humidity Warning (%)</label>
                <input v-model.number="editThresholds.humidityWarn" type="number" min="0" max="100" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeSettings">Cancel</button>
            <button class="btn-confirm" @click="saveThresholds">Save</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db }                                     from '@/firebase'
import { ref as dbRef, set, onValue, get, off }   from 'firebase/database'

const props = defineProps({
  currentMoisture:       { type: Number, default: null },
  currentTemperature:    { type: Number, default: null },
  currentHumidity:       { type: Number, default: null },
  readonly:              { type: Boolean, default: false },
  controlPath:           { type: String, default: 'control/relay' },
  title:                 { type: String, default: 'Relay Override' },
  showThresholdSettings: { type: Boolean, default: true },
})

// State
const relayOn          = ref(false)
const loading          = ref(false)
const inputMinutes     = ref(0)
const inputSeconds     = ref(30)
const countdown        = ref(0)
const durationError    = ref('')
const showWarningModal = ref(false)
const showSettings     = ref(false)
const warningReasons   = ref({ moisture: false, temperature: false, humidity: false })
const sensorValues     = ref({ moisture: null, temperature: null, humidity: null })

const thresholds = ref({
  tempOn:          40,
  tempOff:         15,
  moistureOn:      30,
  moistureOff:     60,
  moistureWarn:    40,
  temperatureWarn: 20,
  humidityWarn:    50,
})

const editThresholds = ref({ ...thresholds.value })

let unsubscribe    = null
let countdownTimer = null

// Computed
const formattedCountdown = computed(() => {
  const m = Math.floor(countdown.value / 60).toString().padStart(2, '0')
  const s = (countdown.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const totalSeconds = computed(() =>
  (inputMinutes.value || 0) * 60 + (inputSeconds.value || 0)
)

function updateSensorValues() {
  sensorValues.value = {
    moisture:    props.currentMoisture,
    temperature: props.currentTemperature,
    humidity:    props.currentHumidity,
  }
}

function checkUnfavorableConditions() {
  updateSensorValues()
  const reasons = {
    moisture:    sensorValues.value.moisture    !== null && sensorValues.value.moisture    > thresholds.value.moistureWarn,
    temperature: sensorValues.value.temperature !== null && sensorValues.value.temperature < thresholds.value.temperatureWarn,
    humidity:    sensorValues.value.humidity    !== null && sensorValues.value.humidity    > thresholds.value.humidityWarn,
  }
  return Object.values(reasons).some(r => r)
}

async function writeRelay(value) {
  try {
    await set(dbRef(db, props.controlPath), value)
    return true
  } catch (err) {
    console.error('Relay write failed:', err)
    return false
  }
}

async function loadThresholds() {
  try {
    const snapshot = await get(dbRef(db, 'config/thresholds'))
    if (snapshot.exists()) {
      thresholds.value     = { ...thresholds.value, ...snapshot.val() }
      editThresholds.value = { ...thresholds.value }
    }
  } catch (err) {
    console.error('Failed to load thresholds:', err)
  }
}

async function saveThresholds() {
  try {
    loading.value = true
    await set(dbRef(db, 'config/thresholds'), editThresholds.value)
    await set(dbRef(db, 'config/thresholds_updated'), Math.floor(Date.now() / 1000))
    thresholds.value     = { ...editThresholds.value }
    loading.value        = false
    showSettings.value   = false
  } catch (err) {
    loading.value = false
    console.error('Failed to save thresholds:', err)
    alert('Failed to save thresholds. Check console for errors.')
  }
}

function startCountdown(seconds) {
  clearInterval(countdownTimer)
  countdown.value = seconds

  countdownTimer = setInterval(async () => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      loading.value = true
      await writeRelay(false)
      loading.value = false
    }
  }, 1000)
}

async function turnOnRelay() {
  loading.value = true
  const ok      = await writeRelay(true)
  loading.value = false
  if (ok) startCountdown(totalSeconds.value)
}

function closeWarning() { showWarningModal.value = false }

async function proceedOverride() {
  showWarningModal.value = false
  await turnOnRelay()
}

function closeSettings() {
  editThresholds.value = { ...thresholds.value }
  showSettings.value   = false
}

async function handleClick() {
  durationError.value = ''

  if (!relayOn.value) {
    if (totalSeconds.value <= 0) {
      durationError.value = 'Set a duration greater than 0.'
      return
    }
    if (props.showThresholdSettings && checkUnfavorableConditions()) {
      warningReasons.value = {
        moisture:    sensorValues.value.moisture    > thresholds.value.moistureWarn,
        temperature: sensorValues.value.temperature < thresholds.value.temperatureWarn,
        humidity:    sensorValues.value.humidity    > thresholds.value.humidityWarn,
      }
      showWarningModal.value = true
      return
    }
    await turnOnRelay()
  } else {
    clearInterval(countdownTimer)
    countdown.value = 0
    loading.value   = true
    await writeRelay(false)
    loading.value   = false
  }
}

onMounted(() => {
  if (props.showThresholdSettings) {
    loadThresholds()
  }

  const controlRef = dbRef(db, props.controlPath)
  unsubscribe = onValue(controlRef, (snapshot) => {
    const val  = snapshot.val()
    relayOn.value = val === true

    if (!relayOn.value && countdownTimer) {
      clearInterval(countdownTimer)
      countdown.value = 0
    }
  })
})

onUnmounted(() => {
  if (unsubscribe)    unsubscribe()
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.relay-control {
  background: var(--color-card, #F0FAF1);
  border: 1px solid var(--color-border, #B8DDB8);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.relay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.relay-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: var(--color-dim, #4A7C59);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.relay-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 99px;
}
.badge-on  { background: #FF525222; color: #FF5252; }
.badge-off { background: #ffffff14; color: var(--color-dim, #4A7C59); }
.settings-btn {
  background: none;
  border: 1px solid var(--color-border, #B8DDB8);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.15s;
}
.settings-btn:hover { background: var(--color-surface, #FFFFFF); }
.timer-row { display: flex; flex-direction: column; gap: 0.4rem; }
.timer-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: var(--color-dim, #4A7C59);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.timer-inputs { display: flex; align-items: center; gap: 0.5rem; }
.timer-field  { display: flex; align-items: center; gap: 0.3rem; }
.time-input {
  width: 56px;
  background: var(--color-surface, #FFFFFF);
  border: 1px solid var(--color-border, #B8DDB8);
  border-radius: 6px;
  padding: 0.4rem 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  color: var(--color-text, #1B3A2A);
  text-align: center;
}
.time-input:focus { border-color: #69F0AE88; outline: none; }
.time-unit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: var(--color-dim, #4A7C59);
}
.time-sep {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.1rem;
  color: var(--color-dim, #4A7C59);
  margin-bottom: 2px;
}
.duration-error { font-size: 0.72rem; color: #FF5252; }
.countdown-row { display: flex; align-items: center; gap: 0.6rem; }
.countdown-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: var(--color-dim, #4A7C59);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.countdown-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.4rem;
  font-weight: 700;
  color: #FF5252;
  letter-spacing: 0.05em;
}
.relay-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.relay-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-active { background: #FF5252; color: white; }
.btn-idle   { background: #69F0AE22; color: #69F0AE; border: 1px solid #69F0AE44; }
.relay-hint { font-size: 0.72rem; color: var(--color-dim, #4A7C59); margin: 0; }
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #F5FAF6;
  border: 2px solid #FF5252;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  max-width: 420px;
  width: 90%;
  display: flex; flex-direction: column;
  max-height: 85vh; overflow-y: auto;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #B8DDB8;
}
.modal-title { font-size: 1.05rem; font-weight: 600; color: #1B3A2A; margin: 0; }
.modal-close {
  background: none; border: none; color: #4A7C59;
  font-size: 1.5rem; cursor: pointer;
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { color: #1B3A2A; }
.modal-body { padding: 1.25rem; flex: 1; }
.modal-body p { margin: 0 0 0.8rem 0; color: #1B3A2A; font-size: 0.95rem; }
.warning-list { list-style: none; padding: 0; margin: 0.5rem 0 1.5rem 0; }
.warning-list li { color: #FF5252; padding: 0.5rem 0; font-size: 0.9rem; font-family: 'JetBrains Mono', monospace; }
.warning-proceed { color: #4A7C59; font-style: italic; font-size: 0.9rem; }
.settings-section { margin-bottom: 1.5rem; }
.settings-section h4 {
  margin: 0 0 0.8rem 0; font-size: 0.85rem;
  text-transform: uppercase; color: #4A7C59;
  letter-spacing: 0.06em; font-weight: 600;
}
.threshold-group { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.8rem; }
.threshold-group label { font-size: 0.8rem; color: #1B3A2A; font-weight: 500; }
.threshold-group input {
  padding: 0.5rem;
  background: #FFFFFF;
  border: 1px solid #B8DDB8;
  border-radius: 6px;
  color: #1B3A2A;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
}
.threshold-group input:focus { border-color: #69F0AE88; outline: none; }
.modal-footer {
  display: flex; gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #B8DDB8;
}
.btn-cancel, .btn-confirm {
  flex: 1; padding: 0.7rem; border-radius: 6px;
  border: none; font-weight: 600; cursor: pointer;
  font-size: 0.9rem; transition: opacity 0.15s;
}
.btn-cancel { background: #FFFFFF; color: #1B3A2A; border: 1px solid #B8DDB8; }
.btn-cancel:hover { opacity: 0.8; }
.btn-confirm { background: #FF5252; color: white; }
.btn-confirm:hover { opacity: 0.9; }
</style>
