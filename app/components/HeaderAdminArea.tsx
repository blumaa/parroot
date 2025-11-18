'use client';

import { Box } from '@mond-design-system/theme';
import { LightSwitch } from './LightSwitch';
import { HeaderAuthButtons } from './HeaderAuthButtons';
import { NotificationBell } from './admin/NotificationBell';

interface HeaderAdminAreaProps {
  user: { id: string; email: string } | null;
}

export function HeaderAdminArea({ user }: HeaderAdminAreaProps) {
  return (
    <Box display="flex" alignItems="center" gap="sm">
      <LightSwitch />
      {user && <NotificationBell />}
      <HeaderAuthButtons user={user} />
    </Box>
  );
}
