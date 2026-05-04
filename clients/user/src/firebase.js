// clients/user/src/firebase.js
// ──────────────────────────────────
// Replace ALL placeholder values with your actual Firebase project config.
// Find these in: Firebase Console → Project Settings → General → Your apps → Web app
//
// IMPORTANT: These values are PUBLIC (they go into the browser bundle).
// They do NOT need to be secret — Firebase security is enforced by Security Rules,
// not by keeping these values private.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Usage in any component:
//   import { auth } from "./firebase";
//   import { signInWithEmailAndPassword } from "firebase/auth";
//   const cred = await signInWithEmailAndPassword(auth, email, password);
//   const token = await cred.user.getIdToken();
