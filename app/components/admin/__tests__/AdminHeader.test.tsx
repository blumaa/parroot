import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminHeader } from '../AdminHeader';
import React from 'react';
import type { UserData } from '@/app/lib/dal';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/admin'),
}));

// Mock auth actions
vi.mock('@/app/actions/auth', () => ({
  logout: vi.fn(),
}));

// Mock mailbox actions
vi.mock('@/app/actions/mailbox', () => ({
  getUnreadCountAction: vi.fn().mockResolvedValue(0),
  getUnreadSubmissionsAction: vi.fn().mockResolvedValue([]),
  markSubmissionAsReadAction: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock ToastProvider
vi.mock('@/app/providers/ToastProvider', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

describe('AdminHeader', () => {
  const mockUser: UserData = {
    id: '123',
    email: 'admin@example.com',
    displayName: 'Admin User',
  };

  it('renders user email', () => {
    render(<AdminHeader user={mockUser} hasPostsSegments={false} hasFormSegments={false} />);

    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<AdminHeader user={mockUser} hasPostsSegments={false} hasFormSegments={false} />);

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });
});
