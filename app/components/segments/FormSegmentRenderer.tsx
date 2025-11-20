"use client";

import { useState, FormEvent } from "react";
import { Box, Text, Heading, Button } from "@mond-design-system/theme";
import { Input, Textarea } from "@mond-design-system/theme/client";
import type { FormField, FormContent } from "@/app/types";
import { submitForm } from "@/app/actions/form-submission";
import { useToast } from "@/app/providers/ToastProvider";

interface FormSegmentRendererProps {
  segmentId?: string;
  segmentName?: string;
  content: Record<string, unknown>;
  isPreview?: boolean;
}

export function FormSegmentRenderer({ segmentId, segmentName, content, isPreview = false }: FormSegmentRendererProps) {
  const formContent = content as Partial<FormContent>;
  const fields = formContent.fields || [];
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Handle empty state
  if (!fields || fields.length === 0) {
    return (
      <Box
        padding="8"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text variant="body" semantic="secondary">
          No form fields to display
        </Text>
      </Box>
    );
  }

  const handleChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await submitForm({
        segmentId: segmentId || '',
        segmentName: segmentName || 'Unknown Form',
        formData,
        fields,
        recipientEmail: formContent.recipientEmail || '',
      });

      if (result.success) {
        showSuccess('Success', formContent.successMessage || 'Thank you for your submission!');
        setFormData({}); // Clear form data state
        // Reset form element
        (e.target as HTMLFormElement).reset();
      } else {
        showError('Error', result.error || 'Failed to submit form. Please try again.');
      }
    } catch (err) {
      showError('Error', 'An unexpected error occurred. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';
    // Don't apply required attribute in preview mode to avoid blocking parent form submission
    const isRequired = isPreview ? false : field.required;

    switch (field.type) {
      case 'text':
        return (
          <Box key={field.id} as="label" display="flex" flexDirection="column" gap="xs">
            <Text variant="body-sm" weight="medium">
              {field.label}
            </Text>
            <Input
              id={field.id}
              type="text"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={isRequired}
            />
          </Box>
        );

      case 'email':
        return (
          <Box key={field.id} as="label" display="flex" flexDirection="column" gap="xs">
            <Text variant="body-sm" weight="medium">
              {field.label}
            </Text>
            <Input
              id={field.id}
              type="email"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={isRequired}
            />
          </Box>
        );

      case 'phone':
        return (
          <Box key={field.id} as="label" display="flex" flexDirection="column" gap="xs">
            <Text variant="body-sm" weight="medium">
              {field.label}
            </Text>
            <Input
              id={field.id}
              type="tel"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={isRequired}
            />
          </Box>
        );

      case 'textarea':
        return (
          <Box key={field.id} as="label" display="flex" flexDirection="column" gap="xs">
            <Text variant="body-sm" weight="medium">
              {field.label}
            </Text>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={isRequired}
              rows={4}
            />
          </Box>
        );

      case 'select':
        return (
          <Box key={field.id}>
            <label htmlFor={field.id}>
              <Text variant="body-sm" weight="medium">{field.label}</Text>
            </label>
            <select
              id={field.id}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={isRequired}
              style={{
                width: '100%',
                padding: 'var(--mond-spacing-2)',
                borderRadius: 'var(--mond-radius-md)',
                border: '1px solid var(--mond-color-border-default)',
              }}
            >
              <option value="">{field.placeholder}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Box>
        );

      default:
        return null;
    }
  };

  const formFields = (
    <Box display="flex" flexDirection="column" gap="md">
      {formContent.title && (
        <Heading level={2} align="center">
          {formContent.title}
        </Heading>
      )}

      {formContent.description && (
        <Text variant="body" align="center" semantic="secondary">
          {formContent.description}
        </Text>
      )}

      {fields.map((field) => renderField(field))}

      <Box marginTop="2">
        <Button
          type={isPreview ? "button" : "submit"}
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading || isPreview}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box padding="4" display="flex" justifyContent="center">
      <Box width="full">
        {isPreview ? (
          formFields
        ) : (
          <form onSubmit={handleSubmit}>
            {formFields}
          </form>
        )}
      </Box>
    </Box>
  );
}
