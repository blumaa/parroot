import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CTASegmentForm } from '../CTASegmentForm';

// Mock the toast provider
vi.mock('@/app/providers/ToastProvider', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

describe('CTASegmentForm', () => {
  const mockOnContentChange = vi.fn();

  const defaultProps = {
    content: {},
    onContentChange: mockOnContentChange,
  };

  beforeEach(() => {
    mockOnContentChange.mockClear();
  });

  it('renders all form fields', () => {
    render(<CTASegmentForm {...defaultProps} />);

    expect(screen.getByLabelText(/heading/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/primary button text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/primary button url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/secondary button text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/secondary button url/i)).toBeInTheDocument();
  });

  it('updates heading field', async () => {
    const user = userEvent.setup();
    render(<CTASegmentForm {...defaultProps} />);

    const headingInput = screen.getByLabelText(/heading/i);
    await user.type(headingInput, 'Get Started Today');

    expect(mockOnContentChange).toHaveBeenCalled();
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('updates description field', async () => {
    const user = userEvent.setup();
    render(<CTASegmentForm {...defaultProps} />);

    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Join thousands of customers');

    expect(mockOnContentChange).toHaveBeenCalled();
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('updates primary button text', async () => {
    const user = userEvent.setup();
    render(<CTASegmentForm {...defaultProps} />);

    const buttonTextInput = screen.getByLabelText(/primary button text/i);
    await user.type(buttonTextInput, 'Sign Up');

    expect(mockOnContentChange).toHaveBeenCalled();
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('updates primary button URL', async () => {
    const user = userEvent.setup();
    render(<CTASegmentForm {...defaultProps} />);

    const buttonUrlInput = screen.getByLabelText(/primary button url/i);
    await user.type(buttonUrlInput, '/signup');

    expect(mockOnContentChange).toHaveBeenCalled();
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('updates secondary button fields', async () => {
    const user = userEvent.setup();
    render(<CTASegmentForm {...defaultProps} />);

    const secondaryTextInput = screen.getByLabelText(/secondary button text/i);
    const secondaryUrlInput = screen.getByLabelText(/secondary button url/i);

    await user.type(secondaryTextInput, 'Learn More');
    await user.type(secondaryUrlInput, '/learn');

    expect(mockOnContentChange).toHaveBeenCalled();
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('updates button variant', async () => {
    const user = userEvent.setup();
    render(<CTASegmentForm {...defaultProps} />);

    const outlineButton = screen.getByRole('button', { name: /outline/i });
    await user.click(outlineButton);

    expect(mockOnContentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        buttonVariant: 'outline',
      })
    );
  });

  it('loads existing content correctly', () => {
    const content = {
      heading: 'Existing Heading',
      description: 'Existing Description',
      primaryButtonText: 'Click Me',
      primaryButtonUrl: '/test',
      secondaryButtonText: 'Learn More',
      secondaryButtonUrl: '/learn',
      buttonVariant: 'outline',
    };

    render(<CTASegmentForm content={content} onContentChange={mockOnContentChange} />);

    expect(screen.getByDisplayValue('Existing Heading')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Click Me')).toBeInTheDocument();
    expect(screen.getByDisplayValue('/test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Learn More')).toBeInTheDocument();
    expect(screen.getByDisplayValue('/learn')).toBeInTheDocument();
  });

  it('supports draft saving with empty fields', () => {
    const content = {
      heading: 'Only Heading',
      description: '',
      primaryButtonText: '',
      primaryButtonUrl: '',
    };

    render(<CTASegmentForm content={content} onContentChange={mockOnContentChange} />);

    expect(screen.getByDisplayValue('Only Heading')).toBeInTheDocument();
  });

  it('displays live preview when content exists', () => {
    const content = {
      heading: 'Test Heading',
      description: 'Test Description',
      primaryButtonText: 'Sign Up',
      primaryButtonUrl: '/signup',
    };

    render(<CTASegmentForm content={content} onContentChange={mockOnContentChange} />);

    expect(screen.getByText(/live preview/i)).toBeInTheDocument();
  });

  it('renders button variant selector with all options', () => {
    render(<CTASegmentForm {...defaultProps} />);

    expect(screen.getByRole('button', { name: /^primary$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /outline/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ghost/i })).toBeInTheDocument();
  });

  it('shows URL format hint', () => {
    render(<CTASegmentForm {...defaultProps} />);

    expect(screen.getByText(/internal urls/i)).toBeInTheDocument();
  });

  it('handles switching between button variants', async () => {
    const user = userEvent.setup();
    render(<CTASegmentForm {...defaultProps} />);

    const primaryButton = screen.getByRole('button', { name: /^primary$/i });
    const outlineButton = screen.getByRole('button', { name: /outline/i });
    const ghostButton = screen.getByRole('button', { name: /ghost/i });

    await user.click(outlineButton);
    expect(mockOnContentChange).toHaveBeenCalledWith(
      expect.objectContaining({ buttonVariant: 'outline' })
    );

    await user.click(ghostButton);
    expect(mockOnContentChange).toHaveBeenCalledWith(
      expect.objectContaining({ buttonVariant: 'ghost' })
    );

    await user.click(primaryButton);
    expect(mockOnContentChange).toHaveBeenCalledWith(
      expect.objectContaining({ buttonVariant: 'primary' })
    );
  });
});
