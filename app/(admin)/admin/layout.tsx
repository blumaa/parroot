import { redirect } from 'next/navigation';
import { getUser } from '@/app/lib/dal';
import { getSiteSettings } from '@/app/utils/firestore-settings';
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

  // Ensure redirect happens before any rendering
  return user ? (
    <Box display="flex" className="h-screen bg-gray-50">
      <AdminNavigation siteName={settings?.siteName} />
      <Box flex="1" display="flex" flexDirection="column">
        <AdminHeader user={user} />
        <Box as="main" padding="8" flex="1" className="bg-white">
          {children}
        </Box>
      </Box>
    </Box>
  ) : null;
}
