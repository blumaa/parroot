import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock server-only package to prevent errors in tests
vi.mock('server-only', () => ({}));

// Mock environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:123456789:web:abcdef';

// Mock Firebase modules before any imports
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({
    name: '[DEFAULT]',
    options: {
      projectId: 'parroot-template',
      storageBucket: 'parroot-template.firebasestorage.app',
    },
  })),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({ type: 'firestore' })),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  Timestamp: class {
    constructor(public seconds: number, public nanoseconds: number) {}
    static now() {
      return new this(Math.floor(Date.now() / 1000), 0);
    }
    toDate() {
      return new Date(this.seconds * 1000);
    }
  },
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ app: {}, currentUser: null })),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Call callback immediately with null user
    callback(null);
    // Return unsubscribe function
    return vi.fn();
  }),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({ app: {} })),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}));

// Mock our firebase.ts module with getter functions
vi.mock('./app/utils/firebase', () => {
  const mockApp = {
    name: '[DEFAULT]',
    options: {
      projectId: 'parroot-template',
      storageBucket: 'parroot-template.firebasestorage.app',
    },
  };
  const mockDb = { type: 'firestore' };
  const mockAuth = { app: mockApp, currentUser: null };
  const mockStorage = { app: mockApp };

  return {
    getFirebaseApp: vi.fn(() => mockApp),
    getFirebaseDb: vi.fn(() => mockDb),
    getFirebaseAuth: vi.fn(() => mockAuth),
    getFirebaseStorage: vi.fn(() => mockStorage),
  };
});

// Mock server-only modules
vi.mock('./app/lib/session', () => ({
  encrypt: vi.fn(),
  decrypt: vi.fn(),
  createSession: vi.fn(),
  deleteSession: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('./app/lib/dal', () => ({
  verifySession: vi.fn(),
  getUser: vi.fn(),
  requireAdmin: vi.fn(),
}));

vi.mock('./app/lib/firebase-admin', () => ({
  getFirebaseAdmin: vi.fn(),
  getAdminAuth: vi.fn(),
  getAdminDb: vi.fn(),
}));

vi.mock('./app/actions/auth', () => ({
  createSessionFromCredentials: vi.fn(() => Promise.resolve({ success: true })),
  logout: vi.fn(),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
