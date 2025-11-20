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
  initialMenuItems?: MenuItem[];
  initialPages?: Page[];
}

export function NavigationManager({ initialMenuItems = [], initialPages = [] }: NavigationManagerProps) {
  const { showSuccess, showError } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [availablePages, setAvailablePages] = useState<Page[]>(initialPages);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [addingSubmenuTo, setAddingSubmenuTo] = useState<string | null>(null);

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

  const handleAddPage = async (pageId: string, parentId?: string) => {
    try {
      const page = availablePages.find((p) => p.id === pageId);
      if (!page) return;

      // Calculate order: if parentId exists, find max order among siblings
      let maxOrder = -1;
      if (parentId) {
        const parent = menuItems.find(item => item.id === parentId);
        if (parent && parent.children && parent.children.length > 0) {
          maxOrder = Math.max(...parent.children.map((m) => m.order));
        }
      } else {
        // Top-level item
        maxOrder = menuItems.length > 0 ? Math.max(...menuItems.map((m) => m.order)) : -1;
      }

      const result = await createMenuItemAction({
        pageId: page.id,
        label: page.title,
        order: maxOrder + 1,
        visible: true,
        variant: 'ghost',
        size: 'md',
        parentId,
      });

      if (result.success) {
        showSuccess('Success', `Page added to ${parentId ? 'submenu' : 'navigation'}`);
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

  const handleMoveUp = async (siblings: MenuItem[], index: number) => {
    if (index === 0) return;

    const newSiblings = [...siblings];
    [newSiblings[index - 1], newSiblings[index]] = [newSiblings[index], newSiblings[index - 1]];

    try {
      const updates = newSiblings.map((item, idx) => ({
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

  const handleMoveDown = async (siblings: MenuItem[], index: number) => {
    if (index === siblings.length - 1) return;

    const newSiblings = [...siblings];
    [newSiblings[index], newSiblings[index + 1]] = [newSiblings[index + 1], newSiblings[index]];

    try {
      const updates = newSiblings.map((item, idx) => ({
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
        // Update local state (including nested children)
        const updateVariant = (items: MenuItem[]): MenuItem[] => {
          return items.map(item => {
            if (item.id === itemId) {
              return { ...item, variant };
            }
            if (item.children && item.children.length > 0) {
              return { ...item, children: updateVariant(item.children) };
            }
            return item;
          });
        };
        setMenuItems(updateVariant(menuItems));
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
        // Update local state (including nested children)
        const updateSize = (items: MenuItem[]): MenuItem[] => {
          return items.map(item => {
            if (item.id === itemId) {
              return { ...item, size };
            }
            if (item.children && item.children.length > 0) {
              return { ...item, children: updateSize(item.children) };
            }
            return item;
          });
        };
        setMenuItems(updateSize(menuItems));
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
        // Update local state (including nested children)
        const updateVisibility = (items: MenuItem[]): MenuItem[] => {
          return items.map(item => {
            if (item.id === itemId) {
              return { ...item, visible };
            }
            if (item.children && item.children.length > 0) {
              return { ...item, children: updateVisibility(item.children) };
            }
            return item;
          });
        };
        setMenuItems(updateVisibility(menuItems));
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

  // Helper function to get all pageIds used in menu (including children)
  const getAllUsedPageIds = (items: MenuItem[]): Set<string> => {
    const usedIds = new Set<string>();
    const addIds = (menuItems: MenuItem[]) => {
      menuItems.forEach(item => {
        usedIds.add(item.pageId);
        if (item.children && item.children.length > 0) {
          addIds(item.children);
        }
      });
    };
    addIds(items);
    return usedIds;
  };

  const pagesInMenu = getAllUsedPageIds(menuItems);
  const availablePagesToAdd = availablePages.filter((page) => !pagesInMenu.has(page.id));

  // Recursive component to render menu items with nested children
  const renderMenuItem = (item: MenuItem, index: number, siblings: MenuItem[], depth: number = 0) => {
    const page = availablePages.find((p) => p.id === item.pageId);
    const hasChildren = item.children && item.children.length > 0;
    const indentClass = depth > 0 ? `ml-${depth * 8}` : '';

    return (
      <Box key={item.id} display="flex" flexDirection="column" gap="sm">
        <Box
          display="flex"
          alignItems="center"
          gap="md"
          padding="4"
          className={`border rounded ${indentClass}`}
        >
          {/* Order & Label */}
          <Box flex="1" display="flex" alignItems="center" gap="sm">
            <Box className="min-w-[30px]">
              <Text variant="body-sm" semantic="secondary">
                {depth > 0 ? '└' : ''} {index + 1}.
              </Text>
            </Box>
            <Box display="flex" flexDirection="column">
              <Text variant="body">{page?.title || 'Untitled'}</Text>
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

          {/* Add Submenu (only for top-level items) */}
          {depth === 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddingSubmenuTo(item.id)}
            >
              + Submenu
            </Button>
          )}

          {/* Reorder Buttons */}
          <Box display="flex" gap="sm">
            {index > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMoveUp(siblings, index)}
              >
                ↑
              </Button>
            )}
            {index < siblings.length - 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMoveDown(siblings, index)}
              >
                ↓
              </Button>
            )}
          </Box>

          {/* Delete */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setDeleteConfirm(item.id)}
          >
            Remove
          </Button>
        </Box>

        {/* Render children */}
        {hasChildren && (
          <Box display="flex" flexDirection="column" gap="sm" paddingLeft="8">
            {item.children!.map((child, childIndex) =>
              renderMenuItem(child, childIndex, item.children!, depth + 1)
            )}
          </Box>
        )}
      </Box>
    );
  };

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
            {menuItems.map((item, index) => renderMenuItem(item, index, menuItems, 0))}
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

      {/* Add Submenu Modal */}
      <Modal
        isOpen={addingSubmenuTo !== null}
        onClose={() => setAddingSubmenuTo(null)}
        title="Add Submenu Item"
        size="md"
      >
        <ModalBody>
          <Box display="flex" flexDirection="column" gap="md">
            <Text variant="body">Select a page to add as a submenu item:</Text>
            {availablePagesToAdd.length === 0 ? (
              <Text variant="body-sm" semantic="secondary">
                All published pages are already in the menu.
              </Text>
            ) : (
              <Box display="flex" flexDirection="column" gap="sm">
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
                      onClick={() => {
                        if (addingSubmenuTo) {
                          handleAddPage(page.id, addingSubmenuTo);
                          setAddingSubmenuTo(null);
                        }
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Box display="flex" gap="sm" justifyContent="flex-end">
            <Button variant="outline" onClick={() => setAddingSubmenuTo(null)}>
              Cancel
            </Button>
          </Box>
        </ModalFooter>
      </Modal>
    </Box>
  );
}
