import { verifySession } from '@/app/lib/dal';
import { NavigationManager } from '@/app/components/admin/NavigationManager';
import { getMenuItems, getPages } from '@/app/lib/data-access';
import { redirect } from 'next/navigation';

export default async function NavigationPage() {
  const session = await verifySession();

  if (!session) {
    redirect('/login');
  }

  const [menuItems, pages] = await Promise.all([
    getMenuItems(),
    getPages()
  ]);

  return <NavigationManager initialMenuItems={menuItems} initialPages={pages} />;
}
