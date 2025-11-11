'use client';

import { Box, Text } from '@mond-design-system/theme';
import { HeaderAdminArea } from '@/app/components/HeaderAdminArea';
import type { UserData } from '@/app/lib/dal';

interface AdminHeaderProps {
  user: UserData;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <Box
      as="header"
      padding="4"
      className="flex items-center justify-between bg-white border-b border-gray-200"
    >
      <Text variant="body">{user.email}</Text>
      <HeaderAdminArea user={user} />
    </Box>
  );
}
