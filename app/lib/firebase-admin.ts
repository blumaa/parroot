import 'server-only';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

let app: App | undefined;

function getFirebaseAdmin(): App {
  if (!getApps().length) {
    // Try to get credentials from environment variable first (for CI/CD)
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    let credential;
    if (serviceAccountJson) {
      // Use credentials from environment variable
      const serviceAccount = JSON.parse(serviceAccountJson);
      credential = cert(serviceAccount);
    } else {
      // Fall back to local service account file (for local development)
      const serviceAccountPath = path.join(process.cwd(), 'service-account.json');

      // Check if file exists before trying to use it
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(
          'Firebase service account not found. Please either:\n' +
          '1. Add service-account.json file to project root (local dev), or\n' +
          '2. Set FIREBASE_SERVICE_ACCOUNT_JSON environment variable (CI/CD)'
        );
      }

      credential = cert(serviceAccountPath);
    }

    app = initializeApp({
      credential,
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
