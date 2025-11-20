'use server';

import { revalidatePath } from 'next/cache';
import {
  createPage,
  updatePage,
  deletePage,
  createSegment,
  updateSegment,
  deleteSegment,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getPages,
  getPageById,
  getSegments,
  getSegmentById,
  getMenuItems,
  getSiteSettings,
} from '@/app/lib/data-access';
import { getUser } from '@/app/lib/dal';
import type { Page, Segment, MenuItem } from '@/app/types';

// ============================================
// PAGES
// ============================================

export async function getPagesAction(status?: 'draft' | 'published') {
  return await getPages({ status });
}

export async function getPageByIdAction(id: string) {
  return await getPageById(id);
}

export async function createPageAction(data: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) {
  const page = await createPage(data);
  revalidatePath('/admin/site-builder');
  return page;
}

export async function updatePageAction(id: string, data: Partial<Page>) {
  const page = await updatePage(id, data);
  revalidatePath('/admin/site-builder');
  return page;
}

export async function deletePageAction(id: string) {
  await deletePage(id);
  revalidatePath('/admin/site-builder');
}

// ============================================
// SEGMENTS
// ============================================

export async function getSegmentsAction(status?: 'draft' | 'published') {
  return await getSegments({ status });
}

export async function getSegmentByIdAction(id: string) {
  return await getSegmentById(id);
}

export async function createSegmentAction(data: Omit<Segment, 'id' | 'createdAt' | 'updatedAt'>) {
  const segment = await createSegment(data);
  revalidatePath('/admin/site-builder');
  return segment;
}

export async function updateSegmentAction(id: string, data: Partial<Segment>) {
  const segment = await updateSegment(id, data);
  revalidatePath('/admin/site-builder');
  return segment;
}

export async function deleteSegmentAction(id: string) {
  await deleteSegment(id);
  revalidatePath('/admin/site-builder');
}

// ============================================
// MENU ITEMS
// ============================================

export async function getMenuItemsAction() {
  return await getMenuItems({ visible: undefined });
}

export async function createMenuItemAction(data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'children'>) {
  const menuItem = await createMenuItem(data);
  revalidatePath('/admin/site-builder');
  return menuItem;
}

export async function updateMenuItemAction(id: string, data: Partial<MenuItem>) {
  const menuItem = await updateMenuItem(id, data);
  revalidatePath('/admin/site-builder');
  return menuItem;
}

export async function deleteMenuItemAction(id: string) {
  await deleteMenuItem(id);
  revalidatePath('/admin/site-builder');
}

// ============================================
// SITE SETTINGS
// ============================================

export async function getSiteSettingsAction() {
  return await getSiteSettings();
}

// ============================================
// USER
// ============================================

export async function getUserAction() {
  return await getUser();
}
