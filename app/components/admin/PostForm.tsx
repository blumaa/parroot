"use client";

import { useState, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Box, Text, Button, Divider, Heading, Spinner } from "@mond-design-system/theme";
import { Input, Radio } from "@mond-design-system/theme/client";
import { generateSlug, generateExcerpt } from "@/app/utils/posts";
import { createPostAction, updatePostAction, checkPostSlugUniqueAction } from "@/app/actions/posts";
import { uploadFile } from "@/app/utils/storage";
import { useToast } from "@/app/providers/ToastProvider";
import type { Post, PostStatus } from "@/app/types";
import { PostRenderer } from "@/app/components/segments/PostRenderer";
import { RichTextEditor } from "./RichTextEditor";

interface PostFormProps {
  segmentId: string;
  userId: string;
  userName: string;
  post?: Post;
}

export function PostForm({ segmentId, userId, userName, post }: PostFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState(post?.title || "");
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageInputType, setImageInputType] = useState<"url" | "upload">("url");
  const [status, setStatus] = useState<PostStatus>(post?.status || "draft");
  const [content, setContent] = useState(post?.content || "");

  // Auto-generate slug
  const slug = useMemo(() => generateSlug(title), [title]);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      showError("Title is required");
      return false;
    }
    if (!content || content === "<p></p>" || content.trim() === "") {
      showError("Content is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Check slug uniqueness
      const unique = await checkPostSlugUniqueAction(slug, post?.id);
      if (!unique) {
        showError("This title generates a slug that is already in use. Please choose a different title.");
        setIsSubmitting(false);
        return;
      }

      const postData = {
        segmentId,
        title,
        slug,
        excerpt: generateExcerpt(content),
        content: content,
        featuredImage: featuredImage || undefined,
        author: userName,
        authorId: userId,
        status,
      };

      let result;
      if (post) {
        // Update existing post
        result = await updatePostAction(post.id, segmentId, postData);
        if (result.success) {
          showSuccess("Post updated successfully");
        } else {
          throw new Error(result.error || "Failed to update post");
        }
      } else {
        // Create new post
        result = await createPostAction(postData);
        if (result.success) {
          showSuccess("Post created successfully");
        } else {
          throw new Error(result.error || "Failed to create post");
        }
      }

      router.push(`/admin/segments/${segmentId}/posts`);
    } catch (error) {
      console.error("Error saving post:", error);
      showError("Failed to save post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Box as="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap="lg">
      {/* Header with Action Buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading level={2}>{post ? "Edit Post" : "Create New Post"}</Heading>
        <Box display="flex" gap="sm">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : post ? "Update Post" : "Create Post"}
          </Button>
        </Box>
      </Box>

      <Divider variant="strong" />

      {/* Title */}
      <Box>
        <Input
          id="post-title"
          label="Title"
          type="text"
          placeholder="Enter post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </Box>

      {/* Featured Image */}
      <Box>
        <Box as="label" id="image-input-type-label">
          <Text variant="body-sm" semantic="secondary">
            Featured Image
          </Text>
        </Box>
        <Box
          display="flex"
          gap="md"
          marginTop="2"
          marginBottom="3"
          role="radiogroup"
          aria-labelledby="image-input-type-label"
        >
          <Box display="flex" alignItems="center" gap="sm">
            <Radio
              id="image-input-url"
              name="image-input-type"
              value="url"
              checked={imageInputType === "url"}
              onChange={() => setImageInputType("url")}
              aria-label="Image URL"
            />
            <Text variant="body-sm">Image URL</Text>
          </Box>
          <Box display="flex" alignItems="center" gap="sm">
            <Radio
              id="image-input-upload"
              name="image-input-type"
              value="upload"
              checked={imageInputType === "upload"}
              onChange={() => setImageInputType("upload")}
              aria-label="Upload Image"
            />
            <Text variant="body-sm">Upload Image</Text>
          </Box>
        </Box>

        {imageInputType === "url" ? (
          <Box>
            <Input
              key="image-url-input"
              id="post-featured-image-url"
              label="Image URL"
              type="text"
              placeholder="https://example.com/image.jpg"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
            />
          </Box>
        ) : (
          <Box>
            <Input
              key="image-file-input"
              id="post-featured-image-upload"
              label="Upload Image File"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    setIsUploadingImage(true);
                    const path = `posts/${crypto.randomUUID()}-${file.name}`;
                    const downloadURL = await uploadFile(path, file);
                    setFeaturedImage(downloadURL);
                    showSuccess("Image uploaded successfully");
                  } catch (error) {
                    console.error("Error uploading image:", error);
                    showError("Failed to upload image. Please try again.");
                  } finally {
                    setIsUploadingImage(false);
                  }
                }
              }}
              disabled={isUploadingImage}
            />
            {isUploadingImage && (
              <Box marginTop="1">
                <Spinner size="sm" label="Uploading image..." />
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Status */}
      <Box>
        <Box as="label" id="status-label">
          <Text variant="body-sm" semantic="secondary">
            Status
          </Text>
        </Box>
        <Box display="flex" gap="sm" marginTop="2">
          <Button
            type="button"
            variant={status === "draft" ? "primary" : "outline"}
            onClick={() => setStatus("draft")}
          >
            Draft
          </Button>
          <Button
            type="button"
            variant={status === "published" ? "primary" : "outline"}
            onClick={() => setStatus("published")}
          >
            Published
          </Button>
        </Box>
      </Box>

      {/* Content Editor */}
      <RichTextEditor
        content={content}
        onChange={setContent}
        label="Content"
        placeholder="Start writing your post content..."
      />

      <Divider variant="strong" />

      {/* Live Preview */}
      <Box>
        <Heading level={3}>Live Preview</Heading>

        <Box marginTop="2" border="default">
          <PostRenderer
            title={title}
            content={content}
            featuredImage={featuredImage}
            showMeta={false}
          />
        </Box>
      </Box>

    </Box>
  );
}
