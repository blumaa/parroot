import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CTASegmentRenderer } from '../CTASegmentRenderer';

describe('CTASegmentRenderer', () => {
  it('renders heading and description', () => {
    const content = {
      heading: 'Get Started Today',
      description: 'Join thousands of satisfied customers',
      primaryButtonText: 'Sign Up',
      primaryButtonUrl: '/signup',
    };

    render(<CTASegmentRenderer content={content} />);

    expect(screen.getByText('Get Started Today')).toBeInTheDocument();
    expect(screen.getByText('Join thousands of satisfied customers')).toBeInTheDocument();
  });

  it('renders primary button with correct text and link', () => {
    const content = {
      heading: 'Get Started',
      description: 'Test description',
      primaryButtonText: 'Click Me',
      primaryButtonUrl: '/test-url',
    };

    render(<CTASegmentRenderer content={content} />);

    const button = screen.getByRole('link', { name: 'Click Me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '/test-url');
  });

  it('renders secondary button when provided', () => {
    const content = {
      heading: 'Get Started',
      description: 'Test description',
      primaryButtonText: 'Sign Up',
      primaryButtonUrl: '/signup',
      secondaryButtonText: 'Learn More',
      secondaryButtonUrl: '/learn',
    };

    render(<CTASegmentRenderer content={content} />);

    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learn More' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learn More' })).toHaveAttribute('href', '/learn');
  });

  it('handles empty content gracefully', () => {
    const content = {};

    render(<CTASegmentRenderer content={content} />);

    expect(screen.getByText(/no cta content/i)).toBeInTheDocument();
  });
});
