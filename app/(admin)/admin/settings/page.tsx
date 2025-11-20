import { Box } from '@mond-design-system/theme';
import { verifySession } from '@/app/lib/dal';
import { getSiteSettings, initializeDefaultSettings } from '@/app/lib/data-access';
import { SettingsForm } from '@/app/components/admin/SettingsForm';

export default async function SettingsPage() {
  const { userId } = await verifySession();
  let settings = await getSiteSettings();

  // Initialize default settings if they don't exist
  if (!settings) {
    await initializeDefaultSettings(userId);
    settings = await getSiteSettings();
  }

  return (
    <Box padding="6">
      {settings && <SettingsForm settings={settings} />}
    </Box>
  );
}
