'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Icon } from '@mond-design-system/theme';
import { Popover } from '@mond-design-system/theme/client';
import type { FormSubmission } from '@/app/types';
import {
  getUnreadCountAction,
  getUnreadSubmissionsAction,
  markSubmissionAsReadAction,
} from '@/app/actions/mailbox';
import { useToast } from '@/app/providers/ToastProvider';
import { NotificationList } from './NotificationList';

export function NotificationBell() {
  const router = useRouter();
  const { showError } = useToast();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadSubmissions, setUnreadSubmissions] = useState<FormSubmission[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Load unread count on mount
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadCountAction();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };
    loadUnreadCount();
  }, []);

  // Load unread submissions when popover opens
  useEffect(() => {
    if (!isPopoverOpen) return;

    const loadUnreadSubmissions = async () => {
      try {
        const submissions = await getUnreadSubmissionsAction(10);
        setUnreadSubmissions(submissions);
      } catch (error) {
        console.error('Error loading unread submissions:', error);
        showError('Failed to load notifications');
      }
    };
    loadUnreadSubmissions();
  }, [isPopoverOpen, showError]);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCountAction();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadUnreadSubmissions = async () => {
    try {
      const submissions = await getUnreadSubmissionsAction(10);
      setUnreadSubmissions(submissions);
    } catch (error) {
      console.error('Error loading unread submissions:', error);
      showError('Failed to load notifications');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      // Optimistic update
      setUnreadSubmissions(prev => prev.filter(s => s.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setIsPopoverOpen(false);

      const result = await markSubmissionAsReadAction(id);
      if (result.success) {
        // Check if already on mailbox page
        if (window.location.pathname === '/admin/mailbox') {
          // Just update the hash, which will trigger hashchange event
          window.location.hash = id;
        } else {
          // Navigate to mailbox with the submission ID in URL hash
          router.push(`/admin/mailbox#${id}`);
        }
      } else {
        // Rollback on error
        await loadUnreadCount();
        await loadUnreadSubmissions();
        showError(result.error || 'Failed to mark as read');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      // Rollback on error
      await loadUnreadCount();
      await loadUnreadSubmissions();
      showError('Failed to mark as read');
    }
  };

  return (
    <Popover
      isOpen={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
      placement="bottom-end"
      trigger="click"
      content={
        <NotificationList
          submissions={unreadSubmissions}
          onMarkAsRead={handleMarkAsRead}
        />
      }
    >
      <Button
        variant="ghost"
        iconOnly
        aria-label="Notifications"
      >
        <Icon color={unreadCount > 0 ? "#10b981" : "currentColor"} badge={unreadCount > 0 ? unreadCount : undefined}>
          <svg
            width="100%"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
              fill="currentColor"
            />
          </svg>
        </Icon>
      </Button>
    </Popover>
  );
}
