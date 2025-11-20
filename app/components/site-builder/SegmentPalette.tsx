"use client";

import {
  Box,
  Button,
  Text,
  Heading,
  Card,
  Badge,
  Spinner,
} from "@mond-design-system/theme";
import { useSegments } from "@/app/hooks/useSiteBuilderData";
import { useSiteBuilder } from "@/app/contexts/SiteBuilderContext";
import { useDraggable } from "@dnd-kit/core";

function DraggableSegment({
  id,
  name,
  type,
  status,
  onEdit,
}: {
  id: string;
  name: string;
  type: string;
  status: string;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${id}`,
    data: { type: "segment", isTemplate: true, segmentId: id },
  });

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <Card maxWidth="sm">
        <Box
          padding="3"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" flexDirection="column" gap="xs">
            <Heading level={4} size="sm">
              {name}
            </Heading>
            <Box>
              <Badge variant="outline" size="sm">
                {type}
              </Badge>
            </Box>
            {/* <Box> */}
            {/*   <Badge variant="warning" size="sm"> */}
            {/*     {status} */}
            {/*   </Badge> */}
            {/* </Box> */}
          </Box>
          <Button variant="outline" size="sm" onClick={handleEditClick}>
            Edit
          </Button>
        </Box>
      </Card>
    </div>
  );
}

export function SegmentPalette() {
  const { data: segments, isLoading } = useSegments();
  const { openSegmentDrawer } = useSiteBuilder();

  if (isLoading) {
    return (
      <Box padding="4">
        <Spinner size="lg" label="Loading segments..." />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" padding="8" gap="md" border="subtle">
      <Box display="flex" alignItems="center" justifyContent="space-between" flex="1">
        <Heading level={3} size="xl">
          Segments
        </Heading>
        <Button variant="outline" size="md" onClick={() => openSegmentDrawer()}>
          +
        </Button>
      </Box>

      <Box
        paddingLeft="2"
        paddingRight="2"
        display="flex"
        flexDirection="column"
        gap="sm"
      >
        {segments && segments.length > 0 ? (
          segments.map((segment) => (
            <DraggableSegment
              key={segment.id}
              id={segment.id}
              name={segment.name}
              type={segment.type}
              status={segment.status}
              onEdit={() => openSegmentDrawer(segment.id)}
            />
          ))
        ) : (
          <Box padding="4">
            <Text variant="body" semantic="secondary">
              No segments yet. Create one to get started.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
