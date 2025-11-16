import { getUser } from '@/app/lib/dal';
import { redirect, notFound } from 'next/navigation';
import { getSegmentById, getPostById } from '@/app/lib/data-access';
import { PostForm } from '@/app/components/admin/PostForm';

interface EditPostPageProps {
  params: Promise<{ id: string; postId: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id: segmentId, postId } = await params;
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify segment exists and is a posts segment
  const segment = await getSegmentById(segmentId);
  if (!segment) {
    notFound();
  }

  if (segment.type !== 'posts') {
    redirect('/admin/segments');
  }

  // Get the post
  const post = await getPostById(postId);
  if (!post) {
    notFound();
  }

  // Verify post belongs to this segment
  if (post.segmentId !== segmentId) {
    redirect('/admin/segments');
  }

  return (
    <PostForm
      segmentId={segmentId}
      userId={user.id}
      userName={user.displayName || user.email}
      post={post}
    />
  );
}
