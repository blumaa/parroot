import { getFirebaseDb } from './firebase';
import type { Timestamp } from 'firebase/firestore';

/**
 * Supported segment types
 */
export type SegmentType =
  | 'carousel'
  | 'gallery'
  | 'text-block'
  | 'hero'
  | 'cta'
  | 'testimonials'
  | 'faq'
  | 'team'
  | 'form';

/**
 * Base segment configuration interface
 * Each segment type will extend this with specific config
 */
export interface SegmentConfig {
  // Common config properties that all segments might need
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  margin?: string;
  className?: string;
}

/**
 * Multi-language content structure
 */
export interface LocalizedContent {
  en: Record<string, unknown>;
  [locale: string]: Record<string, unknown>;
}

/**
 * Segment interface
 */
export interface Segment {
  id: string;
  type: SegmentType;
  name: string; // Internal name for admin reference
  config: SegmentConfig & Record<string, unknown>; // Type-specific config
  content?: LocalizedContent; // Optional multi-language content
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * Segment input for creating/updating segments
 */
export interface SegmentInput {
  type: SegmentType;
  name: string;
  config: SegmentConfig & Record<string, unknown>;
  content?: LocalizedContent;
  status: 'draft' | 'published';
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
 * Get all segments with optional filters
 */
export async function getSegments(filters?: {
  type?: SegmentType;
  status?: 'draft' | 'published';
  search?: string;
}): Promise<Segment[]> {
  const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
  const db = await getFirebaseDb();

  // Build query constraints
  const constraints = [];

  // Apply type filter
  if (filters?.type) {
    constraints.push(where('type', '==', filters.type));
  }

  // Apply status filter
  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  }

  // Add ordering
  constraints.push(orderBy('updatedAt', 'desc'));

  const q = query(collection(db, 'segments'), ...constraints);
  const snapshot = await getDocs(q);

  let segments = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      type: data.type,
      name: data.name,
      config: data.config || {},
      content: data.content,
      status: data.status,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    } as Segment;
  });

  // Apply search filter client-side
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    segments = segments.filter((segment) => segment.name.toLowerCase().includes(searchLower));
  }

  return segments;
}

/**
 * Get single segment by ID
 */
export async function getSegmentById(id: string): Promise<Segment | null> {
  const { doc, getDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const docRef = doc(db, 'segments', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    type: data.type,
    name: data.name,
    config: data.config || {},
    content: data.content,
    status: data.status,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
  } as Segment;
}

/**
 * Get multiple segments by IDs (for page rendering)
 */
export async function getSegmentsByIds(ids: string[]): Promise<Segment[]> {
  if (ids.length === 0) {
    return [];
  }

  const { doc, getDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();

  const segmentPromises = ids.map(async (id) => {
    const docRef = doc(db, 'segments', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      type: data.type,
      name: data.name,
      config: data.config || {},
      content: data.content,
      status: data.status,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    } as Segment;
  });

  const segments = await Promise.all(segmentPromises);
  return segments.filter((segment): segment is Segment => segment !== null);
}

/**
 * Create new segment
 */
export async function createSegment(input: SegmentInput, userId: string): Promise<Segment> {
  const { collection, addDoc, getDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();

  const now = new Date();
  const segmentData = {
    type: input.type,
    name: input.name,
    config: input.config || {},
    content: input.content,
    status: input.status,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  };

  const docRef = await addDoc(collection(db, 'segments'), segmentData);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data()!;

  return {
    id: docSnap.id,
    type: data.type,
    name: data.name,
    config: data.config || {},
    content: data.content,
    status: data.status,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
  } as Segment;
}

/**
 * Update existing segment
 */
export async function updateSegment(
  id: string,
  input: Partial<SegmentInput>,
  userId: string
): Promise<Segment> {
  const { doc, updateDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();

  const updateData: Record<string, unknown> = {
    ...input,
    updatedAt: new Date(),
    updatedBy: userId,
  };

  const docRef = doc(db, 'segments', id);
  await updateDoc(docRef, updateData);
  const updatedSegment = await getSegmentById(id);

  if (!updatedSegment) {
    throw new Error(`Segment with ID "${id}" not found`);
  }

  return updatedSegment;
}

/**
 * Delete segment
 */
export async function deleteSegment(id: string): Promise<void> {
  const { doc, deleteDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const docRef = doc(db, 'segments', id);
  await deleteDoc(docRef);
}

/**
 * Duplicate segment (useful for creating variations)
 */
export async function duplicateSegment(id: string, userId: string): Promise<Segment> {
  const originalSegment = await getSegmentById(id);

  if (!originalSegment) {
    throw new Error(`Segment with ID "${id}" not found`);
  }

  const duplicateInput: SegmentInput = {
    type: originalSegment.type,
    name: `${originalSegment.name} (Copy)`,
    config: originalSegment.config,
    content: originalSegment.content,
    status: 'draft', // Always create duplicates as drafts
  };

  return createSegment(duplicateInput, userId);
}
