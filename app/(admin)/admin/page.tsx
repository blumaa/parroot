import { unstable_noStore as noStore } from 'next/cache';
import { getUser } from '@/app/lib/dal';
import { redirect } from 'next/navigation';
import { getSegments } from '@/app/lib/data-access';
import { getAdminDb } from '@/app/lib/firebase-admin';
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

  // Check if there are any form submissions
  const db = getAdminDb();
  const submissionsSnapshot = await db
    .collection('formSubmissions')
    .limit(1)
    .get();
  const hasFormSubmissions = !submissionsSnapshot.empty;

  return (
    <DashboardView
      hasPostsSegments={hasPostsSegments}
      hasFormSubmissions={hasFormSubmissions}
    />
  );
}
