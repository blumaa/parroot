'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Button, Heading, Avatar } from '@mond-design-system/theme';
import type { MenuItem } from '@/app/utils/firestore-navigation';
import type { Page } from '@/app/utils/firestore-pages';
import { HeaderAdminArea } from './HeaderAdminArea';

interface HeaderProps {
  menuItems: MenuItem[];
  pages: Page[];
  user: { id: string; email: string } | null;
  siteName?: string;
  logoUrl?: string;
  stickyHeader?: boolean;
}

export function Header({ menuItems, pages, user, siteName = 'Parroot', logoUrl, stickyHeader = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Create a map of pageId to page for quick lookup
  const pageMap = new Map(pages.map((page) => [page.id, page]));

  // Filter visible items and get their page data
  const visibleItems = menuItems
    .filter((item) => item.visible)
    .map((item) => ({
      ...item,
      page: pageMap.get(item.pageId),
    }))
    .filter((item) => item.page); // Only show items with valid pages

  return (
    <Box as="header" className={`border-b border-gray-200 bg-white${stickyHeader ? ' sticky-header' : ''}`} padding='4' marginBottom='2'>
      <Box className="container mx-auto px-4">
        <Box display="flex" alignItems="center" justifyContent="space-between" className="h-16">
          {/* Logo/Site Title */}
          <Link href="/" className="no-underline">
            <Box display="flex" alignItems="center" gap="sm">
              {logoUrl && (
                <Avatar
                  src={logoUrl}
                  alt={siteName}
                  size="lg"
                />
              )}
              <Heading level={3}>{siteName}</Heading>
            </Box>
          </Link>

          {/* Desktop Navigation & Admin Area */}
          <Box display="flex" alignItems="center" gap="md">
            <Box as="nav" display='flex' gap='xs'>
              {visibleItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.page!.slug}`}
                  className="no-underline"
                >
                  <Button variant={item.variant} size={item.size} corners='rounded'>
                    {item.page!.title}
                  </Button>
                </Link>
              ))}
            </Box>
            <HeaderAdminArea user={user} />
          </Box>

          {/* Mobile Menu Button */}
          {/* <Box className="md:hidden"> */}
          {/*   <Button */}
          {/*     variant="outline" */}
          {/*     size="sm" */}
          {/*     onClick={() => setMobileMenuOpen(!mobileMenuOpen)} */}
          {/*   > */}
          {/*     {mobileMenuOpen ? '✕' : '☰'} */}
          {/*   </Button> */}
          {/* </Box> */}
        </Box>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <Box paddingBottom="4" className="md:hidden">
            <Box display="flex" flexDirection="column" gap="sm">
              {visibleItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.page!.slug}`}
                  className="no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant={item.variant} size={item.size} fullWidth>
                    {item.page!.title}
                  </Button>
                </Link>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
