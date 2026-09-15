import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import * as fs from 'fs'

// Read .env manually
const envContent = fs.readFileSync('./.env', 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
  if (match) {
    env[match[1]] = match[2]?.trim() || ''
  }
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

console.log('Testing connection to Firebase project:', firebaseConfig.projectId)
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

try {
  const snapshot = await getDocs(collection(db, 'kelas'))
  console.log('Successfully connected to Firestore! Found documents in "kelas":', snapshot.size)
} catch (err) {
  console.error('Error connecting to Firestore:', err)
  process.exit(1)
}
