'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Box, Button, Text, Heading, Badge, Spinner, Divider } from '@mond-design-system/theme';
import { Input, Modal, ModalBody, ModalFooter } from '@mond-design-system/theme/client';
import type { Page } from '@/app/types';
import { getPagesAction } from '@/app/actions/pages';
import { deletePageAction } from '@/app/actions/pages';
import { useToast } from '@/app/providers/ToastProvider';

interface PageListProps {
  onDelete?: () => void;
  initialPages?: Page[];
}

export function PageList({ onDelete, initialPages = [] }: PageListProps) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [filteredPages, setFilteredPages] = useState<Page[]>(initialPages);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedPages = await getPagesAction();
      setPages(fetchedPages);
    } catch (error) {
      showError('Error', 'Failed to load pages');
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const filterPages = useCallback(() => {
    let filtered = [...pages];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((page) => page.status === statusFilter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (page) =>
          page.title.toLowerCase().includes(query) || page.slug.toLowerCase().includes(query)
      );
    }

    setFilteredPages(filtered);
  }, [pages, statusFilter, searchQuery]);

  // Only load pages if initialPages was empty
  useEffect(() => {
    if (initialPages.length === 0) {
      loadPages();
    }
  }, [initialPages.length, loadPages]);

  useEffect(() => {
    filterPages();
  }, [filterPages]);

  const handleDelete = async (id: string) => {
    try {
      const result = await deletePageAction(id);
      if (result.success) {
        showSuccess('Success', 'Page deleted successfully');
        setDeleteConfirm(null);
        // Remove from local state
        setPages(pages.filter(p => p.id !== id));
        onDelete?.();
      } else {
        showError('Error', result.error || 'Failed to delete page');
      }
    } catch (error) {
      showError('Error', 'Failed to delete page');
      console.error('Error deleting page:', error);
    }
  };

  if (loading) {
    return (
      <Box padding="8" display="flex" justifyContent="center">
        <Spinner size="lg" label="Loading pages..." />
      </Box>
    );
  }

  return (
    <Box padding="4" display="flex" flexDirection="column" gap="md">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading level={2}>Pages</Heading>
        <Link href="/admin/pages/new">
          <Button variant="primary">Create New Page</Button>
        </Link>
      </Box>

      {/* Filters */}
      <Box display="flex" gap="md" alignItems="center">
        <Box display="flex" gap="sm">
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('all')}
          >
            All ({pages.length})
          </Button>
          <Button
            variant={statusFilter === 'published' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('published')}
          >
            Published ({pages.filter((p) => p.status === 'published').length})
          </Button>
          <Button
            variant={statusFilter === 'draft' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('draft')}
          >
            Draft ({pages.filter((p) => p.status === 'draft').length})
          </Button>
        </Box>
        <Divider orientation="vertical" />
        <Box flex="1" display='flex' gap='sm' alignItems='center'>
          <Text>
            Search
          </Text>
          <Input
            // label="Search"
            type="text"
            placeholder="Search by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
      </Box>

      {/* Pages Table */}
      {filteredPages.length === 0 ? (
        <Box padding="8" className="text-center">
          <Text variant="body" semantic="secondary">
            {searchQuery || statusFilter !== 'all' ? 'No pages found' : 'No pages yet. Create your first page!'}
          </Text>
        </Box>
      ) : (
        <Box className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">
                  <Text variant="body-sm" semantic="secondary">
                    Title
                  </Text>
                </th>
                <th className="text-left p-3">
                  <Text variant="body-sm" semantic="secondary">
                    Slug
                  </Text>
                </th>
                <th className="text-left p-3">
                  <Text variant="body-sm" semantic="secondary">
                    Status
                  </Text>
                </th>
                <th className="text-left p-3">
                  <Text variant="body-sm" semantic="secondary">
                    Updated
                  </Text>
                </th>
                <th className="text-right p-3">
                  <Text variant="body-sm" semantic="secondary">
                    Actions
                  </Text>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((page) => (
                <tr key={page.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <Text variant="body">{page.title}</Text>
                  </td>
                  <td className="p-3">
                    <Text variant="body-sm" semantic="secondary">
                      /{page.slug}
                    </Text>
                  </td>
                  <td className="p-3">
                    <Badge variant={page.status === 'published' ? 'success' : 'warning'}>
                      {page.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Text variant="body-sm" semantic="secondary">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </Text>
                  </td>
                  <td className="p-3">
                    <Box display="flex" gap="sm" justifyContent="flex-end">
                      <Link href={`/admin/pages/${page.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(page.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Page"
        size="sm"
      >
        <ModalBody>
          <Text>Are you sure you want to delete this page? This action cannot be undone.</Text>
        </ModalBody>
        <ModalFooter>
          <Box display="flex" gap="sm" justifyContent="flex-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </Box>
        </ModalFooter>
      </Modal>
    </Box>
  );
}
