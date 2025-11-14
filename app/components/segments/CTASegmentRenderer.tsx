"use client";

import { Box, Text, Heading, Button } from "@mond-design-system/theme";
import Link from "next/link";
import type { CTAContent } from "@/app/types";
import "./CTASegmentRenderer.css";

interface CTASegmentRendererProps {
  content: Record<string, unknown>;
}

export function CTASegmentRenderer({ content }: CTASegmentRendererProps) {
  const ctaContent = content as Partial<CTAContent>;

  // Handle empty state
  if (!ctaContent.heading && !ctaContent.description && !ctaContent.primaryButtonText) {
    return (
      <Box
        padding="8"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text variant="body" semantic="secondary">
          No CTA content to display
        </Text>
      </Box>
    );
  }

  const buttonVariant = ctaContent.buttonVariant || 'primary';

  // Check if URL is external
  const isExternalUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // Validate button has both text and URL
  const hasPrimaryButton = ctaContent.primaryButtonText && ctaContent.primaryButtonUrl;
  const hasSecondaryButton = ctaContent.secondaryButtonText && ctaContent.secondaryButtonUrl;

  return (
    <div className="cta-container">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap="lg"
        padding="8"
      >
        {/* Heading */}
        {ctaContent.heading && (
          <Heading level={1} align="center">
            {ctaContent.heading}
          </Heading>
        )}

        {/* Description */}
        {ctaContent.description && (
          <Box className="cta-description">
            <Text variant="body" align="center">
              {ctaContent.description}
            </Text>
          </Box>
        )}

        {/* Buttons */}
        {(hasPrimaryButton || hasSecondaryButton) && (
          <Box display="flex" gap="md" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {hasPrimaryButton && (
              <>
                {isExternalUrl(ctaContent.primaryButtonUrl!) ? (
                  <a
                    href={ctaContent.primaryButtonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant={buttonVariant}
                      size="lg"
                    >
                      {ctaContent.primaryButtonText}
                    </Button>
                  </a>
                ) : (
                  <Link href={ctaContent.primaryButtonUrl!}>
                    <Button
                      variant={buttonVariant}
                      size="lg"
                    >
                      {ctaContent.primaryButtonText}
                    </Button>
                  </Link>
                )}
              </>
            )}

            {hasSecondaryButton && (
              <>
                {isExternalUrl(ctaContent.secondaryButtonUrl!) ? (
                  <a
                    href={ctaContent.secondaryButtonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                    >
                      {ctaContent.secondaryButtonText}
                    </Button>
                  </a>
                ) : (
                  <Link href={ctaContent.secondaryButtonUrl!}>
                    <Button
                      variant="outline"
                      size="lg"
                    >
                      {ctaContent.secondaryButtonText}
                    </Button>
                  </Link>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    </div>
  );
}
