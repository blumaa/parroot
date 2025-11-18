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

    expect(screen.getByText(/add new image/i)).toBeInTheDocument();
    expect(screen.queryByText(/image 1/i)).not.toBeInTheDocument();
  });

  it('adds a new image when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<GallerySegmentForm {...defaultProps} />);

    const addButton = screen.getByText(/add new image/i);
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
});
