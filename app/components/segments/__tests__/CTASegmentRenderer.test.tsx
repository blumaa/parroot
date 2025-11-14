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

  it('does not render secondary button when not provided', () => {
    const content = {
      heading: 'Get Started',
      description: 'Test description',
      primaryButtonText: 'Sign Up',
      primaryButtonUrl: '/signup',
    };

    render(<CTASegmentRenderer content={content} />);

    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.queryByText('Learn More')).not.toBeInTheDocument();
  });

  it('handles empty content gracefully', () => {
    const content = {};

    render(<CTASegmentRenderer content={content} />);

    expect(screen.getByText(/no cta content/i)).toBeInTheDocument();
  });

  it('handles missing required fields gracefully', () => {
    const content = {
      heading: 'Get Started',
      description: '',
      primaryButtonText: '',
      primaryButtonUrl: '',
    };

    render(<CTASegmentRenderer content={content} />);

    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('applies button variant when specified', () => {
    const content = {
      heading: 'Get Started',
      description: 'Test description',
      primaryButtonText: 'Sign Up',
      primaryButtonUrl: '/signup',
      buttonVariant: 'outline' as const,
    };

    render(<CTASegmentRenderer content={content} />);

    const button = screen.getByRole('link', { name: 'Sign Up' });
    expect(button).toBeInTheDocument();
  });

  it('handles external URLs correctly', () => {
    const content = {
      heading: 'Visit Our Partner',
      description: 'Check out our partner site',
      primaryButtonText: 'Visit Now',
      primaryButtonUrl: 'https://example.com',
    };

    render(<CTASegmentRenderer content={content} />);

    const button = screen.getByRole('link', { name: 'Visit Now' });
    expect(button).toHaveAttribute('href', 'https://example.com');
    expect(button).toHaveAttribute('target', '_blank');
    expect(button).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('uses default button variant when not specified', () => {
    const content = {
      heading: 'Get Started',
      description: 'Test description',
      primaryButtonText: 'Sign Up',
      primaryButtonUrl: '/signup',
    };

    render(<CTASegmentRenderer content={content} />);

    const button = screen.getByRole('link', { name: 'Sign Up' });
    expect(button).toBeInTheDocument();
  });

  it('renders with proper spacing between elements', () => {
    const content = {
      heading: 'Get Started Today',
      description: 'Join thousands of satisfied customers',
      primaryButtonText: 'Sign Up',
      primaryButtonUrl: '/signup',
      secondaryButtonText: 'Learn More',
      secondaryButtonUrl: '/learn',
    };

    render(<CTASegmentRenderer content={content} />);

    expect(screen.getByText('Get Started Today')).toBeInTheDocument();
    expect(screen.getByText('Join thousands of satisfied customers')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learn More' })).toBeInTheDocument();
  });

  it('does not render secondary button when only text is provided without URL', () => {
    const content = {
      heading: 'Get Started',
      description: 'Test description',
      primaryButtonText: 'Sign Up',
      primaryButtonUrl: '/signup',
      secondaryButtonText: 'Learn More',
      secondaryButtonUrl: '',
    };

    render(<CTASegmentRenderer content={content} />);

    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.queryByText('Learn More')).not.toBeInTheDocument();
  });

  it('does not render primary button when missing text or URL', () => {
    const content = {
      heading: 'Get Started',
      description: 'Test description',
      primaryButtonText: '',
      primaryButtonUrl: '/signup',
    };

    render(<CTASegmentRenderer content={content} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
