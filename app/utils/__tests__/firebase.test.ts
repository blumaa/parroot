import { describe, it, expect } from 'vitest';
import { getFirebaseApp, getFirebaseAuth, getFirebaseDb, getFirebaseStorage } from '../firebase';

describe('Firebase Initialization', () => {
  it('should return Firebase app instance', () => {
    const app = getFirebaseApp();

    expect(app).toBeDefined();
    expect(app.name).toBe('[DEFAULT]');
  });

  it('should return same app instance on multiple calls', () => {
    const app1 = getFirebaseApp();
    const app2 = getFirebaseApp();

    expect(app1).toBe(app2);
  });

  it('should return auth instance', () => {
    const auth = getFirebaseAuth();

    expect(auth).toBeDefined();
    expect(auth.app).toBeDefined();
  });

  it('should return firestore instance', () => {
    const db = getFirebaseDb();

    expect(db).toBeDefined();
    expect(db.type).toBe('firestore');
  });

  it('should return storage instance', () => {
    const storage = getFirebaseStorage();

    expect(storage).toBeDefined();
    expect(storage.app).toBeDefined();
  });
});
