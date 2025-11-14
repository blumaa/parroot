'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Box, Button, Text, Heading, Badge, Spinner } from '@mond-design-system/theme';
import { Input, Modal, ModalBody, ModalFooter } from '@mond-design-system/theme/client';
import { getSegments, deleteSegment, type Segment, type SegmentType } from '@/app/utils/firestore-segments';
import { useToast } from '@/app/providers/ToastProvider';

const SEGMENT_TYPE_LABELS: Record<SegmentType, string> = {
  carousel: 'Carousel',
  gallery: 'Gallery',
  'text-block': 'Text Block',
  hero: 'Hero',
  cta: 'CTA',
  testimonials: 'Testimonials',
  faq: 'FAQ',
  team: 'Team',
  'form': 'Form',
};

interface SegmentListProps {
  onDelete?: () => void;
}

export function SegmentList({ onDelete }: SegmentListProps) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [filteredSegments, setFilteredSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [typeFilter, setTypeFilter] = useState<SegmentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const loadSegments = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedSegments = await getSegments();
      setSegments(fetchedSegments);
    } catch (error) {
      showError('Error', 'Failed to load segments');
      console.error('Error loading segments:', error);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const filterSegments = useCallback(() => {
    let filtered = [...segments];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((segment) => segment.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((segment) => segment.type === typeFilter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((segment) => segment.name.toLowerCase().includes(query));
    }

    setFilteredSegments(filtered);
  }, [segments, statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    loadSegments();
  }, [loadSegments]);

  useEffect(() => {
    filterSegments();
  }, [filterSegments]);

  const handleDelete = async (id: string) => {
    try {
      await deleteSegment(id);
      showSuccess('Success', 'Segment deleted successfully');
      setDeleteConfirm(null);
      await loadSegments();
      onDelete?.();
    } catch (error) {
      showError('Error', 'Failed to delete segment');
      console.error('Error deleting segment:', error);
    }
  };

  if (loading) {
    return (
      <Box padding="8" display="flex" justifyContent="center">
        <Spinner size="lg" label="Loading segments..." />
      </Box>
    );
  }

  // Get unique types from segments
  const availableTypes = Array.from(new Set(segments.map((s) => s.type)));

  return (
    <Box padding="4" display="flex" flexDirection="column" gap="md">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading level={2}>Segments</Heading>
        <Link href="/admin/segments/new">
          <Button variant="primary">Create New Segment</Button>
        </Link>
      </Box>

      {/* Filters */}
      <Box display="flex" flexDirection="column" gap="md">
        {/* Status Filter */}
        <Box display="flex" gap="sm">
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('all')}
          >
            All ({segments.length})
          </Button>
          <Button
            variant={statusFilter === 'published' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('published')}
          >
            Published ({segments.filter((s) => s.status === 'published').length})
          </Button>
          <Button
            variant={statusFilter === 'draft' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('draft')}
          >
            Draft ({segments.filter((s) => s.status === 'draft').length})
          </Button>
        </Box>

        {/* Type Filter */}
        <Box display="flex" gap="sm" className="flex-wrap">
          <Button
            variant={typeFilter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            All Types
          </Button>
          {availableTypes.map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(type)}
            >
              {SEGMENT_TYPE_LABELS[type]} ({segments.filter((s) => s.type === type).length})
            </Button>
          ))}
        </Box>

        {/* Search */}
        <Box flex="1">
          <Input
            label="Search"
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
      </Box>

      {/* Segments Table */}
      {filteredSegments.length === 0 ? (
        <Box padding="8" className="text-center">
          <Text variant="body" semantic="secondary">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No segments found'
              : 'No segments yet. Create your first segment!'}
          </Text>
        </Box>
      ) : (
        <Box className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">
                  <Text variant="body-sm" semantic="secondary">
                    Name
                  </Text>
                </th>
                <th className="text-left p-3">
                  <Text variant="body-sm" semantic="secondary">
                    Type
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
              {filteredSegments.map((segment) => (
                <tr key={segment.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <Text variant="body-sm">{segment.name}</Text>
                  </td>
                  <td className="p-3">
                    <Badge variant="error" size='sm'>{SEGMENT_TYPE_LABELS[segment.type]}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={segment.status === 'published' ? 'success' : 'warning'}>
                      {segment.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Text variant="body-sm" semantic="secondary">
                      {new Date(segment.updatedAt).toLocaleDateString()}
                    </Text>
                  </td>
                  <td className="p-3">
                    <Box display="flex" gap="sm" justifyContent="flex-end">
                      <Link href={`/admin/segments/${segment.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteConfirm(segment.id)}
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
        title="Delete Segment"
        size="sm"
      >
        <ModalBody>
          <Text>Are you sure you want to delete this segment? This action cannot be undone.</Text>
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
