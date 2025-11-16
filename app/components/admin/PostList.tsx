"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Text,
  Heading,
  Badge,
  Spinner,
} from "@mond-design-system/theme";
import {
  Input,
  Modal,
  ModalBody,
  ModalFooter,
} from "@mond-design-system/theme/client";
import { deletePostAction } from "@/app/actions/posts";
import { getPostsAction } from "@/app/actions/posts";
import { useToast } from "@/app/providers/ToastProvider";
import type { Post, PostStatus } from "@/app/types";

interface PostListProps {
  segmentId: string;
  segmentName: string;
  initialPosts?: Post[];
}

export function PostList({
  segmentId,
  segmentName,
  initialPosts = [],
}: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedPosts = await getPostsAction({ segmentId });
      setPosts(fetchedPosts);
      setFilteredPosts(fetchedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
      showError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [segmentId, showError]);

  // Only load posts if initialPosts was empty (for backwards compatibility)
  useEffect(() => {
    if (initialPosts.length === 0) {
      loadPosts();
    }
  }, [initialPosts.length, loadPosts]);

  // Filter posts
  useEffect(() => {
    let filtered = posts;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((post) => post.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query),
      );
    }

    setFilteredPosts(filtered);
  }, [posts, statusFilter, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      const result = await deletePostAction(id, segmentId);
      if (result.success) {
        showSuccess("Post deleted successfully");
        setDeleteConfirm(null);
        // Remove from local state
        setPosts(posts.filter((p) => p.id !== id));
      } else {
        showError(result.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      showError("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <Box padding="4" display="flex" justifyContent="center">
        <Spinner size="lg" label="Loading posts..." />
      </Box>
    );
  }

  return (
    <Box padding="4" display="flex" flexDirection="column" gap="lg">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Heading level={2}>{segmentName}</Heading>
          <Text variant="body" semantic="secondary">
            Manage posts for {segmentName}
          </Text>
        </Box>
        <Link href={`/admin/segments/${segmentId}/posts/new`}>
          <Button variant="primary">Create Post</Button>
        </Link>
      </Box>

      {/* Filters */}
      <Box
        display="flex"
        flexDirection="row"
        gap="md"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box flex="1">
          <Input
            id="search"
            type="text"
            placeholder="Search by title or excerpt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Box display="flex" gap="sm">
          <Box>
            <Button
              variant={statusFilter === "all" ? "primary" : "outline"}
              onClick={() => setStatusFilter("all")}
              size="sm"
            >
              All
            </Button>
          </Box>
          <Box>
            <Button
              variant={statusFilter === "draft" ? "primary" : "outline"}
              onClick={() => setStatusFilter("draft")}
              size="sm"
            >
              Draft
            </Button>
          </Box>
          <Box>
            <Button
              variant={statusFilter === "published" ? "primary" : "outline"}
              onClick={() => setStatusFilter("published")}
              size="sm"
            >
              Published
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Box
          padding="8"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap="md"
        >
          <Text variant="body" semantic="secondary">
            {posts.length === 0
              ? "No posts yet. Create your first post!"
              : "No posts match your filters."}
          </Text>
          {posts.length === 0 && (
            <Link href={`/admin/segments/${segmentId}/posts/new`}>
              <Button variant="primary">Create First Post</Button>
            </Link>
          )}
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap="sm">
          {filteredPosts.map((post) => (
            <Box
              key={post.id}
              padding="4"
              border="default"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" flexDirection="column" gap="xs" flex="1">
                <Heading level={4}>{post.title}</Heading>
                <Box display="flex" alignItems="center" gap="sm">
                  <Text variant="body-sm" semantic="secondary">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Text>
                  <Text variant="body-sm" semantic="secondary">
                    {post.excerpt.substring(0, 100)}
                    {post.excerpt.length > 100 ? "..." : ""}
                  </Text>
                </Box>
              </Box>

              <Box display="flex" gap="sm">
                <Badge
                  variant={post.status === "published" ? "success" : "warning"}
                >
                  {post.status}
                </Badge>
                <Link
                  href={`/admin/segments/${segmentId}/posts/${post.id}/edit`}
                >
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirm(post.id)}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Post"
        >
          <ModalBody>
            <Text variant="body">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Box display="flex" gap="sm" justifyContent="flex-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </Button>
            </Box>
          </ModalFooter>
        </Modal>
      )}
    </Box>
  );
}
