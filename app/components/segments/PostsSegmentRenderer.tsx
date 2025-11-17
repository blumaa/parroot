"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  Text,
  Heading,
  Button,
  Link as MdsLink,
} from "@mond-design-system/theme";
import { Pagination } from "@mond-design-system/theme/client";
import type { Post } from "@/app/types";

interface PostsSegmentRendererProps {
  posts: Post[];
  content: Record<string, unknown>;
}

const POSTS_PER_PAGE = 5;

export function PostsSegmentRenderer({
  posts,
  content,
}: PostsSegmentRendererProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const title = (content.title as string) || "Posts";
  const description = (content.description as string) || "";

  // Calculate pagination
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of posts section
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box padding="4" display="flex" flexDirection="column" gap="lg">
      {/* Section Header */}
      <Box>
        <Heading level={2}>{title}</Heading>
        {description && (
          <Box marginTop="2">
            <Text variant="body" semantic="secondary">
              {description}
            </Text>
          </Box>
        )}
      </Box>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Box padding="8" display="flex" justifyContent="center">
          <Text variant="body" semantic="secondary">
            No posts yet.
          </Text>
        </Box>
      ) : (
        <>
          <Box display="flex" flexDirection="column" gap="md">
            {currentPosts.map((post) => (
              <Box key={post.id} border="default" padding="4">
                <Box display="flex" gap="md">
                  {/* Featured Image */}
                  {post.featuredImage && (
                    <Box corners="rounded">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        width={150}
                        height={150}
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                  )}

                  {/* Post Content */}
                  <Box display="flex" flexDirection="column" gap="sm" flex="1">
                    {/* Post Title */}
                    <Heading level={3}>
                      <MdsLink as={Link} href={`/posts/${post.slug}`}>
                        {post.title}
                      </MdsLink>
                    </Heading>

                    {/* Post Excerpt */}
                    <Text variant="body" semantic="secondary">
                      {post.excerpt}
                    </Text>

                    {/* Post Meta */}
                    <Text variant="body-sm" semantic="secondary">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>

                    <Link href={`/posts/${post.slug}`}>
                      <Button variant="outline" size="sm">
                        Read More
                      </Button>
                    </Link>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" marginTop="4">
              <Pagination
                currentPage={currentPage}
                totalItems={posts.length}
                itemsPerPage={POSTS_PER_PAGE}
                onPageChange={handlePageChange}
                showItemsPerPage={false}
                showTotalInfo={false}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
