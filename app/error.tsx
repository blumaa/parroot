'use client';

import { useEffect } from 'react';
import { Box, Button, Heading, Text } from '@mond-design-system/theme';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <Box
      padding="8"
      className="flex flex-col items-center justify-center min-h-screen"
    >
      <Box className="flex flex-col gap-4 text-center max-w-md">
        <Heading level={1}>Something went wrong</Heading>
        <Text variant="body" semantic="secondary">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </Text>
        {error.digest && (
          <Text variant="body-sm" semantic="tertiary">
            Error ID: {error.digest}
          </Text>
        )}
        <Box marginTop="4">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
