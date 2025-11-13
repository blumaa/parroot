"use client";

import { Box, Text, Button, Divider, Heading } from "@mond-design-system/theme";
import { Input } from "@mond-design-system/theme/client";
import { useState } from "react";
import type { GalleryImage } from "@/app/types";
import { uploadFile } from "@/app/utils/storage";
import { GallerySegmentRenderer } from "@/app/components/segments/GallerySegmentRenderer";
import { useToast } from "@/app/providers/ToastProvider";

interface GallerySegmentFormProps {
  content: Record<string, unknown>;
  onContentChange: (content: Record<string, unknown>) => void;
}

export function GallerySegmentForm({
  content,
  onContentChange,
}: GallerySegmentFormProps) {
  const images = (content.images as GalleryImage[]) || [];
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const handleAddImage = () => {
    const newImage: GalleryImage = {
      id: crypto.randomUUID(),
      imageUrl: "",
      caption: "",
      alt: "",
    };

    onContentChange({
      ...content,
      images: [...images, newImage],
    });
  };

  const handleRemoveImage = (imageId: string) => {
    onContentChange({
      ...content,
      images: images.filter((image) => image.id !== imageId),
    });
  };

  const handleMoveImageUp = (index: number) => {
    if (index === 0) return;

    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];

    onContentChange({
      ...content,
      images: newImages,
    });
  };

  const handleMoveImageDown = (index: number) => {
    if (index === images.length - 1) return;

    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];

    onContentChange({
      ...content,
      images: newImages,
    });
  };

  const handleImageFieldChange = (imageId: string, field: keyof GalleryImage, value: string) => {
    onContentChange({
      ...content,
      images: images.map((image) =>
        image.id === imageId ? { ...image, [field]: value } : image
      ),
    });
  };

  const handleImageUpload = async (imageId: string, file: File) => {
    try {
      setUploadingImageId(imageId);
      const path = `segments/gallery/${crypto.randomUUID()}-${file.name}`;
      const downloadURL = await uploadFile(path, file);

      handleImageFieldChange(imageId, "imageUrl", downloadURL);
      showSuccess("Success", "Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      showError(
        "Upload Failed",
        error instanceof Error ? error.message : "Failed to upload image. Please try again."
      );
    } finally {
      setUploadingImageId(null);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap="lg">
      {/* Gallery Settings */}
      <Box display="flex" flexDirection="column" gap="md">
        <Heading level={4}>Gallery Settings</Heading>

        <Box display="flex" flexDirection="column" gap="sm">
          <Text variant="body-sm" as="label">Images per Row</Text>
          <Box display="flex" gap="sm" style={{ flexWrap: "wrap" }}>
            <Button
              type="button"
              size="sm"
              variant={(content.imagesPerRow as number) === 3 ? "primary" : "outline"}
              onClick={() => onContentChange({ ...content, imagesPerRow: 3 })}
            >
              3 Images
            </Button>
            <Button
              type="button"
              size="sm"
              variant={(content.imagesPerRow as number) === 4 || !content.imagesPerRow ? "primary" : "outline"}
              onClick={() => onContentChange({ ...content, imagesPerRow: 4 })}
            >
              4 Images
            </Button>
            <Button
              type="button"
              size="sm"
              variant={(content.imagesPerRow as number) === 5 ? "primary" : "outline"}
              onClick={() => onContentChange({ ...content, imagesPerRow: 5 })}
            >
              5 Images
            </Button>
          </Box>
          <Text variant="body-sm" semantic="secondary">
            Rows will auto-adjust based on number of images. Responsive: Mobile (1-2 cols), Medium (2-3 cols), Large (3-5 cols)
          </Text>
        </Box>
      </Box>

      <Divider variant="strong" />

      {/* Images List */}
      {images.length > 0 && (
        <Box display="flex" flexDirection="column" gap="md">
          {/* Grid Preview of Images */}
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 'var(--mond-spacing-4)',
            }}
          >
            {images.map((image, index) => (
              <Box
                key={image.id}
                padding="3"
                style={{
                  border: "1px solid var(--mond-color-border-default)",
                  borderRadius: "var(--mond-radius-md)",
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="2">
                  <Text variant="body-sm" weight="medium">Image {index + 1}</Text>
                  <Box display="flex" gap="xs">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMoveImageUp(index)}
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMoveImageDown(index)}
                      disabled={index === images.length - 1}
                      aria-label="Move down"
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>

                <Box display="flex" flexDirection="column" gap="sm">
                  {/* Image Preview */}
                  {image.imageUrl && (
                    <Box
                      style={{
                        width: '100%',
                        aspectRatio: '4 / 3',
                        borderRadius: 'var(--mond-radius-sm)',
                        overflow: 'hidden',
                        backgroundColor: 'var(--mond-color-surface-secondary)',
                        backgroundImage: `url(${image.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                      role="img"
                      aria-label={image.alt || 'Preview'}
                    />
                  )}

                  {/* Image URL Input */}
                  <Box>
                    <Input
                      id={`image-url-${image.id}`}
                      label="Image URL"
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={image.imageUrl}
                      onChange={(e) => handleImageFieldChange(image.id, "imageUrl", e.target.value)}
                    />
                  </Box>

                  {/* File Upload */}
                  <Box>
                    <Text variant="body-sm" semantic="secondary" as="label">
                      Or upload an image
                    </Text>
                    <Box marginTop="1">
                      <Input
                        id={`image-upload-${image.id}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(image.id, file);
                          }
                        }}
                        disabled={uploadingImageId === image.id}
                      />
                      {uploadingImageId === image.id && (
                        <Box marginTop="1">
                          <Text variant="body-sm" semantic="secondary">
                            Uploading...
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Caption */}
                  <Box>
                    <Input
                      id={`caption-${image.id}`}
                      label="Caption"
                      type="text"
                      placeholder="Image caption (optional)"
                      value={image.caption}
                      onChange={(e) => handleImageFieldChange(image.id, "caption", e.target.value)}
                    />
                  </Box>

                  {/* Alt Text */}
                  <Box>
                    <Input
                      id={`alt-${image.id}`}
                      label="Alt Text"
                      type="text"
                      placeholder="Descriptive alt text for accessibility"
                      value={image.alt}
                      onChange={(e) => handleImageFieldChange(image.id, "alt", e.target.value)}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Add Image Button */}
      <Box>
        <Button type="button" variant="outline" onClick={handleAddImage}>
          Add Image
        </Button>
      </Box>

      {/* Live Preview */}
      {images.length > 0 && (
        <>
          <Divider variant="strong" />
          <Box>
            <Heading level={3}>Live Preview</Heading>
            <Divider />

            <Box marginTop="4">
              <GallerySegmentRenderer content={content} />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
