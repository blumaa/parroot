"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, Button, Heading } from "@mond-design-system/theme";
import {
  Avatar,
  Popover,
  Drawer,
  DrawerHeader,
  DrawerBody,
} from "@mond-design-system/theme/client";
import type { MenuItem, Page } from "@/app/types";
import { HeaderAdminArea } from "./HeaderAdminArea";
import "./header.css";

interface HeaderProps {
  menuItems: MenuItem[];
  pages: Page[];
  user: { id: string; email: string } | null;
  siteName?: string;
  logoUrl?: string;
  stickyHeader?: boolean;
}

export function Header({
  menuItems,
  pages,
  user,
  siteName = "Parroot",
  logoUrl,
  stickyHeader = false,
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

    if (hasSubmenu) {
      // Menu item with submenu - wrap the link in a popover
      // The popover triggers on hover, but click still navigates
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
          <Link href={`/${page.slug}`} className="no-underline">
            <Button variant={item.variant} size={item.size}>
              {page.title}
            </Button>
          </Link>
        </Popover>
      );
    }

    // Regular menu item without submenu
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

    if (hasSubmenu) {
      // Menu item with submenu - show parent + indented children
      return (
        <Box key={item.id} display="flex" flexDirection="column" gap="xs">
          <Link
            href={`/${page.slug}`}
            className="no-underline"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button variant={item.variant} size={item.size} fullWidth>
              {page.title}
            </Button>
          </Link>
          <Box paddingLeft="4" display="flex" flexDirection="column" gap="xs">
            {visibleChildren.map((child) => {
              const childPage = getPage(child);
              if (!childPage) return null;

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
                  size="lg"
                />
              )}
              <Heading level={3}>{siteName}</Heading>
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
            <HeaderAdminArea user={user} />
          </Box>

          {/* Mobile: Hamburger Button */}
          <Box className="mobile-nav">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
            >
              ☰
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
          <HeaderAdminArea user={user} />
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
