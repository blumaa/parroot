import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import { Box, Divider } from '@mond-design-system/theme';
import { SegmentRenderer } from '@/app/components/segments/SegmentRenderer';
import {
  getPageBySlug,
  getSegmentsByIds,
  getPosts
} from '@/app/lib/data-access';
import type { Segment } from '@/app/types';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DynamicPage({ params }: PageProps) {
  // Opt out of caching for this request
  noStore();

  const { slug } = await params;

  // Fetch page data by slug
  const page = await getPageBySlug(slug);

  // If page doesn't exist or is not published, show 404
  if (!page || page.status !== 'published') {
    notFound();
  }

  // Fetch segments for this page
  const segments = await getSegmentsByIds(page.segments);

  // Filter segments to only show published ones and maintain order from page.segments
  const publishedSegments = page.segments
    .map((segmentId: string) => segments.find((s) => s.id === segmentId))
    .filter((segment: Segment | undefined): segment is Segment =>
      segment !== undefined && segment.status === 'published'
    );

  // Fetch posts for all posts-type segments
  const postsSegmentIds = publishedSegments
    .filter((segment) => segment.type === 'posts')
    .map((segment) => segment.id);

  const postsData = await Promise.all(
    postsSegmentIds.map((segmentId) =>
      getPosts({ segmentId, status: 'published' })
    )
  );

  // Create a map of segmentId -> posts for easy lookup
  const postsMap = new Map(
    postsSegmentIds.map((segmentId, index) => [segmentId, postsData[index]])
  );

  return (
    <Box as="main" className="min-h-screen">
      {publishedSegments.length === 0 ? (
        <Box padding="20" display="flex" alignItems="center" justifyContent="center">
          <Box className="max-w-3xl text-center">
            <p>This page has no published segments yet.</p>
          </Box>
        </Box>
      ) : (
        publishedSegments.map((segment: Segment, index: number) => (
          <Box key={segment.id} paddingLeft='4' paddingRight='4'>
            <SegmentRenderer
              segment={segment}
              posts={segment.type === 'posts' ? postsMap.get(segment.id) : undefined}
            />
            {index < publishedSegments.length - 1 && (
              <Divider />
            )}
          </Box>
        ))
      )}
    </Box>
  );
}
