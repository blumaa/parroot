'use client';

import { Box, Text } from '@mond-design-system/theme';
import type { FormSubmission } from '@/app/types';

interface NotificationItemProps {
  submission: FormSubmission;
  onClick: () => void;
}

export function NotificationItem({ submission, onClick }: NotificationItemProps) {
  // Get first form field for preview
  const firstField = Object.entries(submission.data)[0];
  const preview = firstField
    ? `${firstField[0]}: ${firstField[1]}`
    : 'Form Submission';

  // Truncate preview to 50 characters
  const truncatedPreview = preview.length > 50
    ? `${preview.substring(0, 50)}...`
    : preview;

  // Format timestamp as relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const relativeTime = getRelativeTime(submission.submittedAt);

  return (
    <Box
      onClick={onClick}
      padding="3"
      className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
      display="flex"
      flexDirection="column"
      gap="xs"
      style={{ cursor: 'pointer' }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="sm">
        <Text variant="body-sm" weight="medium">
          {truncatedPreview}
        </Text>
        {!submission.read && (
          <Box
            className="rounded-full"
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              flexShrink: 0,
            }}
          />
        )}
      </Box>
      <Text variant="body-sm" semantic="secondary">
        {relativeTime}
      </Text>
    </Box>
  );
}
