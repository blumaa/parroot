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

  it('renders slide form fields when slide exists', async () => {
    const user = userEvent.setup();
    render(<CarouselSegmentForm {...defaultProps} />);

    await user.click(screen.getByText(/add slide/i));

    // Should render slide fields (check via last mockOnContentChange call creating a slide)
    expect(mockOnContentChange).toHaveBeenCalled();
  });

  it('updates slide title field', async () => {
    const user = userEvent.setup();
    const content = {
      slides: [
        {
          id: 'slide-1',
          imageUrl: '',
          title: '',
          description: '',
          buttonText: '',
          buttonUrl: '',
        },
      ],
    };

    render(<CarouselSegmentForm content={content} onContentChange={mockOnContentChange} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'New Title');

    expect(mockOnContentChange).toHaveBeenCalled();
    // userEvent.type triggers onChange for each character, check that we got calls
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('updates slide description field', async () => {
    const user = userEvent.setup();
    const content = {
      slides: [
        {
          id: 'slide-1',
          imageUrl: '',
          title: '',
          description: '',
          buttonText: '',
          buttonUrl: '',
        },
      ],
    };

    render(<CarouselSegmentForm content={content} onContentChange={mockOnContentChange} />);

    const descInput = screen.getByLabelText(/description/i);
    await user.type(descInput, 'New Description');

    expect(mockOnContentChange).toHaveBeenCalled();
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('updates slide image URL field', async () => {
    const user = userEvent.setup();
    const content = {
      slides: [
        {
          id: 'slide-1',
          imageUrl: '',
          title: '',
          description: '',
          buttonText: '',
          buttonUrl: '',
        },
      ],
    };

    render(<CarouselSegmentForm content={content} onContentChange={mockOnContentChange} />);

    const imageUrlInput = screen.getByLabelText(/image url/i);
    await user.type(imageUrlInput, 'https://example.com/image.jpg');

    expect(mockOnContentChange).toHaveBeenCalled();
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('updates button text and URL fields', async () => {
    const user = userEvent.setup();
    const content = {
      slides: [
        {
          id: 'slide-1',
          imageUrl: '',
          title: '',
          description: '',
          buttonText: '',
          buttonUrl: '',
        },
      ],
    };

    render(<CarouselSegmentForm content={content} onContentChange={mockOnContentChange} />);

    const buttonTextInput = screen.getByLabelText(/button text/i);
    await user.type(buttonTextInput, 'Click Me');

    const buttonUrlInput = screen.getByLabelText(/button url/i);
    await user.type(buttonUrlInput, '/click-here');

    expect(mockOnContentChange).toHaveBeenCalled();
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
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

  it('moves slide up when up button is clicked', async () => {
    const user = userEvent.setup();
    const content = {
      slides: [
        {
          id: 'slide-1',
          imageUrl: '',
          title: 'First',
          description: '',
          buttonText: '',
          buttonUrl: '',
        },
        {
          id: 'slide-2',
          imageUrl: '',
          title: 'Second',
          description: '',
          buttonText: '',
          buttonUrl: '',
        },
      ],
    };

    render(<CarouselSegmentForm content={content} onContentChange={mockOnContentChange} />);

    const upButtons = screen.getAllByLabelText(/move up/i);
    await user.click(upButtons[1]); // Click up on second slide

    expect(mockOnContentChange).toHaveBeenCalled();
    const lastCall = mockOnContentChange.mock.calls[mockOnContentChange.mock.calls.length - 1][0];
    expect(lastCall.slides[0].id).toBe('slide-2');
    expect(lastCall.slides[1].id).toBe('slide-1');
  });

  it('moves slide down when down button is clicked', async () => {
    const user = userEvent.setup();
    const content = {
      slides: [
        {
          id: 'slide-1',
          imageUrl: '',
          title: 'First',
          description: '',
          buttonText: '',
          buttonUrl: '',
        },
        {
          id: 'slide-2',
          imageUrl: '',
          title: 'Second',
          description: '',
          buttonText: '',
          buttonUrl: '',
        },
      ],
    };

    render(<CarouselSegmentForm content={content} onContentChange={mockOnContentChange} />);

    const downButtons = screen.getAllByLabelText(/move down/i);
    await user.click(downButtons[0]); // Click down on first slide

    expect(mockOnContentChange).toHaveBeenCalled();
    const lastCall = mockOnContentChange.mock.calls[mockOnContentChange.mock.calls.length - 1][0];
    expect(lastCall.slides[0].id).toBe('slide-2');
    expect(lastCall.slides[1].id).toBe('slide-1');
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
