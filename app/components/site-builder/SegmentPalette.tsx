'use client';

import { Box, Button, Text, Heading, Card, Badge } from '@mond-design-system/theme';
import { useSegments } from '@/app/hooks/useSiteBuilderData';
import { useSiteBuilder } from '@/app/contexts/SiteBuilderContext';
import { useDraggable } from '@dnd-kit/core';

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
    id,
    data: { type: 'segment', isTemplate: true, segmentId: id },
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
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <Card>
        <Box padding="3" display="flex" alignItems="center" justifyContent="space-between">
          <Box flex="1" display="flex" flexDirection="column" gap="xs">
            <Heading level={4} size="sm">{name}</Heading>
            <Text variant="body-sm" semantic="secondary">
              {type}
            </Text>
            <Badge variant={status === 'published' ? 'success' : 'default'} size="sm">
              {status}
            </Badge>
          </Box>
          <Button variant="ghost" size="sm" onClick={handleEditClick}>
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
        <Text>Loading segments...</Text>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" width="full">
      <Box padding="4">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Heading level={3} size="md">Segments</Heading>
          <Button variant="outline" size="md" onClick={() => openSegmentDrawer()}>
            +
          </Button>
        </Box>
      </Box>

      <Box padding="4" display="flex" flexDirection="column" gap="sm">
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
