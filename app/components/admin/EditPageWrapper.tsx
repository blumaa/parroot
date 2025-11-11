'use client';

import { useState, useEffect } from 'react';
import { Box, Text } from '@mond-design-system/theme';
import { PageForm } from './PageForm';
import { getPageById, type Page } from '@/app/utils/firestore-pages';

interface EditPageWrapperProps {
  pageId: string;
  userId: string;
}

export function EditPageWrapper({ pageId, userId }: EditPageWrapperProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        const fetchedPage = await getPageById(pageId);

        if (!fetchedPage) {
          setError('Page not found');
          return;
        }

        setPage(fetchedPage);
      } catch (err) {
        console.error('Error loading page:', err);
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [pageId]);

  if (loading) {
    return (
      <Box padding="4">
        <Text>Loading page...</Text>
      </Box>
    );
  }

  if (error || !page) {
    return (
      <Box padding="4">
        <Text variant="body">
          {error || 'Page not found'}
        </Text>
      </Box>
    );
  }

  return <PageForm page={page} userId={userId} />;
}
