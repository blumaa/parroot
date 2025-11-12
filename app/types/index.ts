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

// Segment types
export type SegmentType =
  | 'carousel'
  | 'gallery'
  | 'textBlock'
  | 'title'
  | 'divider'
  | 'form'
  | 'paypalDonate'
  | 'blogDisplay'
  | 'socialLinks';

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
  title: MultiLang;
  slug: string;
  status: PageStatus;
  segmentIds: string[]; // References to Segment collection
  metadata: {
    metaTitle?: MultiLang;
    metaDescription?: MultiLang;
    ogImage?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

// ============================================
// SEGMENT
// ============================================
export interface Segment {
  id: string;
  name: string; // User-friendly name like "Summer Sale Carousel"
  type: SegmentType;
  props: Record<string, unknown>; // Type-specific props
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
// NAVIGATION
// ============================================
export interface Navigation {
  id: string;
  position: 'header' | 'footer' | 'sidebar';
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  label: MultiLang;
  type: MenuItemType;
  pageId?: string;
  externalUrl?: string;
  children?: MenuItem[];
  order: number;
  visible: boolean;
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
  formType: string;
  data: Record<string, unknown>;
  submittedAt: Timestamp;
  read: boolean;
  emailSent: boolean;
}

// ============================================
// SITE SETTINGS
// ============================================
export interface SiteSettings {
  id: string; // Singleton - typically 'default'
  siteName: MultiLang;
  siteDescription: MultiLang;
  contactEmail: string;
  languages: {
    default: string;
    supported: string[];
  };
  integrations: {
    paypal?: {
      clientId: string;
      mode: 'sandbox' | 'production';
    };
    analytics?: {
      googleAnalyticsId?: string;
    };
  };
  updatedAt: Timestamp;
}
