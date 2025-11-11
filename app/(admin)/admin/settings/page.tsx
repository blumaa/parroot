import { unstable_noStore as noStore } from 'next/cache';
import { Box, Heading, Text } from '@mond-design-system/theme';
import { requireAdmin } from '@/app/lib/dal';
import { getSiteSettings, initializeDefaultSettings } from '@/app/utils/firestore-settings';
import { SettingsForm } from '@/app/components/admin/SettingsForm';

export default async function SettingsPage() {
  noStore();

  const user = await requireAdmin();
  let settings = await getSiteSettings();

  // Initialize default settings if they don't exist
  if (!settings) {
    await initializeDefaultSettings(user.id);
    settings = await getSiteSettings();
  }

  return (
    <Box padding="6">
      <Box marginBottom="6">
        <Heading level={1} size="3xl">
          Site Settings
        </Heading>
        <Text variant="body" semantic="secondary">
          Manage your site configuration and integrations
        </Text>
      </Box>

      {settings && <SettingsForm settings={settings} />}
    </Box>
  );
}
