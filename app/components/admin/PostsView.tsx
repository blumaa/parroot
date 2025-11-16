"use client";

import { Box, Heading, Card } from '@mond-design-system/theme';
import { PostList } from './PostList';
import type { Segment, Post } from '@/app/types';

interface PostsViewProps {
  postsSegments: Segment[];
  postsBySegment: Record<string, Post[]>;
}

export function PostsView({ postsSegments, postsBySegment }: PostsViewProps) {
  return (
    <Box display="flex" flexDirection="column" gap="lg">
      <Box>
        <Heading level={1}>Posts</Heading>
      </Box>

      {/* Posts Segments Section - Only show if there are Posts segments */}
      {postsSegments.length > 0 && (
        <Box display="flex" flexDirection="column" gap="lg">
          {postsSegments.map((segment) => (
            <Card key={segment.id}>
              <PostList
                segmentId={segment.id}
                segmentName={segment.name}
                initialPosts={postsBySegment[segment.id] || []}
              />
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
