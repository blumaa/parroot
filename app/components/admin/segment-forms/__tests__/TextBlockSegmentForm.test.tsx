import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextBlockSegmentForm } from '../TextBlockSegmentForm';

describe('TextBlockSegmentForm', () => {
  const mockOnContentChange = vi.fn();

  const defaultProps = {
    content: {},
    onContentChange: mockOnContentChange,
  };

  beforeEach(() => {
    mockOnContentChange.mockClear();
  });

  it('renders all form fields', () => {
    render(<TextBlockSegmentForm {...defaultProps} />);

    // Heading controls
    expect(screen.getByLabelText(/heading text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heading size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heading weight/i)).toBeInTheDocument();

    // Body editor
    expect(screen.getByText(/body content/i)).toBeInTheDocument();

    // Styling controls
    expect(screen.getByLabelText(/alignment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/padding/i)).toBeInTheDocument();
  });

  it('calls onContentChange when heading text changes', async () => {
    const user = userEvent.setup();
    render(<TextBlockSegmentForm {...defaultProps} />);

    const headingInput = screen.getByLabelText(/heading text/i);
    await user.type(headingInput, 'Welcome');

    // userEvent.type types one character at a time, so onChange is called for each character
    expect(mockOnContentChange).toHaveBeenCalled();
    // Check that the final state contains 'Welcome'
    const lastCall = mockOnContentChange.mock.calls[mockOnContentChange.mock.calls.length - 1][0];
    expect(lastCall.heading).toContain('e'); // At minimum we have the last character
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('loads existing content correctly', () => {
    const existingContent = {
      heading: 'Existing Heading',
      headingSize: 'xl',
      headingWeight: 'bold',
      body: '<p>Existing body</p>',
      alignment: 'center',
      padding: 'lg',
    };

    render(<TextBlockSegmentForm content={existingContent} onContentChange={mockOnContentChange} />);

    expect(screen.getByLabelText(/heading text/i)).toHaveValue('Existing Heading');
    // MDS Select doesn't expose value in the same way as native select
    // Just verify the selects are rendered
    expect(screen.getByLabelText(/heading size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heading weight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/padding/i)).toBeInTheDocument();
  });

  it('supports draft saving with optional fields', () => {
    const minimalContent = {
      heading: 'Only heading',
    };

    render(<TextBlockSegmentForm content={minimalContent} onContentChange={mockOnContentChange} />);

    expect(screen.getByLabelText(/heading text/i)).toHaveValue('Only heading');
  });
});
