import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormSegmentRenderer } from '../FormSegmentRenderer';
import { ToastProvider } from '@/app/providers/ToastProvider';

// Mock the form submission action
vi.mock('@/app/actions/form-submission', () => ({
  submitForm: vi.fn().mockResolvedValue({ success: true }),
}));

describe('FormSegmentRenderer', () => {

  const mockContent = {
    fields: [
      {
        id: 'field-1',
        type: 'text' as const,
        label: 'Name',
        placeholder: 'Enter your name',
        required: true,
      },
      {
        id: 'field-2',
        type: 'email' as const,
        label: 'Email',
        placeholder: 'your@email.com',
        required: true,
      },
    ],
    successMessage: 'Thank you for your submission!',
    recipientEmail: 'test@example.com',
  };

  const renderWithToast = (ui: React.ReactElement) => {
    return render(<ToastProvider>{ui}</ToastProvider>);
  };

  beforeEach(async () => {
    const { submitForm } = await import('@/app/actions/form-submission');
    vi.mocked(submitForm).mockClear();
    vi.mocked(submitForm).mockResolvedValue({ success: true });
  });

  it('renders all form fields', () => {
    renderWithToast(<FormSegmentRenderer content={mockContent} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders text input field correctly', () => {
    renderWithToast(<FormSegmentRenderer content={mockContent} />);

    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveAttribute('type', 'text');
    expect(nameInput).toHaveAttribute('placeholder', 'Enter your name');
  });

  it('renders email input field correctly', () => {
    renderWithToast(<FormSegmentRenderer content={mockContent} />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('placeholder', 'your@email.com');
  });

  it('renders textarea field correctly', () => {
    const content = {
      ...mockContent,
      fields: [
        {
          id: 'field-1',
          type: 'textarea' as const,
          label: 'Message',
          placeholder: 'Your message',
          required: false,
        },
      ],
    };

    renderWithToast(<FormSegmentRenderer content={content} />);

    const textarea = screen.getByLabelText(/message/i);
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('renders select field with options', () => {
    const content = {
      ...mockContent,
      fields: [
        {
          id: 'field-1',
          type: 'select' as const,
          label: 'Country',
          placeholder: 'Select a country',
          required: true,
          options: ['USA', 'Canada', 'Mexico'],
        },
      ],
    };

    renderWithToast(<FormSegmentRenderer content={content} />);

    const select = screen.getByLabelText(/country/i);
    expect(select.tagName).toBe('SELECT');
    expect(screen.getByText('USA')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('Mexico')).toBeInTheDocument();
  });

  it('renders phone input field correctly', () => {
    const content = {
      ...mockContent,
      fields: [
        {
          id: 'field-1',
          type: 'phone' as const,
          label: 'Phone',
          placeholder: '(555) 123-4567',
          required: false,
        },
      ],
    };

    renderWithToast(<FormSegmentRenderer content={content} />);

    const phoneInput = screen.getByLabelText(/phone/i);
    expect(phoneInput).toHaveAttribute('type', 'tel');
  });

  it('shows required indicator for required fields', () => {
    renderWithToast(<FormSegmentRenderer content={mockContent} />);

    // Check that required fields are marked (MDS Input handles this)
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toBeRequired();
  });

  it('renders submit button', () => {
    renderWithToast(<FormSegmentRenderer content={mockContent} />);

    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('allows user to fill out form', async () => {
    const user = userEvent.setup();
    renderWithToast(<FormSegmentRenderer content={mockContent} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
  });

  it('shows loading state when submitting', async () => {
    const user = userEvent.setup();
    const { submitForm } = await import('@/app/actions/form-submission');

    // Make submission take some time
    vi.mocked(submitForm).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

    renderWithToast(<FormSegmentRenderer content={mockContent} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    // Button should show loading state
    expect(submitButton).toBeDisabled();
  });

  it('displays success message after successful submission', async () => {
    const user = userEvent.setup();
    renderWithToast(<FormSegmentRenderer content={mockContent} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Thank you for your submission!')).toBeInTheDocument();
    });
  });

  it('displays error message on submission failure', async () => {
    const user = userEvent.setup();
    const { submitForm } = await import('@/app/actions/form-submission');
    vi.mocked(submitForm).mockResolvedValue({ success: false, error: 'Something went wrong' });

    renderWithToast(<FormSegmentRenderer content={mockContent} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('handles empty form gracefully', () => {
    const emptyContent = {
      fields: [],
      successMessage: '',
      recipientEmail: '',
    };

    renderWithToast(<FormSegmentRenderer content={emptyContent} />);

    expect(screen.getByText(/no form fields/i)).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    const user = userEvent.setup();
    const { submitForm } = await import('@/app/actions/form-submission');
    renderWithToast(<FormSegmentRenderer content={mockContent} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });

    // Try to submit without filling required fields
    await user.click(submitButton);

    // Form should not submit (HTML5 validation will prevent it)
    expect(submitForm).not.toHaveBeenCalled();
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    renderWithToast(<FormSegmentRenderer content={mockContent} />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    // After submission, success toast should be shown and form should be cleared
    await waitFor(() => {
      expect(screen.getByText('Thank you for your submission!')).toBeInTheDocument();
    });

    // Form should be automatically cleared
    await waitFor(() => {
      const clearedNameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      const clearedEmailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      expect(clearedNameInput.value).toBe('');
      expect(clearedEmailInput.value).toBe('');
    });
  });
});
