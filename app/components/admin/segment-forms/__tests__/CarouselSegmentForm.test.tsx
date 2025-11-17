import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CarouselSegmentForm } from '../CarouselSegmentForm';

// Mock the storage utility
vi.mock('@/app/utils/storage', () => ({
  uploadFile: vi.fn().mockResolvedValue('https://example.com/uploaded-image.jpg'),
}));

// Mock the toast provider
vi.mock('@/app/providers/ToastProvider', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

describe('CarouselSegmentForm', () => {
  const mockOnContentChange = vi.fn();

  const defaultProps = {
    content: {},
    onContentChange: mockOnContentChange,
  };

  beforeEach(() => {
    mockOnContentChange.mockClear();
  });

  it('renders empty form with add slide button', () => {
    render(<CarouselSegmentForm {...defaultProps} />);

    expect(screen.getByText(/add slide/i)).toBeInTheDocument();
    expect(screen.queryByText(/slide 1/i)).not.toBeInTheDocument();
  });

  it('adds a new slide when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<CarouselSegmentForm {...defaultProps} />);

    const addButton = screen.getByText(/add slide/i);
    await user.click(addButton);

    expect(mockOnContentChange).toHaveBeenCalled();
    const lastCall = mockOnContentChange.mock.calls[mockOnContentChange.mock.calls.length - 1][0];
    expect(lastCall.slides).toHaveLength(1);
    expect(lastCall.slides[0]).toHaveProperty('id');
    expect(lastCall.slides[0]).toHaveProperty('imageUrl', '');
    expect(lastCall.slides[0]).toHaveProperty('title', '');
    expect(lastCall.slides[0]).toHaveProperty('description', '');
  });

  it('removes slide when delete button is clicked', async () => {
    const user = userEvent.setup();
    const content = {
      slides: [
        {
          id: 'slide-1',
          imageUrl: '',
          title: 'Slide 1',
          description: '',
          buttonText: '',
          buttonUrl: '',
        },
        {
          id: 'slide-2',
          imageUrl: '',
          title: 'Slide 2',
          description: '',
          buttonText: '',
          buttonUrl: '',
        },
      ],
    };

    render(<CarouselSegmentForm content={content} onContentChange={mockOnContentChange} />);

    const deleteButtons = screen.getAllByText(/delete/i);
    await user.click(deleteButtons[0]);

    expect(mockOnContentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        slides: expect.arrayContaining([
          expect.objectContaining({ id: 'slide-2' }),
        ]),
      })
    );
    const lastCall = mockOnContentChange.mock.calls[mockOnContentChange.mock.calls.length - 1][0];
    expect(lastCall.slides).toHaveLength(1);
  });

  it('loads existing slides correctly', () => {
    const content = {
      slides: [
        {
          id: 'slide-1',
          imageUrl: 'https://example.com/image.jpg',
          title: 'Existing Title',
          description: 'Existing Description',
          buttonText: 'Click Here',
          buttonUrl: '/click',
        },
      ],
    };

    render(<CarouselSegmentForm content={content} onContentChange={mockOnContentChange} />);

    expect(screen.getByDisplayValue('Existing Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Click Here')).toBeInTheDocument();
    expect(screen.getByDisplayValue('/click')).toBeInTheDocument();
  });

  it('supports draft saving with empty fields', () => {
    const content = {
      slides: [
        {
          id: 'slide-1',
          imageUrl: '',
          title: 'Only Title',
          description: '',
          buttonText: '',
          buttonUrl: '',
        },
      ],
    };

    render(<CarouselSegmentForm content={content} onContentChange={mockOnContentChange} />);

    expect(screen.getByDisplayValue('Only Title')).toBeInTheDocument();
  });
});
