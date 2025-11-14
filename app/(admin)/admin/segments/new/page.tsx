'use client';

import { Box, Button, Heading, Text } from '@mond-design-system/theme';
import { useRouter } from 'next/navigation';

const SEGMENT_TYPES = [
  {
    type: 'carousel',
    label: 'Carousel',
    description: 'Rotating image or content slider',
    icon: '🎠',
  },
  {
    type: 'text-block',
    label: 'Text Block',
    description: 'Rich text content section',
    icon: '📝',
  },
  {
    type: 'gallery',
    label: 'Gallery',
    description: 'Grid of images or media',
    icon: '🖼️',
  },
  {
    type: 'cta',
    label: 'Call to Action',
    description: 'Prominent call-to-action section',
    icon: '📣',
  },
  {
    type: 'form',
    label: 'Contact Form',
    description: 'Contact or inquiry form',
    icon: '📧',
  },
] as const;

export default function NewSegmentPage() {
  const router = useRouter();

  const handleSelectType = (type: string) => {
    router.push(`/admin/segments/new/${type}`);
  };

  return (
    <Box padding="4" display="flex" flexDirection="column" gap="lg">
      <Box>
        <Heading level={2}>Choose Segment Type</Heading>
        <Text variant="body" semantic="secondary">
          Select the type of content segment you want to create
        </Text>
      </Box>

      <Box display="flex" flexDirection="column" gap="md">
        {SEGMENT_TYPES.map((segmentType) => (
          <Box
            key={segmentType.type}
            padding="4"
            display="flex"
            alignItems="center"
            // justifyContent="space-between"
            gap="md"
          >
            <Box display="flex" flexDirection="column" gap="xs">
              <Box display="flex" alignItems="center" gap="sm">
                <Button
                  variant="primary"
                  onClick={() => handleSelectType(segmentType.type)}
                >
                  Create
                </Button>
                <Text variant="title">{segmentType.icon}</Text>
                <Heading level={3}>{segmentType.label}</Heading>
              </Box>
              <Text variant="body" semantic="secondary">
                {segmentType.description}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
