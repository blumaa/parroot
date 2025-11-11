import { SegmentForm } from '@/app/components/admin/SegmentForm';
import { getUser } from '@/app/lib/dal';
import { redirect } from 'next/navigation';

export default async function NewSegmentPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return <SegmentForm userId={user.id} />;
}
