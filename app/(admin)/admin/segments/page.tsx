import { SegmentList } from '@/app/components/admin/SegmentList';
import { getUser } from '@/app/lib/dal';
import { redirect } from 'next/navigation';

export default async function SegmentsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return <SegmentList />;
}
