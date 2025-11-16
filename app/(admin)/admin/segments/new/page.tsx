"use client";

import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Text,
} from "@mond-design-system/theme";
import { useRouter } from "next/navigation";

const SEGMENT_TYPES = [
  {
    type: "carousel",
    label: "Carousel",
    description: "Rotating image or content slider",
    icon: "🎠",
  },
  {
    type: "text-block",
    label: "Text Block",
    description: "Rich text content section",
    icon: "📝",
  },
  {
    type: "gallery",
    label: "Gallery",
    description: "Grid of images or media",
    icon: "🖼️",
  },
  {
    type: "cta",
    label: "Call to Action",
    description: "Prominent call-to-action section",
    icon: "📣",
  },
  {
    type: "form",
    label: "Form",
    description: "Contact or inquiry form",
    icon: "📧",
  },
  {
    type: "posts",
    label: "Posts",
    description: "A collection of posts",
    icon: "📰",
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

      <Box
        display="grid"
        gap="lg"
        flexWrap="wrap"
        gridTemplateColumns="repeat(2, minmax(250px, 1fr))"
      >
        {SEGMENT_TYPES.map((segmentType) => (
          <Card key={segmentType.type}>
            <CardBody>
              <Box display="flex" flexDirection="column" gap="xs">
                <Box display="flex" alignItems="center" gap="sm">
                  <Text variant="title">{segmentType.icon}</Text>
                  <Heading level={3}>{segmentType.label}</Heading>
                </Box>
                <Text variant="body" semantic="secondary">
                  {segmentType.description}
                </Text>
                <Box>
                  <Button
                    variant="primary"
                    onClick={() => handleSelectType(segmentType.type)}
                  >
                    Create {segmentType.label}
                  </Button>
                </Box>
              </Box>
            </CardBody>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
