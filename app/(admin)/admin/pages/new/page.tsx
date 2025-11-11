import { PageForm } from '@/app/components/admin/PageForm';
import { getUser } from '@/app/lib/dal';

export default async function NewPagePage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return <PageForm userId={user.id} />;
}
