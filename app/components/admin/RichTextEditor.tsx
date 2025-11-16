"use client";

import { Box, Text, Button, Divider } from "@mond-design-system/theme";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import "./RichTextEditor.css";

interface RichTextEditorProps {
  /**
   * The HTML content of the editor
   */
  content: string;
  /**
   * Callback when content changes
   */
  onChange: (html: string) => void;
  /**
   * Optional label for the editor
   */
  label?: string;
  /**
   * Optional placeholder text
   */
  placeholder?: string;
}

/**
 * RichTextEditor Component
 *
 * A reusable rich text editor using TipTap with formatting toolbar.
 * Supports bold, italic, strike, lists, and text alignment.
 */
export function RichTextEditor({
  content,
  onChange,
  label,
  placeholder = "Start typing your content here...",
}: RichTextEditorProps) {
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
    content: content || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-3",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when content prop changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  return (
    <Box>
      {label && (
        <Text variant="body-sm" semantic="secondary" as="label">
          {label}
        </Text>
      )}

      {/* Editor Toolbar */}
      {editor && (
        <Box
          marginTop={label ? "2" : undefined}
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
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
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
            {placeholder}
          </Box>
        )}
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
