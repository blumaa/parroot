import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DashboardView } from '@/app/components/admin/DashboardView';
import type { Segment } from '@/app/types';

// Mock MDS components
vi.mock('@mond-design-system/theme', () => ({
  Box: ({ children, ...props }: React.ComponentProps<'div'>) => <div data-testid="mds-box" {...props}>{children}</div>,
  Heading: ({ children, level, ...props }: { children: React.ReactNode; level: number; [key: string]: unknown }) => <div data-testid={`heading-${level}`} {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
  Card: ({ children, ...props }: React.ComponentProps<'div'>) => <div data-testid="mds-card" {...props}>{children}</div>,
}));

// Mock PostList component
vi.mock('@/app/components/admin/PostList', () => ({
  PostList: ({ segmentName }: { segmentName: string }) => <div data-testid="post-list">{segmentName}</div>,
}));

describe('DashboardView', () => {
  it('renders Dashboard title', () => {
    render(<DashboardView postsSegments={[]} postsBySegment={{}} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('does not render posts section when no segments', () => {
    render(<DashboardView postsSegments={[]} postsBySegment={{}} />);
    expect(screen.queryByTestId('post-list')).not.toBeInTheDocument();
  });

  it('renders posts section when segments exist', () => {
    const mockSegments: Segment[] = [
      {
        id: 'segment-1',
        name: 'Blog Posts',
        type: 'posts',
        config: {},
        content: { en: {} },
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      },
    ];

    render(<DashboardView postsSegments={mockSegments} postsBySegment={{ 'segment-1': [] }} />);
    expect(screen.getByText('Blog Posts')).toBeInTheDocument();
    expect(screen.getByTestId('post-list')).toBeInTheDocument();
  });

  it('renders multiple post segments', () => {
    const mockSegments: Segment[] = [
      {
        id: 'segment-1',
        name: 'Blog Posts',
        type: 'posts',
        config: {},
        content: { en: {} },
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      },
      {
        id: 'segment-2',
        name: 'News Posts',
        type: 'posts',
        config: {},
        content: { en: {} },
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-2',
        updatedBy: 'user-2',
      },
    ];

    render(<DashboardView postsSegments={mockSegments} postsBySegment={{ 'segment-1': [], 'segment-2': [] }} />);
    expect(screen.getByText('Blog Posts')).toBeInTheDocument();
    expect(screen.getByText('News Posts')).toBeInTheDocument();
    expect(screen.getAllByTestId('post-list')).toHaveLength(2);
  });
});
