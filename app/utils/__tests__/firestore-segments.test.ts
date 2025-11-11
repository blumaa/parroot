import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  QuerySnapshot,
  DocumentSnapshot,
  Query,
  DocumentReference,
  QueryFieldFilterConstraint,
} from 'firebase/firestore';
import {
  getSegments,
  getSegmentById,
  getSegmentsByIds,
  createSegment,
  updateSegment,
  deleteSegment,
  duplicateSegment,
  type SegmentInput,
} from '../firestore-segments';

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

describe('firestore-segments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSegments', () => {
    it('returns all segments ordered by updatedAt desc', async () => {
      const mockSegments = [
        {
          id: '1',
          data: () => ({
            type: 'hero',
            name: 'Hero Segment 1',
            config: { backgroundColor: '#fff' },
            status: 'published',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
        {
          id: '2',
          data: () => ({
            type: 'carousel',
            name: 'Carousel Segment 1',
            config: { autoplay: true },
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
      ];

      const { query, getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ docs: mockSegments } as unknown as QuerySnapshot);
      vi.mocked(query).mockReturnValue({} as Query);

      const segments = await getSegments();
      expect(segments).toHaveLength(2);
      expect(segments[0].id).toBe('1');
      expect(segments[0].type).toBe('hero');
    });

    it('filters segments by type', async () => {
      const mockSegments = [
        {
          id: '1',
          data: () => ({
            type: 'hero',
            name: 'Hero Segment',
            config: {},
            status: 'published',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
      ];

      const { query, getDocs, where } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ docs: mockSegments } as unknown as QuerySnapshot);
      vi.mocked(query).mockReturnValue({} as Query);
      vi.mocked(where).mockReturnValue({} as QueryFieldFilterConstraint);

      const segments = await getSegments({ type: 'hero' });
      expect(where).toHaveBeenCalledWith('type', '==', 'hero');
      expect(segments).toHaveLength(1);
    });

    it('filters segments by status', async () => {
      const mockSegments = [
        {
          id: '1',
          data: () => ({
            type: 'hero',
            name: 'Published Segment',
            config: {},
            status: 'published',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
      ];

      const { query, getDocs, where } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ docs: mockSegments } as unknown as QuerySnapshot);
      vi.mocked(query).mockReturnValue({} as Query);
      vi.mocked(where).mockReturnValue({} as QueryFieldFilterConstraint);

      const segments = await getSegments({ status: 'published' });
      expect(where).toHaveBeenCalledWith('status', '==', 'published');
      expect(segments).toHaveLength(1);
    });

    it('filters segments by search term', async () => {
      const mockSegments = [
        {
          id: '1',
          data: () => ({
            type: 'hero',
            name: 'Hero Banner',
            config: {},
            status: 'published',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
        {
          id: '2',
          data: () => ({
            type: 'carousel',
            name: 'Product Carousel',
            config: {},
            status: 'published',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
          }),
        },
      ];

      const { query, getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ docs: mockSegments } as unknown as QuerySnapshot);
      vi.mocked(query).mockReturnValue({} as Query);

      const segments = await getSegments({ search: 'hero' });
      expect(segments).toHaveLength(1);
      expect(segments[0].name).toBe('Hero Banner');
    });
  });

  describe('getSegmentById', () => {
    it('returns segment when found', async () => {
      const { getDoc, doc } = await import('firebase/firestore');
      const mockDoc = {
        exists: () => true,
        id: '123',
        data: () => ({
          type: 'hero',
          name: 'Test Hero',
          config: { backgroundColor: '#000' },
          content: { en: { title: 'Welcome' } },
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
          updatedBy: 'user1',
        }),
      };

      vi.mocked(getDoc).mockResolvedValue(mockDoc as unknown as DocumentSnapshot);
      vi.mocked(doc).mockReturnValue({} as DocumentReference);

      const segment = await getSegmentById('123');
      expect(segment).not.toBeNull();
      expect(segment?.name).toBe('Test Hero');
      expect(segment?.type).toBe('hero');
    });

    it('returns null when segment not found', async () => {
      const { getDoc, doc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);
      vi.mocked(doc).mockReturnValue({} as DocumentReference);

      const segment = await getSegmentById('nonexistent');
      expect(segment).toBeNull();
    });
  });

  describe('getSegmentsByIds', () => {
    it('returns empty array for empty input', async () => {
      const segments = await getSegmentsByIds([]);
      expect(segments).toEqual([]);
    });

    it('returns multiple segments by IDs', async () => {
      const { getDoc, doc } = await import('firebase/firestore');

      const mockDoc1 = {
        exists: () => true,
        id: '1',
        data: () => ({
          type: 'hero',
          name: 'Hero 1',
          config: {},
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
          updatedBy: 'user1',
        }),
      };

      const mockDoc2 = {
        exists: () => true,
        id: '2',
        data: () => ({
          type: 'carousel',
          name: 'Carousel 1',
          config: {},
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
          updatedBy: 'user1',
        }),
      };

      vi.mocked(getDoc)
        .mockResolvedValueOnce(mockDoc1 as unknown as DocumentSnapshot)
        .mockResolvedValueOnce(mockDoc2 as unknown as DocumentSnapshot);
      vi.mocked(doc).mockReturnValue({} as DocumentReference);

      const segments = await getSegmentsByIds(['1', '2']);
      expect(segments).toHaveLength(2);
      expect(segments[0].id).toBe('1');
      expect(segments[1].id).toBe('2');
    });

    it('filters out null segments', async () => {
      const { getDoc, doc } = await import('firebase/firestore');

      const mockDoc1 = {
        exists: () => true,
        id: '1',
        data: () => ({
          type: 'hero',
          name: 'Hero 1',
          config: {},
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
          updatedBy: 'user1',
        }),
      };

      vi.mocked(getDoc)
        .mockResolvedValueOnce(mockDoc1 as unknown as DocumentSnapshot)
        .mockResolvedValueOnce({ exists: () => false } as unknown as DocumentSnapshot);
      vi.mocked(doc).mockReturnValue({} as DocumentReference);

      const segments = await getSegmentsByIds(['1', 'nonexistent']);
      expect(segments).toHaveLength(1);
      expect(segments[0].id).toBe('1');
    });
  });

  describe('createSegment', () => {
    it('creates segment with valid data', async () => {
      const { addDoc, getDoc, collection } = await import('firebase/firestore');

      const mockDocRef = { id: 'new-id' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as unknown as DocumentReference);
      vi.mocked(getDoc).mockResolvedValue({
        id: 'new-id',
        data: () => ({
          type: 'hero',
          name: 'New Hero',
          config: { backgroundColor: '#fff' },
          content: { en: { title: 'Welcome' } },
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
          updatedBy: 'user1',
        }),
      } as unknown as DocumentSnapshot);
      vi.mocked(collection).mockReturnValue({} as never);

      const input: SegmentInput = {
        type: 'hero',
        name: 'New Hero',
        config: { backgroundColor: '#fff' },
        content: { en: { title: 'Welcome' } },
        status: 'draft',
      };

      const segment = await createSegment(input, 'user1');
      expect(segment.name).toBe('New Hero');
      expect(segment.type).toBe('hero');
      expect(addDoc).toHaveBeenCalled();
    });
  });

  describe('updateSegment', () => {
    it('updates segment successfully', async () => {
      const { updateDoc, doc, getDoc } = await import('firebase/firestore');

      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(doc).mockReturnValue({} as DocumentReference);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: '123',
        data: () => ({
          type: 'hero',
          name: 'Updated Hero',
          config: { backgroundColor: '#000' },
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
          updatedBy: 'user2',
        }),
      } as unknown as DocumentSnapshot);

      const segment = await updateSegment('123', { name: 'Updated Hero' }, 'user2');
      expect(segment.name).toBe('Updated Hero');
      expect(updateDoc).toHaveBeenCalled();
    });

    it('throws error when segment not found', async () => {
      const { updateDoc, doc, getDoc } = await import('firebase/firestore');

      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(doc).mockReturnValue({} as DocumentReference);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      await expect(updateSegment('nonexistent', { name: 'Updated' }, 'user1')).rejects.toThrow(
        'Segment with ID "nonexistent" not found'
      );
    });
  });

  describe('deleteSegment', () => {
    it('deletes segment successfully', async () => {
      const { deleteDoc, doc } = await import('firebase/firestore');

      vi.mocked(deleteDoc).mockResolvedValue(undefined);
      vi.mocked(doc).mockReturnValue({} as DocumentReference);

      await deleteSegment('123');
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('duplicateSegment', () => {
    it('creates duplicate with modified name and draft status', async () => {
      const { getDoc, doc, addDoc, collection } = await import('firebase/firestore');

      // Mock getSegmentById
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: '123',
        data: () => ({
          type: 'hero',
          name: 'Original Hero',
          config: { backgroundColor: '#fff' },
          content: { en: { title: 'Welcome' } },
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
          updatedBy: 'user1',
        }),
      } as unknown as DocumentSnapshot);

      // Mock createSegment
      const mockDocRef = { id: 'duplicate-id' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as unknown as DocumentReference);
      vi.mocked(getDoc).mockResolvedValueOnce({
        id: 'duplicate-id',
        data: () => ({
          type: 'hero',
          name: 'Original Hero (Copy)',
          config: { backgroundColor: '#fff' },
          content: { en: { title: 'Welcome' } },
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user2',
          updatedBy: 'user2',
        }),
      } as unknown as DocumentSnapshot);
      vi.mocked(doc).mockReturnValue({} as DocumentReference);
      vi.mocked(collection).mockReturnValue({} as never);

      const duplicate = await duplicateSegment('123', 'user2');
      expect(duplicate.name).toBe('Original Hero (Copy)');
      expect(duplicate.status).toBe('draft');
    });

    it('throws error when original segment not found', async () => {
      const { getDoc, doc } = await import('firebase/firestore');

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);
      vi.mocked(doc).mockReturnValue({} as DocumentReference);

      await expect(duplicateSegment('nonexistent', 'user1')).rejects.toThrow(
        'Segment with ID "nonexistent" not found'
      );
    });
  });
});
