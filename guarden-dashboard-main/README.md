# Guarden — Sensor Dashboard

> Real-time sensor data visualization for the Guarden AI-assisted crop management system.
> Holy Angel University · BS Computer Engineering · 2026

## Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Vue 3 (Composition API)             |
| Build Tool | Vite 5                              |
| Database   | Firebase Realtime Database (SDK v9+)|
| Styling    | Tailwind CSS 3                      |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

```bash
cp .env.example .env
```

Open `.env` and fill in your Firebase project credentials from the
[Firebase Console](https://console.firebase.google.com/) → Project Settings → Your Apps.

> **Note:** If `.env` is missing or credentials are incomplete, the app
> runs automatically in **Demo Mode** with simulated sensor data.

### 3. Run development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

---

## Firebase Realtime Database Structure

Set up your RTDB with the following JSON structure. Each zone maps to one plant.

```json
{
  "sensors": {
    "zone-1": {
      "plant": "tomato",
      "moisture": 65,
      "temperature": 28.5,
      "humidity": 72,
      "updatedAt": 1714186800000
    },
    "zone-2": {
      "plant": "okra",
      "moisture": 45,
      "temperature": 31.2,
      "humidity": 65,
      "updatedAt": 1714186800000
    },
    "zone-3": {
      "plant": "eggplant",
      "moisture": 58,
      "temperature": 28.0,
      "humidity": 78,
      "updatedAt": 1714186800000
    }
  }
}
```

### Field Definitions

| Field         | Type   | Range    | Unit |
|---------------|--------|----------|------|
| `moisture`    | number | 0–100    | %    |
| `temperature` | number | any      | °C   |
| `humidity`    | number | 0–100    | %    |
| `updatedAt`   | number | epoch ms | ms   |

### Microcontroller Write Example (Arduino/ESP32 pseudocode)

```cpp
// Write sensor data from ESP32 → Firebase RTDB
FirebaseJson json;
json.set("moisture",    soilMoisturePercent);
json.set("temperature", dhtTemp);
json.set("humidity",    dhtHumidity);
json.set("updatedAt",   millis());   // or use NTP epoch time

Firebase.RTDB.setJSON(&fbdo, "/sensors/zone-1", &json);
```

---

## Project Structure

```
src/
├── firebase.js                     # Firebase init (SDK v9 modular)
├── main.js                         # App bootstrap
├── App.vue                         # Root component
├── style.css                       # Global styles + Tailwind
│
├── composables/
│   └── useSensorData.js            # Real-time RTDB listener + demo mode
│
├── components/
│   ├── AppNavBar.vue               # Top navigation
│   ├── ZoneCard.vue                # Zone sensor card
│   ├── SensorGauge.vue             # SVG circular moisture gauge
│   └── SensorStat.vue              # Compact stat tile (temp / humidity)
│
└── views/
    └── Dashboard.vue               # Main dashboard view
```

---

## Expandability Notes

The following features are scaffolded for future integration:

- **Sparkline charts** — `SensorStat.vue` has a placeholder div marked
  for a mini time-series chart (last N readings).
- **Vue Router** — install `vue-router` and add routes for Pest Log,
  Watering Control, Harvest Readiness without touching existing components.
- **Pinia store** — replace `useSensorData` composable's local `ref`
  with a Pinia store for cross-component sensor history.
- **Firebase Auth** — add an `authGuard` to protect the dashboard
  route when ready for multi-user access.

---

## Sensor Threshold Configuration

Edit `ZONE_META` in `src/composables/useSensorData.js` to adjust
alert thresholds per plant:

```js
thresholds: {
  moisture:    { low: 30, high: 80 },  // % below/above = warn/danger
  temperature: { low: 18, high: 35 },  // °C
  humidity:    { low: 40, high: 85 },  // %
}
```
