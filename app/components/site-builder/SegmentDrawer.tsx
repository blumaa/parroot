"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Card,
  Spinner,
} from "@mond-design-system/theme";
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
} from "@mond-design-system/theme/client";
import { useSiteBuilder } from "@/app/contexts/SiteBuilderContext";
import { useSegment } from "@/app/hooks/useSiteBuilderData";
import { SegmentFormWrapper } from "./SegmentFormWrapper";
import type { SegmentType } from "@/app/types";

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

export function SegmentDrawer() {
  const { isSegmentDrawerOpen, closeSegmentDrawer, editingSegmentId } =
    useSiteBuilder();
  const { data: existingSegment, isLoading: isLoadingSegment } =
    useSegment(editingSegmentId);
  const [selectedType, setSelectedType] = useState<SegmentType | null>(null);

  // Reset when drawer closes
  const handleClose = () => {
    setSelectedType(null);
    closeSegmentDrawer();
  };

  // If editing existing segment, show form directly
  const showForm = editingSegmentId || selectedType;

  return (
    <Drawer isOpen={isSegmentDrawerOpen} onClose={handleClose} width="xl">
      <DrawerHeader onClose={handleClose}>
        <Heading level={3} size="lg">
          {editingSegmentId
            ? "Edit Segment"
            : showForm
              ? "Create Segment"
              : "Choose Segment Type"}
        </Heading>
      </DrawerHeader>

      <DrawerBody>
        {!showForm ? (
          // Type Selection View
          <Box
            display="grid"
            gridTemplateColumns="repeat(2, minmax(250px, 1fr))"
            gap="md"
            padding="4"
          >
            {SEGMENT_TYPES.map((segmentType) => (
              <Card key={segmentType.type}>
                <Box padding="3" display="flex" flexDirection="column" gap="xs">
                  <Box display="flex" alignItems="center" gap="sm">
                    <Text variant="title">{segmentType.icon}</Text>
                    <Heading level={4} size="sm">
                      {segmentType.label}
                    </Heading>
                  </Box>
                  <Text variant="body" semantic="secondary">
                    {segmentType.description}
                  </Text>
                  <Box>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        setSelectedType(segmentType.type as SegmentType)
                      }
                    >
                      Create {segmentType.label}
                    </Button>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        ) : editingSegmentId && isLoadingSegment ? (
          // Loading state when editing a segment
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            padding="8"
          >
            <Spinner size="lg" label="Loading segment..." />
          </Box>
        ) : (
          // Segment Form View
          <SegmentFormWrapper
            segment={existingSegment || undefined}
            initialType={selectedType || undefined}
            onClose={handleClose}
          />
        )}
      </DrawerBody>
    </Drawer>
  );
}
