import { EditSegmentWrapper } from '@/app/components/admin/EditSegmentWrapper';
import { getUser } from '@/app/lib/dal';
import { redirect } from 'next/navigation';

interface EditSegmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSegmentPage({ params }: EditSegmentPageProps) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;

  return <EditSegmentWrapper segmentId={id} userId={user.id} />;
}
