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

  it('renders add field button', () => {
    render(<FormSegmentForm {...defaultProps} />);

    expect(screen.getByRole('button', { name: /add field/i })).toBeInTheDocument();
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

  it('allows editing field label', async () => {
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

    const labelInput = screen.getByDisplayValue('Name');
    await user.clear(labelInput);
    await user.type(labelInput, 'Full Name');

    expect(mockOnContentChange).toHaveBeenCalled();
  });

  it('allows changing field type', async () => {
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

    const typeSelect = screen.getByRole('combobox', { name: /field type/i });
    await user.selectOptions(typeSelect, 'email');

    expect(mockOnContentChange).toHaveBeenCalled();
    const callArg = mockOnContentChange.mock.calls[mockOnContentChange.mock.calls.length - 1][0];
    expect(callArg.fields[0].type).toBe('email');
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

  it('allows moving fields up and down', async () => {
    const user = userEvent.setup();
    const content = {
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'First',
          placeholder: '',
          required: false,
        },
        {
          id: 'field-2',
          type: 'text',
          label: 'Second',
          placeholder: '',
          required: false,
        },
      ],
    };

    render(<FormSegmentForm content={content} onContentChange={mockOnContentChange} />);

    // Find the move down button for the first field
    const moveDownButtons = screen.getAllByRole('button', { name: /move.*down/i });
    await user.click(moveDownButtons[0]);

    expect(mockOnContentChange).toHaveBeenCalled();
    const callArg = mockOnContentChange.mock.calls[mockOnContentChange.mock.calls.length - 1][0];
    expect(callArg.fields[0].label).toBe('Second');
    expect(callArg.fields[1].label).toBe('First');
  });

  it('shows options field for select type', () => {
    const content = {
      fields: [
        {
          id: 'field-1',
          type: 'select',
          label: 'Country',
          placeholder: 'Select a country',
          required: true,
          options: ['USA', 'Canada'],
        },
      ],
    };

    render(<FormSegmentForm content={content} onContentChange={mockOnContentChange} />);

    // Check that the options input field exists with the correct value
    expect(screen.getByDisplayValue('USA, Canada')).toBeInTheDocument();
    // Check that helper text is shown
    expect(screen.getByText(/enter options separated by commas/i)).toBeInTheDocument();
  });

  it('toggles required checkbox', async () => {
    const user = userEvent.setup();
    const content = {
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'Name',
          placeholder: '',
          required: false,
        },
      ],
    };

    render(<FormSegmentForm content={content} onContentChange={mockOnContentChange} />);

    const requiredCheckbox = screen.getByRole('checkbox', { name: /required/i });
    expect(requiredCheckbox).not.toBeChecked();

    await user.click(requiredCheckbox);

    expect(mockOnContentChange).toHaveBeenCalled();
    const callArg = mockOnContentChange.mock.calls[mockOnContentChange.mock.calls.length - 1][0];
    expect(callArg.fields[0].required).toBe(true);
  });

  it('updates recipient email', async () => {
    const user = userEvent.setup();
    render(<FormSegmentForm {...defaultProps} />);

    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.type(emailInput, 'test@example.com');

    expect(mockOnContentChange).toHaveBeenCalled();
  });

  it('updates success message', async () => {
    const user = userEvent.setup();
    render(<FormSegmentForm {...defaultProps} />);

    const successInput = screen.getByLabelText(/success message/i);
    await user.type(successInput, 'Thank you!');

    expect(mockOnContentChange).toHaveBeenCalled();
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

  it('displays live preview when fields exist', () => {
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
      recipientEmail: 'test@example.com',
      successMessage: 'Thank you!',
    };

    render(<FormSegmentForm content={content} onContentChange={mockOnContentChange} />);

    expect(screen.getByText(/live preview/i)).toBeInTheDocument();
  });

  it('allows field placeholder customization', async () => {
    const user = userEvent.setup();
    const content = {
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'Name',
          placeholder: 'Enter your name',
          required: false,
        },
      ],
    };

    render(<FormSegmentForm content={content} onContentChange={mockOnContentChange} />);

    const placeholderInput = screen.getByDisplayValue('Enter your name');
    await user.clear(placeholderInput);
    await user.type(placeholderInput, 'Your full name');

    expect(mockOnContentChange).toHaveBeenCalled();
  });
});
