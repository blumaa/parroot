import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import AdminLayout from '../layout';

// Mock admin components
vi.mock('@/app/components/admin/AdminHeader', () => ({
  AdminHeader: ({ user }: { user: { email: string }; hasPostsSegments: boolean; hasFormSegments: boolean }) => <div data-testid="admin-header">{user.email}</div>,
}));

// Mock getUser
vi.mock('@/app/lib/dal', () => ({
  getUser: vi.fn(),
}));

// Mock Firebase Admin
vi.mock('@/app/lib/firebase-admin', () => ({
  getAdminDb: vi.fn(() => ({
    collection: vi.fn(() => ({
      limit: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ empty: true }),
      })),
    })),
  })),
}));

// Mock data access functions
vi.mock('@/app/lib/data-access', () => ({
  getSiteSettings: vi.fn().mockResolvedValue({
    id: 'default',
    siteName: 'Test Site',
    siteDescription: 'Test Description',
    contactEmail: 'test@example.com',
    languages: { default: 'en', supported: ['en'] },
    integrations: {},
    logoUrl: '',
    stickyHeader: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'test',
    updatedBy: 'test',
  }),
  getSegments: vi.fn().mockResolvedValue([]),
}));

// Mock Next.js redirect
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}));

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders admin layout when user is authenticated', async () => {
    const { getUser } = await import('@/app/lib/dal');
    vi.mocked(getUser).mockResolvedValue({
      id: '123',
      email: 'test@example.com',
    });

    const layout = await AdminLayout({ children: <div>Test Content</div> });
    const { getByText, getByTestId } = render(layout as React.ReactElement);

    expect(getByTestId('admin-header')).toBeInTheDocument();
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', async () => {
    const { getUser } = await import('@/app/lib/dal');
    vi.mocked(getUser).mockResolvedValue(null);

    try {
      await AdminLayout({ children: <div>Test Content</div> });
    } catch {
      // redirect throws an error in Next.js
    }

    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('passes user data to AdminHeader', async () => {
    const { getUser } = await import('@/app/lib/dal');
    const mockUser = {
      id: '456',
      email: 'admin@example.com',
    };
    vi.mocked(getUser).mockResolvedValue(mockUser);

    const layout = await AdminLayout({ children: <div>Test</div> });
    const { getByText } = render(layout as React.ReactElement);

    expect(getByText('admin@example.com')).toBeInTheDocument();
  });

  it('renders children in main content area', async () => {
    const { getUser } = await import('@/app/lib/dal');
    vi.mocked(getUser).mockResolvedValue({
      id: '789',
      email: 'user@example.com',
    });

    const testContent = <div data-testid="test-content">Custom Content</div>;
    const layout = await AdminLayout({ children: testContent });
    const { getByTestId } = render(layout as React.ReactElement);

    expect(getByTestId('test-content')).toBeInTheDocument();
  });
});
