'use server';

import { getAdminDb } from '@/app/lib/firebase-admin';

export interface FormSubmission {
  id: string;
  data: Record<string, string>;
  recipientEmail: string;
  submittedAt: string;
  read: boolean;
}

export async function getFormSubmissions(): Promise<FormSubmission[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('formSubmissions')
      .orderBy('submittedAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<FormSubmission, 'id'>),
    }));
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    return [];
  }
}

export async function deleteFormSubmission(id: string): Promise<boolean> {
  try {
    const db = getAdminDb();
    await db.collection('formSubmissions').doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting form submission:', error);
    return false;
  }
}

export async function markFormSubmissionAsRead(id: string): Promise<boolean> {
  try {
    const db = getAdminDb();
    await db.collection('formSubmissions').doc(id).update({
      read: true,
    });
    return true;
  } catch (error) {
    console.error('Error marking form submission as read:', error);
    return false;
  }
}
