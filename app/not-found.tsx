import Link from 'next/link';
import { Box, Button, Heading, Text } from '@mond-design-system/theme';

export default function NotFound() {
  return (
    <Box
      padding="8"
      className="flex flex-col items-center justify-center min-h-screen"
    >
      <Box className="flex flex-col gap-4 text-center max-w-md">
        <Heading level={1}>404</Heading>
        <Heading level={2}>Page Not Found</Heading>
        <Text variant="body" semantic="secondary">
          The page you are looking for does not exist or has been moved.
        </Text>
        <Box marginTop="4">
          <Link href="/">
            <Button variant="primary">Go Home</Button>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
