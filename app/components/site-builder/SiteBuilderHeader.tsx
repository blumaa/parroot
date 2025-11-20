'use client';

import { Box, Heading } from '@mond-design-system/theme';

export function SiteBuilderHeader() {
  return (
    <Box padding="4" display="flex" alignItems="center">
      <Heading level={2} size="2xl">
        Site Builder
      </Heading>
    </Box>
  );
}
