import { Header } from '@/app/components/Header';
import { getMenuItems, getPages, getSiteSettings } from '@/app/lib/data-access';
import { getUser } from '@/app/lib/dal';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  // Fetch navigation data, user, and settings for header
  const [menuItems, pages, user, settings] = await Promise.all([
    getMenuItems({ visible: true }),
    getPages({ status: 'published' }),
    getUser(),
    getSiteSettings(),
  ]);

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
      />
      {children}
    </>
  );
}
