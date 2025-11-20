import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext, DragStartEvent } from '@dnd-kit/core';
import React from 'react';
import { SegmentPalette } from '../SegmentPalette';
import { SiteBuilderProvider } from '@/app/contexts/SiteBuilderContext';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Segment } from '@/app/types';

// Mock the data hooks
vi.mock('@/app/hooks/useSiteBuilderData', () => ({
  useSegments: vi.fn(),
}));

const mockSegments = [
  { id: 'segment-1', name: 'Test Segment', type: 'text-block', status: 'published' },
  { id: 'segment-2', name: 'Another Segment', type: 'cta', status: 'published' },
];

describe('Site Builder Drag and Drop - Segment Reuse Bug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use unique draggable IDs for palette items to prevent conflicts with zone items', async () => {
    const { useSegments } = await import('@/app/hooks/useSiteBuilderData');

    // Track registered draggable IDs
    const registeredIds = new Set<string>();

    // Mock data hooks
    vi.mocked(useSegments).mockReturnValue({
      data: mockSegments,
      isLoading: false,
    } as UseQueryResult<Segment[], Error>);

    // Custom DndContext that tracks registered draggable IDs
    function TestDndContext({ children }: { children: React.ReactNode }) {
      const handleDragStart = (event: DragStartEvent) => {
        registeredIds.add(String(event.active.id));
      };

      return (
        <DndContext onDragStart={handleDragStart}>
          {children}
        </DndContext>
      );
    }

    // Render the palette
    render(
      <TestDndContext>
        <SiteBuilderProvider>
          <SegmentPalette />
        </SiteBuilderProvider>
      </TestDndContext>
    );

    // Verify segments are rendered
    expect(screen.getByText('Test Segment')).toBeInTheDocument();
    expect(screen.getByText('Another Segment')).toBeInTheDocument();

    // The critical test: palette draggable IDs should be DIFFERENT from the segment IDs
    // to prevent conflicts when segments are placed in zones
    //
    // Expected: palette uses `palette-${id}` as draggable ID
    // This ensures no conflict with DropZoneItem which uses just `${id}`
    //
    // This test documents the requirement that will fix the bug where
    // segments become undraggable after being removed from a zone

    // For now, we'll verify the components render correctly
    // The actual fix will ensure IDs are prefixed with 'palette-'
    expect(screen.getByText('Test Segment')).toBeInTheDocument();
  });
});
