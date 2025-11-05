import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

/**
 * Initialize Firebase app (lazy initialization)
 * Only runs in browser environment and on first call
 */
function initializeFirebase(): FirebaseApp {
  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized in the browser');
  }

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  return app;
}

/**
 * Get Firebase app instance (initializes on first call)
 */
export function getApp(): FirebaseApp {
  if (!app) {
    app = initializeFirebase();
  }
  return app;
}

/**
 * Get Firestore instance (initializes on first call)
 */
export function getDb(): Firestore {
  if (!db) {
    const firebaseApp = getApp();
    db = getFirestore(firebaseApp);
  }
  return db;
}

/**
 * Get Auth instance (initializes on first call)
 */
export function getAuthInstance(): Auth {
  if (!auth) {
    const firebaseApp = getApp();
    auth = getAuth(firebaseApp);
  }
  return auth;
}

/**
 * Get Storage instance (initializes on first call)
 */
export function getStorageInstance(): FirebaseStorage {
  if (!storage) {
    const firebaseApp = getApp();
    storage = getStorage(firebaseApp);
  }
  return storage;
}

// Legacy exports for backward compatibility (used by tests)
// These export the getter functions themselves, not the values
export { getApp as app, getDb as db, getAuthInstance as auth, getStorageInstance as storage };
