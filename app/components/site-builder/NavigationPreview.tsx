'use client';

import { useEffect } from 'react';
import { useSiteBuilder } from '@/app/contexts/SiteBuilderContext';
import { usePages, useMenuItems, useSiteSettings, useSegments, useUser } from '@/app/hooks/useSiteBuilderData';
import { Header } from '@/app/components/Header';

export function NavigationPreview() {
  const {
    selectedPageId,
    setSelectedPageId,
  } = useSiteBuilder();

  const { data: pages, isLoading: pagesLoading } = usePages();
  const { data: menuItems, isLoading: menuLoading } = useMenuItems();
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const { data: segments, isLoading: segmentsLoading } = useSegments();
  const { data: user, isLoading: userLoading } = useUser();

  // Auto-select first visible menu item's page if none selected
  useEffect(() => {
    if (!selectedPageId && pages && menuItems) {
      const pageMap = new Map(pages.map((page) => [page.id, page]));
      const visibleItems = menuItems.filter((item) => item.visible && pageMap.get(item.pageId));

      if (visibleItems.length > 0) {
        setSelectedPageId(visibleItems[0].pageId);
      }
    }
  }, [selectedPageId, pages, menuItems, setSelectedPageId]);

  if (pagesLoading || menuLoading || settingsLoading || segmentsLoading || userLoading || !pages || !menuItems) {
    return null;
  }

  // Check if there are any form segments
  const hasFormSegments = segments?.some((segment) => segment.type === 'form') || false;

  return (
    <Header
      menuItems={menuItems}
      pages={pages}
      user={user || null}
      siteName={settings?.siteName}
      logoUrl={settings?.logoUrl}
      logoSize={settings?.logoSize}
      siteNameSize={settings?.siteNameSize}
      stickyHeader={settings?.stickyHeader}
      hasFormSegments={hasFormSegments}
      isPreview={true}
      onPageSelect={setSelectedPageId}
      selectedPageId={selectedPageId}
    />
  );
}
