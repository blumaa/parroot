import { verifySession } from '@/app/lib/dal';
import { NavigationManager } from '@/app/components/admin/NavigationManager';
import { redirect } from 'next/navigation';

export default async function NavigationPage() {
  const session = await verifySession();

  if (!session) {
    redirect('/login');
  }

  return <NavigationManager userId={session.userId} />;
}
