"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Heading, Text, Divider } from "@mond-design-system/theme";
import { Input } from "@mond-design-system/theme/client";
import type { Segment, SegmentType } from "@/app/types";
import { createSegmentAction, updateSegmentAction } from "@/app/actions/segments";
import { useToast } from "@/app/providers/ToastProvider";
import { TextBlockSegmentForm } from "./segment-forms/TextBlockSegmentForm";
import { CarouselSegmentForm } from "./segment-forms/CarouselSegmentForm";
import { GallerySegmentForm } from "./segment-forms/GallerySegmentForm";
import { CTASegmentForm } from "./segment-forms/CTASegmentForm";
import { FormSegmentForm } from "./segment-forms/FormSegmentForm";
import { PostsSegmentForm } from "./segment-forms/PostsSegmentForm";

const SEGMENT_TYPES: {
  value: SegmentType;
  label: string;
  description: string;
}[] = [
  {
    value: "carousel",
    label: "Carousel",
    description: "Rotating image or content slider",
  },
  {
    value: "text-block",
    label: "Text Block",
    description: "Rich text content section",
  },
  {
    value: "gallery",
    label: "Gallery",
    description: "Grid of images or media",
  },
  {
    value: "cta",
    label: "Call to Action",
    description: "Prominent call-to-action section",
  },
  {
    value: "form",
    label: "Form",
    description: "Customizable form with multiple field types",
  },
  {
    value: "posts",
    label: "Posts",
    description: "Display and manage a collection of posts",
  },
];

interface SegmentFormProps {
  segment?: Segment;
  userId: string;
  initialType?: SegmentType;
}

export function SegmentForm({
  segment,
  userId,
  initialType,
}: SegmentFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState(segment?.name || "");
  // Type is set once and not changed (type selection happens on /admin/segments/new page)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [type, setType] = useState<SegmentType>(
    segment?.type || initialType || "carousel",
  );
  const [status, setStatus] = useState<"draft" | "published">(
    segment?.status || "draft",
  );

  // Content state - will hold all content fields
  const [content, setContent] = useState<Record<string, unknown>>(
    segment?.content?.en || {},
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !type) {
      showError("Error", "Name and type are required");
      return;
    }

    setLoading(true);

    try {
      const segmentData = {
        name,
        type,
        status,
        config: {},
        content: { en: content },
      };

      let result;
      if (segment) {
        result = await updateSegmentAction(segment.id, segmentData);
        if (result.success) {
          showSuccess("Success", "Segment updated successfully");
        } else {
          throw new Error(result.error || "Failed to update segment");
        }
      } else {
        result = await createSegmentAction(segmentData);
        if (result.success) {
          showSuccess("Success", "Segment created successfully");
        } else {
          throw new Error(result.error || "Failed to create segment");
        }
      }

      router.push("/admin/segments");
    } catch (error) {
      showError(
        "Error",
        error instanceof Error ? error.message : "Failed to save segment",
      );
      console.error("Error saving segment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box padding="4" display="flex" flexDirection="column" gap="lg">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading level={2}>
            {segment
              ? "Edit Segment"
              : `Create New ${SEGMENT_TYPES.find((st) => st.value === type)?.label || "Segment"}`}
          </Heading>
          <Box display="flex" gap="sm">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {segment ? "Update Segment" : "Create Segment"}
            </Button>
          </Box>
        </Box>

        {/* Basic Info */}
        <Box display="flex" gap="md">
          <Box display="flex" flexDirection="column" gap="sm">
            <Text as="label">Name</Text>
            <Input
              type="text"
              placeholder="e.g., Summer Sale Hero"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Box>

          <Box display="flex" flexDirection="column" gap="sm">
            <Text as="label">Status</Text>
            <Box display="flex" gap="sm">
              <Button
                type="button"
                variant={status === "draft" ? "primary" : "outline"}
                onClick={() => setStatus("draft")}
              >
                Draft
              </Button>
              <Button
                type="button"
                variant={status === "published" ? "primary" : "outline"}
                onClick={() => setStatus("published")}
              >
                Published
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider variant="strong" />

        {/* Dynamic Content Fields Based on Type */}
        <Box display="flex" flexDirection="column" gap="md">
          {type === "text-block" && (
            <TextBlockSegmentForm
              content={content}
              onContentChange={setContent}
            />
          )}

          {type === "cta" && (
            <CTASegmentForm
              content={content}
              onContentChange={setContent}
            />
          )}

          {type === "form" && (
            <FormSegmentForm content={content} onContentChange={setContent} />
          )}

          {type === "carousel" && (
            <CarouselSegmentForm
              content={content}
              onContentChange={setContent}
            />
          )}

          {type === "gallery" && (
            <GallerySegmentForm
              content={content}
              onContentChange={setContent}
            />
          )}

          {type === "posts" && (
            <PostsSegmentForm
              content={content}
              onContentChange={setContent}
            />
          )}
        </Box>
      </Box>
    </form>
  );
}
