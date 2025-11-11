import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import { Box } from '@mond-design-system/theme';
import { Header } from '@/app/components/Header';
import { SegmentRenderer } from '@/app/components/segments/SegmentRenderer';
import { getPageBySlug } from '@/app/utils/firestore-pages';
import { getSegmentsByIds } from '@/app/utils/firestore-segments';
import { getMenuItems } from '@/app/utils/firestore-navigation';
import { getPages } from '@/app/utils/firestore-pages';
import { getUser } from '@/app/lib/dal';
import { getSiteSettings } from '@/app/utils/firestore-settings';

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

  // Fetch navigation data, user, and settings for header
  const [menuItems, pages, segments, user, settings] = await Promise.all([
    getMenuItems({ visible: true }),
    getPages({ status: 'published' }),
    getSegmentsByIds(page.segments),
    getUser(),
    getSiteSettings(),
  ]);

  // Filter segments to only show published ones and maintain order from page.segments
  const publishedSegments = page.segments
    .map((segmentId) => segments.find((s) => s.id === segmentId))
    .filter((segment): segment is NonNullable<typeof segment> =>
      segment !== undefined && segment.status === 'published'
    );

  return (
    <>
      <Header
        menuItems={menuItems}
        pages={pages}
        user={user}
        siteName={settings?.siteName}
        logoUrl={settings?.logoUrl}
      />
      <Box as="main" className="min-h-screen">
        {publishedSegments.length === 0 ? (
          <Box padding="20" display="flex" alignItems="center" justifyContent="center">
            <Box className="max-w-3xl text-center">
              <p>This page has no published segments yet.</p>
            </Box>
          </Box>
        ) : (
          publishedSegments.map((segment) => (
            <SegmentRenderer key={segment.id} segment={segment} />
          ))
        )}
      </Box>
    </>
  );
}
