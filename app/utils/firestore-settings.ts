import 'server-only';
import { getAdminDb } from '@/app/lib/firebase-admin';

export interface SiteSettings {
  id: string;
  // General Settings
  siteName: string;
  siteDescription: string;
  contactEmail: string;

  // PayPal Integration
  paypalClientId?: string;
  paypalMode?: 'sandbox' | 'production';

  // Analytics Integration
  googleAnalyticsId?: string;

  // Logo and Favicon (URLs to uploaded files)
  logoUrl?: string;
  faviconUrl?: string;

  // Timestamps
  updatedAt: Date;
  updatedBy: string;
}

const SETTINGS_DOC_ID = 'site-settings';

/**
 * Get site settings (singleton document)
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const db = getAdminDb();
    const settingsDoc = await db.collection('settings').doc(SETTINGS_DOC_ID).get();

    if (!settingsDoc.exists) {
      return null;
    }

    const data = settingsDoc.data();

    return {
      id: settingsDoc.id,
      siteName: data?.siteName || '',
      siteDescription: data?.siteDescription || '',
      contactEmail: data?.contactEmail || '',
      paypalClientId: data?.paypalClientId,
      paypalMode: data?.paypalMode || 'sandbox',
      googleAnalyticsId: data?.googleAnalyticsId,
      logoUrl: data?.logoUrl,
      faviconUrl: data?.faviconUrl,
      updatedAt: data?.updatedAt?.toDate() || new Date(),
      updatedBy: data?.updatedBy || '',
    };
  } catch (error) {
    console.error('Failed to get site settings:', error);
    return null;
  }
}

/**
 * Update site settings (creates if doesn't exist)
 */
export async function updateSiteSettings(
  settings: Partial<Omit<SiteSettings, 'id' | 'updatedAt'>>,
  userId: string
): Promise<void> {
  try {
    const db = getAdminDb();

    await db.collection('settings').doc(SETTINGS_DOC_ID).set(
      {
        ...settings,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to update site settings:', error);
    throw new Error('Failed to update site settings');
  }
}

/**
 * Initialize default site settings if they don't exist
 */
export async function initializeDefaultSettings(userId: string): Promise<void> {
  try {
    const existing = await getSiteSettings();
    if (existing) {
      return; // Settings already exist
    }

    await updateSiteSettings(
      {
        siteName: 'My Website',
        siteDescription: 'A website built with Parroot',
        contactEmail: '',
        paypalMode: 'sandbox',
      },
      userId
    );
  } catch (error) {
    console.error('Failed to initialize default settings:', error);
    throw new Error('Failed to initialize default settings');
  }
}
