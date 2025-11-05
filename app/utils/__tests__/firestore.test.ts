import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

describe('Firestore Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDocument', () => {
    it('should get document by path', async () => {
      const mockData = { id: '123', name: 'Test' };
      vi.mocked(doc).mockReturnValue('mockDocRef' as never);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockData,
        id: '123',
      } as never);

      const { getDocument } = await import('../firestore');
      const result = await getDocument('users/123');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', '123');
      expect(getDoc).toHaveBeenCalledWith('mockDocRef');
      expect(result).toEqual(mockData);
    });

    it('should return null if document does not exist', async () => {
      vi.mocked(doc).mockReturnValue('mockDocRef' as never);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      const { getDocument } = await import('../firestore');
      const result = await getDocument('users/123');

      expect(result).toBeNull();
    });
  });

  describe('getCollection', () => {
    it('should get all documents in collection', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ name: 'Doc 1' }) },
        { id: '2', data: () => ({ name: 'Doc 2' }) },
      ];

      vi.mocked(collection).mockReturnValue('mockCollectionRef' as never);
      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as never);

      const { getCollection } = await import('../firestore');
      const result = await getCollection('users');

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'users');
      expect(getDocs).toHaveBeenCalledWith('mockCollectionRef');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: '1', name: 'Doc 1' });
    });
  });

  describe('addDocument', () => {
    it('should add document to collection', async () => {
      const mockData = { name: 'New Doc' };
      const mockDocRef = { id: 'new-id' };

      vi.mocked(collection).mockReturnValue('mockCollectionRef' as never);
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as never);

      const { addDocument } = await import('../firestore');
      const result = await addDocument('users', mockData);

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'users');
      expect(addDoc).toHaveBeenCalledWith('mockCollectionRef', mockData);
      expect(result).toBe('new-id');
    });
  });

  describe('setDocument', () => {
    it('should set document data', async () => {
      const mockData = { name: 'Updated Doc' };

      vi.mocked(doc).mockReturnValue('mockDocRef' as never);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const { setDocument } = await import('../firestore');
      await setDocument('users/123', mockData);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', '123');
      expect(setDoc).toHaveBeenCalledWith('mockDocRef', mockData);
    });
  });

  describe('updateDocument', () => {
    it('should update document fields', async () => {
      const mockData = { name: 'Updated Name' };

      vi.mocked(doc).mockReturnValue('mockDocRef' as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const { updateDocument } = await import('../firestore');
      await updateDocument('users/123', mockData);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', '123');
      expect(updateDoc).toHaveBeenCalledWith('mockDocRef', mockData);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document', async () => {
      vi.mocked(doc).mockReturnValue('mockDocRef' as never);
      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      const { deleteDocument } = await import('../firestore');
      await deleteDocument('users/123');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', '123');
      expect(deleteDoc).toHaveBeenCalledWith('mockDocRef');
    });
  });

  describe('queryCollection', () => {
    it('should query collection with constraints', async () => {
      const mockDocs = [{ id: '1', data: () => ({ age: 25 }) }];
      const mockQuery = 'mockQuery';
      const mockConstraints = ['constraint1', 'constraint2'];

      vi.mocked(collection).mockReturnValue('mockCollectionRef' as never);
      vi.mocked(query).mockReturnValue(mockQuery as never);
      vi.mocked(where).mockReturnValue('constraint1' as never);
      vi.mocked(orderBy).mockReturnValue('constraint2' as never);
      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as never);

      const { queryCollection } = await import('../firestore');
      const result = await queryCollection(
        'users',
        mockConstraints as never[]
      );

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'users');
      expect(query).toHaveBeenCalledWith(
        'mockCollectionRef',
        ...mockConstraints
      );
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
      expect(result).toHaveLength(1);
    });
  });
});
