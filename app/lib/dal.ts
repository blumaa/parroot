import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { decrypt } from '@/app/lib/session';
import { redirect } from 'next/navigation';
import { getAdminDb } from '@/app/lib/firebase-admin';

export interface UserData {
  id: string;
  email: string;
  role: string;
  displayName?: string;
}

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect('/admin/login');
  }

  return { isAuth: true, userId: session.userId, email: session.email };
});

export const getUser = cache(async (): Promise<UserData | null> => {
  // Check session without redirecting
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return null;
  }

  try {
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(session.userId).get();

    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();

    return {
      id: session.userId,
      email: session.email,
      role: userData?.role || 'user',
      displayName: userData?.displayName,
    };
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
});

export const requireAdmin = cache(async (): Promise<UserData> => {
  const user = await getUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  return user;
});
