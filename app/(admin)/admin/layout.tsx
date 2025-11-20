import { redirect } from 'next/navigation';
import { getUser } from '@/app/lib/dal';
import { getSiteSettings, getSegments } from '@/app/lib/data-access';
import { Box } from '@mond-design-system/theme';
import { AdminHeader } from '@/app/components/admin/AdminHeader';

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

  // Check if there are any form segments
  const hasFormSegments = allSegments.some(
    (segment) => segment.type === 'form'
  );

  // Ensure redirect happens before any rendering
  return user ? (
    <Box display="flex" flexDirection="column" className="h-screen bg-gray-50">
      <AdminHeader
        user={user}
        siteName={settings?.siteName}
        hasPostsSegments={hasPostsSegments}
        hasFormSegments={hasFormSegments}
      />
      <Box as="main" padding="8" flex="1" className="bg-white overflow-auto">
        {children}
      </Box>
    </Box>
  ) : null;
}
