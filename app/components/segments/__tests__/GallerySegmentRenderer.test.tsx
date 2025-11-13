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

  it('renders empty state when images array is empty', () => {
    render(<GallerySegmentRenderer content={{ images: [] }} />);

    expect(screen.getByText(/no images to display/i)).toBeInTheDocument();
  });

  it('renders gallery with image captions', () => {
    render(<GallerySegmentRenderer content={{ images: mockImages }} />);

    expect(screen.getByText('First Image')).toBeInTheDocument();
    expect(screen.getByText('Second Image')).toBeInTheDocument();
    expect(screen.getByText('Third Image')).toBeInTheDocument();
  });

  it('renders images with correct alt text', () => {
    render(<GallerySegmentRenderer content={{ images: mockImages }} />);

    expect(screen.getByAltText('First image alt text')).toBeInTheDocument();
    expect(screen.getByAltText('Second image alt text')).toBeInTheDocument();
    expect(screen.getByAltText('Third image alt text')).toBeInTheDocument();
  });

  it('handles single image', () => {
    const singleImage = [mockImages[0]];

    render(<GallerySegmentRenderer content={{ images: singleImage }} />);

    expect(screen.getByText('First Image')).toBeInTheDocument();
    expect(screen.queryByText('Second Image')).not.toBeInTheDocument();
  });

  it('renders with default settings (2 rows, 4 images per row)', () => {
    render(<GallerySegmentRenderer content={{ images: mockImages }} />);

    const gallery = screen.getByRole('region', { name: /gallery/i });
    expect(gallery).toBeInTheDocument();
  });

  it('renders with custom row count', () => {
    render(
      <GallerySegmentRenderer
        content={{
          images: mockImages,
          rowCount: 1,
        }}
      />
    );

    const gallery = screen.getByRole('region', { name: /gallery/i });
    expect(gallery).toBeInTheDocument();
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

  it('opens lightbox when image is clicked', () => {
    render(<GallerySegmentRenderer content={{ images: mockImages }} />);

    const firstImage = screen.getByAltText('First image alt text');
    fireEvent.click(firstImage);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes lightbox when close button is clicked', () => {
    render(<GallerySegmentRenderer content={{ images: mockImages }} />);

    const firstImage = screen.getByAltText('First image alt text');
    fireEvent.click(firstImage);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders images without captions when caption is empty', () => {
    const imagesWithoutCaptions = [
      {
        id: 'img-1',
        imageUrl: 'https://example.com/image1.jpg',
        caption: '',
        alt: 'Test image',
      },
    ];

    render(<GallerySegmentRenderer content={{ images: imagesWithoutCaptions }} />);

    expect(screen.getByAltText('Test image')).toBeInTheDocument();
    expect(screen.queryByText(/Test image/i)).not.toBeInTheDocument();
  });
});
