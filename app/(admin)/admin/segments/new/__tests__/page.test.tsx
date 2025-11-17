import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewSegmentPage from '../page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('NewSegmentPage (Segment Type Selection)', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders all segment type options', () => {
    render(<NewSegmentPage />);

    expect(screen.getByText('Carousel')).toBeInTheDocument();
    expect(screen.getByText('Text Block')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('Call to Action')).toBeInTheDocument();
    expect(screen.getByText('Form')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
  });

  it('navigates when segment type button clicked', async () => {
    const user = userEvent.setup();
    render(<NewSegmentPage />);

    const buttons = screen.getAllByRole('button', { name: /create/i });
    await user.click(buttons[0]); // First button is Carousel

    expect(mockPush).toHaveBeenCalledWith('/admin/segments/new/carousel');
  });
});
