// src/firebase.js
// Firebase JS SDK v9+ modular API
//
// ── Security note ────────────────────────────────────────────────────────────
// Firebase web config values (apiKey, projectId, etc.) are NOT secrets.
// Google designed them to be public identifiers for the web client.
// Security is enforced server-side via Firebase Security Rules — not by
// hiding this config. See: https://firebase.google.com/docs/projects/api-keys
//
// What IS secret and must never be committed:
//   - Service account JSON keys  → never used in frontend
//   - Firebase CI tokens         → never used in frontend
//   - .env file                  → already in .gitignore
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app'
import { getDatabase }   from 'firebase/database'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validate required config — do NOT log which keys are missing (info leak)
const isConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.databaseURL &&
  firebaseConfig.projectId
)

export const isDemoMode = !isConfigured

let app = null
let db  = null

if (isConfigured) {
  app = initializeApp(firebaseConfig)
  db  = getDatabase(app)
}

export { db }
