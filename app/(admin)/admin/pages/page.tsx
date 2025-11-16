import { PageList } from '@/app/components/admin/PageList';
import { getUser } from '@/app/lib/dal';
import { getPages } from '@/app/lib/data-access';
import { redirect } from 'next/navigation';

export default async function PagesPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const pages = await getPages();

  return <PageList initialPages={pages} />;
}
