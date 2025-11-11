import { Box, Spinner } from '@mond-design-system/theme';

export default function LoginLoading() {
  return (
    <Box className="flex justify-center items-center h-screen">
      <Spinner size="lg" label="Loading..." />
    </Box>
  );
}
