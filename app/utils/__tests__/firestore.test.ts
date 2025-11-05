import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDocument,
  getAllDocuments,
  queryDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  getPublishedPages,
  getPublishedBlogPosts,
  getBlogPostsByCategory,
  getUserByEmail,
  getSiteSettings,
  getBrandConfiguration,
  getNavigationByPosition,
} from '../firestore';
import {
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';

describe('Firestore CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDocument', () => {
    it('should get a document by ID', async () => {
      const mockData = { id: '123', title: 'Test' };
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: '123',
        data: () => ({ title: 'Test' }),
      } as any);

      const result = await getDocument('pages', '123');
      expect(result).toEqual(mockData);
    });

    it('should return null if document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getDocument('pages', '123');
      expect(result).toBeNull();
    });

    it('should throw error on failure', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(getDocument('pages', '123')).rejects.toThrow('Firestore error');
    });
  });

  describe('getAllDocuments', () => {
    it('should get all documents from collection', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ title: 'Doc 1' }) },
        { id: '2', data: () => ({ title: 'Doc 2' }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as any);

      const result = await getAllDocuments('pages');
      expect(result).toEqual([
        { id: '1', title: 'Doc 1' },
        { id: '2', title: 'Doc 2' },
      ]);
    });

    it('should handle empty collection', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      const result = await getAllDocuments('pages');
      expect(result).toEqual([]);
    });
  });

  describe('queryDocuments', () => {
    it('should query documents with filters', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ status: 'published' }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as any);

      const result = await queryDocuments(
        'pages',
        [{ field: 'status', operator: '==', value: 'published' }]
      );

      expect(result).toEqual([{ id: '1', status: 'published' }]);
    });

    it('should apply ordering and limit', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      await queryDocuments('pages', [], 'createdAt', 'desc', 10);

      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(limit).toHaveBeenCalledWith(10);
    });
  });

  describe('createDocument', () => {
    it('should create a new document with timestamps', async () => {
      const mockDocRef = { id: 'new-id' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);

      const data = { title: 'New Doc' };
      const result = await createDocument('pages', data);

      expect(result).toBe('new-id');

      // Verify addDoc was called with the document data
      const call = vi.mocked(addDoc).mock.calls[0];
      expect(call[1]).toHaveProperty('title', 'New Doc');
      expect(call[1]).toHaveProperty('createdAt');
      expect(call[1]).toHaveProperty('updatedAt');
      // Verify timestamps are Timestamp instances
      expect(call[1].createdAt).toBeInstanceOf(Timestamp);
      expect(call[1].updatedAt).toBeInstanceOf(Timestamp);
    });

    it('should throw error on failure', async () => {
      vi.mocked(addDoc).mockRejectedValue(new Error('Create failed'));

      await expect(createDocument('pages', { title: 'Test' })).rejects.toThrow('Create failed');
    });
  });

  describe('updateDocument', () => {
    it('should update document with new timestamp', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateDocument('pages', '123', { title: 'Updated' });

      // Verify updateDoc was called with the document data
      const call = vi.mocked(updateDoc).mock.calls[0];
      expect(call[1]).toHaveProperty('title', 'Updated');
      expect(call[1]).toHaveProperty('updatedAt');
      // Verify timestamp is a Timestamp instance
      expect(call[1].updatedAt).toBeInstanceOf(Timestamp);
    });

    it('should throw error on failure', async () => {
      vi.mocked(updateDoc).mockRejectedValue(new Error('Update failed'));

      await expect(updateDocument('pages', '123', { title: 'Test' })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      await deleteDocument('pages', '123');

      expect(deleteDoc).toHaveBeenCalled();
    });

    it('should throw error on failure', async () => {
      vi.mocked(deleteDoc).mockRejectedValue(new Error('Delete failed'));

      await expect(deleteDocument('pages', '123')).rejects.toThrow('Delete failed');
    });
  });

  describe('Collection-specific helpers', () => {
    beforeEach(() => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
    });

    it('should get published pages', async () => {
      await getPublishedPages();

      expect(where).toHaveBeenCalledWith('status', '==', 'published');
      expect(orderBy).toHaveBeenCalledWith('updatedAt', 'desc');
    });

    it('should get published blog posts', async () => {
      await getPublishedBlogPosts();

      expect(where).toHaveBeenCalledWith('status', '==', 'published');
      expect(orderBy).toHaveBeenCalledWith('publishDate', 'desc');
    });

    it('should get blog posts by category', async () => {
      await getBlogPostsByCategory('tech');

      expect(where).toHaveBeenCalledWith('status', '==', 'published');
      expect(where).toHaveBeenCalledWith('category', '==', 'tech');
    });

    it('should get user by email', async () => {
      await getUserByEmail('test@example.com');

      expect(where).toHaveBeenCalledWith('email', '==', 'test@example.com');
      expect(limit).toHaveBeenCalledWith(1);
    });

    it('should get site settings singleton', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'default',
        data: () => ({ siteName: 'Test' }),
      } as any);

      await getSiteSettings();

      expect(getDoc).toHaveBeenCalled();
    });

    it('should get brand configuration singleton', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'default',
        data: () => ({ colors: {} }),
      } as any);

      await getBrandConfiguration();

      expect(getDoc).toHaveBeenCalled();
    });

    it('should get navigation by position', async () => {
      await getNavigationByPosition('header');

      expect(where).toHaveBeenCalledWith('position', '==', 'header');
      expect(limit).toHaveBeenCalledWith(1);
    });
  });
});
