import { unstable_noStore as noStore } from 'next/cache';
import { getUser } from '@/app/lib/dal';
import { redirect } from 'next/navigation';
import { getSegments } from '@/app/lib/data-access';
import { DashboardView } from '@/app/components/admin/DashboardView';

export default async function DashboardPage() {
  noStore();

  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if there are any posts segments (draft OR published)
  const allSegments = await getSegments();
  const hasPostsSegments = allSegments.some(
    (segment) => segment.type === 'posts'
  );

  // Check if there are any form segments
  const hasFormSegments = allSegments.some(
    (segment) => segment.type === 'form'
  );

  return (
    <DashboardView
      hasPostsSegments={hasPostsSegments}
      hasFormSegments={hasFormSegments}
    />
  );
}
