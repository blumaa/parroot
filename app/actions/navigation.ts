'use server';

import { revalidatePath } from 'next/cache';
import { verifySession } from '@/app/lib/dal';
import { getAdminDb } from '@/app/lib/firebase-admin';
import { getMenuItems } from '@/app/lib/data-access';

export async function getMenuItemsAction() {
  await verifySession();
  return await getMenuItems();
}

export async function deleteMenuItemAction(menuItemId: string) {
  await verifySession();

  try {
    const db = getAdminDb();
    await db.collection('navigation').doc(menuItemId).delete();

    revalidatePath('/admin/navigation');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return { success: false, error: 'Failed to delete menu item' };
  }
}

export async function createMenuItemAction(data: {
  pageId: string;
  label: string;
  visible: boolean;
  order: number;
  variant?: string;
  size?: string;
}) {
  const { userId } = await verifySession();

  try {
    const db = getAdminDb();
    const now = new Date();

    const menuItemData = {
      ...data,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    };

    const docRef = await db.collection('navigation').add(menuItemData);

    revalidatePath('/admin/navigation');
    revalidatePath('/');

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating menu item:', error);
    return { success: false, error: 'Failed to create menu item' };
  }
}

export async function updateMenuItemAction(
  menuItemId: string,
  data: Partial<{
    pageId: string;
    label: string;
    visible: boolean;
    order: number;
    variant?: string;
    size?: string;
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

    await db.collection('navigation').doc(menuItemId).update(updateData);

    revalidatePath('/admin/navigation');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error updating menu item:', error);
    return { success: false, error: 'Failed to update menu item' };
  }
}

export async function reorderMenuItemsAction(
  updates: Array<{ id: string; order: number }>
) {
  const { userId } = await verifySession();

  try {
    const db = getAdminDb();
    const batch = db.batch();

    updates.forEach((update) => {
      const docRef = db.collection('navigation').doc(update.id);
      batch.update(docRef, {
        order: update.order,
        updatedAt: new Date(),
        updatedBy: userId,
      });
    });

    await batch.commit();

    revalidatePath('/admin/navigation');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error reordering menu items:', error);
    return { success: false, error: 'Failed to reorder menu items' };
  }
}
