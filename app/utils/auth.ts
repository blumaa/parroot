import type { UserCredential } from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

export async function signInUser(
  email: string,
  password: string
): Promise<UserCredential> {
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}
