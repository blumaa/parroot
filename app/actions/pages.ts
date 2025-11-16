'use server';

import { revalidatePath } from 'next/cache';
import { verifySession } from '@/app/lib/dal';
import { getAdminDb } from '@/app/lib/firebase-admin';
import { getPages, getPageById, getPageBySlug } from '@/app/lib/data-access';

export async function getPagesAction() {
  await verifySession();
  return await getPages();
}

export async function getPageByIdAction(pageId: string) {
  await verifySession();
  return await getPageById(pageId);
}

export async function deletePageAction(pageId: string) {
  await verifySession();

  try {
    const db = getAdminDb();
    await db.collection('pages').doc(pageId).delete();

    revalidatePath('/admin/pages');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Error deleting page:', error);
    return { success: false, error: 'Failed to delete page' };
  }
}

export async function createPageAction(data: {
  title: string;
  slug: string;
  description?: string;
  segments: string[];
  status: 'draft' | 'published';
}) {
  const { userId } = await verifySession();

  try {
    const db = getAdminDb();
    const now = new Date();

    const pageData = {
      ...data,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    };

    const docRef = await db.collection('pages').add(pageData);

    revalidatePath('/admin/pages');
    revalidatePath('/admin');

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating page:', error);
    return { success: false, error: 'Failed to create page' };
  }
}

export async function updatePageAction(
  pageId: string,
  data: Partial<{
    title: string;
    slug: string;
    description: string;
    segments: string[];
    status: 'draft' | 'published';
  }>
) {
  const { userId } = await verifySession();

  try {
    const db = getAdminDb();
    const updateData = {
      ...data,
      updatedAt: new Date(),
      updatedBy: userId,
    };

    await db.collection('pages').doc(pageId).update(updateData);

    revalidatePath('/admin/pages');
    revalidatePath('/admin');
    revalidatePath(`/${data.slug}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating page:', error);
    return { success: false, error: 'Failed to update page' };
  }
}

/**
 * Check if slug is unique (excluding current page ID)
 */
export async function checkSlugUniqueAction(slug: string, excludeId?: string): Promise<boolean> {
  await verifySession();

  const existingPage = await getPageBySlug(slug);
  if (!existingPage) {
    return true;
  }
  return excludeId ? existingPage.id === excludeId : false;
}
