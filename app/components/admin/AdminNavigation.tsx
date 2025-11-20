'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, Button, Heading } from '@mond-design-system/theme';

interface AdminNavigationProps {
  siteName?: string;
  hasPostsSegments: boolean;
  hasFormSubmissions: boolean;
}

export function AdminNavigation({
  siteName = 'Parroot',
  hasPostsSegments,
  hasFormSubmissions,
}: AdminNavigationProps) {
  const pathname = usePathname();

  const allNavItems = [
    { label: 'Dashboard', href: '/admin', alwaysShow: true },
    { label: 'Site Builder', href: '/admin/site-builder', alwaysShow: true },
    { label: 'Posts', href: '/admin/posts', alwaysShow: false, condition: hasPostsSegments },
    { label: 'Mailbox', href: '/admin/mailbox', alwaysShow: false, condition: hasFormSubmissions },
    { label: 'Site Settings', href: '/admin/settings', alwaysShow: true },
  ];

  // Filter nav items based on conditional display
  const navItems = allNavItems.filter(
    (item) => item.alwaysShow || item.condition
  );

  return (
    <Box
      as="nav"
      padding="6"
      display="flex"
      flexDirection="column"
      gap="lg"
      border="default"
    >
      <Box display="flex" flexDirection="column" gap="md" alignItems="center">
        <Heading level={2}>{siteName} Admin</Heading>
      </Box>
      <Box display="flex" flexDirection="column" gap="sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="no-underline">
              <Button
                variant={isActive ? 'primary' : 'ghost'}
                fullWidth
              >
                {item.label}
              </Button>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}
