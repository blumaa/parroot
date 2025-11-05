import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { getAuthInstance } from './firebase';
import { createDocument, getDocument, getUserByEmail } from './firestore';
import { User, UserRole } from '../types';

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  try {
    const auth = getAuthInstance();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Create a new user (admin only)
 */
export async function createUser(
  email: string,
  password: string,
  displayName: string,
  role: UserRole
): Promise<string> {
  try {
    const auth = getAuthInstance();
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    // Update display name
    await updateProfile(userCredential.user, { displayName });

    // Create user document in Firestore
    // Note: createDocument automatically adds createdAt and updatedAt
    await createDocument('users', {
      email,
      displayName,
      role,
    });

    return uid;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    const auth = getAuthInstance();
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Get current user's role from Firestore
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const auth = getAuthInstance();
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const userDoc = await getDocument<User>('users', currentUser.uid);
    return userDoc?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'admin';
}

/**
 * Check if current user is editor or admin
 */
export async function isEditor(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'admin' || role === 'editor';
}

/**
 * Get current user data
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const auth = getAuthInstance();
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    return await getDocument<User>('users', currentUser.uid);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
