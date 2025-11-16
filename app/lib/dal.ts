import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { decrypt } from '@/app/lib/session';
import { redirect } from 'next/navigation';

export interface UserData {
  id: string;
  email: string;
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
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return null;
  }

  return {
    id: session.userId,
    email: session.email,
    displayName: session.email, // Use email as display name for now
  };
});
