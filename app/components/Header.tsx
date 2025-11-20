"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, Button, Heading, Icon } from "@mond-design-system/theme";
import {
  Avatar,
  Popover,
  Drawer,
  DrawerHeader,
  DrawerBody,
} from "@mond-design-system/theme/client";
import type { MenuItem, Page, HeadingSize, AvatarSize } from "@/app/types";
import { HeaderAdminArea } from "./HeaderAdminArea";
import "./header.css";

interface HeaderProps {
  menuItems: MenuItem[];
  pages: Page[];
  user: { id: string; email: string } | null;
  siteName?: string;
  logoUrl?: string;
  logoSize?: AvatarSize;
  stickyHeader?: boolean;
  siteNameSize?: HeadingSize;
  isPreview?: boolean;
  onPageSelect?: (pageId: string) => void;
  selectedPageId?: string | null;
  hasFormSegments?: boolean;
}

export function Header({
  menuItems,
  pages,
  user,
  siteName = "Parroot",
  logoUrl,
  logoSize = "2xl",
  stickyHeader = false,
  siteNameSize = "md",
  isPreview = false,
  onPageSelect,
  selectedPageId,
  hasFormSegments = false,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Create a map of pageId to page for quick lookup
  const pageMap = new Map(pages.map((page) => [page.id, page]));

  // Helper to get page from menu item
  const getPage = (item: MenuItem) => pageMap.get(item.pageId);

  // Filter visible top-level items and ensure their pages exist
  const visibleItems = menuItems.filter(
    (item) => item.visible && getPage(item),
  );

  // Helper to filter visible children
  const getVisibleChildren = (item: MenuItem) => {
    if (!item.children) return [];
    return item.children.filter((child) => child.visible && getPage(child));
  };

  // Render a desktop menu item with optional popover submenu
  const renderDesktopMenuItem = (item: MenuItem) => {
    const page = getPage(item);
    if (!page) return null;

    const visibleChildren = getVisibleChildren(item);
    const hasSubmenu = visibleChildren.length > 0;

    const isSelected = selectedPageId === page.id;

    if (hasSubmenu) {
      // Menu item with submenu - wrap the button in a popover
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
                const childPage = getPage(child);
                if (!childPage) return null;
                const isChildSelected = selectedPageId === childPage.id;

                if (isPreview) {
                  return (
                    <Button
                      key={child.id}
                      variant={child.variant}
                      size={child.size}
                      fullWidth
                      onClick={() => {
                        onPageSelect?.(childPage.id);
                        setOpenSubmenu(null);
                      }}
                    >
                      {childPage.title}
                    </Button>
                  );
                }

                return (
                  <Link
                    key={child.id}
                    href={`/${childPage.slug}`}
                    className="no-underline"
                    onClick={() => setOpenSubmenu(null)}
                  >
                    <Button variant={child.variant} size={child.size} fullWidth>
                      {childPage.title}
                    </Button>
                  </Link>
                );
              })}
            </Box>
          }
        >
          {isPreview ? (
            <Button
              variant={item.variant}
              size={item.size}
              onClick={() => onPageSelect?.(page.id)}
            >
              {page.title}
            </Button>
          ) : (
            <Link href={`/${page.slug}`} className="no-underline">
              <Button variant={item.variant} size={item.size}>
                {page.title}
              </Button>
            </Link>
          )}
        </Popover>
      );
    }

    // Regular menu item without submenu
    if (isPreview) {
      return (
        <Button
          key={item.id}
          variant={item.variant}
          size={item.size}
          onClick={() => onPageSelect?.(page.id)}
        >
          {page.title}
        </Button>
      );
    }

    return (
      <Link key={item.id} href={`/${page.slug}`} className="no-underline">
        <Button variant={item.variant} size={item.size}>
          {page.title}
        </Button>
      </Link>
    );
  };

  // Render a mobile menu item (inside drawer) with accordion-style submenus
  const renderMobileMenuItem = (item: MenuItem) => {
    const page = getPage(item);
    if (!page) return null;

    const visibleChildren = getVisibleChildren(item);
    const hasSubmenu = visibleChildren.length > 0;
    const isSelected = selectedPageId === page.id;

    if (hasSubmenu) {
      // Menu item with submenu - show parent + indented children
      return (
        <Box key={item.id} display="flex" flexDirection="column" gap="xs">
          {isPreview ? (
            <Button
              variant={item.variant}
              size={item.size}
              fullWidth
              onClick={() => {
                onPageSelect?.(page.id);
                setMobileMenuOpen(false);
              }}
            >
              {page.title}
            </Button>
          ) : (
            <Link
              href={`/${page.slug}`}
              className="no-underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant={item.variant} size={item.size} fullWidth>
                {page.title}
              </Button>
            </Link>
          )}
          <Box paddingLeft="4" display="flex" flexDirection="column" gap="xs">
            {visibleChildren.map((child) => {
              const childPage = getPage(child);
              if (!childPage) return null;
              const isChildSelected = selectedPageId === childPage.id;

              if (isPreview) {
                return (
                  <Button
                    key={child.id}
                    variant={child.variant}
                    size={child.size}
                    fullWidth
                    onClick={() => {
                      onPageSelect?.(childPage.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {childPage.title}
                  </Button>
                );
              }

              return (
                <Link
                  key={child.id}
                  href={`/${childPage.slug}`}
                  className="no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant={child.variant} size={child.size} fullWidth>
                    {childPage.title}
                  </Button>
                </Link>
              );
            })}
          </Box>
        </Box>
      );
    }

    // Regular menu item without submenu
    if (isPreview) {
      return (
        <Button
          key={item.id}
          variant={item.variant}
          size={item.size}
          fullWidth
          onClick={() => {
            onPageSelect?.(page.id);
            setMobileMenuOpen(false);
          }}
        >
          {page.title}
        </Button>
      );
    }

    return (
      <Link
        key={item.id}
        href={`/${page.slug}`}
        className="no-underline"
        onClick={() => setMobileMenuOpen(false)}
      >
        <Button variant={item.variant} size={item.size} fullWidth>
          {page.title}
        </Button>
      </Link>
    );
  };

  return (
    <Box
      as="header"
      className={`border-b border-gray-200 bg-white${stickyHeader ? " sticky-header" : ""}`}
      padding="4"
      marginBottom="2"
    >
      <Box className="container mx-auto px-4">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          className="h-16"
        >
          {/* Logo/Site Title */}
          <Link href="/" className="no-underline">
            <Box display="flex" alignItems="center" gap="sm">
              {logoUrl && (
                <Avatar
                  src={logoUrl}
                  alt={siteName}
                  fallback={siteName}
                  size={logoSize}
                />
              )}
              <Heading level={3} size={siteNameSize}>{siteName}</Heading>
            </Box>
          </Link>

          {/* Desktop Navigation & Admin Area */}
          <Box
            className="desktop-nav"
            display="flex"
            alignItems="center"
            gap="md"
          >
            <Box as="nav" display="flex" gap="xs">
              {visibleItems.map(renderDesktopMenuItem)}
            </Box>
            <HeaderAdminArea user={user} hasFormSegments={hasFormSegments} />
          </Box>

          {/* Mobile: Hamburger Button */}
          <Box className="mobile-nav">
            <Button
              variant="outline"
              onClick={() => setMobileMenuOpen(true)}
              iconOnly
            >
              <Icon color="currentColor">
                <svg
                  width="100%"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="48"
                    height="48"
                    fillOpacity="0.01"
                  />
                  <path
                    d="M7.94977 11.9498H39.9498"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.94977 23.9498H39.9498"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.94977 35.9498H39.9498"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Icon>
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        position="right"
        width="md"
      >
        <DrawerHeader onClose={() => setMobileMenuOpen(false)}>
          <HeaderAdminArea user={user} hasFormSegments={hasFormSegments} />
        </DrawerHeader>
        <DrawerBody>
          <Box display="flex" flexDirection="column" gap="lg">
            {/* Navigation Items */}
            <Box display="flex" flexDirection="column" gap="sm">
              {visibleItems.map(renderMobileMenuItem)}
            </Box>
          </Box>
        </DrawerBody>
      </Drawer>
    </Box>
  );
}
