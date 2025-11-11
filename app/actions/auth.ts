'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/app/lib/session';
import { getAdminAuth } from '@/app/lib/firebase-admin';

export interface LoginResult {
  success: boolean;
  error?: string;
}

/**
 * Create server session after verifying Firebase ID token
 * SECURE: Verifies the ID token with Firebase Admin SDK before creating session
 * @param idToken - Firebase ID token from the client
 */
export async function createSessionFromCredentials(
  idToken: string
): Promise<LoginResult> {
  try {
    // Verify the ID token with Firebase Admin SDK
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Extract verified user data from the token
    const userId = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      return {
        success: false,
        error: 'Email not found in token',
      };
    }

    // Create server-side session with verified data
    await createSession(userId, email);

    return { success: true };
  } catch (error) {
    console.error('Session creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid or expired token',
    };
  }
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
