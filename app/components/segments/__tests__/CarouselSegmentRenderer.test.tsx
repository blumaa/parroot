import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CarouselSegmentRenderer } from '../CarouselSegmentRenderer';

describe('CarouselSegmentRenderer', () => {
  const mockSlides = [
    {
      id: 'slide-1',
      imageUrl: 'https://example.com/image1.jpg',
      title: 'First Slide',
      description: 'Description for first slide',
      buttonText: 'Learn More',
      buttonUrl: '/learn-more',
    },
    {
      id: 'slide-2',
      imageUrl: 'https://example.com/image2.jpg',
      title: 'Second Slide',
      description: 'Description for second slide',
      buttonText: 'Get Started',
      buttonUrl: '/get-started',
    },
  ];

  it('renders empty state when no slides provided', () => {
    render(<CarouselSegmentRenderer content={{}} />);

    expect(screen.getByText(/no slides to display/i)).toBeInTheDocument();
  });

  it('renders carousel with slide titles', () => {
    render(<CarouselSegmentRenderer content={{ slides: mockSlides }} />);

    expect(screen.getByText('First Slide')).toBeInTheDocument();
    expect(screen.getByText('Second Slide')).toBeInTheDocument();
  });

  it('renders slide without button when buttonText is empty', () => {
    const slidesWithoutButton = [
      {
        id: 'slide-1',
        imageUrl: 'https://example.com/image1.jpg',
        title: 'Test Slide',
        description: 'Test Description',
        buttonText: '',
        buttonUrl: '',
      },
    ];

    render(<CarouselSegmentRenderer content={{ slides: slidesWithoutButton }} />);

    expect(screen.getByText('Test Slide')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('handles single slide', () => {
    const singleSlide = [mockSlides[0]];

    render(<CarouselSegmentRenderer content={{ slides: singleSlide }} />);

    expect(screen.getByText('First Slide')).toBeInTheDocument();
    expect(screen.queryByText('Second Slide')).not.toBeInTheDocument();
  });
});
