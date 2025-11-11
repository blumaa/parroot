'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Button } from '@mond-design-system/theme';
import { logout } from '@/app/actions/auth';

interface HeaderAuthButtonsProps {
  user: { id: string; email: string } | null;
}

export function HeaderAuthButtons({ user }: HeaderAuthButtonsProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  if (user) {
    return (
      <Box display="flex" alignItems="center" gap="sm">
        <Link href="/admin" className="no-underline">
          <Button variant="outline" size="sm">
            Admin
          </Button>
        </Link>
        <Button
          variant="primary"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </Box>
    );
  }

  return (
    <Link href="/login" className="no-underline">
      <Button variant="primary" size="sm">
        Login
      </Button>
    </Link>
  );
}
