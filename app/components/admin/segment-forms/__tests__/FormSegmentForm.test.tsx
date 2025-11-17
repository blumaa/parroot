import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormSegmentForm } from '../FormSegmentForm';

// Mock the toast provider
vi.mock('@/app/providers/ToastProvider', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

describe('FormSegmentForm', () => {
  const mockOnContentChange = vi.fn();

  const defaultProps = {
    content: {},
    onContentChange: mockOnContentChange,
  };

  beforeEach(() => {
    mockOnContentChange.mockClear();
  });

  it('renders form configuration fields', () => {
    render(<FormSegmentForm {...defaultProps} />);

    expect(screen.getByLabelText(/recipient email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/success message/i)).toBeInTheDocument();
  });

  it('allows adding a new field', async () => {
    const user = userEvent.setup();
    render(<FormSegmentForm {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add field/i });
    await user.click(addButton);

    expect(mockOnContentChange).toHaveBeenCalled();
    const callArg = mockOnContentChange.mock.calls[0][0];
    expect(callArg.fields).toHaveLength(1);
    expect(callArg.fields[0]).toHaveProperty('id');
    expect(callArg.fields[0]).toHaveProperty('type', 'text');
    expect(callArg.fields[0]).toHaveProperty('label', '');
    expect(callArg.fields[0]).toHaveProperty('placeholder', '');
    expect(callArg.fields[0]).toHaveProperty('required', false);
  });

  it('renders existing fields', () => {
    const content = {
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Enter your name',
          required: true,
        },
        {
          id: 'field-2',
          type: 'email',
          label: 'Email Address',
          placeholder: 'your@email.com',
          required: true,
        },
      ],
    };

    render(<FormSegmentForm content={content} onContentChange={mockOnContentChange} />);

    expect(screen.getByDisplayValue('Full Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Email Address')).toBeInTheDocument();
  });

  it('allows removing a field', async () => {
    const user = userEvent.setup();
    const content = {
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'Name',
          placeholder: 'Enter your name',
          required: true,
        },
      ],
    };

    render(<FormSegmentForm content={content} onContentChange={mockOnContentChange} />);

    const removeButton = screen.getByRole('button', { name: /remove.*field/i });
    await user.click(removeButton);

    expect(mockOnContentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: [],
      })
    );
  });

  it('loads existing content correctly', () => {
    const content = {
      recipientEmail: 'admin@example.com',
      successMessage: 'Form submitted successfully!',
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'Name',
          placeholder: 'Enter name',
          required: true,
        },
      ],
    };

    render(<FormSegmentForm content={content} onContentChange={mockOnContentChange} />);

    expect(screen.getByDisplayValue('admin@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Form submitted successfully!')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Name')).toBeInTheDocument();
  });
});
