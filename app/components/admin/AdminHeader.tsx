'use client';

import { Box, Text, Button } from '@mond-design-system/theme';
import { logout } from '@/app/actions/auth';
import type { UserData } from '@/app/lib/dal';

interface AdminHeaderProps {
  user: UserData;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const handleLogout = async () => {
    // Note: logout() calls redirect() which throws a special Next.js error
    // This is expected behavior - the redirect will happen and user will be sent to login
    await logout();
  };

  return (
    <Box
      as="header"
      padding="4"
      className="flex items-center justify-between bg-white border-b border-gray-200"
    >
      <Text variant="body">{user.email}</Text>
      <Button onClick={handleLogout} variant="outline">
        Logout
      </Button>
    </Box>
  );
}
