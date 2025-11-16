import { SegmentList } from '@/app/components/admin/SegmentList';
import { getUser } from '@/app/lib/dal';
import { getSegments } from '@/app/lib/data-access';
import { redirect } from 'next/navigation';

export default async function SegmentsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const segments = await getSegments();

  return <SegmentList initialSegments={segments} />;
}
