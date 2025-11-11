'use client';

import { Box, Text } from '@mond-design-system/theme';
import type { Segment } from '@/app/utils/firestore-segments';

interface SegmentRendererProps {
  segment: Segment;
  locale?: string;
}

/**
 * SegmentRenderer - Maps segment types to their component implementations
 *
 * This is the core component that renders segments on pages.
 * As we implement specific segment types (MDS-16 through MDS-24),
 * we'll import their components and add them to the switch statement.
 */
export function SegmentRenderer({ segment, locale = 'en' }: SegmentRendererProps) {
  // Get localized content if available
  // This will be used when segment types are implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const content = segment.content?.[locale] || segment.content?.en || {};

  switch (segment.type) {
    case 'carousel':
      // TODO: Import and render CarouselSegment (MDS-16)
      return <PlaceholderSegment type="Carousel" segmentName={segment.name} />;

    case 'gallery':
      // TODO: Import and render GallerySegment (MDS-17)
      return <PlaceholderSegment type="Gallery" segmentName={segment.name} />;

    case 'text-block':
      // TODO: Import and render TextBlockSegment (MDS-18)
      return <PlaceholderSegment type="Text Block" segmentName={segment.name} />;

    case 'hero':
      // TODO: Import and render HeroSegment (MDS-19)
      return <PlaceholderSegment type="Hero" segmentName={segment.name} />;

    case 'cta':
      // TODO: Import and render CTASegment (MDS-20)
      return <PlaceholderSegment type="CTA" segmentName={segment.name} />;

    case 'testimonials':
      // TODO: Import and render TestimonialsSegment (MDS-21)
      return <PlaceholderSegment type="Testimonials" segmentName={segment.name} />;

    case 'faq':
      // TODO: Import and render FAQSegment (MDS-22)
      return <PlaceholderSegment type="FAQ" segmentName={segment.name} />;

    case 'team':
      // TODO: Import and render TeamSegment (MDS-23)
      return <PlaceholderSegment type="Team" segmentName={segment.name} />;

    case 'contact-form':
      // TODO: Import and render ContactFormSegment (MDS-24)
      return <PlaceholderSegment type="Contact Form" segmentName={segment.name} />;

    default:
      return (
        <Box padding="4" className="border border-red-500 bg-red-50">
          <Text variant="body">Unknown segment type: {segment.type}</Text>
        </Box>
      );
  }
}

/**
 * Placeholder component for segments not yet implemented
 */
function PlaceholderSegment({ type, segmentName }: { type: string; segmentName: string }) {
  return (
    <Box padding="4" className="border-2 border-dashed border-gray-300 bg-gray-50">
      <Text variant="body" semantic="secondary">
        {type} Segment: {segmentName}
      </Text>
      <Box marginTop="2">
        <Text variant="body-sm" semantic="secondary">
          This segment type will be implemented in a future task.
        </Text>
      </Box>
    </Box>
  );
}
