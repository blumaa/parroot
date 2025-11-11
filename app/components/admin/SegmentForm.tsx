'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Heading, Text } from '@mond-design-system/theme';
import { Input, Radio, Textarea } from '@mond-design-system/theme/client';
import {
  createSegment,
  updateSegment,
  type Segment,
  type SegmentInput,
  type SegmentType,
} from '@/app/utils/firestore-segments';
import { useToast } from '@/app/providers/ToastProvider';

const SEGMENT_TYPES: { value: SegmentType; label: string; description: string }[] = [
  { value: 'carousel', label: 'Carousel', description: 'Rotating image or content slider' },
  { value: 'text-block', label: 'Text Block', description: 'Rich text content section' },
  { value: 'gallery', label: 'Gallery', description: 'Grid of images or media' },
  { value: 'cta', label: 'Call to Action', description: 'Prominent call-to-action section' },
  { value: 'contact-form', label: 'Contact Form', description: 'Contact or inquiry form' },
];

interface SegmentFormProps {
  segment?: Segment;
  userId: string;
}

export function SegmentForm({ segment, userId }: SegmentFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState(segment?.name || '');
  const [type, setType] = useState<SegmentType>(segment?.type || 'carousel');
  const [status, setStatus] = useState<'draft' | 'published'>(segment?.status || 'draft');

  // Content state - will hold all content fields
  const [content, setContent] = useState<Record<string, unknown>>(
    segment?.content?.en || {}
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !type) {
      showError('Error', 'Name and type are required');
      return;
    }

    setLoading(true);

    try {
      const segmentInput: SegmentInput = {
        name,
        type,
        status,
        config: {},
        content: { en: content },
      };

      if (segment) {
        await updateSegment(segment.id, segmentInput, userId);
        showSuccess('Success', 'Segment updated successfully');
      } else {
        await createSegment(segmentInput, userId);
        showSuccess('Success', 'Segment created successfully');
      }

      router.push('/admin/segments');
    } catch (error) {
      showError('Error', error instanceof Error ? error.message : 'Failed to save segment');
      console.error('Error saving segment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box padding="4" display="flex" flexDirection="column" gap="lg" className="max-w-4xl">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading level={2}>{segment ? 'Edit Segment' : 'Create New Segment'}</Heading>
          <Box display="flex" gap="sm">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : segment ? 'Update Segment' : 'Create Segment'}
            </Button>
          </Box>
        </Box>

        {/* Basic Info */}
        <Box display="flex" flexDirection="column" gap="md">
          <Heading level={3}>Basic Information</Heading>

          <Input
            label="Segment Name"
            type="text"
            placeholder="e.g., Summer Sale Hero"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Box>
            <label className="block text-sm font-medium mb-2">Segment Type</label>
            <Box className="flex flex-col gap-3">
              {SEGMENT_TYPES.map((segmentType) => (
                <Box key={segmentType.value} className="flex items-start gap-2">
                  <Radio
                    name="segmentType"
                    value={segmentType.value}
                    checked={type === segmentType.value}
                    onChange={() => setType(segmentType.value)}
                  />
                  <Box className="flex flex-col">
                    <Text variant="body">{segmentType.label}</Text>
                    <Text variant="body-sm" semantic="secondary">
                      {segmentType.description}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Box className="flex gap-2">
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

        {/* Dynamic Content Fields Based on Type */}
        <Box className="flex flex-col gap-4">
          <Heading level={3}>Content</Heading>

          {type === 'text-block' && (
            <>
              <Input
                label="Title"
                type="text"
                placeholder="Enter title"
                value={(content.title as string) || ''}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
              />
              <Textarea
                label="Body"
                placeholder="Enter body text"
                value={(content.body as string) || ''}
                onChange={(e) => setContent({ ...content, body: e.target.value })}
                rows={6}
              />
              <Input
                label="Button Text (optional)"
                type="text"
                placeholder="e.g., Learn More"
                value={(content.buttonText as string) || ''}
                onChange={(e) => setContent({ ...content, buttonText: e.target.value })}
              />
              <Input
                label="Button URL (optional)"
                type="text"
                placeholder="e.g., /about"
                value={(content.buttonUrl as string) || ''}
                onChange={(e) => setContent({ ...content, buttonUrl: e.target.value })}
              />
            </>
          )}

          {type === 'cta' && (
            <>
              <Input
                label="Headline"
                type="text"
                placeholder="Enter headline"
                value={(content.headline as string) || ''}
                onChange={(e) => setContent({ ...content, headline: e.target.value })}
              />
              <Textarea
                label="Description"
                placeholder="Enter description"
                value={(content.description as string) || ''}
                onChange={(e) => setContent({ ...content, description: e.target.value })}
                rows={3}
              />
              <Input
                label="Button Text"
                type="text"
                placeholder="e.g., Get Started"
                value={(content.buttonText as string) || ''}
                onChange={(e) => setContent({ ...content, buttonText: e.target.value })}
              />
              <Input
                label="Button URL"
                type="text"
                placeholder="e.g., /signup"
                value={(content.buttonUrl as string) || ''}
                onChange={(e) => setContent({ ...content, buttonUrl: e.target.value })}
              />
              <Input
                label="Background Color (optional)"
                type="text"
                placeholder="e.g., #f0f0f0"
                value={(content.backgroundColor as string) || ''}
                onChange={(e) => setContent({ ...content, backgroundColor: e.target.value })}
              />
            </>
          )}

          {type === 'contact-form' && (
            <>
              <Input
                label="Form Title"
                type="text"
                placeholder="e.g., Contact Us"
                value={(content.formTitle as string) || ''}
                onChange={(e) => setContent({ ...content, formTitle: e.target.value })}
              />
              <Input
                label="Submit Button Text"
                type="text"
                placeholder="e.g., Send Message"
                value={(content.submitButtonText as string) || ''}
                onChange={(e) => setContent({ ...content, submitButtonText: e.target.value })}
              />
              <Input
                label="Email Recipient"
                type="email"
                placeholder="e.g., contact@example.com"
                value={(content.emailRecipient as string) || ''}
                onChange={(e) => setContent({ ...content, emailRecipient: e.target.value })}
              />
            </>
          )}

          {type === 'carousel' && (
            <Box className="flex flex-col gap-4">
              <Text variant="body-sm" semantic="secondary">
                Carousel configuration coming soon. For now, create the segment and configure
                slides later.
              </Text>
            </Box>
          )}

          {type === 'gallery' && (
            <Box className="flex flex-col gap-4">
              <Text variant="body-sm" semantic="secondary">
                Gallery configuration coming soon. For now, create the segment and configure images
                later.
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </form>
  );
}
