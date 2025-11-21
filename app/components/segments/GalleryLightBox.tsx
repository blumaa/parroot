"use client";

import { Box, Button } from "@mond-design-system/theme";
import { Modal, ModalBody } from "@mond-design-system/theme/client";
import Image from "next/image";
import type { GalleryImage } from "@/app/types";

interface GalleryLightBoxProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryImage[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
}

export function GalleryLightBox({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNext,
  onPrevious,
}: GalleryLightBoxProps) {
  const currentImage = images[currentIndex];

  if (!currentImage) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        paddingTop="4"
        paddingBottom="4"
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <Box border="default" padding="2">
            <Button
              variant="outline"
              size="lg"
              onClick={onPrevious}
              aria-label="Previous image"
            >
              ‹
            </Button>
          </Box>
        )}

        {/* Image */}
        <div
          style={{
            width: "80vw",
            height: "80vh",
            position: "relative",
          }}
        >
          <Image
            src={currentImage.imageUrl}
            alt={currentImage.alt || currentImage.caption || "Gallery image"}
            fill
            sizes="80vw"
            style={{
              objectFit: "contain",
            }}
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <Box>
            <Button
              variant="outline"
              size="lg"
              onClick={onNext}
              aria-label="Next image"
            >
              ›
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
}
