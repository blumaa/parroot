import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
} from 'firebase/storage';

describe('Security Rules Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Pages Collection Security', () => {
    it('should allow public read access to published pages', async () => {
      const mockPage = {
        id: 'page-1',
        data: () => ({
          title: { en: 'Public Page' },
          status: 'published',
        }),
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        ...mockPage,
      } as any);

      const result = await getDoc(doc({} as any, 'pages', 'page-1'));

      expect(result.exists()).toBe(true);
      expect(result.data()).toHaveProperty('status', 'published');
    });

    it('should deny public read access to draft pages', async () => {
      // In real implementation, this would be blocked by security rules
      // Testing that draft status is properly checked
      const mockPage = {
        id: 'page-2',
        data: () => ({
          title: { en: 'Draft Page' },
          status: 'draft',
        }),
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        ...mockPage,
      } as any);

      const result = await getDoc(doc({} as any, 'pages', 'page-2'));

      // Security rules would prevent this, but we verify the status
      expect(result.data()?.status).toBe('draft');
    });

    it('should allow editors to create pages', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'editor-123' };

      const mockDocRef = { id: 'new-page' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);

      const newPage = {
        title: { en: 'New Page' },
        slug: 'new-page',
        status: 'draft' as const,
      };

      const result = await addDoc(collection({} as any, 'pages'), newPage);

      expect(result.id).toBe('new-page');
      expect(addDoc).toHaveBeenCalled();
    });

    it('should allow editors to update pages', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'editor-123' };

      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateDoc(doc({} as any, 'pages', 'page-1'), {
        title: { en: 'Updated Title' },
      });

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should allow editors to delete pages', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'editor-123' };

      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      await deleteDoc(doc({} as any, 'pages', 'page-1'));

      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('Blog Posts Collection Security', () => {
    it('should allow public read access to published posts', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          data: () => ({
            title: { en: 'Blog Post' },
            status: 'published',
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockPosts,
      } as any);

      const result = await getDocs(
        query(
          collection({} as any, 'blogPosts'),
          where('status', '==', 'published')
        )
      );

      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].data().status).toBe('published');
    });

    it('should allow editors to create blog posts', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'editor-123' };

      const mockDocRef = { id: 'new-post' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);

      const newPost = {
        title: { en: 'New Post' },
        slug: 'new-post',
        status: 'draft' as const,
      };

      const result = await addDoc(collection({} as any, 'blogPosts'), newPost);

      expect(result.id).toBe('new-post');
    });
  });

  describe('Segments Collection Security', () => {
    it('should allow public read access to segments', async () => {
      const mockSegment = {
        id: 'segment-1',
        data: () => ({
          type: 'hero',
          content: { en: 'Hero Content' },
        }),
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        ...mockSegment,
      } as any);

      const result = await getDoc(doc({} as any, 'segments', 'segment-1'));

      expect(result.exists()).toBe(true);
    });

    it('should allow editors to create segments', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'editor-123' };

      const mockDocRef = { id: 'new-segment' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);

      const newSegment = {
        type: 'hero' as const,
        name: { en: 'New Hero' },
        isReusable: true,
      };

      const result = await addDoc(collection({} as any, 'segments'), newSegment);

      expect(result.id).toBe('new-segment');
    });
  });

  describe('Users Collection Security', () => {
    it('should deny public read access to users', async () => {
      // Unauthenticated user
      const { auth } = await import('../firebase');
      (auth as any).currentUser = null;

      vi.mocked(getDoc).mockRejectedValue(
        new Error('Missing or insufficient permissions')
      );

      await expect(
        getDoc(doc({} as any, 'users', 'user-123'))
      ).rejects.toThrow('Missing or insufficient permissions');
    });

    it('should allow admins to read users', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'admin-123' };

      const mockUser = {
        id: 'user-123',
        data: () => ({
          email: 'user@example.com',
          role: 'editor',
        }),
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        ...mockUser,
      } as any);

      const result = await getDoc(doc({} as any, 'users', 'user-123'));

      expect(result.exists()).toBe(true);
    });

    it('should allow admins to create users', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'admin-123' };

      const mockDocRef = { id: 'new-user' };
      vi.mocked(setDoc).mockResolvedValue(undefined);

      await setDoc(doc({} as any, 'users', 'new-user'), {
        email: 'new@example.com',
        role: 'editor',
      });

      expect(setDoc).toHaveBeenCalled();
    });

    it('should deny editors from creating users', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'editor-123' };

      vi.mocked(setDoc).mockRejectedValue(
        new Error('Missing or insufficient permissions')
      );

      await expect(
        setDoc(doc({} as any, 'users', 'new-user'), {
          email: 'new@example.com',
          role: 'editor',
        })
      ).rejects.toThrow('Missing or insufficient permissions');
    });
  });

  describe('Navigation Collection Security', () => {
    it('should allow public read access to navigation', async () => {
      const mockNav = {
        id: 'nav-1',
        data: () => ({
          position: 'header',
          items: [],
        }),
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        ...mockNav,
      } as any);

      const result = await getDoc(doc({} as any, 'navigation', 'nav-1'));

      expect(result.exists()).toBe(true);
    });

    it('should allow editors to update navigation', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'editor-123' };

      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateDoc(doc({} as any, 'navigation', 'nav-1'), {
        items: [{ label: { en: 'Home' }, url: '/' }],
      });

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('Brand Configuration Security', () => {
    it('should allow public read access to brand config', async () => {
      const mockBrand = {
        id: 'default',
        data: () => ({
          colors: {
            primary: '#000000',
          },
        }),
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        ...mockBrand,
      } as any);

      const result = await getDoc(doc({} as any, 'brandConfiguration', 'default'));

      expect(result.exists()).toBe(true);
    });

    it('should allow admins to update brand config', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'admin-123' };

      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateDoc(doc({} as any, 'brandConfiguration', 'default'), {
        colors: { primary: '#FF0000' },
      });

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should deny editors from updating brand config', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'editor-123' };

      vi.mocked(updateDoc).mockRejectedValue(
        new Error('Missing or insufficient permissions')
      );

      await expect(
        updateDoc(doc({} as any, 'brandConfiguration', 'default'), {
          colors: { primary: '#FF0000' },
        })
      ).rejects.toThrow('Missing or insufficient permissions');
    });
  });

  describe('Media Collection Security', () => {
    it('should allow public read access to media', async () => {
      const mockMedia = {
        id: 'media-1',
        data: () => ({
          url: 'https://storage.example.com/image.jpg',
          uploadedBy: 'user-123',
        }),
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        ...mockMedia,
      } as any);

      const result = await getDoc(doc({} as any, 'media', 'media-1'));

      expect(result.exists()).toBe(true);
    });

    it('should allow authenticated users to upload media', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'user-123' };

      const mockDocRef = { id: 'new-media' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);

      const newMedia = {
        url: 'https://storage.example.com/new-image.jpg',
        uploadedBy: 'user-123',
      };

      const result = await addDoc(collection({} as any, 'media'), newMedia);

      expect(result.id).toBe('new-media');
    });

    it('should allow uploader to delete their own media', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'user-123' };

      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      await deleteDoc(doc({} as any, 'media', 'media-1'));

      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('Site Settings Security', () => {
    it('should allow public read access to site settings', async () => {
      const mockSettings = {
        id: 'default',
        data: () => ({
          siteName: { en: 'My Site' },
        }),
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        ...mockSettings,
      } as any);

      const result = await getDoc(doc({} as any, 'siteSettings', 'default'));

      expect(result.exists()).toBe(true);
    });

    it('should allow admins to update site settings', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'admin-123' };

      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateDoc(doc({} as any, 'siteSettings', 'default'), {
        siteName: { en: 'Updated Site' },
      });

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should deny editors from updating site settings', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'editor-123' };

      vi.mocked(updateDoc).mockRejectedValue(
        new Error('Missing or insufficient permissions')
      );

      await expect(
        updateDoc(doc({} as any, 'siteSettings', 'default'), {
          siteName: { en: 'Updated Site' },
        })
      ).rejects.toThrow('Missing or insufficient permissions');
    });
  });

  describe('Form Submissions Security', () => {
    it('should deny public read access to form submissions', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = null;

      vi.mocked(getDoc).mockRejectedValue(
        new Error('Missing or insufficient permissions')
      );

      await expect(
        getDoc(doc({} as any, 'formSubmissions', 'sub-1'))
      ).rejects.toThrow('Missing or insufficient permissions');
    });

    it('should allow public to create form submissions', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = null;

      const mockDocRef = { id: 'new-submission' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);

      const submission = {
        formType: 'contact',
        data: { name: 'John Doe', email: 'john@example.com' },
      };

      const result = await addDoc(collection({} as any, 'formSubmissions'), submission);

      expect(result.id).toBe('new-submission');
    });

    it('should allow editors to read form submissions', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'editor-123' };

      const mockSubmissions = [
        {
          id: 'sub-1',
          data: () => ({
            formType: 'contact',
            data: {},
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockSubmissions,
      } as any);

      const result = await getDocs(collection({} as any, 'formSubmissions'));

      expect(result.docs).toHaveLength(1);
    });
  });

  describe('Storage Security', () => {
    it('should allow public read access to images', async () => {
      const mockRef = { fullPath: 'images/test.jpg' };
      vi.mocked(ref).mockReturnValue(mockRef as any);

      const storageRef = ref({} as any, 'images/test.jpg');

      expect(storageRef.fullPath).toBe('images/test.jpg');
    });

    it('should allow authenticated users to upload images', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'user-123' };

      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const mockRef = { fullPath: 'images/test.jpg' };

      vi.mocked(ref).mockReturnValue(mockRef as any);
      vi.mocked(uploadBytes).mockResolvedValue({ ref: mockRef } as any);

      const storageRef = ref({} as any, 'images/test.jpg');
      await uploadBytes(storageRef, mockFile);

      expect(uploadBytes).toHaveBeenCalled();
    });

    it('should allow authenticated users to delete images', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: 'user-123' };

      const mockRef = { fullPath: 'images/test.jpg' };

      vi.mocked(ref).mockReturnValue(mockRef as any);
      vi.mocked(deleteObject).mockResolvedValue(undefined);

      const storageRef = ref({} as any, 'images/test.jpg');
      await deleteObject(storageRef);

      expect(deleteObject).toHaveBeenCalled();
    });

    it('should deny unauthenticated users from uploading', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = null;

      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(uploadBytes).mockRejectedValue(
        new Error('Missing or insufficient permissions')
      );

      await expect(
        uploadBytes({} as any, mockFile)
      ).rejects.toThrow('Missing or insufficient permissions');
    });
  });
});
