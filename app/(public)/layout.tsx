import { Header } from '@/app/components/Header';
import { getMenuItems, getPages, getSiteSettings, getSegments } from '@/app/lib/data-access';
import { getUser } from '@/app/lib/dal';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  // Fetch navigation data, user, and settings for header
  const [menuItems, pages, user, settings, allSegments] = await Promise.all([
    getMenuItems({ visible: true }),
    getPages({ status: 'published' }),
    getUser(),
    getSiteSettings(),
    getSegments(),
  ]);

  // Check if there are any form segments
  const hasFormSegments = allSegments.some(
    (segment) => segment.type === 'form'
  );

  return (
    <>
      <Header
        menuItems={menuItems}
        pages={pages}
        user={user}
        siteName={settings?.siteName}
        logoUrl={settings?.logoUrl}
        logoSize={settings?.logoSize}
        stickyHeader={settings?.stickyHeader}
        siteNameSize={settings?.siteNameSize}
        hasFormSegments={hasFormSegments}
      />
      {children}
    </>
  );
}
