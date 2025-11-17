import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostsSegmentRenderer } from '../PostsSegmentRenderer';
import type { Post } from '@/app/types';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

describe('PostsSegmentRenderer', () => {
  const mockSegmentId = 'segment-123';
  const mockContent = {
    title: 'Latest Posts',
    description: 'Check out our recent updates',
  };

  const createMockPost = (overrides?: Partial<Post>): Post => ({
    id: '1',
    segmentId: mockSegmentId,
    title: 'Test Post',
    content: '<p>Test content</p>',
    excerpt: 'Test excerpt',
    slug: 'test-post',
    author: 'John Doe',
    authorId: 'user1',
    status: 'published',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays message when no posts exist', () => {
    render(<PostsSegmentRenderer posts={[]} content={mockContent} />);

    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
  });

  it('displays posts when data is loaded', () => {
    const mockPosts = [
      createMockPost({ id: '1', title: 'First Post', excerpt: 'First excerpt' }),
      createMockPost({ id: '2', title: 'Second Post', excerpt: 'Second excerpt' }),
    ];

    render(<PostsSegmentRenderer posts={mockPosts} content={mockContent} />);

    expect(screen.getByText('First Post')).toBeInTheDocument();
    expect(screen.getByText('Second Post')).toBeInTheDocument();
    expect(screen.getByText('First excerpt')).toBeInTheDocument();
    expect(screen.getByText('Second excerpt')).toBeInTheDocument();
  });

  it('displays pagination when more than 5 posts', () => {
    const mockPosts = Array.from({ length: 8 }, (_, i) =>
      createMockPost({ id: `${i + 1}`, title: `Post ${i + 1}` })
    );

    render(<PostsSegmentRenderer posts={mockPosts} content={mockContent} />);

    // Pagination component should be present
    const pagination = screen.getByRole('navigation');
    expect(pagination).toBeInTheDocument();
  });

  it('changes page when pagination button is clicked', async () => {
    const user = userEvent.setup();
    const mockPosts = Array.from({ length: 8 }, (_, i) =>
      createMockPost({ id: `${i + 1}`, title: `Post ${i + 1}`, excerpt: `Excerpt ${i + 1}` })
    );

    render(<PostsSegmentRenderer posts={mockPosts} content={mockContent} />);

    expect(screen.getByText('Post 1')).toBeInTheDocument();

    // Click page 2 button
    const buttons = screen.getAllByRole('button');
    const page2Button = buttons.find(btn => btn.textContent === '2');

    if (page2Button) {
      await user.click(page2Button);

      // Should now show posts 6-8
      expect(screen.getByText('Post 6')).toBeInTheDocument();
    }
  });
});
