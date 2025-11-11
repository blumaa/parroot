import { Box, Spinner } from '@mond-design-system/theme';

export default function AdminLoading() {
  return (
    <Box
      padding="8"
      className="flex flex-col items-center justify-center"
    >
      <Spinner size="lg" label="Loading admin..." />
    </Box>
  );
}
