/**
 * Client-side utility functions for post management
 */

import { generateSlug as baseGenerateSlug } from './slug';

/**
 * Generate URL-friendly slug from title
 * Reuses the base slug generator
 */
export function generateSlug(title: string): string {
  return baseGenerateSlug(title);
}

/**
 * Generate excerpt from HTML content
 * Strips HTML tags and truncates to max length
 */
export function generateExcerpt(htmlContent: string, maxLength: number = 160): string {
  // Strip HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, '');

  // Truncate to max length
  if (text.length <= maxLength) {
    return text;
  }

  // Find last space before max length
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return truncated.substring(0, lastSpace) + '...';
}
