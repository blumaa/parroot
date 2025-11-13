import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GallerySegmentForm } from '../GallerySegmentForm';

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

describe('GallerySegmentForm', () => {
  const mockOnContentChange = vi.fn();

  const defaultProps = {
    content: {},
    onContentChange: mockOnContentChange,
  };

  beforeEach(() => {
    mockOnContentChange.mockClear();
  });

  it('renders empty form with add image button', () => {
    render(<GallerySegmentForm {...defaultProps} />);

    expect(screen.getByText(/add image/i)).toBeInTheDocument();
    expect(screen.queryByText(/image 1/i)).not.toBeInTheDocument();
  });

  it('renders gallery settings with default values', () => {
    render(<GallerySegmentForm {...defaultProps} />);

    expect(screen.getByText(/gallery settings/i)).toBeInTheDocument();
    expect(screen.getByText(/images per row/i)).toBeInTheDocument();
  });

  it('adds a new image when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<GallerySegmentForm {...defaultProps} />);

    const addButton = screen.getByText(/add image/i);
    await user.click(addButton);

    expect(mockOnContentChange).toHaveBeenCalled();
    const lastCall = mockOnContentChange.mock.calls[mockOnContentChange.mock.calls.length - 1][0];
    expect(lastCall.images).toHaveLength(1);
    expect(lastCall.images[0]).toHaveProperty('id');
    expect(lastCall.images[0]).toHaveProperty('imageUrl', '');
    expect(lastCall.images[0]).toHaveProperty('caption', '');
    expect(lastCall.images[0]).toHaveProperty('alt', '');
  });

  it('updates images per row setting', async () => {
    const user = userEvent.setup();
    render(<GallerySegmentForm {...defaultProps} />);

    const threeImagesButton = screen.getByRole('button', { name: /3 images/i });
    await user.click(threeImagesButton);

    expect(mockOnContentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        imagesPerRow: 3,
      })
    );
  });

  it('updates image URL field', async () => {
    const user = userEvent.setup();
    const content = {
      images: [
        {
          id: 'img-1',
          imageUrl: '',
          caption: '',
          alt: '',
        },
      ],
    };

    render(<GallerySegmentForm content={content} onContentChange={mockOnContentChange} />);

    const imageUrlInput = screen.getByLabelText(/image url/i);
    await user.type(imageUrlInput, 'https://example.com/image.jpg');

    expect(mockOnContentChange).toHaveBeenCalled();
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('updates caption field', async () => {
    const user = userEvent.setup();
    const content = {
      images: [
        {
          id: 'img-1',
          imageUrl: '',
          caption: '',
          alt: '',
        },
      ],
    };

    render(<GallerySegmentForm content={content} onContentChange={mockOnContentChange} />);

    const captionInput = screen.getByLabelText(/caption/i);
    await user.type(captionInput, 'Test Caption');

    expect(mockOnContentChange).toHaveBeenCalled();
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('updates alt text field', async () => {
    const user = userEvent.setup();
    const content = {
      images: [
        {
          id: 'img-1',
          imageUrl: '',
          caption: '',
          alt: '',
        },
      ],
    };

    render(<GallerySegmentForm content={content} onContentChange={mockOnContentChange} />);

    const altInput = screen.getByLabelText(/alt text/i);
    await user.type(altInput, 'Test Alt Text');

    expect(mockOnContentChange).toHaveBeenCalled();
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('removes image when delete button is clicked', async () => {
    const user = userEvent.setup();
    const content = {
      images: [
        {
          id: 'img-1',
          imageUrl: '',
          caption: 'Image 1',
          alt: '',
        },
        {
          id: 'img-2',
          imageUrl: '',
          caption: 'Image 2',
          alt: '',
        },
      ],
    };

    render(<GallerySegmentForm content={content} onContentChange={mockOnContentChange} />);

    const deleteButtons = screen.getAllByText(/delete/i);
    await user.click(deleteButtons[0]);

    expect(mockOnContentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        images: expect.arrayContaining([
          expect.objectContaining({ id: 'img-2' }),
        ]),
      })
    );
    const lastCall = mockOnContentChange.mock.calls[mockOnContentChange.mock.calls.length - 1][0];
    expect(lastCall.images).toHaveLength(1);
  });

  it('moves image up when up button is clicked', async () => {
    const user = userEvent.setup();
    const content = {
      images: [
        {
          id: 'img-1',
          imageUrl: '',
          caption: 'First',
          alt: '',
        },
        {
          id: 'img-2',
          imageUrl: '',
          caption: 'Second',
          alt: '',
        },
      ],
    };

    render(<GallerySegmentForm content={content} onContentChange={mockOnContentChange} />);

    const upButtons = screen.getAllByLabelText(/move up/i);
    await user.click(upButtons[1]); // Click up on second image

    expect(mockOnContentChange).toHaveBeenCalled();
    const lastCall = mockOnContentChange.mock.calls[mockOnContentChange.mock.calls.length - 1][0];
    expect(lastCall.images[0].id).toBe('img-2');
    expect(lastCall.images[1].id).toBe('img-1');
  });

  it('moves image down when down button is clicked', async () => {
    const user = userEvent.setup();
    const content = {
      images: [
        {
          id: 'img-1',
          imageUrl: '',
          caption: 'First',
          alt: '',
        },
        {
          id: 'img-2',
          imageUrl: '',
          caption: 'Second',
          alt: '',
        },
      ],
    };

    render(<GallerySegmentForm content={content} onContentChange={mockOnContentChange} />);

    const downButtons = screen.getAllByLabelText(/move down/i);
    await user.click(downButtons[0]); // Click down on first image

    expect(mockOnContentChange).toHaveBeenCalled();
    const lastCall = mockOnContentChange.mock.calls[mockOnContentChange.mock.calls.length - 1][0];
    expect(lastCall.images[0].id).toBe('img-2');
    expect(lastCall.images[1].id).toBe('img-1');
  });

  it('loads existing images correctly', () => {
    const content = {
      images: [
        {
          id: 'img-1',
          imageUrl: 'https://example.com/image.jpg',
          caption: 'Existing Caption',
          alt: 'Existing Alt',
        },
      ],
    };

    render(<GallerySegmentForm content={content} onContentChange={mockOnContentChange} />);

    expect(screen.getByDisplayValue('Existing Caption')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Alt')).toBeInTheDocument();
  });

  it('supports draft saving with empty fields', () => {
    const content = {
      images: [
        {
          id: 'img-1',
          imageUrl: '',
          caption: 'Only Caption',
          alt: '',
        },
      ],
    };

    render(<GallerySegmentForm content={content} onContentChange={mockOnContentChange} />);

    expect(screen.getByDisplayValue('Only Caption')).toBeInTheDocument();
  });

  it('displays live preview when images exist', () => {
    const content = {
      images: [
        {
          id: 'img-1',
          imageUrl: 'https://example.com/image.jpg',
          caption: 'Test Image',
          alt: 'Test Alt',
        },
      ],
    };

    render(<GallerySegmentForm content={content} onContentChange={mockOnContentChange} />);

    expect(screen.getByText(/live preview/i)).toBeInTheDocument();
  });
});
