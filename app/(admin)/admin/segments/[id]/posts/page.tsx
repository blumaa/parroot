import { getUser } from '@/app/lib/dal';
import { redirect, notFound } from 'next/navigation';
import { getSegmentById } from '@/app/lib/data-access';
import { PostList } from '@/app/components/admin/PostList';

interface PostsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostsPage({ params }: PostsPageProps) {
  const { id: segmentId } = await params;
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

  return <PostList segmentId={segmentId} segmentName={segment.name} />;
}
