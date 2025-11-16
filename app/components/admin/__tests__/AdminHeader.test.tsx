import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminHeader } from '../AdminHeader';
import React from 'react';
import type { UserData } from '@/app/lib/dal';

// Mock MDS components
vi.mock('@mond-design-system/theme', () => ({
  Box: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'p'>) => <p {...props}>{children}</p>,
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}));

// Mock auth actions
vi.mock('@/app/actions/auth', () => ({
  logout: vi.fn(),
}));

describe('AdminHeader', () => {
  const mockUser: UserData = {
    id: '123',
    email: 'admin@example.com',
    displayName: 'Admin User',
  };

  it('renders user email', () => {
    render(<AdminHeader user={mockUser} />);

    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<AdminHeader user={mockUser} />);

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });
});
