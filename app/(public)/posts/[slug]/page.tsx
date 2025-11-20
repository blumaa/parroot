import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getPages,
  getSegmentById,
} from "@/app/lib/data-access";
import { Box, Button } from "@mond-design-system/theme";
import { PostRenderer } from "@/app/components/segments/PostRenderer";
import Link from "next/link";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  // Get the segment to find which page it belongs to
  const segment = await getSegmentById(post.segmentId);

  // Find the page that contains this segment (support both old and new format)
  const allPages = await getPages({ status: "published" });
  const parentPage = allPages.find((page) => {
    // Check new format
    if (page.headerSegmentId === post.segmentId ||
        page.mainSegmentId === post.segmentId ||
        page.footerSegmentId === post.segmentId) {
      return true;
    }
    // Check old format
    return page.segments?.includes(post.segmentId);
  });
  const backUrl = parentPage ? `/${parentPage.slug}` : "/";

  return (
    <Box padding="4" display="flex" flexDirection="column" gap="lg">
        <PostRenderer
          title={post.title}
          content={post.content}
          featuredImage={post.featuredImage}
          createdAt={post.createdAt}
          showMeta={false}
        />

        {/* Back Button */}
        <Box marginTop="4">
          <Link href={backUrl}>
            <Button variant="outline" size="sm">
              ← Back
            </Button>
          </Link>
        </Box>
      </Box>
  );
}
