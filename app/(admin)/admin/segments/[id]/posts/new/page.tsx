import { getUser } from '@/app/lib/dal';
import { redirect, notFound } from 'next/navigation';
import { getSegmentById } from '@/app/lib/data-access';
import { PostForm } from '@/app/components/admin/PostForm';

interface NewPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewPostPage({ params }: NewPostPageProps) {
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

  return (
    <PostForm
      segmentId={segmentId}
      userId={user.id}
      userName={user.displayName || user.email}
    />
  );
}
