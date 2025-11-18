'use server';

import { revalidatePath } from 'next/cache';
import { verifySession } from '@/app/lib/dal';
import { getAdminDb } from '@/app/lib/firebase-admin';
import type { FormSubmission } from '@/app/types';

export async function getFormSubmissionsAction(): Promise<FormSubmission[]> {
  await verifySession();

  const db = getAdminDb();
  const snapshot = await db
    .collection('formSubmissions')
    .orderBy('submittedAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    submittedAt: new Date(doc.data().submittedAt),
  })) as FormSubmission[];
}

export async function getUnreadCountAction(): Promise<number> {
  await verifySession();

  const db = getAdminDb();
  const snapshot = await db
    .collection('formSubmissions')
    .where('read', '==', false)
    .get();

  return snapshot.size;
}

export async function getUnreadSubmissionsAction(limit: number = 10): Promise<FormSubmission[]> {
  await verifySession();

  const db = getAdminDb();
  const snapshot = await db
    .collection('formSubmissions')
    .where('read', '==', false)
    .orderBy('submittedAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    submittedAt: new Date(doc.data().submittedAt),
  })) as FormSubmission[];
}

export async function markSubmissionAsReadAction(id: string) {
  await verifySession();

  try {
    const db = getAdminDb();
    await db.collection('formSubmissions').doc(id).update({
      read: true,
    });

    revalidatePath('/admin/mailbox');

    return { success: true };
  } catch (error) {
    console.error('Error marking submission as read:', error);
    return { success: false, error: 'Failed to mark submission as read' };
  }
}

export async function markAllAsReadAction() {
  await verifySession();

  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('formSubmissions')
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();

    revalidatePath('/admin/mailbox');

    return { success: true };
  } catch (error) {
    console.error('Error marking all as read:', error);
    return { success: false, error: 'Failed to mark all as read' };
  }
}

export async function deleteFormSubmissionAction(id: string) {
  await verifySession();

  try {
    const db = getAdminDb();
    await db.collection('formSubmissions').doc(id).delete();

    revalidatePath('/admin/mailbox');

    return { success: true };
  } catch (error) {
    console.error('Error deleting form submission:', error);
    return { success: false, error: 'Failed to delete submission' };
  }
}
