'use client';

import { Box, Button, Heading, Text } from '@mond-design-system/theme';
import { Drawer, DrawerHeader, DrawerBody, Input, Select, Textarea, Modal, ModalBody, ModalFooter } from '@mond-design-system/theme/client';
import { useSiteBuilder } from '@/app/contexts/SiteBuilderContext';
import { usePage, useCreatePage, useUpdatePage, useDeletePage } from '@/app/hooks/useSiteBuilderData';
import { useState, useEffect } from 'react';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export function PageDrawer() {
  const {
    isPageDrawerOpen,
    closePageDrawer,
    editingPageId,
    setSelectedPageId,
  } = useSiteBuilder();

  const { data: existingPage } = usePage(editingPageId);
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getInitialFormData = () => {
    if (existingPage) {
      return {
        title: existingPage.title,
        slug: existingPage.slug,
        description: existingPage.description || '',
        status: existingPage.status,
      };
    }
    return {
      title: '',
      slug: '',
      description: '',
      status: 'draft' as 'draft' | 'published',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  // Reset form when drawer opens/closes or editing different page
  useEffect(() => {
    setFormData(getInitialFormData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageDrawerOpen, editingPageId]);

  const handleSave = async () => {
    const userId = 'temp-user-id';

    // Auto-generate slug from title if slug is empty
    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (editingPageId) {
      await updatePage.mutateAsync({
        id: editingPageId,
        data: {
          ...formData,
          slug,
          updatedBy: userId,
        },
      });
    } else {
      const newPage = await createPage.mutateAsync({
        ...formData,
        slug,
        headerSegmentId: null,
        mainSegmentId: null,
        footerSegmentId: null,
        createdBy: userId,
        updatedBy: userId,
      });
      setSelectedPageId(newPage.id);
    }

    closePageDrawer();
  };

  const handleDelete = async () => {
    if (!editingPageId) return;

    try {
      await deletePage.mutateAsync(editingPageId);
      setSelectedPageId(null);
      setShowDeleteConfirm(false);
      closePageDrawer();
    } catch (error) {
      console.error('Error deleting page:', error);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Drawer isOpen={isPageDrawerOpen} onClose={closePageDrawer} width='lg'>
      <DrawerHeader onClose={closePageDrawer}>
        <Heading level={3} size="lg">
          {editingPageId ? 'Edit Page' : 'Create New Page'}
        </Heading>
      </DrawerHeader>

      <DrawerBody>
        <Box display="flex" flexDirection="column" gap="lg" padding="4">
          <Box display="flex" flexDirection="column" gap="sm">
            <Text as="label">Title</Text>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Page title"
              required
            />
          </Box>

          <Box display="flex" flexDirection="column" gap="sm">
            <Text as="label">Slug (optional)</Text>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="Leave empty to auto-generate from title"
            />
          </Box>

          <Box display="flex" flexDirection="column" gap="sm">
            <Text as="label">Description</Text>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Page description"
            />
          </Box>

          <Box display="flex" flexDirection="column" gap="sm">
            <Text as="label">Status</Text>
            <Select
              options={STATUS_OPTIONS}
              value={formData.status}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as 'draft' | 'published',
                })
              }
            />
          </Box>

          <Box display="flex" gap="sm" justifyContent="space-between">
            <Box display="flex" gap="sm">
              <Button variant="primary" onClick={handleSave}>
                {editingPageId ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={closePageDrawer}>
                Cancel
              </Button>
            </Box>

            {editingPageId && (
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </Button>
            )}
          </Box>
        </Box>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Page"
          size="sm"
        >
          <ModalBody>
            <Text>Are you sure you want to delete this page? This action cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <Box display="flex" gap="sm" justifyContent="flex-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </Box>
          </ModalFooter>
        </Modal>
      </DrawerBody>
    </Drawer>
  );
}
