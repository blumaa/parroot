'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, Text, Button, Heading } from '@mond-design-system/theme';
import { HeaderAdminArea } from '@/app/components/HeaderAdminArea';
import type { UserData } from '@/app/lib/dal';

interface AdminHeaderProps {
  user: UserData;
  siteName?: string;
  hasPostsSegments: boolean;
  hasFormSegments: boolean;
}

export function AdminHeader({
  user,
  siteName = 'Parroot',
  hasPostsSegments,
  hasFormSegments,
}: AdminHeaderProps) {
  const pathname = usePathname();

  const allNavItems = [
    { label: 'Dashboard', href: '/admin', alwaysShow: true },
    { label: 'Site Builder', href: '/admin/site-builder', alwaysShow: true },
    { label: 'Posts', href: '/admin/posts', alwaysShow: false, condition: hasPostsSegments },
    { label: 'Mailbox', href: '/admin/mailbox', alwaysShow: false, condition: hasFormSegments },
    { label: 'Site Settings', href: '/admin/settings', alwaysShow: true },
  ];

  // Filter nav items based on conditional display
  const navItems = allNavItems.filter(
    (item) => item.alwaysShow || item.condition
  );

  return (
    <Box
      as="header"
      padding="4"
      className="flex items-center justify-between bg-white border-b border-gray-200"
    >
      <Box display="flex" alignItems="center" gap="lg">
        <Heading level={3} size="md">{siteName}</Heading>
        <Box display="flex" gap="sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="no-underline">
                <Button
                  variant={isActive ? 'primary' : 'ghost'}
                  size="sm"
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap="md">
        <Text variant="body" semantic="secondary">{user.email}</Text>
        <HeaderAdminArea user={user} hasFormSegments={hasFormSegments} />
      </Box>
    </Box>
  );
}
