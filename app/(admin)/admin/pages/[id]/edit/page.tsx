import { EditPageWrapper } from '@/app/components/admin/EditPageWrapper';
import { getUser } from '@/app/lib/dal';

interface EditPagePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPagePage({ params }: EditPagePageProps) {
  const user = await getUser();

  if (!user) {
    return null;
  }

  const { id } = await params;

  return <EditPageWrapper pageId={id} userId={user.id} />;
}
