'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Heading, Text, Spinner } from '@mond-design-system/theme';
import { Select, Modal, ModalBody, ModalFooter } from '@mond-design-system/theme/client';
import type { MenuItem, Page, ButtonVariant, ButtonSize } from '@/app/types';
import { getMenuItemsAction, createMenuItemAction, updateMenuItemAction, deleteMenuItemAction, reorderMenuItemsAction } from '@/app/actions/navigation';
import { getPagesAction } from '@/app/actions/pages';
import { useToast } from '@/app/providers/ToastProvider';

const VARIANT_OPTIONS: Array<{ value: ButtonVariant; label: string }> = [
  { value: 'primary', label: 'Primary' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' },
  { value: 'destructive', label: 'Destructive' },
  { value: 'warning', label: 'Warning' },
];

const SIZE_OPTIONS: Array<{ value: ButtonSize; label: string }> = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

interface NavigationManagerProps {
  userId: string;
  initialMenuItems?: MenuItem[];
  initialPages?: Page[];
}

export function NavigationManager({ userId, initialMenuItems = [], initialPages = [] }: NavigationManagerProps) {
  const { showSuccess, showError } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [availablePages, setAvailablePages] = useState<Page[]>(initialPages);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [items, allPages] = await Promise.all([
        getMenuItemsAction(),
        getPagesAction(),
      ]);
      const publishedPages = allPages.filter(p => p.status === 'published');
      setMenuItems(items);
      setAvailablePages(publishedPages);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Error', 'Failed to load navigation data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Only load data if initialMenuItems and initialPages were empty
  useEffect(() => {
    if (initialMenuItems.length === 0 && initialPages.length === 0) {
      loadData();
    }
  }, [initialMenuItems.length, initialPages.length, loadData]);

  const handleAddPage = async (pageId: string) => {
    try {
      const page = availablePages.find((p) => p.id === pageId);
      if (!page) return;

      const maxOrder = menuItems.length > 0 ? Math.max(...menuItems.map((m) => m.order)) : -1;

      const result = await createMenuItemAction({
        pageId: page.id,
        label: page.title,
        order: maxOrder + 1,
        visible: true,
        variant: 'ghost',
        size: 'md',
      });

      if (result.success) {
        showSuccess('Success', 'Page added to navigation');
        await loadData();
      } else {
        showError('Error', result.error || 'Failed to add page to navigation');
      }
    } catch (error) {
      console.error('Error adding page:', error);
      showError('Error', 'Failed to add page to navigation');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const result = await deleteMenuItemAction(id);
      if (result.success) {
        showSuccess('Success', 'Menu item removed');
        setDeleteConfirm(null);
        // Remove from local state
        setMenuItems(menuItems.filter(item => item.id !== id));
      } else {
        showError('Error', result.error || 'Failed to remove menu item');
      }
    } catch (error) {
      console.error('Error removing menu item:', error);
      showError('Error', 'Failed to remove menu item');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newItems = [...menuItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];

    try {
      const updates = newItems.map((item, idx) => ({
        id: item.id,
        order: idx,
      }));

      const result = await reorderMenuItemsAction(updates);
      if (result.success) {
        showSuccess('Success', 'Menu items reordered');
        await loadData();
      } else {
        throw new Error(result.error || 'Failed to reorder');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      showError('Error', 'Failed to reorder menu items');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === menuItems.length - 1) return;

    const newItems = [...menuItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];

    try {
      const updates = newItems.map((item, idx) => ({
        id: item.id,
        order: idx,
      }));

      const result = await reorderMenuItemsAction(updates);
      if (result.success) {
        showSuccess('Success', 'Menu items reordered');
        await loadData();
      } else {
        throw new Error(result.error || 'Failed to reorder');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      showError('Error', 'Failed to reorder menu items');
    }
  };

  const handleVariantChange = async (itemId: string, variant: ButtonVariant) => {
    try {
      const result = await updateMenuItemAction(itemId, { variant });
      if (result.success) {
        showSuccess('Success', 'Variant updated');
        // Update local state
        setMenuItems(menuItems.map(item =>
          item.id === itemId ? { ...item, variant } : item
        ));
      } else {
        showError('Error', result.error || 'Failed to update variant');
      }
    } catch (error) {
      console.error('Error updating variant:', error);
      showError('Error', 'Failed to update variant');
    }
  };

  const handleSizeChange = async (itemId: string, size: ButtonSize) => {
    try {
      const result = await updateMenuItemAction(itemId, { size });
      if (result.success) {
        showSuccess('Success', 'Size updated');
        // Update local state
        setMenuItems(menuItems.map(item =>
          item.id === itemId ? { ...item, size } : item
        ));
      } else {
        showError('Error', result.error || 'Failed to update size');
      }
    } catch (error) {
      console.error('Error updating size:', error);
      showError('Error', 'Failed to update size');
    }
  };

  const handleVisibilityToggle = async (itemId: string, visible: boolean) => {
    try {
      const result = await updateMenuItemAction(itemId, { visible });
      if (result.success) {
        showSuccess('Success', visible ? 'Menu item shown' : 'Menu item hidden');
        // Update local state
        setMenuItems(menuItems.map(item =>
          item.id === itemId ? { ...item, visible } : item
        ));
      } else {
        showError('Error', result.error || 'Failed to update visibility');
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
      showError('Error', 'Failed to update visibility');
    }
  };

  if (loading) {
    return (
      <Box padding="8" display="flex" justifyContent="center">
        <Spinner size="lg" label="Loading navigation..." />
      </Box>
    );
  }

  const pagesInMenu = new Set(menuItems.map((item) => item.pageId));
  const availablePagesToAdd = availablePages.filter((page) => !pagesInMenu.has(page.id));

  return (
    <Box padding="4" display="flex" flexDirection="column" gap="lg">
      {/* Header */}
      <Box>
        <Heading level={2}>Navigation Menu</Heading>
        <Text variant="body-sm" semantic="secondary">
          Manage the navigation menu displayed on your website
        </Text>
      </Box>

      {/* Current Menu Items */}
      <Box display="flex" flexDirection="column" gap="md">
        <Heading level={3}>Menu Items</Heading>

        {menuItems.length === 0 ? (
          <Box padding="8" className="text-center border rounded">
            <Text variant="body" semantic="secondary">
              No menu items yet. Add pages from below.
            </Text>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap="sm">
            {menuItems.map((item, index) => {
              const page = availablePages.find((p) => p.id === item.pageId);
              return (
                <Box
                  key={item.id}
                  display="flex"
                  alignItems="center"
                  gap="md"
                  padding="4"
                  className="border rounded"
                >
                  {/* Order & Label */}
                  <Box flex="1" display="flex" alignItems="center" gap="sm">
                    <Box className="min-w-[30px]">
                      <Text variant="body-sm" semantic="secondary">
                        {index + 1}.
                      </Text>
                    </Box>
                    <Box display="flex" flexDirection="column">
                      <Text variant="body">{item.label}</Text>
                      <Text variant="body-sm" semantic="secondary">
                        /{page?.slug || 'unknown'}
                      </Text>
                    </Box>
                  </Box>

                  {/* Variant Select */}
                  <Box className="w-40">
                    <Select
                      value={item.variant}
                      onChange={(value) => handleVariantChange(item.id, value as ButtonVariant)}
                      options={VARIANT_OPTIONS}
                    />
                  </Box>

                  {/* Size Select */}
                  <Box className="w-32">
                    <Select
                      value={item.size}
                      onChange={(value) => handleSizeChange(item.id, value as ButtonSize)}
                      options={SIZE_OPTIONS}
                    />
                  </Box>

                  {/* Visibility Toggle */}
                  <Button
                    type="button"
                    variant={item.visible ? 'outline' : 'ghost'}
                    size="sm"
                    onClick={() => handleVisibilityToggle(item.id, !item.visible)}
                  >
                    {item.visible ? 'Visible' : 'Hidden'}
                  </Button>

                  {/* Reorder Buttons */}
                  <Box display="flex" gap="sm">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveUp(index)}
                      >
                        ↑
                      </Button>
                    )}
                    {index < menuItems.length - 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveDown(index)}
                      >
                        ↓
                      </Button>
                    )}
                  </Box>

                  {/* Delete */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirm(item.id)}
                  >
                    Remove
                  </Button>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Add Pages */}
      <Box display="flex" flexDirection="column" gap="md">
        <Heading level={3}>Add Pages to Menu</Heading>

        {availablePagesToAdd.length === 0 ? (
          <Box padding="4" className="border rounded">
            <Text variant="body-sm" semantic="secondary">
              All published pages are already in the menu.
            </Text>
          </Box>
        ) : (
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availablePagesToAdd.map((page) => (
              <Box
                key={page.id}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                padding="3"
                className="border rounded"
              >
                <Box display="flex" flexDirection="column">
                  <Text variant="body">{page.title}</Text>
                  <Text variant="body-sm" semantic="secondary">
                    /{page.slug}
                  </Text>
                </Box>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddPage(page.id)}
                >
                  Add to Menu
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Remove Menu Item"
        size="sm"
      >
        <ModalBody>
          <Text>Are you sure you want to remove this item from the navigation menu?</Text>
        </ModalBody>
        <ModalFooter>
          <Box display="flex" gap="sm" justifyContent="flex-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleRemove(deleteConfirm)}
            >
              Remove
            </Button>
          </Box>
        </ModalFooter>
      </Modal>
    </Box>
  );
}
