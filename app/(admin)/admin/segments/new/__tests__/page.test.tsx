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

  it('renders segment type selection heading', () => {
    render(<NewSegmentPage />);

    expect(screen.getByText(/choose segment type/i)).toBeInTheDocument();
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

  it('shows descriptions for each segment type', () => {
    render(<NewSegmentPage />);

    expect(screen.getByText(/rotating image or content slider/i)).toBeInTheDocument();
    expect(screen.getByText(/rich text content section/i)).toBeInTheDocument();
    expect(screen.getByText(/grid of images or media/i)).toBeInTheDocument();
    expect(screen.getByText(/prominent call-to-action section/i)).toBeInTheDocument();
    expect(screen.getByText(/contact or inquiry form/i)).toBeInTheDocument();
  });

  it('navigates to carousel creation when carousel button clicked', async () => {
    const user = userEvent.setup();
    render(<NewSegmentPage />);

    const buttons = screen.getAllByRole('button', { name: /create/i });
    await user.click(buttons[0]); // First button is Carousel

    expect(mockPush).toHaveBeenCalledWith('/admin/segments/new/carousel');
  });

  it('navigates to text-block creation when text block button clicked', async () => {
    const user = userEvent.setup();
    render(<NewSegmentPage />);

    const buttons = screen.getAllByRole('button', { name: /create/i });
    await user.click(buttons[1]); // Second button is Text Block

    expect(mockPush).toHaveBeenCalledWith('/admin/segments/new/text-block');
  });

  it('navigates to gallery creation when gallery button clicked', async () => {
    const user = userEvent.setup();
    render(<NewSegmentPage />);

    const buttons = screen.getAllByRole('button', { name: /create/i });
    await user.click(buttons[2]); // Third button is Gallery

    expect(mockPush).toHaveBeenCalledWith('/admin/segments/new/gallery');
  });

  it('navigates to cta creation when CTA button clicked', async () => {
    const user = userEvent.setup();
    render(<NewSegmentPage />);

    const buttons = screen.getAllByRole('button', { name: /create/i });
    await user.click(buttons[3]); // Fourth button is CTA

    expect(mockPush).toHaveBeenCalledWith('/admin/segments/new/cta');
  });

  it('navigates to form creation when form button clicked', async () => {
    const user = userEvent.setup();
    render(<NewSegmentPage />);

    const buttons = screen.getAllByRole('button', { name: /create/i });
    await user.click(buttons[4]); // Fifth button is Form

    expect(mockPush).toHaveBeenCalledWith('/admin/segments/new/form');
  });
});
