'use client';

import { Box } from '@mond-design-system/theme';
import { PageCanvas } from './PageCanvas';
import { PageDrawer } from './PageDrawer';
import { SegmentDrawer } from './SegmentDrawer';
import { MenuSettingsDrawer } from './MenuSettingsDrawer';

export function BuilderLayout() {
  return (
    <Box display="flex" flex="1" width="full" border='default' padding='4'>
      <Box flex="1" display="flex" flexDirection="column">
        <PageCanvas />
      </Box>

      <PageDrawer />
      <SegmentDrawer />
      <MenuSettingsDrawer />
    </Box>
  );
}
