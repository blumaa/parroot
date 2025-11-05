import {
  signInWithEmailAndPassword as firebaseSignIn,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword as firebaseCreateUser,
  sendPasswordResetEmail as firebaseSendPasswordReset,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

export async function signInUser(
  email: string,
  password: string
): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  return firebaseSignIn(auth, email, password);
}

export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  return firebaseSignOut(auth);
}

export async function registerUser(
  email: string,
  password: string
): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  return firebaseCreateUser(auth, email, password);
}

export async function resetPassword(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  return firebaseSendPasswordReset(auth, email);
}

export async function updateUserProfile(
  user: User,
  profile: { displayName?: string; photoURL?: string }
): Promise<void> {
  return firebaseUpdateProfile(user, profile);
}

export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  const auth = getFirebaseAuth();
  return firebaseOnAuthStateChanged(auth, callback);
}
