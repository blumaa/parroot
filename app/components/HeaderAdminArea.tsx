"use client";

import { Box } from "@mond-design-system/theme";
import { LightSwitch } from "./LightSwitch";
import { HeaderAuthButtons } from "./HeaderAuthButtons";
import { NotificationBell } from "./admin/NotificationBell";

interface HeaderAdminAreaProps {
  user: { id: string; email: string } | null;
  hasFormSegments?: boolean;
}

export function HeaderAdminArea({ user, hasFormSegments = false }: HeaderAdminAreaProps) {
  return (
    <Box display="flex" gap="xxs">
      <Box display="flex">
        <LightSwitch />
        {user && hasFormSegments && <NotificationBell />}
      </Box>
      <HeaderAuthButtons user={user} />
    </Box>
  );
}
