"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Text, Button } from "@mond-design-system/theme";
import Image from "next/image";
import type { GalleryImage } from "@/app/types";
import "./GallerySegmentRenderer.css";

interface GallerySegmentRendererProps {
  content: Record<string, unknown>;
}

export function GallerySegmentRenderer({
  content,
}: GallerySegmentRendererProps) {
  const images = (content.images as GalleryImage[]) || [];
  const imagesPerRow = (content.imagesPerRow as 3 | 4 | 5) ?? 4;
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleCloseLightbox = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const handleNextImage = useCallback(() => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % images.length);
    }
  }, [selectedImageIndex, images.length]);

  const handlePreviousImage = useCallback(() => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(
        (selectedImageIndex - 1 + images.length) % images.length,
      );
    }
  }, [selectedImageIndex, images.length]);

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedImageIndex === null) return;

      if (event.key === "Escape") {
        handleCloseLightbox();
      } else if (event.key === "ArrowLeft") {
        handlePreviousImage();
      } else if (event.key === "ArrowRight") {
        handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImageIndex, handleCloseLightbox, handlePreviousImage, handleNextImage]);

  // Handle empty state
  if (!images || images.length === 0) {
    return (
      <Box
        padding="8"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text variant="body" semantic="secondary">
          No images to display
        </Text>
      </Box>
    );
  }

  // Filter out images without URLs
  const validImages = images.filter((image) => image.imageUrl);

  // Calculate actual columns needed (minimum of imagesPerRow or actual image count)
  const actualColumns = Math.min(validImages.length, imagesPerRow);

  // Calculate number of rows needed based on total images
  const rowCount = Math.ceil(validImages.length / actualColumns);

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        padding="4"
        role="region"
        aria-label="Gallery"
      >
        <div
          className="gallery-grid"
          data-images-per-row={actualColumns}
          data-row-count={rowCount}
        >
          {validImages.map((image, index) => (
            <Box
              as="button"
              key={image.id}
              display="flex"
              flexDirection="column"
              gap="sm"
              onClick={() => handleImageClick(index)}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4 / 3",
                  overflow: "hidden",
                  borderRadius: "var(--mond-radius-md)",
                }}
              >
                <Image
                  src={image.imageUrl}
                  alt={image.alt || image.caption || "Gallery image"}
                  width={400}
                  height={300}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              {image.caption && (
                <Text variant="body-sm" semantic="secondary">
                  {image.caption}
                </Text>
              )}
            </Box>
          ))}
        </div>
      </Box>

      {/* Lightbox Overlay */}
      {selectedImageIndex !== null && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={handleCloseLightbox}
        >
          {/* Close Button */}
          <div className="lightbox-button close">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleCloseLightbox}
              aria-label="Close lightbox"
            >
              ×
            </Button>
          </div>

          {/* Previous Button */}
          {images.length > 1 && (
            <div className="lightbox-button prev">
              <Button
                variant="ghost"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviousImage();
                }}
                aria-label="Previous image"
              >
                ‹
              </Button>
            </div>
          )}

          {/* Image */}
          <div
            className="lightbox-image-container"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedImageIndex].imageUrl}
              alt={
                images[selectedImageIndex].alt ||
                images[selectedImageIndex].caption ||
                "Gallery image"
              }
              width={1200}
              height={900}
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
            />
            {images[selectedImageIndex].caption && (
              <Box marginTop="4" display="flex" justifyContent="center">
                <div className="caption-white">
                  <Text variant="body">
                    {images[selectedImageIndex].caption}
                  </Text>
                </div>
              </Box>
            )}
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <div className="lightbox-button next">
              <Button
                variant="ghost"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                aria-label="Next image"
              >
                ›
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
