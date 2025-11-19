'use client';

import { Box, Text } from '@mond-design-system/theme';
import type { FormSubmission } from '@/app/types';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  submissions: FormSubmission[];
  onMarkAsRead: (id: string) => Promise<void>;
}

export function NotificationList({
  submissions,
  onMarkAsRead,
}: NotificationListProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      className="w-80 max-h-96"
    >
      {/* Notification Items */}
      <Box className="overflow-y-auto">
        {submissions.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Text variant="body-sm" semantic="secondary">
              No new notifications
            </Text>
          </Box>
        ) : (
          submissions.map((submission, index) => (
            <NotificationItem
              key={submission.id}
              submission={submission}
              onClick={() => onMarkAsRead(submission.id)}
              isLast={index === submissions.length - 1}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
