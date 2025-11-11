'use client';

import { useState } from 'react';
import { Box, Button, Heading, Text } from '@mond-design-system/theme';
import { Input, Select } from '@mond-design-system/theme/client';
import type { SiteSettings } from '@/app/utils/firestore-settings';
import { updateSettings } from '@/app/actions/settings';
import { useToast } from '@/app/providers/ToastProvider';

interface SettingsFormProps {
  settings: SiteSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const { showSuccess, showError } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [paypalMode, setPaypalMode] = useState<'sandbox' | 'production'>(settings.paypalMode || 'sandbox');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateSettings(formData);

    setIsSaving(false);

    if (result.success) {
      showSuccess('Settings saved successfully!');
    } else {
      showError(result.error || 'Failed to save settings');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* General Settings */}
      <Box marginBottom="8">
        <Box marginBottom="4">
          <Heading level={2} size="2xl">
            General Settings
          </Heading>
        </Box>

        <Box display="flex" flexDirection="column" gap="md">
          <Box>
            <Input
              id="siteName"
              name="siteName"
              type="text"
              label="Site Name"
              defaultValue={settings.siteName}
              required
            />
          </Box>

          <Box>
            <Input
              id="siteDescription"
              name="siteDescription"
              type="text"
              label="Site Description"
              defaultValue={settings.siteDescription}
            />
          </Box>

          <Box>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              label="Contact Email"
              defaultValue={settings.contactEmail}
            />
          </Box>

          <Box>
            <Input
              id="logoUrl"
              name="logoUrl"
              type="text"
              label="Logo URL"
              defaultValue={settings.logoUrl || ''}
              placeholder="https://example.com/logo.png"
              helperText="URL to your site logo image"
            />
          </Box>

          <Box>
            <Input
              id="faviconUrl"
              name="faviconUrl"
              type="text"
              label="Favicon URL"
              defaultValue={settings.faviconUrl || ''}
              placeholder="https://example.com/favicon.ico"
              helperText="URL to your site favicon"
            />
          </Box>
        </Box>
      </Box>

      {/* Integrations */}
      <Box marginBottom="8">
        <Box marginBottom="4">
          <Heading level={2} size="2xl">
            Integrations
          </Heading>
        </Box>

        <Box display="flex" flexDirection="column" gap="md">
          <Box>
            <Input
              id="googleAnalyticsId"
              name="googleAnalyticsId"
              type="text"
              label="Google Analytics ID"
              defaultValue={settings.googleAnalyticsId || ''}
              placeholder="G-XXXXXXXXXX"
              helperText="Optional: Enter your Google Analytics measurement ID"
            />
          </Box>

          <Box>
            <Input
              id="paypalClientId"
              name="paypalClientId"
              type="text"
              label="PayPal Client ID"
              defaultValue={settings.paypalClientId || ''}
              helperText="Optional: For PayPal donation integration"
            />
          </Box>

          <Box>
            <Select
              id="paypalMode"
              label="PayPal Mode"
              value={paypalMode}
              onChange={(value) => setPaypalMode(value as 'sandbox' | 'production')}
              options={[
                { value: 'sandbox', label: 'Sandbox (Testing)' },
                { value: 'production', label: 'Production (Live)' },
              ]}
              helperText="Use sandbox mode for testing, production for live transactions"
            />
            <input type="hidden" name="paypalMode" value={paypalMode} />
          </Box>
        </Box>
      </Box>

      {/* Save Button */}
      <Box display="flex" gap="md">
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </form>
  );
}
