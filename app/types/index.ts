import type { Timestamp } from 'firebase/firestore';

// Multi-language field type
export type MultiLang = {
  [languageCode: string]: string;
};

// User roles
export type UserRole = 'admin' | 'editor';

// Page status
export type PageStatus = 'draft' | 'published' | 'archived';

// Blog post status
export type BlogPostStatus = 'draft' | 'published';

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
  role: UserRole;
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

export interface CarouselProps {
  items: Array<{
    id: string;
    imageUrl: string;
    caption?: MultiLang;
  }>;
}

export interface GalleryProps {
  images: Array<{
    id: string;
    url: string;
    caption?: MultiLang;
    alt: string;
  }>;
  columns: number;
  gap: 'sm' | 'md' | 'lg';
  lightbox: boolean;
}

export interface TextBlockProps {
  content: MultiLang; // HTML content
}

export interface TitleProps {
  text: MultiLang;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  alignment: 'left' | 'center' | 'right';
  variant?: string;
}

export interface FormProps {
  templateType: 'contact';
}

export interface PayPalDonateProps {
  title: MultiLang;
  description: MultiLang;
  suggestedAmounts: number[];
}

export interface SocialLinksProps {
  platforms: Array<{
    type: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok';
    url: string;
    label?: MultiLang;
  }>;
  displayStyle: 'icon' | 'iconLabel' | 'button';
  iconSize: 'sm' | 'md' | 'lg';
}

export interface PostsSegmentProps {
  title: string;
  description: string;
}

// ============================================
// BLOG POST
// ============================================
export interface BlogPost {
  id: string;
  title: MultiLang;
  content: MultiLang; // Rich HTML content
  excerpt: MultiLang;
  slug: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  author: string;
  authorId: string;
  publishDate: Timestamp;
  status: BlogPostStatus;
  metadata: {
    metaTitle?: MultiLang;
    metaDescription?: MultiLang;
    ogImage?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
// BRAND CONFIGURATION
// ============================================
export interface BrandConfiguration {
  id: string; // Singleton - typically 'default'
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    [key: string]: string;
  };
  typography: {
    fontFamily: string;
    headingScale: number;
    [key: string]: string | number;
  };
  spacing: {
    baseUnit: number;
    [key: string]: number;
  };
  logo?: string;
  favicon?: string;
  updatedAt: Timestamp;
}

// ============================================
// MEDIA
// ============================================
export interface Media {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Timestamp;
  metadata?: {
    alt?: MultiLang;
    caption?: MultiLang;
  };
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
export interface SiteSettings {
  id: string;
  // General Settings
  siteName: string;
  siteDescription: string;
  contactEmail: string;

  // Header Settings
  stickyHeader?: boolean;

  // PayPal Integration
  paypalClientId?: string;
  paypalMode?: 'sandbox' | 'production';

  // Analytics Integration
  googleAnalyticsId?: string;

  // Logo and Favicon (URLs to uploaded files)
  logoUrl?: string;
  faviconUrl?: string;

  // Timestamps
  updatedAt: Date;
  updatedBy: string;
}
