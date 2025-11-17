import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DashboardView } from '@/app/components/admin/DashboardView';

// Mock MDS components

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('DashboardView', () => {
  it('renders Dashboard title', () => {
    render(<DashboardView hasPostsSegments={false} hasFormSubmissions={false} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows Posts card when posts segments exist', () => {
    render(<DashboardView hasPostsSegments={true} hasFormSubmissions={false} />);
    expect(screen.getByText('Posts')).toBeInTheDocument();
  });

  it('shows Mailbox card when form submissions exist', () => {
    render(<DashboardView hasPostsSegments={false} hasFormSubmissions={true} />);
    expect(screen.getByText('Mailbox')).toBeInTheDocument();
  });

  it('hides Posts card when no posts segments', () => {
    render(<DashboardView hasPostsSegments={false} hasFormSubmissions={false} />);
    expect(screen.queryByText('Posts')).not.toBeInTheDocument();
  });
});
