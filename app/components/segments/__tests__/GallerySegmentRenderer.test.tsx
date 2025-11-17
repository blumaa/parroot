import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GallerySegmentRenderer } from '../GallerySegmentRenderer';

describe('GallerySegmentRenderer', () => {
  const mockImages = [
    {
      id: 'img-1',
      imageUrl: 'https://example.com/image1.jpg',
      caption: 'First Image',
      alt: 'First image alt text',
    },
    {
      id: 'img-2',
      imageUrl: 'https://example.com/image2.jpg',
      caption: 'Second Image',
      alt: 'Second image alt text',
    },
    {
      id: 'img-3',
      imageUrl: 'https://example.com/image3.jpg',
      caption: 'Third Image',
      alt: 'Third image alt text',
    },
  ];

  it('renders empty state when no images provided', () => {
    render(<GallerySegmentRenderer content={{}} />);

    expect(screen.getByText(/no images to display/i)).toBeInTheDocument();
  });

  it('renders gallery with image captions', () => {
    render(<GallerySegmentRenderer content={{ images: mockImages }} />);

    expect(screen.getByText('First Image')).toBeInTheDocument();
    expect(screen.getByText('Second Image')).toBeInTheDocument();
    expect(screen.getByText('Third Image')).toBeInTheDocument();
  });

  it('handles single image', () => {
    const singleImage = [mockImages[0]];

    render(<GallerySegmentRenderer content={{ images: singleImage }} />);

    expect(screen.getByText('First Image')).toBeInTheDocument();
    expect(screen.queryByText('Second Image')).not.toBeInTheDocument();
  });

  it('renders with custom images per row', () => {
    render(
      <GallerySegmentRenderer
        content={{
          images: mockImages,
          imagesPerRow: 3,
        }}
      />
    );

    const gallery = screen.getByRole('region', { name: /gallery/i });
    expect(gallery).toBeInTheDocument();
  });
});
