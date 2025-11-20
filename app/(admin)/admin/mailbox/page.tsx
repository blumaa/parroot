"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Heading, Text, Button, Spinner } from "@mond-design-system/theme";
import {
  Input,
  Modal,
  ModalBody,
  ModalFooter,
} from "@mond-design-system/theme/client";
import { useToast } from "@/app/providers/ToastProvider";
import { getFormSubmissionsAction, deleteFormSubmissionAction, markSubmissionAsReadAction } from "@/app/actions/mailbox";
import { getSegmentsAction } from "@/app/actions/siteBuilderActions";
import { MailboxCard } from "@/app/components/admin/MailboxCard";
import type { FormSubmission, Segment } from "@/app/types";

export default function MailboxPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [formSegments, setFormSegments] = useState<Segment[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<
    FormSubmission[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  // Load submissions and form segments on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [submissionsData, segmentsData] = await Promise.all([
          getFormSubmissionsAction(),
          getSegmentsAction(),
        ]);

        // Filter for published form segments only
        const publishedFormSegments = segmentsData.filter(
          (segment) => segment.type === 'form' && segment.status === 'published'
        );
        setFormSegments(publishedFormSegments);

        // Create set of valid segment IDs
        const validSegmentIds = new Set(publishedFormSegments.map(s => s.id));

        // Filter submissions to only include those from published form segments
        const validSubmissions = submissionsData.filter(
          (submission) => validSegmentIds.has(submission.segmentId)
        );

        setSubmissions(validSubmissions);
        setFilteredSubmissions(validSubmissions);
      } catch (error) {
        console.error("Error loading data:", error);
        showError("Error", "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showError]);

  // Handle URL hash to auto-expand specific submission
  useEffect(() => {
    const handleHashChange = () => {
      if (!loading && filteredSubmissions.length > 0) {
        const hash = window.location.hash.slice(1); // Remove the #
        if (hash && filteredSubmissions.find(s => s.id === hash)) {
          setOpenAccordionId(hash);
          // Clear the hash after setting
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [loading, filteredSubmissions]);

  // Filter submissions when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSubmissions(submissions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = submissions.filter((submission) => {
      const dataMatch = Object.values(submission.data).some((value) =>
        value.toLowerCase().includes(query),
      );
      const emailMatch = submission.recipientEmail.toLowerCase().includes(query);
      const dateMatch = new Date(submission.submittedAt)
        .toLocaleString()
        .toLowerCase()
        .includes(query);

      return dataMatch || emailMatch || dateMatch;
    });

    setFilteredSubmissions(filtered);
  }, [searchQuery, submissions]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [submissionsData, segmentsData] = await Promise.all([
        getFormSubmissionsAction(),
        getSegmentsAction(),
      ]);

      // Filter for published form segments only
      const publishedFormSegments = segmentsData.filter(
        (segment) => segment.type === 'form' && segment.status === 'published'
      );
      setFormSegments(publishedFormSegments);

      // Create set of valid segment IDs
      const validSegmentIds = new Set(publishedFormSegments.map(s => s.id));

      // Filter submissions to only include those from published form segments
      const validSubmissions = submissionsData.filter(
        (submission) => validSegmentIds.has(submission.segmentId)
      );

      setSubmissions(validSubmissions);
      setFilteredSubmissions(validSubmissions);
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Error", "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteFormSubmissionAction(id);
      if (result.success) {
        showSuccess("Success", "Submission deleted successfully");
        setDeleteConfirm(null);
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
      } else {
        showError("Error", result.error || "Failed to delete submission");
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      showError("Error", "Failed to delete submission");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const result = await markSubmissionAsReadAction(id);
      if (result.success) {
        // Update local state to mark as read
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, read: true } : s))
        );
      }
    } catch (error) {
      console.error('Error marking submission as read:', error);
    }
  };

  // Group submissions by segment ID
  const submissionsBySegment = useMemo(() => {
    return filteredSubmissions.reduce((acc, submission) => {
      const segmentId = submission.segmentId || 'unknown';
      if (!acc[segmentId]) {
        acc[segmentId] = [];
      }
      acc[segmentId].push(submission);
      return acc;
    }, {} as Record<string, FormSubmission[]>);
  }, [filteredSubmissions]);

  return (
    <Box display="flex" flexDirection="column" gap="lg" padding="6">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading level={1}>Mailbox</Heading>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Search */}
      <Box width="half">
        <Input
          id="mailbox-search"
          type="text"
          placeholder="Search submissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* Submissions List */}
      {loading ? (
        <Box padding="8" display="flex" justifyContent="center">
          <Spinner size="lg" label="Loading submissions..." />
        </Box>
      ) : formSegments.length === 0 ? (
        <Box padding="8" display="flex" justifyContent="center">
          <Text variant="body" semantic="secondary">
            No form segments found. Create a form segment in the Site Builder to receive submissions.
          </Text>
        </Box>
      ) : filteredSubmissions.length === 0 ? (
        <Box padding="8" display="flex" justifyContent="center">
          <Text variant="body" semantic="secondary">
            {searchQuery
              ? "No submissions match your search"
              : "No submissions yet"}
          </Text>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap="lg">
          {formSegments.map((segment) => {
            const segmentSubmissions = submissionsBySegment[segment.id] || [];

            return (
              <MailboxCard
                key={segment.id}
                segmentId={segment.id}
                segmentName={segment.name}
                submissions={segmentSubmissions}
                openAccordionId={openAccordionId}
                onAccordionChange={setOpenAccordionId}
                onMarkAsRead={handleMarkAsRead}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            );
          })}
        </Box>
      )}

      {/* Stats */}
      {!loading && submissions.length > 0 && (
        <Box marginTop="4">
          <Text variant="body-sm" semantic="secondary">
            Showing {filteredSubmissions.length} of {submissions.length}{" "}
            submission
            {submissions.length !== 1 ? "s" : ""}
          </Text>
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Submission"
        size="sm"
      >
        <ModalBody>
          <Text>Are you sure you want to delete this submission? This action cannot be undone.</Text>
        </ModalBody>
        <ModalFooter>
          <Box display="flex" gap="sm" justifyContent="flex-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </Box>
        </ModalFooter>
      </Modal>
    </Box>
  );
}
