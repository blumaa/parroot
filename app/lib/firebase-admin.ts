import 'server-only';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import path from 'path';

let app: App | undefined;

function getFirebaseAdmin(): App {
  if (!getApps().length) {
    // Use service account file for authentication
    const serviceAccountPath = path.join(process.cwd(), 'service-account.json');

    app = initializeApp({
      credential: cert(serviceAccountPath),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    app = getApps()[0];
  }

  return app;
}

export function getAdminAuth(): Auth {
  const app = getFirebaseAdmin();
  return getAuth(app);
}

export function getAdminDb(): Firestore {
  const app = getFirebaseAdmin();
  return getFirestore(app);
}
