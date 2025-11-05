import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Query,
  QueryConstraint,
  Timestamp,
  WhereFilterOp,
  OrderByDirection,
} from 'firebase/firestore';
import { getDb } from './firebase';

// ============================================
// GENERIC CRUD OPERATIONS
// ============================================

/**
 * Get a single document by ID
 */
export async function getDocument<T>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  try {
    const db = getDb();
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Get all documents from a collection
 */
export async function getAllDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const db = getDb();
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Query documents with filters
 */
export async function queryDocuments<T>(
  collectionName: string,
  filters: Array<{
    field: string;
    operator: WhereFilterOp;
    value: any;
  }> = [],
  orderByField?: string,
  orderDirection: OrderByDirection = 'asc',
  limitCount?: number
): Promise<T[]> {
  try {
    const db = getDb();
    const collectionRef = collection(db, collectionName);
    const constraints: QueryConstraint[] = [];

    // Add where clauses
    filters.forEach(({ field, operator, value }) => {
      constraints.push(where(field, operator, value));
    });

    // Add ordering
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }

    // Add limit
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Create a new document
 */
export async function createDocument<T>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<string> {
  try {
    const db = getDb();
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Update an existing document
 */
export async function updateDocument<T>(
  collectionName: string,
  documentId: string,
  data: Partial<Omit<T, 'id'>>
): Promise<void> {
  try {
    const db = getDb();
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  try {
    const db = getDb();
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

// ============================================
// COLLECTION-SPECIFIC HELPERS
// ============================================

/**
 * Get published pages
 */
export async function getPublishedPages() {
  return queryDocuments(
    'pages',
    [{ field: 'status', operator: '==', value: 'published' }],
    'updatedAt',
    'desc'
  );
}

/**
 * Get published blog posts
 */
export async function getPublishedBlogPosts() {
  return queryDocuments(
    'blogPosts',
    [{ field: 'status', operator: '==', value: 'published' }],
    'publishDate',
    'desc'
  );
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(category: string) {
  return queryDocuments(
    'blogPosts',
    [
      { field: 'status', operator: '==', value: 'published' },
      { field: 'category', operator: '==', value: category },
    ],
    'publishDate',
    'desc'
  );
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const results = await queryDocuments(
    'users',
    [{ field: 'email', operator: '==', value: email }],
    undefined,
    'asc',
    1
  );
  return results[0] || null;
}

/**
 * Get site settings (singleton)
 */
export async function getSiteSettings() {
  return getDocument('siteSettings', 'default');
}

/**
 * Get brand configuration (singleton)
 */
export async function getBrandConfiguration() {
  return getDocument('brandConfiguration', 'default');
}

/**
 * Get navigation by position
 */
export async function getNavigationByPosition(position: 'header' | 'footer' | 'sidebar') {
  const results = await queryDocuments(
    'navigation',
    [{ field: 'position', operator: '==', value: position }],
    undefined,
    'asc',
    1
  );
  return results[0] || null;
}
