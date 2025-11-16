"use client";

import { Box, Text, Heading } from "@mond-design-system/theme";
import { Input, Radio, Select } from "@mond-design-system/theme/client";
import { TextBlockSegmentRenderer } from "@/app/components/segments/TextBlockSegmentRenderer";
import { RichTextEditor } from "../RichTextEditor";

interface TextBlockSegmentFormProps {
  content: Record<string, unknown>;
  onContentChange: (content: Record<string, unknown>) => void;
}

const HEADING_SIZES = [
  { value: "xs", label: "Extra Small" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
  { value: "2xl", label: "2X Large" },
  { value: "3xl", label: "3X Large" },
  { value: "4xl", label: "4X Large" },
];

const HEADING_WEIGHTS = [
  { value: "normal", label: "Normal" },
  { value: "medium", label: "Medium" },
  { value: "semibold", label: "Semibold" },
  { value: "bold", label: "Bold" },
];

const PADDING_OPTIONS = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
];

export function TextBlockSegmentForm({
  content,
  onContentChange,
}: TextBlockSegmentFormProps) {
  const handleFieldChange = (field: string, value: unknown) => {
    onContentChange({
      ...content,
      [field]: value,
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap="md">
      {/* Heading Controls */}
      <Box>
        <Input
          id="heading-text"
          label="Heading Text"
          type="text"
          placeholder="Enter heading"
          value={(content.heading as string) || ""}
          onChange={(e) => handleFieldChange("heading", e.target.value)}
        />
      </Box>

      <Box display="flex" gap="md">
        <Box flex="1">
          <Select
            id="heading-size"
            label="Heading Size"
            value={(content.headingSize as string) || "lg"}
            onChange={(value) => handleFieldChange("headingSize", value)}
            options={HEADING_SIZES}
          />
        </Box>

        <Box flex="1">
          <Select
            id="heading-weight"
            label="Heading Weight"
            value={(content.headingWeight as string) || "bold"}
            onChange={(value) => handleFieldChange("headingWeight", value)}
            options={HEADING_WEIGHTS}
          />
        </Box>
      </Box>

      {/* Alignment */}
      <Box>
        <Box as="label" id="alignment-label">
          <Text variant="body-sm" semantic="secondary">
            Alignment
          </Text>
        </Box>
        <Box
          display="flex"
          gap="md"
          marginTop="2"
          role="radiogroup"
          aria-labelledby="alignment-label"
        >
          {["left", "center", "right"].map((align) => (
            <Box key={align} display="flex" alignItems="center" gap="sm">
              <Radio
                name="alignment"
                value={align}
                checked={
                  (content.alignment as string) === align ||
                  (!content.alignment && align === "left")
                }
                onChange={() => handleFieldChange("alignment", align)}
                aria-label={align}
              />
              <Text variant="body-sm">
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Padding */}
      <Box>
        <Select
          id="padding"
          label="Padding"
          value={(content.padding as string) || "md"}
          onChange={(value) => handleFieldChange("padding", value)}
          options={PADDING_OPTIONS}
        />
      </Box>

      {/* Body Content Editor */}
      <RichTextEditor
        content={(content.body as string) || ""}
        onChange={(html) => handleFieldChange("body", html)}
        label="Body Content"
        placeholder="Start typing your content here..."
      />

      {/* Live Preview */}
      <Box>
        <Heading level={3}>Live Preview</Heading>
        
        <Box marginTop="2" border="default" >
          <TextBlockSegmentRenderer content={content} />
        </Box>
      </Box>
    </Box>
  );
}
