"use client";

import { Box, Text, Button, Divider, Heading } from "@mond-design-system/theme";
import { Input, Checkbox } from "@mond-design-system/theme/client";
import type { FormField, FormContent, FormFieldType } from "@/app/types";
import { FormSegmentRenderer } from "@/app/components/segments/FormSegmentRenderer";

interface FormSegmentFormProps {
  content: Record<string, unknown>;
  onContentChange: (content: Record<string, unknown>) => void;
}

export function FormSegmentForm({
  content,
  onContentChange,
}: FormSegmentFormProps) {
  const formContent = content as Partial<FormContent>;
  const fields = formContent.fields || [];
  const title = formContent.title || '';
  const description = formContent.description || '';
  const recipientEmail = formContent.recipientEmail || '';
  const successMessage = formContent.successMessage || '';

  const handleAddField = () => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
    };

    onContentChange({
      ...content,
      fields: [...fields, newField],
    });
  };

  const handleRemoveField = (fieldId: string) => {
    onContentChange({
      ...content,
      fields: fields.filter((field) => field.id !== fieldId),
    });
  };

  const handleMoveFieldUp = (index: number) => {
    if (index === 0) return;

    const newFields = [...fields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];

    onContentChange({
      ...content,
      fields: newFields,
    });
  };

  const handleMoveFieldDown = (index: number) => {
    if (index === fields.length - 1) return;

    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];

    onContentChange({
      ...content,
      fields: newFields,
    });
  };

  const handleFieldChange = (fieldId: string, updates: Partial<FormField>) => {
    onContentChange({
      ...content,
      fields: fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    });
  };

  const handleRecipientEmailChange = (value: string) => {
    onContentChange({
      ...content,
      recipientEmail: value,
    });
  };

  const handleTitleChange = (value: string) => {
    onContentChange({
      ...content,
      title: value,
    });
  };

  const handleDescriptionChange = (value: string) => {
    onContentChange({
      ...content,
      description: value,
    });
  };

  const handleSuccessMessageChange = (value: string) => {
    onContentChange({
      ...content,
      successMessage: value,
    });
  };

  const fieldTypeOptions: { value: FormFieldType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select' },
  ];

  return (
    <Box display="flex" flexDirection="column" gap="lg">
      {/* Form Configuration */}
      <Box display="flex" flexDirection="column" gap="md">
        <Heading level={4}>Form Configuration</Heading>

        <Input
          label="Form Title"
          type="text"
          placeholder="Contact Us"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
        />

        <Input
          label="Form Description"
          type="text"
          placeholder="We'd love to hear from you"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
        />

        <Box>
          <Input
            label="Recipient Email"
            type="email"
            placeholder="admin@example.com"
            value={recipientEmail}
            onChange={(e) => handleRecipientEmailChange(e.target.value)}
          />
          <Text variant="body-sm" semantic="secondary">
            Form submissions will be saved to the Mailbox in the admin panel
          </Text>
        </Box>

        <Input
          label="Success Message"
          type="text"
          placeholder="Thank you for your submission!"
          value={successMessage}
          onChange={(e) => handleSuccessMessageChange(e.target.value)}
        />
      </Box>

      <Divider />

      {/* Fields */}
      <Box display="flex" flexDirection="column" gap="md">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading level={4}>Form Fields</Heading>
          <Button variant="primary" size="sm" onClick={handleAddField}>
            Add Field
          </Button>
        </Box>

        {fields.length === 0 && (
          <Box padding="4" display="flex" justifyContent="center">
            <Text variant="body" semantic="secondary">
              No fields added. Click &quot;Add Field&quot; to get started.
            </Text>
          </Box>
        )}

        {fields.map((field, index) => (
          <Box
            key={field.id}
            padding="4"
            display="flex"
            flexDirection="column"
            gap="sm"
            border="default"
            corners="default"
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Text variant="body-sm" weight="medium">
                Field {index + 1}
              </Text>
              <Box display="flex" gap="xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveFieldUp(index)}
                  disabled={index === 0}
                  aria-label={`Move field ${index + 1} up`}
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveFieldDown(index)}
                  disabled={index === fields.length - 1}
                  aria-label={`Move field ${index + 1} down`}
                >
                  ↓
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveField(field.id)}
                  aria-label={`Remove field ${index + 1}`}
                >
                  Remove
                </Button>
              </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap="sm">
              <Box display="flex" gap="sm">
                <Box flex="1">
                  <Input
                    label="Label"
                    type="text"
                    placeholder="Field label"
                    value={field.label}
                    onChange={(e) => handleFieldChange(field.id, { label: e.target.value })}
                  />
                </Box>
                <Box flex="1">
                  <label htmlFor={`field-type-${field.id}`}>
                    <Text variant="body-sm" weight="medium">
                      Field Type
                    </Text>
                  </label>
                  <select
                    id={`field-type-${field.id}`}
                    value={field.type}
                    onChange={(e) => handleFieldChange(field.id, { type: e.target.value as FormFieldType })}
                    style={{
                      width: '100%',
                      padding: 'var(--mond-spacing-2)',
                      borderRadius: 'var(--mond-radius-md)',
                      border: '1px solid var(--mond-color-border-default)',
                    }}
                  >
                    {fieldTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Box>
              </Box>

              <Input
                label="Placeholder"
                type="text"
                placeholder="Placeholder text"
                value={field.placeholder}
                onChange={(e) => handleFieldChange(field.id, { placeholder: e.target.value })}
              />

              {field.type === 'select' && (
                <Box>
                  <Input
                    label="Options"
                    type="text"
                    placeholder="Option 1, Option 2, Option 3"
                    value={field.options?.join(', ') || ''}
                    onChange={(e) => {
                      const options = e.target.value
                        .split(',')
                        .map(opt => opt.trim())
                        .filter(opt => opt.length > 0);
                      handleFieldChange(field.id, { options });
                    }}
                  />
                  <Text variant="body-sm" semantic="secondary">
                    Enter options separated by commas
                  </Text>
                </Box>
              )}

              <Box>
                <Checkbox
                  id={`required-${field.id}`}
                  label="Required"
                  checked={field.required}
                  onChange={(e) => handleFieldChange(field.id, { required: e.target.checked })}
                />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Live Preview */}
      {fields.length > 0 && (
        <>
          <Divider />
          <Box display="flex" flexDirection="column" gap="md">
            <Heading level={4}>Live Preview</Heading>
            <Box
              padding="4"
              border="default"
              corners="default"
            >
              <FormSegmentRenderer content={content} isPreview={true} />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
