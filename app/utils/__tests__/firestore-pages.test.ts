import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { QuerySnapshot, DocumentSnapshot, Query, DocumentReference, QueryFieldFilterConstraint } from 'firebase/firestore';
import {
  generateSlug,
  getPages,
  getPageById,
  isSlugUnique,
  createPage,
  type PageInput,
} from '../firestore-pages';

// Mock Firebase
vi.mock('../firebase', () => ({
  getFirebaseDb: vi.fn().mockResolvedValue({}),
}));

// Mock firebase/firestore module
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
  };
});

describe('firestore-pages', () => {
  describe('generateSlug', () => {
    it('converts title to URL-friendly slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('About Us & Our Team')).toBe('about-us-our-team');
      expect(generateSlug('  Extra   Spaces  ')).toBe('extra-spaces');
    });

    it('removes special characters', () => {
      expect(generateSlug('Hello@World!')).toBe('helloworld');
      expect(generateSlug('Test#123$456')).toBe('test123456');
    });

    it('handles empty strings', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug('   ')).toBe('');
    });

    it('handles unicode characters', () => {
      expect(generateSlug('Café')).toBe('caf');
      expect(generateSlug('Über uns')).toBe('ber-uns');
    });
  });

  describe('getPages', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns all pages ordered by updatedAt desc', async () => {
      const mockPages = [
        {
          id: '1',
          data: () => ({
            title: 'Page 1',
            slug: 'page-1',
            status: 'published',
            segments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
        {
          id: '2',
          data: () => ({
            title: 'Page 2',
            slug: 'page-2',
            status: 'draft',
            segments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
      ];

      const { query, getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ docs: mockPages } as unknown as QuerySnapshot);
      vi.mocked(query).mockReturnValue({} as Query);

      const pages = await getPages();
      expect(pages).toHaveLength(2);
      expect(pages[0].id).toBe('1');
    });

    it('filters pages by status', async () => {
      const mockPages = [
        {
          id: '1',
          data: () => ({
            title: 'Published Page',
            slug: 'published',
            status: 'published',
            segments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
      ];

      const { query, getDocs, where } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ docs: mockPages } as unknown as QuerySnapshot);
      vi.mocked(query).mockReturnValue({} as Query);
      vi.mocked(where).mockReturnValue({} as QueryFieldFilterConstraint);

      const pages = await getPages({ status: 'published' });
      expect(where).toHaveBeenCalledWith('status', '==', 'published');
      expect(pages).toHaveLength(1);
    });

    it('filters pages by search term', async () => {
      const mockPages = [
        {
          id: '1',
          data: () => ({
            title: 'About Us',
            slug: 'about-us',
            status: 'published',
            segments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
        {
          id: '2',
          data: () => ({
            title: 'Contact',
            slug: 'contact',
            status: 'published',
            segments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
      ];

      const { query, getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ docs: mockPages } as unknown as QuerySnapshot);
      vi.mocked(query).mockReturnValue({} as Query);

      const pages = await getPages({ search: 'about' });
      expect(pages).toHaveLength(1);
      expect(pages[0].title).toBe('About Us');
    });
  });

  describe('getPageById', () => {
    it('returns page when found', async () => {
      const { getDoc, doc } = await import('firebase/firestore');
      const mockDoc = {
        exists: () => true,
        id: '123',
        data: () => ({
          title: 'Test Page',
          slug: 'test-page',
          status: 'published',
          segments: [],
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
          updatedBy: 'user1',
        }),
      };

      vi.mocked(getDoc).mockResolvedValue(mockDoc as unknown as DocumentSnapshot);
      vi.mocked(doc).mockReturnValue({} as DocumentReference);

      const page = await getPageById('123');
      expect(page).not.toBeNull();
      expect(page?.title).toBe('Test Page');
    });

    it('returns null when page not found', async () => {
      const { getDoc, doc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as unknown as DocumentSnapshot);
      vi.mocked(doc).mockReturnValue({} as DocumentReference);

      const page = await getPageById('nonexistent');
      expect(page).toBeNull();
    });
  });

  describe('isSlugUnique', () => {
    it('returns true when slug does not exist', async () => {
      const { getDocs, query } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as unknown as QuerySnapshot);
      vi.mocked(query).mockReturnValue({} as Query);

      const unique = await isSlugUnique('new-slug');
      expect(unique).toBe(true);
    });

    it('returns false when slug exists', async () => {
      const mockDocs = [
        {
          id: '123',
          data: () => ({
            title: 'Existing',
            slug: 'existing-slug',
            status: 'published',
            segments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
      ];

      const { getDocs, query } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ empty: false, docs: mockDocs } as unknown as QuerySnapshot);
      vi.mocked(query).mockReturnValue({} as Query);

      const unique = await isSlugUnique('existing-slug');
      expect(unique).toBe(false);
    });

    it('returns true when slug exists but is same page (excludeId)', async () => {
      const mockDocs = [
        {
          id: '123',
          data: () => ({
            title: 'Existing',
            slug: 'existing-slug',
            status: 'published',
            segments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
      ];

      const { getDocs, query } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ empty: false, docs: mockDocs } as unknown as QuerySnapshot);
      vi.mocked(query).mockReturnValue({} as Query);

      const unique = await isSlugUnique('existing-slug', '123');
      expect(unique).toBe(true);
    });
  });

  describe('createPage', () => {
    it('creates page with valid data', async () => {
      const { addDoc, getDoc, getDocs, query } = await import('firebase/firestore');

      // Mock slug uniqueness check
      vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as unknown as QuerySnapshot);
      vi.mocked(query).mockReturnValue({} as Query);

      // Mock doc creation
      const mockDocRef = { id: 'new-id' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as unknown as DocumentReference);
      vi.mocked(getDoc).mockResolvedValue({
        id: 'new-id',
        data: () => ({
          title: 'New Page',
          slug: 'new-page',
          description: 'Test',
          status: 'draft',
          segments: [],
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
          updatedBy: 'user1',
        }),
      } as unknown as DocumentSnapshot);

      const input: PageInput = {
        title: 'New Page',
        slug: 'new-page',
        description: 'Test',
        status: 'draft',
      };

      const page = await createPage(input, 'user1');
      expect(page.title).toBe('New Page');
      expect(addDoc).toHaveBeenCalled();
    });

    it('throws error when slug already exists', async () => {
      const { getDocs, query } = await import('firebase/firestore');

      const mockDocs = [
        {
          id: '123',
          data: () => ({
            title: 'Existing',
            slug: 'existing',
            status: 'published',
            segments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ empty: false, docs: mockDocs } as unknown as QuerySnapshot);
      vi.mocked(query).mockReturnValue({} as Query);

      const input: PageInput = {
        title: 'New Page',
        slug: 'existing',
        status: 'draft',
      };

      await expect(createPage(input, 'user1')).rejects.toThrow('Slug "existing" is already in use');
    });
  });
});
