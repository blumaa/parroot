'use server';

import { verifySession } from '@/app/lib/dal';
import { updateSiteSettings } from '@/app/lib/data-access';
import { revalidatePath } from 'next/cache';

export async function updateSettings(formData: FormData) {
  const { userId } = await verifySession();

  const siteName = formData.get('siteName') as string;
  const siteDescription = formData.get('siteDescription') as string;
  const contactEmail = formData.get('contactEmail') as string;
  const logoUrl = formData.get('logoUrl') as string;
  const logoSize = formData.get('logoSize') as string;
  const faviconUrl = formData.get('faviconUrl') as string;
  const stickyHeader = formData.get('stickyHeader') === 'true';
  const siteNameSize = formData.get('siteNameSize') as string;
  const paypalClientId = formData.get('paypalClientId') as string;
  const paypalMode = formData.get('paypalMode') as 'sandbox' | 'production';
  const googleAnalyticsId = formData.get('googleAnalyticsId') as string;

  try {
    const settingsData: Record<string, string | boolean> = {
      siteName,
      siteDescription,
      contactEmail,
      stickyHeader,
      paypalMode: paypalMode || 'sandbox',
    };

    // Only include optional fields if they have values
    if (logoUrl) {
      settingsData.logoUrl = logoUrl;
    }
    if (logoSize) {
      settingsData.logoSize = logoSize;
    }
    if (faviconUrl) {
      settingsData.faviconUrl = faviconUrl;
    }
    if (siteNameSize) {
      settingsData.siteNameSize = siteNameSize;
    }
    if (paypalClientId) {
      settingsData.paypalClientId = paypalClientId;
    }
    if (googleAnalyticsId) {
      settingsData.googleAnalyticsId = googleAnalyticsId;
    }

    await updateSiteSettings(settingsData, userId);

    // Revalidate all pages that use settings
    revalidatePath('/admin/settings');
    revalidatePath('/', 'page');
    revalidatePath('/[slug]', 'page');
    revalidatePath('/admin', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Failed to update settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}
