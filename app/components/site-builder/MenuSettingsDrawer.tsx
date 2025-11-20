"use client";

import {
  Box,
  Button,
  Heading,
  Text,
  Card,
  Divider,
} from "@mond-design-system/theme";
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
  Input,
  Select,
  Checkbox,
  Radio,
  Modal,
  ModalBody,
  ModalFooter,
} from "@mond-design-system/theme/client";
import { useSiteBuilder } from "@/app/contexts/SiteBuilderContext";
import {
  useMenuItems,
  usePages,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useCreatePage,
} from "@/app/hooks/useSiteBuilderData";
import { updateMenuItemAction } from "@/app/actions/siteBuilderActions";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { MenuItem, ButtonVariant, ButtonSize } from "@/app/types";

const VARIANT_OPTIONS = [
  { value: "primary", label: "Primary" },
  { value: "outline", label: "Outline" },
  { value: "ghost", label: "Ghost" },
  { value: "destructive", label: "Destructive" },
  { value: "warning", label: "Warning" },
];

const SIZE_OPTIONS = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

type FormMode = "list" | "add-top-level" | "add-submenu" | "edit";

export function MenuSettingsDrawer() {
  const { isMenuSettingsOpen, closeMenuSettings } = useSiteBuilder();
  const { data: menuItems } = useMenuItems();
  const { data: pages } = usePages();
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const createPage = useCreatePage();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<FormMode>("list");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [parentItemId, setParentItemId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [createNewPage, setCreateNewPage] = useState(true);
  const [pageName, setPageName] = useState("");
  const [formData, setFormData] = useState({
    pageId: "",
    visible: true,
    variant: "ghost" as ButtonVariant,
    size: "md" as ButtonSize,
    order: 0,
  });

  // menuItems already comes as a hierarchical structure with children populated
  const topLevelItems = menuItems || [];

  const handleEdit = (item: MenuItem) => {
    setEditingItemId(item.id);
    setFormData({
      pageId: item.pageId,
      visible: item.visible,
      variant: item.variant,
      size: item.size,
      order: item.order,
    });
    setMode("edit");
  };

  const handleAddTopLevel = () => {
    setEditingItemId(null);
    setParentItemId(null);
    setCreateNewPage(true);
    setPageName("");
    setFormData({
      pageId: "",
      visible: true,
      variant: "ghost",
      size: "md",
      order: topLevelItems.length + 1,
    });
    setMode("add-top-level");
  };

  const handleAddSubmenu = (parentId: string) => {
    setEditingItemId(null);
    setParentItemId(parentId);
    setCreateNewPage(true);
    setPageName("");

    // Find the parent item to get its children count
    const findItem = (items: MenuItem[]): MenuItem | undefined => {
      for (const item of items) {
        if (item.id === parentId) return item;
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    const parent = findItem(topLevelItems);
    const siblings = parent?.children || [];

    setFormData({
      pageId: "",
      visible: true,
      variant: "ghost",
      size: "sm",
      order: siblings.length + 1,
    });
    setMode("add-submenu");
  };

  const handleSave = async () => {
    const userId = "temp-user-id";

    if (editingItemId) {
      // Editing existing menu item
      await updateMenuItem.mutateAsync({
        id: editingItemId,
        data: {
          ...formData,
          updatedBy: userId,
        },
      });
    } else {
      // Creating new menu item (top-level or submenu)
      let pageId = formData.pageId;

      if (createNewPage) {
        // Create a new page
        const slug = pageName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        const newPage = await createPage.mutateAsync({
          title: pageName,
          slug,
          description: "",
          status: "published",
          headerSegmentId: null,
          mainSegmentId: null,
          footerSegmentId: null,
          createdBy: userId,
          updatedBy: userId,
        });

        pageId = newPage.id;
      }

      // Create menu item with the page (new or selected)
      await createMenuItem.mutateAsync({
        ...formData,
        pageId,
        parentId: parentItemId || undefined,
        createdBy: userId,
        updatedBy: userId,
      });
    }

    setMode("list");
    setEditingItemId(null);
    setParentItemId(null);
  };

  const handleMoveUp = async (item: MenuItem, siblings: MenuItem[]) => {
    const currentIndex = siblings.findIndex((s) => s.id === item.id);
    if (currentIndex <= 0) return;

    const prevItem = siblings[currentIndex - 1];
    const userId = "temp-user-id";

    try {
      // Use server action directly and manually invalidate to avoid race conditions
      await Promise.all([
        updateMenuItemAction(item.id, {
          order: prevItem.order,
          updatedBy: userId,
        }),
        updateMenuItemAction(prevItem.id, {
          order: item.order,
          updatedBy: userId,
        }),
      ]);

      // Manually invalidate queries after both updates complete
      await queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    } catch (error) {
      console.error("Error moving item up:", error);
    }
  };

  const handleMoveDown = async (item: MenuItem, siblings: MenuItem[]) => {
    const currentIndex = siblings.findIndex((s) => s.id === item.id);
    if (currentIndex >= siblings.length - 1) return;

    const nextItem = siblings[currentIndex + 1];
    const userId = "temp-user-id";

    try {
      // Use server action directly and manually invalidate to avoid race conditions
      await Promise.all([
        updateMenuItemAction(item.id, {
          order: nextItem.order,
          updatedBy: userId,
        }),
        updateMenuItemAction(nextItem.id, {
          order: item.order,
          updatedBy: userId,
        }),
      ]);

      // Manually invalidate queries after both updates complete
      await queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    } catch (error) {
      console.error("Error moving item down:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await deleteMenuItem.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting menu item:", error);
      setDeleteConfirmId(null);
    }
  };

  const handleCancel = () => {
    setMode("list");
    setEditingItemId(null);
    setParentItemId(null);
  };

  const pageOptions =
    pages?.map((page) => ({ value: page.id, label: page.title })) || [];

  const renderMenuItem = (
    item: MenuItem,
    siblings: MenuItem[],
    isChild = false,
  ) => {
    const page = pages?.find((p) => p.id === item.pageId);
    const children = item.children || [];
    const itemIndex = siblings.findIndex((s) => s.id === item.id);

    return (
      <Box key={item.id} display="flex" flexDirection="column" gap="xs">
        <Card>
          <Box
            padding="3"
            paddingLeft={isChild ? "6" : "3"}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box flex="1">
              <Box display="flex" alignItems="center" gap="xs">
                {isChild && (
                  <Text variant="body-sm" semantic="secondary">
                    └─
                  </Text>
                )}
                <Heading level={5} size="sm">
                  {page?.title || "Unknown page"}
                </Heading>
              </Box>
              <Text variant="body" semantic="secondary">
                {item.visible ? "Visible" : "Hidden"}
              </Text>
            </Box>
            <Box display="flex" gap="xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMoveUp(item, siblings)}
                disabled={itemIndex === 0}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMoveDown(item, siblings)}
                disabled={itemIndex === siblings.length - 1}
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(item)}
              >
                Edit
              </Button>
              {!isChild && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddSubmenu(item.id)}
                >
                  + Sub
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirmId(item.id)}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Card>
        {children.length > 0 && (
          <Box display="flex" flexDirection="column" gap="xs">
            {children.map((child: MenuItem) =>
              renderMenuItem(child, children, true),
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Drawer isOpen={isMenuSettingsOpen} onClose={closeMenuSettings} width="xl">
      <DrawerHeader onClose={closeMenuSettings}>
        <Heading level={3} size="lg">
          Menu Settings
        </Heading>
      </DrawerHeader>

      <DrawerBody>
        <Box display="flex" flexDirection="column" gap="lg" padding="4">
          {mode === "list" ? (
            <>
              <Box display="flex" flexDirection="column" gap="sm">
                {topLevelItems.length > 0 ? (
                  topLevelItems.map((item) =>
                    renderMenuItem(item, topLevelItems),
                  )
                ) : (
                  <Box padding="4">
                    <Text variant="body" semantic="secondary">
                      No menu items yet
                    </Text>
                  </Box>
                )}
              </Box>

              <Box display="flex" justifyContent="flex-end">
                <Button variant="primary" onClick={handleAddTopLevel}>
                  Add Menu Item
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Heading level={4} size="sm">
                {mode === "edit"
                  ? "Edit Menu Item"
                  : mode === "add-submenu"
                    ? "Add Submenu Item"
                    : "Add Menu Item"}
              </Heading>

              {mode === "edit" && (
                <Box display="flex" flexDirection="column" gap="sm">
                  <Select
                    options={pageOptions}
                    value={formData.pageId}
                    onChange={(value) =>
                      setFormData({ ...formData, pageId: value })
                    }
                    placeholder="Select a page"
                  />
                </Box>
              )}

              {(mode === "add-top-level" || mode === "add-submenu") && (
                <Box display="flex" flexDirection="column" gap="sm">
                  <Box display="flex" gap="md">
                    <Radio
                      label="Create new page"
                      name="page-option"
                      value="create"
                      checked={createNewPage}
                      onChange={(e) =>
                        setCreateNewPage(e.target.value === "create")
                      }
                    />
                    <Radio
                      label="Select existing page"
                      name="page-option"
                      value="select"
                      checked={!createNewPage}
                      onChange={(e) =>
                        setCreateNewPage(e.target.value === "create")
                      }
                    />
                  </Box>
                </Box>
              )}

              {(mode === "add-top-level" || mode === "add-submenu") &&
                createNewPage && (
                  <Box display="flex" flexDirection="column" gap="sm">
                    <Input
                      value={pageName}
                      onChange={(e) => setPageName(e.target.value)}
                      placeholder="Enter page name"
                      required
                    />
                    <Text variant="body-sm" semantic="secondary">
                      A new page will be created with this name
                    </Text>
                  </Box>
                )}

              {(mode === "add-top-level" || mode === "add-submenu") &&
                !createNewPage && (
                  <Box display="flex" flexDirection="column" gap="sm">
                    <Select
                      options={pageOptions}
                      value={formData.pageId}
                      onChange={(value) =>
                        setFormData({ ...formData, pageId: value })
                      }
                      placeholder="Select a page"
                    />
                  </Box>
                )}

              <Box display="flex" flexDirection="column" gap="md">
                <Box display="flex" flexDirection="column" gap="sm">
                  <Text as="label">Variant</Text>
                  <Select
                    options={VARIANT_OPTIONS}
                    value={formData.variant}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        variant: value as ButtonVariant,
                      })
                    }
                  />
                </Box>

                <Box display="flex" flexDirection="column" gap="sm">
                  <Text as="label">Size</Text>
                  <Select
                    options={SIZE_OPTIONS}
                    value={formData.size}
                    onChange={(value) =>
                      setFormData({ ...formData, size: value as ButtonSize })
                    }
                  />
                </Box>
              </Box>

              <Box>
                <Checkbox
                  label="Visible"
                  checked={formData.visible}
                  onChange={(e) =>
                    setFormData({ ...formData, visible: e.target.checked })
                  }
                />
              </Box>

              <Box display="flex" gap="sm">
                <Button variant="primary" onClick={handleSave}>
                  {editingItemId ? "Update" : "Create"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </Box>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteConfirmId !== null}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Menu Item"
          size="sm"
        >
          <ModalBody>
            <Text>
              Are you sure you want to delete this menu item? This action cannot
              be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Box display="flex" gap="sm" justifyContent="flex-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
              >
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
