/**
 * Server-side data access layer using Firebase Admin SDK
 * All functions in this file bypass Firestore security rules
 * ONLY use these functions in Server Components and Server Actions
 */

import 'server-only';
import { getAdminDb } from './firebase-admin';
import type { Query } from 'firebase-admin/firestore';

// Import types from canonical types file
import type { Page, Segment, Post, PostStatus, MenuItem, SiteSettings } from '@/app/types';

// ============================================================================
// PAGES
// ============================================================================

export async function getPages(filters?: { status?: string }): Promise<Page[]> {
  const db = getAdminDb();
  let query: Query = db.collection('pages').orderBy('updatedAt', 'desc');

  if (filters?.status) {
    query = query.where('status', '==', filters.status);
  }

  const snapshot = await query.get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Page[];
}

export async function getPageById(id: string): Promise<Page | null> {
  const db = getAdminDb();
  const doc = await db.collection('pages').doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data()?.createdAt?.toDate(),
    updatedAt: doc.data()?.updatedAt?.toDate(),
  } as Page;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const db = getAdminDb();
  const snapshot = await db.collection('pages')
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  } as Page;
}

// ============================================================================
// SEGMENTS
// ============================================================================

export async function getSegments(): Promise<Segment[]> {
  const db = getAdminDb();
  const snapshot = await db.collection('segments')
    .orderBy('updatedAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Segment[];
}

export async function getSegmentById(id: string): Promise<Segment | null> {
  const db = getAdminDb();
  const doc = await db.collection('segments').doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data()?.createdAt?.toDate(),
    updatedAt: doc.data()?.updatedAt?.toDate(),
  } as Segment;
}

export async function getSegmentsByIds(ids: string[]): Promise<Segment[]> {
  if (ids.length === 0) return [];

  const db = getAdminDb();
  const segments: Segment[] = [];

  // Firestore 'in' queries are limited to 10 items
  // Split into chunks if necessary
  const chunkSize = 10;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const snapshot = await db.collection('segments')
      .where('__name__', 'in', chunk)
      .get();

    snapshot.docs.forEach(doc => {
      segments.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Segment);
    });
  }

  // Return in the same order as the input ids
  return ids.map(id => segments.find(s => s.id === id)).filter(Boolean) as Segment[];
}

// ============================================================================
// POSTS
// ============================================================================

export async function getPosts(filters?: {
  segmentId?: string;
  status?: PostStatus;
  search?: string;
  authorId?: string;
}): Promise<Post[]> {
  const db = getAdminDb();
  let query: Query = db.collection('posts').orderBy('createdAt', 'desc');

  if (filters?.segmentId) {
    query = query.where('segmentId', '==', filters.segmentId);
  }

  if (filters?.status) {
    query = query.where('status', '==', filters.status);
  }

  if (filters?.authorId) {
    query = query.where('authorId', '==', filters.authorId);
  }

  const snapshot = await query.get();
  let posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Post[];

  // Apply search filter in memory (Firestore doesn't support text search)
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    posts = posts.filter(post =>
      post.title.toLowerCase().includes(searchLower) ||
      post.excerpt.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower)
    );
  }

  return posts;
}

export async function getPostById(id: string): Promise<Post | null> {
  const db = getAdminDb();
  const doc = await db.collection('posts').doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data()?.createdAt?.toDate(),
    updatedAt: doc.data()?.updatedAt?.toDate(),
  } as Post;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const db = getAdminDb();
  const snapshot = await db.collection('posts')
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  } as Post;
}

// ============================================================================
// NAVIGATION
// ============================================================================

export async function getMenuItems(filters?: { visible?: boolean }): Promise<MenuItem[]> {
  const db = getAdminDb();
  let query: Query = db.collection('navigation').orderBy('order', 'asc');

  if (filters?.visible !== undefined) {
    query = query.where('visible', '==', filters.visible);
  }

  const snapshot = await query.get();

  const allItems = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      pageId: data.pageId,
      label: data.label,
      parentId: data.parentId || undefined,
      order: data.order,
      visible: data.visible ?? true,
      variant: data.variant || 'ghost',
      size: data.size || 'md',
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    } as MenuItem;
  });

  // Build hierarchical structure: only return top-level items with children populated
  const itemMap = new Map<string, MenuItem>();
  const topLevelItems: MenuItem[] = [];

  // First pass: create map of all items
  allItems.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Second pass: build hierarchy
  allItems.forEach(item => {
    const menuItem = itemMap.get(item.id)!;

    if (item.parentId) {
      // This is a child item, add it to its parent's children array
      const parent = itemMap.get(item.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(menuItem);
      }
    } else {
      // This is a top-level item
      topLevelItems.push(menuItem);
    }
  });

  // Sort children arrays by order
  topLevelItems.forEach(item => {
    if (item.children && item.children.length > 0) {
      item.children.sort((a, b) => a.order - b.order);
    }
  });

  return topLevelItems;
}

// ============================================================================
// SITE SETTINGS
// ============================================================================

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const db = getAdminDb();
  const snapshot = await db.collection('settings').doc('site-settings').get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  if (!data) return null;

  return {
    id: snapshot.id,
    ...data,
    updatedAt: data.updatedAt?.toDate(),
  } as SiteSettings;
}

export async function updateSiteSettings(
  settings: Partial<Omit<SiteSettings, 'id' | 'updatedAt'>>,
  userId: string
): Promise<void> {
  const db = getAdminDb();
  await db.collection('settings').doc('site-settings').set(
    {
      ...settings,
      updatedAt: new Date(),
      updatedBy: userId,
    },
    { merge: true }
  );
}

export async function initializeDefaultSettings(userId: string): Promise<void> {
  const db = getAdminDb();
  const docRef = db.collection('settings').doc('site-settings');
  const doc = await docRef.get();

  if (!doc.exists) {
    await docRef.set({
      siteName: 'My Site',
      siteDescription: 'Welcome to my site',
      contactEmail: 'contact@example.com',
      stickyHeader: false,
      updatedAt: new Date(),
      updatedBy: userId,
    });
  }
}
