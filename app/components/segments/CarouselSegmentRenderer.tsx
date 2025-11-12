'use client';

import { Box, Text, Button, Heading } from '@mond-design-system/theme';
import { Carousel } from '@mond-design-system/theme/client';
import type { CarouselItem } from '@mond-design-system/theme/client';
import type { CarouselSlide } from '@/app/types';
import Image from 'next/image';
import Link from 'next/link';

interface CarouselSegmentRendererProps {
  content: Record<string, unknown>;
}

export function CarouselSegmentRenderer({ content }: CarouselSegmentRendererProps) {
  const slides = (content.slides as CarouselSlide[]) || [];
  const autoPlay = (content.autoPlay as boolean) ?? true;
  const autoPlayInterval = (content.autoPlayInterval as number) ?? 5000;
  const showArrows = (content.showArrows as boolean) ?? true;
  const showIndicators = (content.showIndicators as boolean) ?? true;
  const size = (content.size as 'sm' | 'md' | 'lg' | 'full-width' | 'auto') || 'lg';

  // Handle empty state
  if (!slides || slides.length === 0) {
    return (
      <Box padding="8" display="flex" justifyContent="center" alignItems="center">
        <Text variant="body" semantic="secondary">
          No slides to display
        </Text>
      </Box>
    );
  }

  // Transform slides into CarouselItem format
  const carouselItems: CarouselItem[] = slides.map((slide) => ({
    id: slide.id,
    content: (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--mond-color-surface-secondary)'
      }}>
        {/* Background Image - only render if imageUrl is provided */}
        {slide.imageUrl && (
          <Image
            src={slide.imageUrl}
            alt={slide.title || 'Carousel slide'}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        )}

        {/* Overlay Gradient for text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: slide.imageUrl
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)'
              : 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 100%)',
          }}
        />

        {/* Content Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          padding: 'var(--mond-spacing-8)'
        }}>
          {/* Title */}
          {slide.title && (
            <div style={{
              marginBottom: 'var(--mond-spacing-2)',
              color: slide.imageUrl ? 'white' : 'var(--mond-color-text-primary)',
              fontSize: '2.25rem',
              lineHeight: '2.5rem'
            }}>
              <Heading level={2}>{slide.title}</Heading>
            </div>
          )}

          {/* Description */}
          {slide.description && (
            <div style={{
              marginBottom: 'var(--mond-spacing-4)',
              color: slide.imageUrl ? 'white' : 'var(--mond-color-text-secondary)'
            }}>
              <Text variant="body">{slide.description}</Text>
            </div>
          )}

          {/* Button */}
          {slide.buttonText && slide.buttonUrl && (
            <Link href={slide.buttonUrl}>
              <Button variant="primary" size="lg">
                {slide.buttonText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    ),
  }));

  return (
    <Carousel
      items={carouselItems}
      autoPlay={autoPlay}
      autoPlayInterval={autoPlayInterval}
      showArrows={showArrows}
      showIndicators={showIndicators}
      size={size}
      infinite
      pauseOnHover
    />
  );
}
