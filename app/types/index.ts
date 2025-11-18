import type { Timestamp } from 'firebase/firestore';

// Multi-language field type
export type MultiLang = {
  [languageCode: string]: string;
};

// Post status
export type PostStatus = 'draft' | 'published';

// Segment types
export type SegmentType =
  | 'carousel'
  | 'gallery'
  | 'text-block'
  | 'hero'
  | 'cta'
  | 'testimonials'
  | 'faq'
  | 'team'
  | 'form'
  | 'posts';

// Menu item types
export type MenuItemType = 'page' | 'external' | 'dropdown';

// ============================================
// USER
// ============================================
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  displayName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// PAGE
// ============================================
export interface Page {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: 'draft' | 'published';
  segments: string[]; // Array of segment IDs
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// ============================================
// SEGMENT
// ============================================
export interface SegmentConfig {
  // Common config properties that all segments might need
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  margin?: string;
  className?: string;
}

export interface LocalizedContent {
  en: Record<string, unknown>;
  [locale: string]: Record<string, unknown>;
}

export interface Segment {
  id: string;
  name: string; // User-friendly name like "Summer Sale Carousel"
  type: SegmentType;
  config: SegmentConfig & Record<string, unknown>; // Type-specific config
  content?: LocalizedContent; // Optional multi-language content
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Specific segment prop types
export interface CarouselSlide {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string;
  alt: string;
}

export interface CTAContent {
  heading: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  backgroundColor?: string;
  buttonVariant?: 'primary' | 'outline' | 'ghost';
}

export type FormFieldType = 'text' | 'email' | 'textarea' | 'phone' | 'select';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[]; // for select type only
}

export interface FormContent {
  title?: string;
  description?: string;
  fields: FormField[];
  successMessage: string;
  recipientEmail: string;
}

export interface PostsSegmentProps {
  title: string;
  description: string;
}

// ============================================
// POST
// ============================================
export interface Post {
  id: string;
  segmentId: string; // Links post to specific Posts segment
  title: string;
  content: string; // Rich HTML content
  excerpt: string;
  slug: string;
  featuredImage?: string;
  author: string;
  authorId: string;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// NAVIGATION
// ============================================
export interface Navigation {
  id: string;
  position: 'header' | 'footer' | 'sidebar';
  items: MenuItem[];
}

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface MenuItem {
  id: string;
  pageId: string;
  label: string;
  parentId?: string; // Optional: ID of parent menu item for nested menus
  children?: MenuItem[]; // Computed field: nested children (not stored in DB)
  order: number;
  visible: boolean;
  variant: ButtonVariant;
  size: ButtonSize;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// ============================================
// FORM SUBMISSION
// ============================================
export interface FormSubmission {
  id: string;
  data: Record<string, string>;
  recipientEmail: string;
  submittedAt: Date;
  read: boolean;
}

// ============================================
// SITE SETTINGS
// ============================================
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface SiteSettings {
  id: string;
  // General Settings
  siteName: string;
  siteDescription: string;
  contactEmail: string;

  // Header Settings
  stickyHeader?: boolean;
  siteNameSize?: HeadingSize;

  // PayPal Integration
  paypalClientId?: string;
  paypalMode?: 'sandbox' | 'production';

  // Analytics Integration
  googleAnalyticsId?: string;

  // Logo and Favicon (URLs to uploaded files)
  logoUrl?: string;
  logoSize?: AvatarSize;
  faviconUrl?: string;

  // Timestamps
  updatedAt: Date;
  updatedBy: string;
}
