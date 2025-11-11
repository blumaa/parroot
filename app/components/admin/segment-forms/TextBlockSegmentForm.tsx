"use client";

import { Box, Text, Button, Divider, Heading } from "@mond-design-system/theme";
import { Input, Radio, Select } from "@mond-design-system/theme/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import { TextBlockSegmentRenderer } from "@/app/components/segments/TextBlockSegmentRenderer";
import "./TextBlockSegmentForm.css";

interface TextBlockSegmentFormProps {
  content: Record<string, unknown>;
  onContentChange: (content: Record<string, unknown>) => void;
}

const HEADING_SIZES = [
  { value: "xs", label: "Extra Small" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
  { value: "2xl", label: "2X Large" },
  { value: "3xl", label: "3X Large" },
  { value: "4xl", label: "4X Large" },
];

const HEADING_WEIGHTS = [
  { value: "normal", label: "Normal" },
  { value: "medium", label: "Medium" },
  { value: "semibold", label: "Semibold" },
  { value: "bold", label: "Bold" },
];

const PADDING_OPTIONS = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
];

export function TextBlockSegmentForm({
  content,
  onContentChange,
}: TextBlockSegmentFormProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: "text-base",
          },
        },
        hardBreak: {
          keepMarks: true,
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: (content.body as string) || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-3",
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange({
        ...content,
        body: editor.getHTML(),
      });
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content.body !== editor.getHTML()) {
      editor.commands.setContent((content.body as string) || "");
    }
  }, [content.body, editor]);

  const handleFieldChange = (field: string, value: unknown) => {
    onContentChange({
      ...content,
      [field]: value,
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap="md">
      {/* Heading Controls */}
      <Box>
        <Input
          id="heading-text"
          label="Heading Text"
          type="text"
          placeholder="Enter heading"
          value={(content.heading as string) || ""}
          onChange={(e) => handleFieldChange("heading", e.target.value)}
        />
      </Box>

      <Box display="flex" gap="md">
        <Box flex="1">
          <Select
            id="heading-size"
            label="Heading Size"
            value={(content.headingSize as string) || "lg"}
            onChange={(value) => handleFieldChange("headingSize", value)}
            options={HEADING_SIZES}
          />
        </Box>

        <Box flex="1">
          <Select
            id="heading-weight"
            label="Heading Weight"
            value={(content.headingWeight as string) || "bold"}
            onChange={(value) => handleFieldChange("headingWeight", value)}
            options={HEADING_WEIGHTS}
          />
        </Box>
      </Box>

      {/* Alignment */}
      <Box>
        <Box as="label" id="alignment-label">
          <Text variant="body-sm" semantic="secondary">
            Alignment
          </Text>
        </Box>
        <Box
          display="flex"
          gap="md"
          marginTop="2"
          role="radiogroup"
          aria-labelledby="alignment-label"
        >
          {["left", "center", "right"].map((align) => (
            <Box key={align} display="flex" alignItems="center" gap="sm">
              <Radio
                name="alignment"
                value={align}
                checked={
                  (content.alignment as string) === align ||
                  (!content.alignment && align === "left")
                }
                onChange={() => handleFieldChange("alignment", align)}
                aria-label={align}
              />
              <Text variant="body-sm">
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Padding */}
      <Box>
        <Select
          id="padding"
          label="Padding"
          value={(content.padding as string) || "md"}
          onChange={(value) => handleFieldChange("padding", value)}
          options={PADDING_OPTIONS}
        />
      </Box>

      {/* TipTap Editor */}
      <Box>
        <Text variant="body-sm" semantic="secondary" as="label">
          Body Content
        </Text>

        {/* Editor Toolbar */}
        {editor && (
          <Box
            marginTop="2"
            padding="2"
            display="flex"
            gap="xs"
            className="border rounded-t bg-gray-50"
          >
            <Button
              type="button"
              size="sm"
              variant={editor.isActive("bold") ? "primary" : "outline"}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              Bold
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive("italic") ? "primary" : "outline"}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              Italic
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive("strike") ? "primary" : "outline"}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              Strike
            </Button>
            <Divider orientation="vertical" margin="0" />
            <Button
              type="button"
              size="sm"
              variant={editor.isActive("bulletList") ? "primary" : "outline"}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              • List
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive("orderedList") ? "primary" : "outline"}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              1. List
            </Button>
            <Divider orientation="vertical" margin="0" />
            <Button
              type="button"
              size="sm"
              variant={
                editor.isActive({ textAlign: "left" }) ? "primary" : "outline"
              }
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              Left
            </Button>
            <Button
              type="button"
              size="sm"
              variant={
                editor.isActive({ textAlign: "center" }) ? "primary" : "outline"
              }
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            >
              Center
            </Button>
            <Button
              type="button"
              size="sm"
              variant={
                editor.isActive({ textAlign: "right" }) ? "primary" : "outline"
              }
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              Right
            </Button>
          </Box>
        )}

        {/* Editor Content */}
        <Box className="border border-t-0 rounded-b min-h-[200px] bg-white relative">
          {editor && editor.isEmpty && (
            <Box className="absolute top-3 left-3 text-gray-400 pointer-events-none">
              Start typing your content here...
            </Box>
          )}
          <EditorContent editor={editor} />
        </Box>
      </Box>

      <Divider variant="strong" />

      {/* Live Preview */}
      <Box>
        <Heading level={3}>Live Preview</Heading>
        <Divider />
        
        <Box marginTop="2">
          <TextBlockSegmentRenderer content={content} />
        </Box>
      </Box>
    </Box>
  );
}
