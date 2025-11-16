import { redirect } from 'next/navigation';
import { getUser } from '@/app/lib/dal';
import { getSiteSettings, getSegments } from '@/app/lib/data-access';
import { getAdminDb } from '@/app/lib/firebase-admin';
import { Box } from '@mond-design-system/theme';
import { AdminHeader } from '@/app/components/admin/AdminHeader';
import { AdminNavigation } from '@/app/components/admin/AdminNavigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Server-side auth check using DAL
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const settings = await getSiteSettings();

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

  // Ensure redirect happens before any rendering
  return user ? (
    <Box display="flex" className="h-screen bg-gray-50">
      <AdminNavigation
        siteName={settings?.siteName}
        hasPostsSegments={hasPostsSegments}
        hasFormSubmissions={hasFormSubmissions}
      />
      <Box flex="1" display="flex" flexDirection="column">
        <AdminHeader user={user} />
        <Box as="main" padding="8" flex="1" className="bg-white">
          {children}
        </Box>
      </Box>
    </Box>
  ) : null;
}
