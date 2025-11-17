import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextBlockSegmentRenderer } from '../TextBlockSegmentRenderer';

describe('TextBlockSegmentRenderer', () => {
  it('renders heading when provided', () => {
    render(
      <TextBlockSegmentRenderer
        content={{
          heading: 'Test Heading',
          headingSize: 'lg',
          headingWeight: 'bold',
        }}
      />
    );

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('renders body content when provided', () => {
    render(
      <TextBlockSegmentRenderer
        content={{
          body: '<p>Test body content</p>',
        }}
      />
    );

    expect(screen.getByText('Test body content')).toBeInTheDocument();
  });

  it('renders both heading and body', () => {
    render(
      <TextBlockSegmentRenderer
        content={{
          heading: 'My Heading',
          body: '<p>My body text</p>',
        }}
      />
    );

    expect(screen.getByText('My Heading')).toBeInTheDocument();
    expect(screen.getByText('My body text')).toBeInTheDocument();
  });

  it('renders empty when no content provided', () => {
    const { container } = render(<TextBlockSegmentRenderer content={{}} />);

    // Should render a Box but with no visible content
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});
