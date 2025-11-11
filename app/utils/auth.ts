import type { User, UserCredential } from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

export async function signInUser(
  email: string,
  password: string
): Promise<UserCredential> {
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutUser(): Promise<void> {
  const { signOut } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  return signOut(auth);
}

export async function registerUser(
  email: string,
  password: string
): Promise<UserCredential> {
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function resetPassword(email: string): Promise<void> {
  const { sendPasswordResetEmail } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  return sendPasswordResetEmail(auth, email);
}

export async function updateUserProfile(
  user: User,
  profile: { displayName?: string; photoURL?: string }
): Promise<void> {
  const { updateProfile } = await import('firebase/auth');
  return updateProfile(user, profile);
}

export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  // Only initialize on client side
  if (typeof window === 'undefined') {
    return () => {}; // Return a no-op function for server-side
  }

  let unsubscribe: (() => void) | undefined;

  // Async initialization
  (async () => {
    try {
      const { onAuthStateChanged } = await import('firebase/auth');
      const auth = await getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, callback);
    } catch (error) {
      console.error('Failed to initialize auth listener:', error);
    }
  })();

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}
