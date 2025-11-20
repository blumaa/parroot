"use client";

import { useState } from "react";
import {
  Box,
  Heading,
  Button,
  Badge,
  Spinner,
} from "@mond-design-system/theme";
import { usePageEditor } from "@/app/(admin)/admin/site-builder/page";
import { usePage, useUpdatePage } from "@/app/hooks/useSiteBuilderData";
import { useToast } from "@/app/providers/ToastProvider";
import { useSiteBuilder } from "@/app/contexts/SiteBuilderContext";

export function SitePreviewHeader() {
  const { selectedPageId, openMenuSettings } = useSiteBuilder();
  const { data: page } = usePage(selectedPageId);
  const updatePage = useUpdatePage();
  const { showSuccess, showError } = useToast();
  const [saving, setSaving] = useState(false);

  const { stagedHeaderId, stagedMainId, stagedFooterId, hasUnsavedChanges } =
    usePageEditor();

  const handleSave = async () => {
    if (!page) return;

    setSaving(true);
    try {
      await updatePage.mutateAsync({
        id: page.id,
        data: {
          headerSegmentId: stagedHeaderId,
          mainSegmentId: stagedMainId,
          footerSegmentId: stagedFooterId,
        },
      });
      showSuccess("Page Saved", "Your changes have been saved successfully");
    } catch (error) {
      console.error("Error saving page:", error);
      showError("Save Failed", "Failed to save your changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      padding="4"
      display="flex"
      justifyContent="space-between"
    >
      <Heading level={3} size="2xl">
        Site Preview
      </Heading>
      <Box display="flex" justifyContent="center">
        {page?.title ? (
          <Heading level={2} size="xl">
            {page.title}
          </Heading>
        ) : (
          <Spinner />
        )}
      </Box>
      <Box display="flex" alignItems="center" gap="sm">
        <Box display="flex" alignItems="center" gap="sm">
          <Button
            variant={hasUnsavedChanges ? "warning" : "primary"}
            size="sm"
            onClick={handleSave}
            loading={saving}
            disabled={!hasUnsavedChanges}
            corners="rounded"
          >
            {hasUnsavedChanges ? "Save Changes" : "Saved"}
          </Button>
        </Box>
        <Button
          variant="primary"
          size="sm"
          onClick={openMenuSettings}
          corners="rounded"
        >
          Menu Settings
        </Button>
      </Box>
    </Box>
  );
}
