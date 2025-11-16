'use server';

import { revalidatePath } from 'next/cache';
import { verifySession } from '@/app/lib/dal';
import { getAdminDb } from '@/app/lib/firebase-admin';
import { getPosts, getPostBySlug } from '@/app/lib/data-access';
import type { PostStatus } from '@/app/types';

export async function getPostsAction(filters?: {
  segmentId?: string;
  status?: PostStatus;
  search?: string;
  authorId?: string;
}) {
  await verifySession();
  return await getPosts(filters);
}

export async function deletePostAction(postId: string, segmentId: string) {
  await verifySession();

  try {
    const db = getAdminDb();
    await db.collection('posts').doc(postId).delete();

    revalidatePath('/admin');
    revalidatePath(`/admin/segments/${segmentId}/posts`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

export async function createPostAction(data: {
  segmentId: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featuredImage?: string;
  author: string;
  authorId: string;
  status: PostStatus;
}) {
  await verifySession();

  try {
    const db = getAdminDb();
    const now = new Date();

    const postData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection('posts').add(postData);

    revalidatePath('/admin');
    revalidatePath(`/admin/segments/${data.segmentId}/posts`);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: 'Failed to create post' };
  }
}

export async function updatePostAction(
  postId: string,
  segmentId: string,
  data: Partial<{
    title: string;
    content: string;
    excerpt: string;
    slug: string;
    featuredImage?: string;
    author: string;
    status: PostStatus;
  }>
) {
  await verifySession();

  try {
    const db = getAdminDb();
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await db.collection('posts').doc(postId).update(updateData);

    revalidatePath('/admin');
    revalidatePath(`/admin/segments/${segmentId}/posts`);
    revalidatePath(`/admin/segments/${segmentId}/posts/${postId}/edit`);
    if (data.slug) {
      revalidatePath(`/posts/${data.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating post:', error);
    return { success: false, error: 'Failed to update post' };
  }
}

/**
 * Check if post slug is unique (excluding current post ID)
 */
export async function checkPostSlugUniqueAction(slug: string, excludeId?: string): Promise<boolean> {
  await verifySession();

  const existingPost = await getPostBySlug(slug);
  if (!existingPost) {
    return true;
  }
  return excludeId ? existingPost.id === excludeId : false;
}
