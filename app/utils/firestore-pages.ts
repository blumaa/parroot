import { getFirebaseDb } from './firebase';
import type { Timestamp } from 'firebase/firestore';

export interface Page {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: 'draft' | 'published';
  segments: string[]; // Array of segment IDs
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface PageInput {
  title: string;
  slug: string;
  description?: string;
  status: 'draft' | 'published';
  segments?: string[];
}

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
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
 * Get all pages with optional filters
 */
export async function getPages(filters?: {
  status?: 'draft' | 'published';
  search?: string;
}): Promise<Page[]> {
  const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
  const db = await getFirebaseDb();

  // Build query constraints
  const constraints = [];

  // Apply status filter
  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  }

  // Add ordering
  constraints.push(orderBy('updatedAt', 'desc'));

  const q = query(collection(db, 'pages'), ...constraints);
  const snapshot = await getDocs(q);

  let pages = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      status: data.status,
      segments: data.segments || [],
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    } as Page;
  });

  // Apply search filter client-side
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    pages = pages.filter(
      (page) =>
        page.title.toLowerCase().includes(searchLower) ||
        page.slug.toLowerCase().includes(searchLower)
    );
  }

  return pages;
}

/**
 * Get single page by ID
 */
export async function getPageById(id: string): Promise<Page | null> {
  const { doc, getDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const docRef = doc(db, 'pages', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    status: data.status,
    segments: data.segments || [],
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
  } as Page;
}

/**
 * Get single page by slug
 */
export async function getPageBySlug(slug: string): Promise<Page | null> {
  const { collection, query, where, limit, getDocs } = await import('firebase/firestore');
  const db = await getFirebaseDb();

  const q = query(collection(db, 'pages'), where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    status: data.status,
    segments: data.segments || [],
    metadata: data.metadata || {},
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
  } as Page;
}

/**
 * Check if slug is unique (excluding current page ID)
 */
export async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const existingPage = await getPageBySlug(slug);
  if (!existingPage) {
    return true;
  }
  return excludeId ? existingPage.id === excludeId : false;
}

/**
 * Create new page
 */
export async function createPage(input: PageInput, userId: string): Promise<Page> {
  const { collection, addDoc, getDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();

  // Check slug uniqueness
  const slugUnique = await isSlugUnique(input.slug);
  if (!slugUnique) {
    throw new Error(`Slug "${input.slug}" is already in use`);
  }

  const now = new Date();
  const pageData = {
    title: input.title,
    slug: input.slug,
    description: input.description || '',
    status: input.status,
    segments: [],
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  };

  const docRef = await addDoc(collection(db, 'pages'), pageData);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data()!;

  return {
    id: docSnap.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    status: data.status,
    segments: data.segments || [],
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
  } as Page;
}

/**
 * Update existing page
 */
export async function updatePage(
  id: string,
  input: Partial<PageInput>,
  userId: string
): Promise<Page> {
  const { doc, updateDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();

  // If slug is being updated, check uniqueness
  if (input.slug) {
    const slugUnique = await isSlugUnique(input.slug, id);
    if (!slugUnique) {
      throw new Error(`Slug "${input.slug}" is already in use`);
    }
  }

  const updateData: Record<string, unknown> = {
    ...input,
    updatedAt: new Date(),
    updatedBy: userId,
  };

  const docRef = doc(db, 'pages', id);
  await updateDoc(docRef, updateData);
  const updatedPage = await getPageById(id);

  if (!updatedPage) {
    throw new Error(`Page with ID "${id}" not found`);
  }

  return updatedPage;
}

/**
 * Delete page
 */
export async function deletePage(id: string): Promise<void> {
  const { doc, deleteDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const docRef = doc(db, 'pages', id);
  await deleteDoc(docRef);
}
