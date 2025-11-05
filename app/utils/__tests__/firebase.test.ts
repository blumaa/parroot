import { describe, it, expect } from 'vitest';

describe('Firebase Initialization', () => {
  it('should initialize Firebase app', async () => {
    const { app } = await import('../firebase');
    expect(app).toBeDefined();
    expect(app.name).toBe('[DEFAULT]');
  });

  it('should initialize Firestore', async () => {
    const { db } = await import('../firebase');
    expect(db).toBeDefined();
    expect(db.type).toBe('firestore');
  });

  it('should initialize Auth', async () => {
    const { auth } = await import('../firebase');
    expect(auth).toBeDefined();
    expect(auth).toHaveProperty('currentUser');
  });

  it('should initialize Storage', async () => {
    const { storage } = await import('../firebase');
    expect(storage).toBeDefined();
    expect(storage).toHaveProperty('app');
  });

  it('should have correct Firebase config', async () => {
    const { app } = await import('../firebase');
    expect(app.options.projectId).toBe('parroot-template');
    expect(app.options.storageBucket).toBe('parroot-template.firebasestorage.app');
  });

  it('should only initialize Firebase once (singleton)', async () => {
    const firebase1 = await import('../firebase');
    const firebase2 = await import('../firebase');
    expect(firebase1.app).toBe(firebase2.app);
    expect(firebase1.db).toBe(firebase2.db);
    expect(firebase1.auth).toBe(firebase2.auth);
    expect(firebase1.storage).toBe(firebase2.storage);
  });
});
