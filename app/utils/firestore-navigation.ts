import { getFirebaseDb } from './firebase';
import type { Timestamp } from 'firebase/firestore';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface MenuItem {
  id: string;
  pageId: string;
  label: string;
  order: number;
  visible: boolean;
  variant: ButtonVariant;
  size: ButtonSize;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface MenuItemInput {
  pageId: string;
  label: string;
  order: number;
  visible?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/**
 * Convert Firestore timestamp to Date
 */
function timestampToDate(timestamp: Timestamp | Date): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return timestamp.toDate();
}

/**
 * Get all menu items with optional filters
 */
export async function getMenuItems(filters?: {
  visible?: boolean;
}): Promise<MenuItem[]> {
  const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
  const db = await getFirebaseDb();

  const constraints = [];

  if (filters?.visible !== undefined) {
    constraints.push(where('visible', '==', filters.visible));
  }

  constraints.push(orderBy('order', 'asc'));

  const q = query(collection(db, 'navigation'), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      pageId: data.pageId,
      label: data.label,
      order: data.order,
      visible: data.visible ?? true,
      variant: data.variant || 'ghost',
      size: data.size || 'md',
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    } as MenuItem;
  });
}

/**
 * Get single menu item by ID
 */
export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const { doc, getDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const docRef = doc(db, 'navigation', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    pageId: data.pageId,
    label: data.label,
    order: data.order,
    visible: data.visible ?? true,
    variant: data.variant || 'ghost',
    size: data.size || 'md',
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
  } as MenuItem;
}

/**
 * Create new menu item
 */
export async function createMenuItem(input: MenuItemInput, userId: string): Promise<MenuItem> {
  const { collection, addDoc, getDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();

  const now = new Date();
  const menuItemData = {
    pageId: input.pageId,
    label: input.label,
    order: input.order,
    visible: input.visible ?? true,
    variant: input.variant || 'ghost',
    size: input.size || 'md',
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  };

  const docRef = await addDoc(collection(db, 'navigation'), menuItemData);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data()!;

  return {
    id: docSnap.id,
    pageId: data.pageId,
    label: data.label,
    order: data.order,
    visible: data.visible,
    variant: data.variant,
    size: data.size,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
  } as MenuItem;
}

/**
 * Update existing menu item
 */
export async function updateMenuItem(
  id: string,
  input: Partial<MenuItemInput>,
  userId: string
): Promise<MenuItem> {
  const { doc, updateDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();

  const updateData: Record<string, unknown> = {
    ...input,
    updatedAt: new Date(),
    updatedBy: userId,
  };

  const docRef = doc(db, 'navigation', id);
  await updateDoc(docRef, updateData);
  const updatedItem = await getMenuItemById(id);

  if (!updatedItem) {
    throw new Error(`Menu item with ID "${id}" not found`);
  }

  return updatedItem;
}

/**
 * Delete menu item
 */
export async function deleteMenuItem(id: string): Promise<void> {
  const { doc, deleteDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const docRef = doc(db, 'navigation', id);
  await deleteDoc(docRef);
}

/**
 * Reorder menu items - update order values for all items
 */
export async function reorderMenuItems(
  items: Array<{ id: string; order: number }>,
  userId: string
): Promise<void> {
  const { doc, writeBatch } = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const batch = writeBatch(db);

  items.forEach(({ id, order }) => {
    const docRef = doc(db, 'navigation', id);
    batch.update(docRef, {
      order,
      updatedAt: new Date(),
      updatedBy: userId,
    });
  });

  await batch.commit();
}
