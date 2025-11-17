import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminNavigation } from '../AdminNavigation';
import React from 'react';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock usePathname
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('AdminNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the navigation with site name', () => {
    mockPathname.mockReturnValue('/admin');
    render(<AdminNavigation hasPostsSegments={false} hasFormSubmissions={false} />);

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('renders navigation items for Dashboard and Settings', () => {
    mockPathname.mockReturnValue('/admin');
    render(<AdminNavigation hasPostsSegments={false} hasFormSubmissions={false} />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('highlights Dashboard as active when on /admin route', () => {
    mockPathname.mockReturnValue('/admin');
    render(<AdminNavigation hasPostsSegments={false} hasFormSubmissions={false} />);

    const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
    const settingsButton = screen.getByRole('button', { name: /settings/i });

    expect(dashboardButton).toHaveAttribute('data-variant', 'primary');
    expect(settingsButton).toHaveAttribute('data-variant', 'ghost');
  });

  it('highlights Settings as active when on /admin/settings route', () => {
    mockPathname.mockReturnValue('/admin/settings');
    render(<AdminNavigation hasPostsSegments={false} hasFormSubmissions={false} />);

    const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
    const settingsButton = screen.getByRole('button', { name: /settings/i });

    expect(dashboardButton).toHaveAttribute('data-variant', 'ghost');
    expect(settingsButton).toHaveAttribute('data-variant', 'primary');
  });

  it('links to correct routes', () => {
    mockPathname.mockReturnValue('/admin');
    render(<AdminNavigation hasPostsSegments={false} hasFormSubmissions={false} />);

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    const settingsLink = screen.getByRole('link', { name: /settings/i });

    expect(dashboardLink).toHaveAttribute('href', '/admin');
    expect(settingsLink).toHaveAttribute('href', '/admin/settings');
  });
});
