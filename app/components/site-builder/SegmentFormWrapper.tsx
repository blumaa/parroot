'use client';

import { useState, FormEvent } from 'react';
import { Box, Button, Heading, Text, Divider } from '@mond-design-system/theme';
import { Input, Modal, ModalBody, ModalFooter } from '@mond-design-system/theme/client';
import type { Segment, SegmentType } from '@/app/types';
import { useToast } from '@/app/providers/ToastProvider';
import { useCreateSegment, useUpdateSegment, useDeleteSegment } from '@/app/hooks/useSiteBuilderData';
import { TextBlockSegmentForm } from '../admin/segment-forms/TextBlockSegmentForm';
import { CarouselSegmentForm } from '../admin/segment-forms/CarouselSegmentForm';
import { GallerySegmentForm } from '../admin/segment-forms/GallerySegmentForm';
import { CTASegmentForm } from '../admin/segment-forms/CTASegmentForm';
import { FormSegmentForm } from '../admin/segment-forms/FormSegmentForm';
import { PostsSegmentForm } from '../admin/segment-forms/PostsSegmentForm';

const SEGMENT_TYPES: {
  value: SegmentType;
  label: string;
  description: string;
}[] = [
  { value: 'carousel', label: 'Carousel', description: 'Rotating image or content slider' },
  { value: 'text-block', label: 'Text Block', description: 'Rich text content section' },
  { value: 'gallery', label: 'Gallery', description: 'Grid of images or media' },
  { value: 'cta', label: 'Call to Action', description: 'Prominent call-to-action section' },
  { value: 'form', label: 'Form', description: 'Customizable form with multiple field types' },
  { value: 'posts', label: 'Posts', description: 'Display and manage a collection of posts' },
];

interface SegmentFormWrapperProps {
  segment?: Segment;
  initialType?: SegmentType;
  onClose: () => void;
}

export function SegmentFormWrapper({
  segment,
  initialType,
  onClose,
}: SegmentFormWrapperProps) {
  const { showSuccess, showError } = useToast();
  const createSegment = useCreateSegment();
  const updateSegment = useUpdateSegment();
  const deleteSegment = useDeleteSegment();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state - segment data is guaranteed to be loaded before this component renders
  const [name, setName] = useState(segment?.name || '');
  const [type] = useState<SegmentType>(segment?.type || initialType || 'carousel');
  const [status, setStatus] = useState<'draft' | 'published'>(segment?.status || 'draft');
  const [content, setContent] = useState<Record<string, unknown>>(segment?.content?.en || {});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !type) {
      showError('Error', 'Name and type are required');
      return;
    }

    setLoading(true);

    try {
      const segmentData = {
        name,
        type,
        status,
        config: {},
        content: { en: content },
      };

      if (segment) {
        await updateSegment.mutateAsync({
          id: segment.id,
          data: segmentData,
        });
        showSuccess('Success', 'Segment updated successfully');
      } else {
        await createSegment.mutateAsync({
          ...segmentData,
          createdBy: 'temp-user-id',
          updatedBy: 'temp-user-id',
        });
        showSuccess('Success', 'Segment created successfully');
      }

      onClose();
    } catch (error) {
      showError(
        'Error',
        error instanceof Error ? error.message : 'Failed to save segment'
      );
      console.error('Error saving segment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!segment) return;

    try {
      await deleteSegment.mutateAsync(segment.id);
      showSuccess('Success', 'Segment deleted successfully');
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      showError('Error', 'Failed to delete segment');
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Box padding="4" display="flex" flexDirection="column" gap="lg">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading level={3} size="md">
            {segment
              ? 'Edit Segment'
              : `Create New ${SEGMENT_TYPES.find((st) => st.value === type)?.label || 'Segment'}`}
          </Heading>
        </Box>

        {/* Basic Info */}
        <Box display="flex" gap="md">
          <Box display="flex" flexDirection="column" gap="sm" flex="1">
            <Text as="label">Name</Text>
            <Input
              type="text"
              placeholder="e.g., Summer Sale Hero"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Box>

          <Box display="flex" flexDirection="column" gap="sm">
            <Text as="label">Status</Text>
            <Box display="flex" gap="sm">
              <Button
                type="button"
                variant={status === 'draft' ? 'primary' : 'outline'}
                onClick={() => setStatus('draft')}
              >
                Draft
              </Button>
              <Button
                type="button"
                variant={status === 'published' ? 'primary' : 'outline'}
                onClick={() => setStatus('published')}
              >
                Published
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider variant="strong" />

        {/* Dynamic Content Fields Based on Type */}
        <Box display="flex" flexDirection="column" gap="md">
          {type === 'text-block' && (
            <TextBlockSegmentForm content={content} onContentChange={setContent} />
          )}
          {type === 'carousel' && (
            <CarouselSegmentForm content={content} onContentChange={setContent} />
          )}
          {type === 'gallery' && (
            <GallerySegmentForm content={content} onContentChange={setContent} />
          )}
          {type === 'cta' && (
            <CTASegmentForm content={content} onContentChange={setContent} />
          )}
          {type === 'form' && (
            <FormSegmentForm content={content} onContentChange={setContent} />
          )}
          {type === 'posts' && (
            <PostsSegmentForm content={content} onContentChange={setContent} />
          )}
        </Box>

        {/* Actions */}
        <Box display="flex" gap="sm" justifyContent="space-between">
          <Box display="flex" gap="sm">
            <Button type="submit" variant="primary" loading={loading}>
              {segment ? 'Update Segment' : 'Create Segment'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </Box>

          {segment && (
            <Button type="button" variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </Button>
          )}
        </Box>
      </Box>
      </form>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Segment"
        size="sm"
      >
        <ModalBody>
          <Text>Are you sure you want to delete this segment? This action cannot be undone.</Text>
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
    </>
  );
}
