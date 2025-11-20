'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface SiteBuilderState {
  // Current selected page
  selectedPageId: string | null;
  setSelectedPageId: (pageId: string | null) => void;

  // Drawer states
  isPageDrawerOpen: boolean;
  isSegmentDrawerOpen: boolean;
  isMenuSettingsOpen: boolean;

  // Active forms
  editingPageId: string | null;
  editingSegmentId: string | null;

  // Actions
  openPageDrawer: (pageId?: string) => void;
  closePageDrawer: () => void;
  openSegmentDrawer: (segmentId?: string) => void;
  closeSegmentDrawer: () => void;
  openMenuSettings: () => void;
  closeMenuSettings: () => void;

  // Drop zone targets
  draggedSegmentId: string | null;
  setDraggedSegmentId: (segmentId: string | null) => void;
}

const SiteBuilderContext = createContext<SiteBuilderState | undefined>(undefined);

export function SiteBuilderProvider({ children }: { children: React.ReactNode }) {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isPageDrawerOpen, setIsPageDrawerOpen] = useState(false);
  const [isSegmentDrawerOpen, setIsSegmentDrawerOpen] = useState(false);
  const [isMenuSettingsOpen, setIsMenuSettingsOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [draggedSegmentId, setDraggedSegmentId] = useState<string | null>(null);

  const openPageDrawer = useCallback((pageId?: string) => {
    setEditingPageId(pageId || null);
    setIsPageDrawerOpen(true);
  }, []);

  const closePageDrawer = useCallback(() => {
    setIsPageDrawerOpen(false);
    setEditingPageId(null);
  }, []);

  const openSegmentDrawer = useCallback((segmentId?: string) => {
    setEditingSegmentId(segmentId || null);
    setIsSegmentDrawerOpen(true);
  }, []);

  const closeSegmentDrawer = useCallback(() => {
    setIsSegmentDrawerOpen(false);
    setEditingSegmentId(null);
  }, []);

  const openMenuSettings = useCallback(() => {
    setIsMenuSettingsOpen(true);
  }, []);

  const closeMenuSettings = useCallback(() => {
    setIsMenuSettingsOpen(false);
  }, []);

  const value: SiteBuilderState = {
    selectedPageId,
    setSelectedPageId,
    isPageDrawerOpen,
    isSegmentDrawerOpen,
    isMenuSettingsOpen,
    editingPageId,
    editingSegmentId,
    openPageDrawer,
    closePageDrawer,
    openSegmentDrawer,
    closeSegmentDrawer,
    openMenuSettings,
    closeMenuSettings,
    draggedSegmentId,
    setDraggedSegmentId,
  };

  return (
    <SiteBuilderContext.Provider value={value}>
      {children}
    </SiteBuilderContext.Provider>
  );
}

export function useSiteBuilder() {
  const context = useContext(SiteBuilderContext);
  if (!context) {
    throw new Error('useSiteBuilder must be used within SiteBuilderProvider');
  }
  return context;
}
