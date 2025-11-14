'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, Button, Heading } from '@mond-design-system/theme';

interface AdminNavigationProps {
  siteName?: string;
}

export function AdminNavigation({ siteName = 'Parroot' }: AdminNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Pages', href: '/admin/pages' },
    { label: 'Segments', href: '/admin/segments' },
    { label: 'Navigation', href: '/admin/navigation' },
    { label: 'Settings', href: '/admin/settings' },
    { label: 'Mailbox', href: '/admin/mailbox' },
  ];

  return (
    <Box
      as="nav"
      padding="6"
      display="flex"
      flexDirection="column"
      gap="lg"
      className="bg-gray-50 border-r border-gray-200 w-64"
    >
      <Heading level={2}>{siteName} Admin</Heading>
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
