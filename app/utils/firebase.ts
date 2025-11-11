import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

async function initializeFirebase(): Promise<void> {
  if (!app) {
    const { initializeApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    const { getStorage } = await import('firebase/storage');

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
}

async function getFirebaseService<T>(
  serviceName: string,
  serviceGetter: () => T | undefined
): Promise<T> {
  await initializeFirebase();
  const service = serviceGetter();
  if (!service) {
    throw new Error(`Firebase ${serviceName} is not initialized`);
  }
  return service;
}

export async function getFirebaseApp(): Promise<FirebaseApp> {
  return getFirebaseService('App', () => app);
}

export async function getFirebaseAuth(): Promise<Auth> {
  return getFirebaseService('Auth', () => auth);
}

export async function getFirebaseDb(): Promise<Firestore> {
  return getFirebaseService('Firestore', () => db);
}

export async function getFirebaseStorage(): Promise<FirebaseStorage> {
  return getFirebaseService('Storage', () => storage);
}
