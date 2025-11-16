"use client";

import { Box, Text, Button, Divider, Heading } from "@mond-design-system/theme";
import { Input, Textarea } from "@mond-design-system/theme/client";
import { useState } from "react";
import type { CarouselSlide } from "@/app/types";
import { uploadFile } from "@/app/utils/storage";
import { CarouselSegmentRenderer } from "@/app/components/segments/CarouselSegmentRenderer";
import { useToast } from "@/app/providers/ToastProvider";

interface CarouselSegmentFormProps {
  content: Record<string, unknown>;
  onContentChange: (content: Record<string, unknown>) => void;
}

export function CarouselSegmentForm({
  content,
  onContentChange,
}: CarouselSegmentFormProps) {
  const slides = (content.slides as CarouselSlide[]) || [];
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const handleAddSlide = () => {
    const newSlide: CarouselSlide = {
      id: crypto.randomUUID(),
      imageUrl: "",
      title: "",
      description: "",
      buttonText: "",
      buttonUrl: "",
    };

    onContentChange({
      ...content,
      slides: [...slides, newSlide],
    });
  };

  const handleRemoveSlide = (slideId: string) => {
    onContentChange({
      ...content,
      slides: slides.filter((slide) => slide.id !== slideId),
    });
  };

  const handleMoveSlideUp = (index: number) => {
    if (index === 0) return;

    const newSlides = [...slides];
    [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];

    onContentChange({
      ...content,
      slides: newSlides,
    });
  };

  const handleMoveSlideDown = (index: number) => {
    if (index === slides.length - 1) return;

    const newSlides = [...slides];
    [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];

    onContentChange({
      ...content,
      slides: newSlides,
    });
  };

  const handleSlideFieldChange = (slideId: string, field: keyof CarouselSlide, value: string) => {
    onContentChange({
      ...content,
      slides: slides.map((slide) =>
        slide.id === slideId ? { ...slide, [field]: value } : slide
      ),
    });
  };

  const handleImageUpload = async (slideId: string, file: File) => {
    try {
      setUploadingSlideId(slideId);
      const path = `segments/carousel/${crypto.randomUUID()}-${file.name}`;
      const downloadURL = await uploadFile(path, file);

      handleSlideFieldChange(slideId, "imageUrl", downloadURL);
      showSuccess("Success", "Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      showError(
        "Upload Failed",
        error instanceof Error ? error.message : "Failed to upload image. Please try again."
      );
    } finally {
      setUploadingSlideId(null);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap="lg">
      {/* Carousel Settings */}
      <Box display="flex" flexDirection="column" gap="md">
        <Heading level={4}>Carousel Settings</Heading>

        <Box display="flex" flexDirection="column" gap="sm">
          <Text variant="body-sm" as="label">Size</Text>
          <Box display="flex" gap="sm" flexWrap="wrap">
            <Button
              type="button"
              size="sm"
              variant={(content.size as string) === "sm" ? "primary" : "outline"}
              onClick={() => onContentChange({ ...content, size: "sm" })}
            >
              Small (600px)
            </Button>
            <Button
              type="button"
              size="sm"
              variant={(content.size as string) === "md" ? "primary" : "outline"}
              onClick={() => onContentChange({ ...content, size: "md" })}
            >
              Medium (900px)
            </Button>
            <Button
              type="button"
              size="sm"
              variant={(content.size as string) === "lg" || !content.size ? "primary" : "outline"}
              onClick={() => onContentChange({ ...content, size: "lg" })}
            >
              Large (1200px)
            </Button>
            <Button
              type="button"
              size="sm"
              variant={(content.size as string) === "full-width" ? "primary" : "outline"}
              onClick={() => onContentChange({ ...content, size: "full-width" })}
            >
              Full Width
            </Button>
          </Box>
          <Text variant="body-sm" semantic="secondary">
            All sizes use 16:9 aspect ratio for consistent display
          </Text>
        </Box>
      </Box>

      <Divider variant="strong" />

      {/* Slides List */}
      {slides.length > 0 && (
        <Box display="flex" flexDirection="column" gap="md">
          {slides.map((slide, index) => (
            <Box
              key={slide.id}
              padding="4"
              border="default"
              corners="default"
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="3">
                <Heading level={4}>Slide {index + 1}</Heading>
                <Box display="flex" gap="xs">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveSlideUp(index)}
                    disabled={index === 0}
                    aria-label="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveSlideDown(index)}
                    disabled={index === slides.length - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveSlide(slide.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>

              <Box display="flex" flexDirection="column" gap="md">
                {/* Image URL Input */}
                <Box>
                  <Input
                    id={`image-url-${slide.id}`}
                    label="Image URL"
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={slide.imageUrl}
                    onChange={(e) => handleSlideFieldChange(slide.id, "imageUrl", e.target.value)}
                  />
                </Box>

                {/* File Upload */}
                <Box>
                  <Text variant="body-sm" semantic="secondary" as="label">
                    Or upload an image
                  </Text>
                  <Box marginTop="2">
                    <Input
                      id={`image-upload-${slide.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(slide.id, file);
                        }
                      }}
                      disabled={uploadingSlideId === slide.id}
                    />
                    {uploadingSlideId === slide.id && (
                      <Box marginTop="1">
                        <Text variant="body-sm" semantic="secondary">
                          Uploading...
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Title */}
                <Box>
                  <Input
                    id={`title-${slide.id}`}
                    label="Title"
                    type="text"
                    placeholder="Slide title"
                    value={slide.title}
                    onChange={(e) => handleSlideFieldChange(slide.id, "title", e.target.value)}
                  />
                </Box>

                {/* Description */}
                <Box>
                  <Textarea
                    id={`description-${slide.id}`}
                    label="Description"
                    placeholder="Slide description"
                    value={slide.description}
                    onChange={(e) => handleSlideFieldChange(slide.id, "description", e.target.value)}
                    rows={3}
                  />
                </Box>

                {/* Button Text */}
                <Box>
                  <Input
                    id={`button-text-${slide.id}`}
                    label="Button Text"
                    type="text"
                    placeholder="Learn More (optional)"
                    value={slide.buttonText}
                    onChange={(e) => handleSlideFieldChange(slide.id, "buttonText", e.target.value)}
                  />
                </Box>

                {/* Button URL */}
                <Box>
                  <Input
                    id={`button-url-${slide.id}`}
                    label="Button URL"
                    type="text"
                    placeholder="/page or https://example.com (optional)"
                    value={slide.buttonUrl}
                    onChange={(e) => handleSlideFieldChange(slide.id, "buttonUrl", e.target.value)}
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Add Slide Button */}
      <Box>
        <Button type="button" variant="outline" onClick={handleAddSlide}>
          Add Slide
        </Button>
      </Box>

      {/* Live Preview */}
      {slides.length > 0 && (
        <>
          <Divider variant="strong" />
          <Box>
            <Heading level={3}>Live Preview</Heading>
            <Divider />

            <Box marginTop="4">
              <CarouselSegmentRenderer content={content} />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
