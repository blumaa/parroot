"use client";

import { useState, useEffect } from "react";
import { Box, Heading, Text, Button, Spinner } from "@mond-design-system/theme";
import {
  Input,
  Accordion,
  Modal,
  ModalBody,
  ModalFooter,
} from "@mond-design-system/theme/client";
import { useToast } from "@/app/providers/ToastProvider";
import { getFormSubmissionsAction, deleteFormSubmissionAction } from "@/app/actions/mailbox";
import type { FormSubmission } from "@/app/types";

export default function MailboxPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<
    FormSubmission[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  // Load submissions on mount
  useEffect(() => {
    async function loadSubmissions() {
      setLoading(true);
      try {
        const data = await getFormSubmissionsAction();
        setSubmissions(data);
        setFilteredSubmissions(data);
      } catch (error) {
        console.error("Error loading submissions:", error);
        showError("Error", "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    }
    loadSubmissions();
  }, [showError]);

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
      const data = await getFormSubmissionsAction();
      setSubmissions(data);
      setFilteredSubmissions(data);
    } catch (error) {
      console.error("Error loading submissions:", error);
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

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const getSubmissionTitle = (submission: FormSubmission) => {
    const firstField = Object.entries(submission.data)[0];
    const preview = firstField
      ? `${firstField[0]}: ${firstField[1]}`
      : "Form Submission";
    const date = formatDate(submission.submittedAt);
    return `${date} - ${preview}`;
  };

  const accordionItems = filteredSubmissions.map((submission) => ({
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
              onClick={() => setDeleteConfirm(submission.id)}
            >
              Delete Submission
            </Button>
          </Box>
        </Box>
      </Box>
    ),
  }));

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
      ) : filteredSubmissions.length === 0 ? (
        <Box padding="8" display="flex" justifyContent="center">
          <Text variant="body" semantic="secondary">
            {searchQuery
              ? "No submissions match your search"
              : "No submissions yet"}
          </Text>
        </Box>
      ) : (
        <Accordion items={accordionItems} mode="single" variant="bordered" />
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
