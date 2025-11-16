'use server';

import { revalidatePath } from 'next/cache';
import { verifySession } from '@/app/lib/dal';
import { getAdminDb } from '@/app/lib/firebase-admin';
import { getSegments, getSegmentById } from '@/app/lib/data-access';
import type { SegmentType } from '@/app/types';

export async function getSegmentsAction() {
  await verifySession();
  return await getSegments();
}

export async function getSegmentByIdAction(segmentId: string) {
  await verifySession();
  return await getSegmentById(segmentId);
}

export async function deleteSegmentAction(segmentId: string) {
  await verifySession();

  try {
    const db = getAdminDb();
    await db.collection('segments').doc(segmentId).delete();

    revalidatePath('/admin/segments');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Error deleting segment:', error);
    return { success: false, error: 'Failed to delete segment' };
  }
}

export async function createSegmentAction(data: {
  type: SegmentType;
  name: string;
  config: Record<string, unknown>;
  content?: Record<string, unknown>;
  status: 'draft' | 'published';
}) {
  const { userId } = await verifySession();

  try {
    const db = getAdminDb();
    const now = new Date();

    const segmentData = {
      ...data,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    };

    const docRef = await db.collection('segments').add(segmentData);

    revalidatePath('/admin/segments');
    revalidatePath('/admin');

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating segment:', error);
    return { success: false, error: 'Failed to create segment' };
  }
}

export async function updateSegmentAction(
  segmentId: string,
  data: Partial<{
    type: SegmentType;
    name: string;
    config: Record<string, unknown>;
    content?: Record<string, unknown>;
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

    await db.collection('segments').doc(segmentId).update(updateData);

    revalidatePath('/admin/segments');
    revalidatePath('/admin');
    revalidatePath(`/admin/segments/${segmentId}/edit`);

    return { success: true };
  } catch (error) {
    console.error('Error updating segment:', error);
    return { success: false, error: 'Failed to update segment' };
  }
}
