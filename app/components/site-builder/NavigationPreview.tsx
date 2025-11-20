'use client';

import { useState } from 'react';
import { Box, Button, Text, Divider, Heading, Spinner } from '@mond-design-system/theme';
import { Popover } from '@mond-design-system/theme/client';
import { useSiteBuilder } from '@/app/contexts/SiteBuilderContext';
import { usePages, useMenuItems } from '@/app/hooks/useSiteBuilderData';
import type { MenuItem } from '@/app/types';
import { useEffect } from 'react';

export function NavigationPreview() {
  const {
    selectedPageId,
    setSelectedPageId,
    openMenuSettings,
  } = useSiteBuilder();

  const { data: pages, isLoading: pagesLoading } = usePages();
  const { data: menuItems, isLoading: menuLoading } = useMenuItems();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

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

  if (pagesLoading || menuLoading) {
    return (
      <>
        <Box padding="4" display="flex" alignItems="center" justifyContent="center">
          <Spinner />
        </Box>
        <Divider />
      </>
    );
  }

  const pageMap = new Map(pages?.map((page) => [page.id, page]) || []);
  const visibleItems = menuItems?.filter((item) => item.visible && pageMap.get(item.pageId)) || [];

  const getVisibleChildren = (item: MenuItem) => {
    if (!item.children) return [];
    return item.children.filter((child) => child.visible && pageMap.get(child.pageId));
  };

  const renderMenuItem = (item: MenuItem) => {
    const page = pageMap.get(item.pageId);
    if (!page) return null;

    const visibleChildren = getVisibleChildren(item);
    const hasSubmenu = visibleChildren.length > 0;
    const isSelected = selectedPageId === page.id;

    if (hasSubmenu) {
      return (
        <Popover
          key={item.id}
          isOpen={openSubmenu === item.id}
          onOpenChange={(isOpen) => setOpenSubmenu(isOpen ? item.id : null)}
          placement="bottom-start"
          trigger="hover"
          content={
            <Box display="flex" flexDirection="column" gap="xs" padding="2">
              {visibleChildren.map((child) => {
                const childPage = pageMap.get(child.pageId);
                if (!childPage) return null;
                const isChildSelected = selectedPageId === childPage.id;

                return (
                  <Button
                    key={child.id}
                    variant={child.variant}
                    size={child.size}
                    fullWidth
                    onClick={() => {
                      setSelectedPageId(childPage.id);
                      setOpenSubmenu(null);
                    }}
                  >
                    {childPage.title}
                  </Button>
                );
              })}
            </Box>
          }
        >
          <Button
            variant={item.variant}
            size={item.size}
            onClick={() => setSelectedPageId(page.id)}
          >
            {page.title}
          </Button>
        </Popover>
      );
    }

    return (
      <Button
        key={item.id}
        variant={item.variant}
        size={item.size}
        onClick={() => setSelectedPageId(page.id)}
      >
        {page.title}
      </Button>
    );
  };

  return (
    <>
      <Box padding="4" display="flex" alignItems="center" justifyContent="space-between" gap="md" border='default' marginBottom='4'>
        <Box display="flex" alignItems="center" gap="sm">
          {/* <Heading level={4} size="sm">Navigation</Heading> */}
          {visibleItems.length > 0 ? (
            visibleItems.map(renderMenuItem)
          ) : (
            <Text variant="body" semantic="secondary">No menu items</Text>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap="sm">
          <Button variant="outline" size="sm" onClick={openMenuSettings}>
            Menu Settings
          </Button>
        </Box>
      </Box>
    </>
  );
}
