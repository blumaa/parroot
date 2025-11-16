import { unstable_noStore as noStore } from 'next/cache';
import { getUser } from '@/app/lib/dal';
import { redirect } from 'next/navigation';
import { getSegments, getPosts } from '@/app/lib/data-access';
import { PostsView } from '@/app/components/admin/PostsView';

export default async function PostsPage() {
  noStore();

  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Get all posts segments (draft OR published)
  const allSegments = await getSegments();
  const postsSegments = allSegments.filter(
    (segment) => segment.type === 'posts'
  );

  // Fetch posts for each posts segment
  const postsData = await Promise.all(
    postsSegments.map(segment => getPosts({ segmentId: segment.id }))
  );

  // Create a map of segmentId to posts
  const postsBySegment = Object.fromEntries(
    postsSegments.map((segment, index) => [segment.id, postsData[index]])
  );

  return <PostsView postsSegments={postsSegments} postsBySegment={postsBySegment} />;
}
