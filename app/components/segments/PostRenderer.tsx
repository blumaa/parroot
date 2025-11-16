"use client";

import { Box, Text, Heading } from "@mond-design-system/theme";
import Image from "next/image";
import "@/app/styles/tiptap-content.css";

interface PostRendererProps {
  title: string;
  content: string;
  featuredImage?: string;
  author?: string;
  createdAt?: Date;
  showMeta?: boolean;
}

export function PostRenderer({
  title,
  content,
  featuredImage,
  author,
  createdAt,
  showMeta = true,
}: PostRendererProps) {
  return (
    <Box display="flex" flexDirection="column" gap="md" padding="4">
      {/* Title */}
      {title && (
        <Box>
          <Heading level={2}>{title}</Heading>
        </Box>
      )}

      {/* Meta */}
      {showMeta && (author || createdAt) && (
        <Box>
          <Text variant="body-sm" semantic="secondary">
            {author && `By ${author}`}
            {author && createdAt && ' • '}
            {createdAt && new Date(createdAt).toLocaleDateString()}
          </Text>
        </Box>
      )}

      {/* Content with optional featured image thumbnail */}
      <Box display="flex" gap="md">
        {/* Content */}
        {content && (
          <Box flex="1">
            <div
              className="tiptap-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </Box>
        )}

        {/* Featured Image Thumbnail */}
        {featuredImage && (
          <Box>
            <Image
              src={featuredImage}
              alt={title}
              width={200}
              height={150}
              style={{ objectFit: 'cover' }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
