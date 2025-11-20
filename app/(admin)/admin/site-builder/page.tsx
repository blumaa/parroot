"use client";

import { useState, createContext, useContext } from "react";
import {
  Box,
  Card,
  Spinner,
  Text,
} from "@mond-design-system/theme";
import {
  SiteBuilderProvider,
  useSiteBuilder,
} from "@/app/contexts/SiteBuilderContext";
import { DropZoneProvider } from "@mond-design-system/theme/client";
import { NavigationPreview } from "@/app/components/site-builder/NavigationPreview";
import { BuilderLayout } from "@/app/components/site-builder/BuilderLayout";
import { SegmentPalette } from "@/app/components/site-builder/SegmentPalette";
import { SitePreviewHeader } from "@/app/components/site-builder/SitePreviewHeader";
import { usePage } from "@/app/hooks/useSiteBuilderData";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

interface PageEditorContextValue {
  stagedHeaderId: string | null;
  stagedMainId: string | null;
  stagedFooterId: string | null;
  setStagedHeaderId: (id: string | null) => void;
  setStagedMainId: (id: string | null) => void;
  setStagedFooterId: (id: string | null) => void;
  hasUnsavedChanges: boolean;
}

const PageEditorContext = createContext<PageEditorContextValue | undefined>(
  undefined,
);

export function usePageEditor() {
  const context = useContext(PageEditorContext);
  if (!context) {
    throw new Error("usePageEditor must be used within PageEditorProvider");
  }
  return context;
}

// Separate component to reset state on page change via key prop
function PageEditor({ pageId }: { pageId: string }) {
  const { data: page } = usePage(pageId);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Local staging state - initialized from page data
  const [stagedHeaderId, setStagedHeaderId] = useState<string | null>(
    page?.headerSegmentId || null,
  );
  const [stagedMainId, setStagedMainId] = useState<string | null>(
    page?.mainSegmentId || null,
  );
  const [stagedFooterId, setStagedFooterId] = useState<string | null>(
    page?.footerSegmentId || null,
  );
  const [lastSyncedPageId, setLastSyncedPageId] = useState<string | null>(null);

  // Sync staged state during render when page data arrives (React-recommended pattern)
  if (page && page.id !== lastSyncedPageId) {
    setStagedHeaderId(page.headerSegmentId || null);
    setStagedMainId(page.mainSegmentId || null);
    setStagedFooterId(page.footerSegmentId || null);
    setLastSyncedPageId(page.id);
  }

  // Check if there are unsaved changes
  const hasUnsavedChanges =
    stagedHeaderId !== (page?.headerSegmentId || null) ||
    stagedMainId !== (page?.mainSegmentId || null) ||
    stagedFooterId !== (page?.footerSegmentId || null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !pageId) return;

    const activeData = active.data.current;

    // Only handle drops from the segment palette (templates)
    if (!activeData?.isTemplate) return;

    const segmentId = activeData.segmentId as string;
    const zoneId = over.id as string;

    // Update local staged state based on drop zone
    if (zoneId === "header-zone") {
      setStagedHeaderId(segmentId);
    } else if (zoneId === "main-zone") {
      setStagedMainId(segmentId);
    } else if (zoneId === "footer-zone") {
      setStagedFooterId(segmentId);
    }
  };

  const editorContextValue: PageEditorContextValue = {
    stagedHeaderId,
    stagedMainId,
    stagedFooterId,
    setStagedHeaderId,
    setStagedMainId,
    setStagedFooterId,
    hasUnsavedChanges,
  };

  return (
    <PageEditorContext.Provider value={editorContextValue}>
      <Box display="flex" gap="md">
        <DropZoneProvider
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          dragOverlay={
            activeId ? (
              <Card>
                <Box padding="3">
                  <Text>Dragging segment...</Text>
                </Box>
              </Card>
            ) : null
          }
        >
          <Box display="flex" flexDirection="column" flex="1">
            <SitePreviewHeader />
            <Box border="strong">
              <NavigationPreview />
              <BuilderLayout />
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" width="md" justifyContent="center">
            {/* <SiteBuilderHeader /> */}
            <SegmentPalette />
          </Box>
        </DropZoneProvider>
      </Box>
    </PageEditorContext.Provider>
  );
}

function SiteBuilderContent() {
  const { selectedPageId } = useSiteBuilder();

  if (!selectedPageId) {
    return (
      <Box display="flex" flexDirection="column">
        {/* <Box padding="8" display="flex" alignItems="center"> */}
        {/*   <Heading level={2} size="3xl"> */}
        {/*     Site Builder */}
        {/*   </Heading> */}
        {/* </Box> */}
        <Box display="flex" flexDirection="column" width="full">
          <NavigationPreview />
          <Box
            padding="4"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner size="lg" />
          </Box>
        </Box>
      </Box>
    );
  }

  return <PageEditor key={selectedPageId} pageId={selectedPageId} />;
}

export default function SiteBuilderPage() {
  return (
    <SiteBuilderProvider>
      <SiteBuilderContent />
    </SiteBuilderProvider>
  );
}
