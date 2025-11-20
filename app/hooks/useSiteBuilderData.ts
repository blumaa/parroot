'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Page, Segment, MenuItem } from '@/app/types';
import {
  getPagesAction,
  getPageByIdAction,
  createPageAction,
  updatePageAction,
  deletePageAction,
  getSegmentsAction,
  getSegmentByIdAction,
  createSegmentAction,
  updateSegmentAction,
  deleteSegmentAction,
  getMenuItemsAction,
  createMenuItemAction,
  updateMenuItemAction,
  deleteMenuItemAction,
  getSiteSettingsAction,
  getUserAction,
} from '@/app/actions/siteBuilderActions';

// ============================================
// PAGES
// ============================================

export function usePages(status?: 'draft' | 'published') {
  return useQuery({
    queryKey: ['pages', status],
    queryFn: () => getPagesAction(status),
  });
}

export function usePage(id: string | null) {
  return useQuery({
    queryKey: ['page', id],
    queryFn: () => (id ? getPageByIdAction(id) : null),
    enabled: !!id,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) =>
      createPageAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Page> }) =>
      updatePageAction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', variables.id] });
      // Also invalidate all segment queries to ensure they refetch
      queryClient.invalidateQueries({ queryKey: ['segment'] });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePageAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

// ============================================
// SEGMENTS
// ============================================

export function useSegments(status?: 'draft' | 'published') {
  return useQuery({
    queryKey: ['segments', status],
    queryFn: () => getSegmentsAction(status),
  });
}

export function useSegment(id: string | null) {
  return useQuery({
    queryKey: ['segment', id],
    queryFn: () => (id ? getSegmentByIdAction(id) : null),
    enabled: !!id,
  });
}

export function useCreateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Segment, 'id' | 'createdAt' | 'updatedAt'>) =>
      createSegmentAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
    },
  });
}

export function useUpdateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Segment> }) =>
      updateSegmentAction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      queryClient.invalidateQueries({ queryKey: ['segment', variables.id] });
    },
  });
}

export function useDeleteSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSegmentAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      queryClient.invalidateQueries({ queryKey: ['pages'] }); // Pages reference segments
    },
  });
}

// ============================================
// MENU ITEMS
// ============================================

export function useMenuItems() {
  return useQuery({
    queryKey: ['menuItems'],
    queryFn: () => getMenuItemsAction(),
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'children'>) =>
      createMenuItemAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuItem> }) =>
      updateMenuItemAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMenuItemAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

// ============================================
// SITE SETTINGS
// ============================================

export function useSiteSettings() {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: () => getSiteSettingsAction(),
  });
}

// ============================================
// USER
// ============================================

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => getUserAction(),
  });
}
