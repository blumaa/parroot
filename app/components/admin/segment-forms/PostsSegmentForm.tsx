"use client";

import { Box } from "@mond-design-system/theme";
import { Input, Textarea } from "@mond-design-system/theme/client";

interface PostsSegmentFormProps {
  content: Record<string, unknown>;
  onContentChange: (content: Record<string, unknown>) => void;
}

export function PostsSegmentForm({
  content,
  onContentChange,
}: PostsSegmentFormProps) {
  const handleFieldChange = (field: string, value: string) => {
    onContentChange({
      ...content,
      [field]: value,
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap="md">
      <Box>
        <Input
          id="posts-title"
          label="Section Title"
          type="text"
          placeholder="e.g., Latest News, Company Updates"
          value={(content.title as string) || ""}
          onChange={(e) => handleFieldChange("title", e.target.value)}
        />
      </Box>

      <Box>
        <Textarea
          id="posts-description"
          label="Section Description"
          placeholder="Brief description of this posts section"
          value={(content.description as string) || ""}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          rows={3}
        />
      </Box>
    </Box>
  );
}
