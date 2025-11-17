import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostsSegmentForm } from '../PostsSegmentForm';

describe('PostsSegmentForm', () => {
  const mockOnContentChange = vi.fn();

  const defaultProps = {
    content: {},
    onContentChange: mockOnContentChange,
  };

  beforeEach(() => {
    mockOnContentChange.mockClear();
  });

  it('renders all form fields', () => {
    render(<PostsSegmentForm {...defaultProps} />);

    expect(screen.getByLabelText(/section title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/section description/i)).toBeInTheDocument();
  });

  it('updates title field', async () => {
    const user = userEvent.setup();
    render(<PostsSegmentForm {...defaultProps} />);

    const titleInput = screen.getByLabelText(/section title/i);
    await user.type(titleInput, 'Latest News');

    expect(mockOnContentChange).toHaveBeenCalled();
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('updates description field', async () => {
    const user = userEvent.setup();
    render(<PostsSegmentForm {...defaultProps} />);

    const descriptionInput = screen.getByLabelText(/section description/i);
    await user.type(descriptionInput, 'Stay updated with our latest posts');

    expect(mockOnContentChange).toHaveBeenCalled();
    expect(mockOnContentChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('loads existing content correctly', () => {
    const content = {
      title: 'Company Blog',
      description: 'Read our latest updates and news',
    };

    render(<PostsSegmentForm content={content} onContentChange={mockOnContentChange} />);

    expect(screen.getByDisplayValue('Company Blog')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Read our latest updates and news')).toBeInTheDocument();
  });

  it('supports draft saving with empty fields', () => {
    const content = {
      title: '',
      description: '',
    };

    render(<PostsSegmentForm content={content} onContentChange={mockOnContentChange} />);

    const titleInput = screen.getByLabelText(/section title/i);
    const descriptionInput = screen.getByLabelText(/section description/i);

    expect(titleInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
  });
});
