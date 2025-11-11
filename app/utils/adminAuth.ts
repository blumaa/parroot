import type { User } from 'firebase/auth';
import { getDocument } from './firestore';

export async function isUserAdmin(user: User | null): Promise<boolean> {
  if (!user) {
    return false;
  }

  const userDoc = await getDocument(`users/${user.uid}`);

  if (!userDoc) {
    return false;
  }

  return userDoc.role === 'admin';
}
