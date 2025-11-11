import { describe, it, expect } from 'vitest';
import { getFirebaseApp, getFirebaseAuth, getFirebaseDb, getFirebaseStorage } from '../firebase';

describe('Firebase Initialization', () => {
  it('should return Firebase app instance', async () => {
    const app = await getFirebaseApp();

    expect(app).toBeDefined();
    expect(app.name).toBe('[DEFAULT]');
  });

  it('should return same app instance on multiple calls', async () => {
    const app1 = await getFirebaseApp();
    const app2 = await getFirebaseApp();

    expect(app1).toBe(app2);
  });

  it('should return auth instance', async () => {
    const auth = await getFirebaseAuth();

    expect(auth).toBeDefined();
    expect(auth.app).toBeDefined();
  });

  it('should return firestore instance', async () => {
    const db = await getFirebaseDb();

    expect(db).toBeDefined();
    expect(db.type).toBe('firestore');
  });

  it('should return storage instance', async () => {
    const storage = await getFirebaseStorage();

    expect(storage).toBeDefined();
    expect(storage.app).toBeDefined();
  });
});
