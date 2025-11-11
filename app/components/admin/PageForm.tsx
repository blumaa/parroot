'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Heading, Text } from '@mond-design-system/theme';
import { Input, Textarea } from '@mond-design-system/theme/client';
import {
  createPage,
  updatePage,
  generateSlug,
  isSlugUnique,
  type Page,
  type PageInput,
} from '@/app/utils/firestore-pages';
import { getSegments, type Segment } from '@/app/utils/firestore-segments';
import { useToast } from '@/app/providers/ToastProvider';

interface PageFormProps {
  page?: Page;
  userId: string;
}

export function PageForm({ page, userId }: PageFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState(page?.title || '');
  const [slug, setSlug] = useState(page?.slug || '');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState(page?.description || '');
  const [status, setStatus] = useState<'draft' | 'published'>(page?.status || 'draft');
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>(page?.segments || []);

  // Segment library
  const [availableSegments, setAvailableSegments] = useState<Segment[]>([]);
  const [loadingSegments, setLoadingSegments] = useState(true);

  // Validation state
  const [slugError, setSlugError] = useState('');

  // Auto-generate slug from title if not manually edited
  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slugTouched]);

  // Load available segments
  const loadSegments = useCallback(async () => {
    try {
      setLoadingSegments(true);
      const segments = await getSegments({ status: 'published' });
      setAvailableSegments(segments);
    } catch (error) {
      console.error('Error loading segments:', error);
      showError('Error', 'Failed to load segments');
    } finally {
      setLoadingSegments(false);
    }
  }, [showError]);

  useEffect(() => {
    loadSegments();
  }, [loadSegments]);

  // Validate slug uniqueness
  useEffect(() => {
    const validateSlug = async () => {
      if (!slug) {
        setSlugError('Slug is required');
        return;
      }

      const unique = await isSlugUnique(slug, page?.id);
      if (!unique) {
        setSlugError('This slug is already in use');
      } else {
        setSlugError('');
      }
    };

    if (slug) {
      const timer = setTimeout(validateSlug, 500);
      return () => clearTimeout(timer);
    }
  }, [slug, page?.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title || !slug) {
      showError('Error', 'Title and slug are required');
      return;
    }

    if (slugError) {
      showError('Error', 'Please fix validation errors');
      return;
    }

    setLoading(true);

    try {
      const pageInput: PageInput = {
        title,
        slug,
        description,
        status,
        segments: selectedSegmentIds,
      };

      if (page) {
        await updatePage(page.id, pageInput, userId);
        showSuccess('Success', 'Page updated successfully');
      } else {
        await createPage(pageInput, userId);
        showSuccess('Success', 'Page created successfully');
      }

      router.push('/admin/pages');
    } catch (error) {
      showError('Error', error instanceof Error ? error.message : 'Failed to save page');
      console.error('Error saving page:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box padding="4" display="flex" flexDirection="column" gap="lg" className="max-w-4xl">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading level={2}>{page ? 'Edit Page' : 'Create New Page'}</Heading>
          <Box display="flex" gap="sm">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading || !!slugError}>
              {loading ? 'Saving...' : page ? 'Update Page' : 'Create Page'}
            </Button>
          </Box>
        </Box>

        {/* Basic Info */}
        <Box display="flex" flexDirection="column" gap="md">
          <Heading level={3}>Basic Information</Heading>

          <Input
            label="Title"
            type="text"
            placeholder="Page title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Box>
            <Input
              label="Slug"
              type="text"
              placeholder="page-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              required
              error={slugError}
            />
            {!slugError && slug && (
              <Box marginTop="1">
                <span className="text-sm text-gray-500">Preview: /{slug}</span>
              </Box>
            )}
          </Box>

          <Textarea
            label="Description"
            placeholder="Brief description of the page (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <Box>
            <label className="block text-sm font-medium mb-2">Status</label>
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

        {/* Segments Section */}
        <Box display="flex" flexDirection="column" gap="md">
          <Heading level={3}>Page Segments</Heading>

          {loadingSegments ? (
            <Text variant="body-sm" semantic="secondary">
              Loading segments...
            </Text>
          ) : (
            <>
              {/* Selected Segments */}
              {selectedSegmentIds.length > 0 && (
                <Box display="flex" flexDirection="column" gap="sm">
                  <Text variant="body-sm" semantic="secondary">
                    Selected segments (in order):
                  </Text>
                  {selectedSegmentIds.map((segmentId, index) => {
                    const segment = availableSegments.find((s) => s.id === segmentId);
                    if (!segment) return null;
                    return (
                      <Box
                        key={segmentId}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        padding="3"
                        className="border rounded"
                      >
                        <Box display="flex" alignItems="center" gap="sm">
                          <Text variant="body-sm" semantic="secondary">
                            {index + 1}.
                          </Text>
                          <Box display="flex" flexDirection="column">
                            <Text variant="body">{segment.name}</Text>
                            <Text variant="body-sm" semantic="secondary">
                              {segment.type}
                            </Text>
                          </Box>
                        </Box>
                        <Box display="flex" gap="sm">
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newIds = [...selectedSegmentIds];
                                [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
                                setSelectedSegmentIds(newIds);
                              }}
                            >
                              ↑
                            </Button>
                          )}
                          {index < selectedSegmentIds.length - 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newIds = [...selectedSegmentIds];
                                [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
                                setSelectedSegmentIds(newIds);
                              }}
                            >
                              ↓
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedSegmentIds(selectedSegmentIds.filter((id) => id !== segmentId));
                            }}
                          >
                            Remove
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Available Segments */}
              <Box display="flex" flexDirection="column" gap="sm">
                <Text variant="body-sm" semantic="secondary">
                  Available segments:
                </Text>
                {availableSegments.length === 0 ? (
                  <Text variant="body-sm" semantic="secondary">
                    No published segments available. Create segments first.
                  </Text>
                ) : (
                  <Box className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableSegments
                      .filter((segment) => !selectedSegmentIds.includes(segment.id))
                      .map((segment) => (
                        <Box
                          key={segment.id}
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          padding="3"
                          className="border rounded"
                        >
                          <Box display="flex" flexDirection="column">
                            <Text variant="body">{segment.name}</Text>
                            <Text variant="body-sm" semantic="secondary">
                              {segment.type}
                            </Text>
                          </Box>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSegmentIds([...selectedSegmentIds, segment.id]);
                            }}
                          >
                            Add
                          </Button>
                        </Box>
                      ))}
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </form>
  );
}
