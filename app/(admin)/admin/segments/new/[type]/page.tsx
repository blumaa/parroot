import { SegmentForm } from '@/app/components/admin/SegmentForm';
import { getUser } from '@/app/lib/dal';
import { redirect, notFound } from 'next/navigation';
import type { SegmentType } from '@/app/utils/firestore-segments';

const VALID_SEGMENT_TYPES: SegmentType[] = [
  'carousel',
  'text-block',
  'gallery',
  'cta',
  'contact-form',
];

interface NewSegmentTypePageProps {
  params: Promise<{ type: string }>;
}

export default async function NewSegmentTypePage({ params }: NewSegmentTypePageProps) {
  const { type } = await params;
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Validate segment type
  if (!VALID_SEGMENT_TYPES.includes(type as SegmentType)) {
    notFound();
  }

  return <SegmentForm userId={user.id} initialType={type as SegmentType} />;
}
