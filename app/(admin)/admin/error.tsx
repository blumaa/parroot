'use client';

import { useEffect } from 'react';
import { Box, Button, Heading, Text } from '@mond-design-system/theme';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin panel error:', error);
  }, [error]);

  return (
    <Box
      padding="8"
      className="flex flex-col items-center justify-center"
    >
      <Box className="flex flex-col gap-4 text-center max-w-md">
        <Heading level={2}>Admin Panel Error</Heading>
        <Text variant="body" semantic="secondary">
          An error occurred in the admin panel. Please try again.
        </Text>
        {error.digest && (
          <Text variant="body-sm" semantic="tertiary">
            Error ID: {error.digest}
          </Text>
        )}
        <Box marginTop="4" className="flex gap-2 justify-center">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/admin'}>
            Go to Dashboard
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
