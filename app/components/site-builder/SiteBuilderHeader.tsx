'use client';

import { useState } from 'react';
import { Box, Heading, Button, Badge } from '@mond-design-system/theme';
import { usePageEditor } from '@/app/(admin)/admin/site-builder/page';
import { usePage, useUpdatePage } from '@/app/hooks/useSiteBuilderData';
import { useToast } from '@/app/providers/ToastProvider';
import { useSiteBuilder } from '@/app/contexts/SiteBuilderContext';

export function SiteBuilderHeader() {
  const { selectedPageId } = useSiteBuilder();
  const { data: page } = usePage(selectedPageId);
  const updatePage = useUpdatePage();
  const { showSuccess, showError } = useToast();
  const [saving, setSaving] = useState(false);

  const {
    stagedHeaderId,
    stagedMainId,
    stagedFooterId,
    hasUnsavedChanges,
  } = usePageEditor();

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
      showSuccess('Page Saved', 'Your changes have been saved successfully');
    } catch (error) {
      console.error('Error saving page:', error);
      showError('Save Failed', 'Failed to save your changes');
    } finally {
      setSaving(false);
    }
  };

  if (!selectedPageId) {
    return (
      <Box padding="4" display="flex" alignItems="center">
        <Heading level={2} size="3xl">
          Site Builder
        </Heading>
      </Box>
    );
  }

  return (
    <Box padding="4" display="flex" alignItems="center" justifyContent="space-between">
      <Heading level={2} size="3xl">
        Site Builder
      </Heading>

      <Box display="flex" gap="sm" alignItems="center">
        {hasUnsavedChanges && (
          <Badge variant="warning" size="md">
            Unsaved changes
          </Badge>
        )}
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          disabled={!hasUnsavedChanges}
        >
          Save Page
        </Button>
      </Box>
    </Box>
  );
}
