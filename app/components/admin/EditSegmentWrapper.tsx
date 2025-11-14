'use client';

import { useState, useEffect } from 'react';
import { Box, Text, Spinner } from '@mond-design-system/theme';
import { SegmentForm } from './SegmentForm';
import { getSegmentById, type Segment } from '@/app/utils/firestore-segments';

interface EditSegmentWrapperProps {
  segmentId: string;
  userId: string;
}

export function EditSegmentWrapper({ segmentId, userId }: EditSegmentWrapperProps) {
  const [segment, setSegment] = useState<Segment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSegment = async () => {
      try {
        setLoading(true);
        const fetchedSegment = await getSegmentById(segmentId);

        if (!fetchedSegment) {
          setError('Segment not found');
          return;
        }

        setSegment(fetchedSegment);
      } catch (err) {
        console.error('Error loading segment:', err);
        setError('Failed to load segment');
      } finally {
        setLoading(false);
      }
    };

    loadSegment();
  }, [segmentId]);

  if (loading) {
    return (
      <Box padding="8" display="flex" justifyContent="center">
        <Spinner size="lg" label="Loading segment..." />
      </Box>
    );
  }

  if (error || !segment) {
    return (
      <Box padding="4">
        <Text variant="body">{error || 'Segment not found'}</Text>
      </Box>
    );
  }

  return <SegmentForm segment={segment} userId={userId} />;
}
