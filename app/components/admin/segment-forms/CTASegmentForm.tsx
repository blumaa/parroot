"use client";

import { Box, Text, Button, Divider, Heading } from "@mond-design-system/theme";
import { Input, Textarea } from "@mond-design-system/theme/client";
import type { CTAContent } from "@/app/types";
import { CTASegmentRenderer } from "@/app/components/segments/CTASegmentRenderer";

interface CTASegmentFormProps {
  content: Record<string, unknown>;
  onContentChange: (content: Record<string, unknown>) => void;
}

export function CTASegmentForm({
  content,
  onContentChange,
}: CTASegmentFormProps) {
  const ctaContent = content as Partial<CTAContent>;

  const handleFieldChange = (field: keyof CTAContent, value: string) => {
    onContentChange({
      ...content,
      [field]: value,
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap="lg">
      {/* Heading */}
      <Box>
        <Input
          id="cta-heading"
          label="Heading"
          type="text"
          placeholder="Get Started Today"
          value={ctaContent.heading || ""}
          onChange={(e) => handleFieldChange("heading", e.target.value)}
        />
      </Box>

      {/* Description */}
      <Box>
        <Textarea
          id="cta-description"
          label="Description"
          placeholder="Join thousands of satisfied customers"
          value={ctaContent.description || ""}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          rows={3}
        />
      </Box>

      <Divider variant="strong" />

      {/* Primary Button */}
      <Box display="flex" flexDirection="column" gap="md">
        <Heading level={4}>Primary Button</Heading>

        <Box>
          <Input
            id="cta-primary-button-text"
            label="Primary Button Text"
            type="text"
            placeholder="Sign Up"
            value={ctaContent.primaryButtonText || ""}
            onChange={(e) => handleFieldChange("primaryButtonText", e.target.value)}
          />
        </Box>

        <Box>
          <Input
            id="cta-primary-button-url"
            label="Primary Button URL"
            type="text"
            placeholder="/signup or https://example.com"
            value={ctaContent.primaryButtonUrl || ""}
            onChange={(e) => handleFieldChange("primaryButtonUrl", e.target.value)}
          />
          <Box marginTop="1">
            <Text variant="body-sm" semantic="secondary">
              Internal URLs start with / (e.g., /signup), external URLs include https://
            </Text>
          </Box>
        </Box>
      </Box>

      <Divider variant="strong" />

      {/* Secondary Button (Optional) */}
      <Box display="flex" flexDirection="column" gap="md">
        <Heading level={4}>Secondary Button (Optional)</Heading>

        <Box>
          <Input
            id="cta-secondary-button-text"
            label="Secondary Button Text"
            type="text"
            placeholder="Learn More"
            value={ctaContent.secondaryButtonText || ""}
            onChange={(e) => handleFieldChange("secondaryButtonText", e.target.value)}
          />
        </Box>

        <Box>
          <Input
            id="cta-secondary-button-url"
            label="Secondary Button URL"
            type="text"
            placeholder="/learn or https://example.com"
            value={ctaContent.secondaryButtonUrl || ""}
            onChange={(e) => handleFieldChange("secondaryButtonUrl", e.target.value)}
          />
        </Box>
      </Box>

      <Divider variant="strong" />

      {/* Button Variant Selector */}
      <Box display="flex" flexDirection="column" gap="md">
        <Heading level={4}>Primary Button Style</Heading>

        <Box display="flex" gap="sm" style={{ flexWrap: "wrap" }}>
          <Button
            type="button"
            size="sm"
            variant={ctaContent.buttonVariant === 'primary' || !ctaContent.buttonVariant ? 'primary' : 'outline'}
            onClick={() => handleFieldChange("buttonVariant", "primary")}
          >
            Primary
          </Button>
          <Button
            type="button"
            size="sm"
            variant={ctaContent.buttonVariant === 'outline' ? 'primary' : 'outline'}
            onClick={() => handleFieldChange("buttonVariant", "outline")}
          >
            Outline
          </Button>
          <Button
            type="button"
            size="sm"
            variant={ctaContent.buttonVariant === 'ghost' ? 'primary' : 'outline'}
            onClick={() => handleFieldChange("buttonVariant", "ghost")}
          >
            Ghost
          </Button>
        </Box>
        <Text variant="body-sm" semantic="secondary">
          Choose the style for the primary button. Secondary button is always outline style.
        </Text>
      </Box>

      {/* Live Preview */}
      {(ctaContent.heading || ctaContent.description || ctaContent.primaryButtonText) && (
        <>
          <Divider variant="strong" />
          <Box>
            <Heading level={3}>Live Preview</Heading>
            <Divider />

            <Box marginTop="4">
              <CTASegmentRenderer content={content} />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
