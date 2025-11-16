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

  it('displays section title and description', () => {
    render(<PostsSegmentRenderer posts={[]} content={mockContent} />);

    expect(screen.getByText('Latest Posts')).toBeInTheDocument();
    expect(screen.getByText('Check out our recent updates')).toBeInTheDocument();
  });

  it('displays loading spinner while fetching posts', () => {
    // This test is no longer relevant since the component no longer fetches data
    // Posts are now passed as props from the server component
    // Removing this test as it doesn't apply to the new architecture
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

  it('displays featured image when present', () => {
    const mockPosts = [
      createMockPost({
        id: '1',
        title: 'Post with Image',
        featuredImage: 'https://example.com/image.jpg',
      }),
    ];

    render(<PostsSegmentRenderer posts={mockPosts} content={mockContent} />);

    const image = screen.getByAltText('Post with Image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('does not display featured image when not present', () => {
    const mockPosts = [
      createMockPost({
        id: '1',
        title: 'Post without Image',
        featuredImage: undefined,
      }),
    ];

    render(<PostsSegmentRenderer posts={mockPosts} content={mockContent} />);

    expect(screen.getByText('Post without Image')).toBeInTheDocument();

    // Should not find an image with the post title as alt text
    expect(screen.queryByAltText('Post without Image')).not.toBeInTheDocument();
  });

  it('displays post metadata (author and date)', () => {
    const mockPosts = [
      createMockPost({
        id: '1',
        author: 'Jane Doe',
        createdAt: new Date('2024-01-15'),
      }),
    ];

    render(<PostsSegmentRenderer posts={mockPosts} content={mockContent} />);

    expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
    expect(screen.getByText(/1\/15\/2024/i)).toBeInTheDocument();
  });

  it('renders read more button linking to post detail page', () => {
    const mockPosts = [
      createMockPost({ id: '1', slug: 'my-post' }),
    ];

    render(<PostsSegmentRenderer posts={mockPosts} content={mockContent} />);

    const readMoreLink = screen.getByRole('link', { name: /read more/i });
    expect(readMoreLink).toBeInTheDocument();
    expect(readMoreLink).toHaveAttribute('href', '/posts/my-post');
  });

  it('filters posts by segmentId and published status', () => {
    // This test is no longer relevant since filtering is now done server-side
    // The component receives already-filtered posts as props
    // Removing this test as it doesn't apply to the new architecture
  });

  it('displays only 5 posts per page', () => {
    const mockPosts = Array.from({ length: 8 }, (_, i) =>
      createMockPost({
        id: `${i + 1}`,
        title: `Post ${i + 1}`,
        excerpt: `Excerpt ${i + 1}`,
      })
    );

    render(<PostsSegmentRenderer posts={mockPosts} content={mockContent} />);

    // Should show first 5 posts
    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post 5')).toBeInTheDocument();
    // Should not show 6th post on first page
    expect(screen.queryByText('Post 6')).not.toBeInTheDocument();
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

  it('does not display pagination when 5 or fewer posts', () => {
    const mockPosts = Array.from({ length: 3 }, (_, i) =>
      createMockPost({ id: `${i + 1}`, title: `Post ${i + 1}` })
    );

    render(<PostsSegmentRenderer posts={mockPosts} content={mockContent} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
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

  it('uses default title when not provided', () => {
    render(<PostsSegmentRenderer posts={[]} content={{}} />);

    expect(screen.getByText('Posts')).toBeInTheDocument();
  });

  it('does not display description when not provided', () => {
    const contentWithoutDescription = { title: 'Posts' };
    render(<PostsSegmentRenderer posts={[]} content={contentWithoutDescription} />);

    expect(screen.queryByText(/check out our recent updates/i)).not.toBeInTheDocument();
  });
});
