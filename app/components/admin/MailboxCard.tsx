"use client";

import { useState } from "react";
import { Box, Heading, Text, Button, Card, CardHeader, CardBody, CardFooter } from "@mond-design-system/theme";
import { Accordion, Pagination } from "@mond-design-system/theme/client";
import type { FormSubmission } from "@/app/types";

interface MailboxCardProps {
  segmentId: string;
  segmentName: string;
  submissions: FormSubmission[];
  openAccordionId: string | null;
  onAccordionChange: (id: string | null) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function MailboxCard({
  segmentId,
  segmentName,
  submissions,
  openAccordionId,
  onAccordionChange,
  onMarkAsRead,
  onDelete,
}: MailboxCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubmissions = submissions.slice(startIndex, endIndex);

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const getSubmissionTitle = (submission: FormSubmission) => {
    const firstField = Object.entries(submission.data)[0];
    const preview = firstField
      ? `${firstField[0]}: ${firstField[1]}`
      : "Form Submission";
    const date = formatDate(submission.submittedAt);

    return (
      <Box display="flex" alignItems="center" gap="sm" justifyContent="space-between" width="full">
        <Text variant="body">{`${date} - ${preview}`}</Text>
        {!submission.read && (
          <Box as="span" display="inline-block">
            <svg width="8" height="8" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="4" fill="#10b981" />
            </svg>
          </Box>
        )}
      </Box>
    );
  };

  const accordionItems = paginatedSubmissions.map((submission) => ({
    id: submission.id,
    title: getSubmissionTitle(submission),
    content: (
      <Box display="flex" flexDirection="column" gap="md">
        {/* Submission Data */}
        <Box display="flex" gap="sm" justifyContent="space-between">
          <Box>
            {Object.entries(submission.data).map(([label, value]) => (
              <Box key={label} marginBottom="2" gap="sm" display="flex">
                <Text variant="body-sm" weight="bold">
                  {label}:
                </Text>
                <Text variant="body">{String(value) || "(empty)"}</Text>
              </Box>
            ))}
          </Box>
          {/* Delete Button */}
          <Box>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(submission.id)}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>
    ),
  }));

  return (
    <Card>
      <CardHeader>
        <Heading level={2} size="md">{segmentName}</Heading>
        <Text variant="body-sm" semantic="secondary">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </Text>
      </CardHeader>

      <CardBody>
        {submissions.length === 0 ? (
          <Box padding="8" display="flex" justifyContent="center">
            <Text variant="body" semantic="secondary">
              No submissions yet for this form
            </Text>
          </Box>
        ) : (
          <Accordion
            items={accordionItems}
            mode="single"
            variant="bordered"
            expandedIds={openAccordionId ? [openAccordionId] : []}
            onExpandedChange={(expandedIds) => {
              const newId = expandedIds && expandedIds.length > 0 ? expandedIds[0] : null;
              onAccordionChange(newId);

              // Mark submission as read when accordion item is opened
              if (newId) {
                const submission = submissions.find(s => s.id === newId);
                if (submission && !submission.read) {
                  onMarkAsRead(newId);
                }
              }
            }}
          />
        )}
      </CardBody>

      {submissions.length > 0 && (
        <CardFooter>
          <Pagination
            currentPage={currentPage}
            totalItems={submissions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(perPage) => {
              setItemsPerPage(perPage);
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
            size="sm"
            showItemsPerPage={false}
            showTotalInfo={true}
          />
        </CardFooter>
      )}
    </Card>
  );
}
