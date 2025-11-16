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
