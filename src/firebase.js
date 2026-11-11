import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase web configuration comes from .env.local (see .env.example).
// Vite exposes only variables that start with VITE_.
const env = import.meta.env;
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const REQUIRED = ['apiKey', 'authDomain', 'projectId', 'appId'];
export const missingFirebaseKeys = REQUIRED.filter((key) => !firebaseConfig[key]);
export const isFirebaseConfigured = missingFirebaseKeys.length === 0;

// When the variables are missing the app still works as a public catalog;
// the auth pages explain what is missing instead of the whole app crashing.
export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
