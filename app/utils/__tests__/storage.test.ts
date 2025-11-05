import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  uploadImage,
  deleteImage,
  uploadMultipleImages,
  validateImageFile,
  getStoragePathFromUrl,
} from '../storage';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { createDocument, deleteDocument } from '../firestore';

vi.mock('../firestore', () => ({
  createDocument: vi.fn(),
  deleteDocument: vi.fn(),
}));

describe('Storage Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload an image and create media document', async () => {
      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      const mockStorageRef = { fullPath: 'images/123_test.jpg' };
      const mockUrl = 'https://storage.googleapis.com/test/images/123_test.jpg';

      vi.mocked(ref).mockReturnValue(mockStorageRef as any);
      vi.mocked(uploadBytes).mockResolvedValue({ ref: mockStorageRef } as any);
      vi.mocked(getDownloadURL).mockResolvedValue(mockUrl);
      vi.mocked(createDocument).mockResolvedValue('media-id-123');

      const result = await uploadImage(mockFile, 'images', 'user-123');

      expect(result).toEqual({
        url: mockUrl,
        mediaId: 'media-id-123',
      });

      expect(uploadBytes).toHaveBeenCalledWith(
        mockStorageRef,
        mockFile,
        { contentType: 'image/jpeg' }
      );

      expect(createDocument).toHaveBeenCalledWith('media', {
        url: mockUrl,
        filename: 'test.jpg',
        contentType: 'image/jpeg',
        size: mockFile.size,
        uploadedBy: 'user-123',
      });
    });

    it('should upload to branding folder', async () => {
      const mockFile = new File(['logo'], 'logo.png', { type: 'image/png' });
      const mockStorageRef = {};
      const mockUrl = 'https://storage.googleapis.com/test/branding/logo.png';

      vi.mocked(ref).mockReturnValue(mockStorageRef as any);
      vi.mocked(uploadBytes).mockResolvedValue({ ref: mockStorageRef } as any);
      vi.mocked(getDownloadURL).mockResolvedValue(mockUrl);
      vi.mocked(createDocument).mockResolvedValue('media-id');

      await uploadImage(mockFile, 'branding', 'admin-123');

      expect(ref).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('branding/')
      );
    });

    it('should throw error on upload failure', async () => {
      const mockFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(ref).mockReturnValue({} as any);
      vi.mocked(uploadBytes).mockRejectedValue(new Error('Upload failed'));

      await expect(uploadImage(mockFile, 'images', 'user-123')).rejects.toThrow('Upload failed');
    });
  });

  describe('deleteImage', () => {
    it('should delete image from storage and firestore', async () => {
      const mockUrl = 'https://storage.googleapis.com/test/images/test.jpg';
      const mockStorageRef = {};

      vi.mocked(ref).mockReturnValue(mockStorageRef as any);
      vi.mocked(deleteObject).mockResolvedValue(undefined);
      vi.mocked(deleteDocument).mockResolvedValue(undefined);

      await deleteImage(mockUrl, 'media-id-123');

      expect(deleteObject).toHaveBeenCalledWith(mockStorageRef);
      expect(deleteDocument).toHaveBeenCalledWith('media', 'media-id-123');
    });

    it('should delete from storage only if no mediaId provided', async () => {
      const mockUrl = 'https://storage.googleapis.com/test/images/test.jpg';
      const mockStorageRef = {};

      vi.mocked(ref).mockReturnValue(mockStorageRef as any);
      vi.mocked(deleteObject).mockResolvedValue(undefined);

      await deleteImage(mockUrl);

      expect(deleteObject).toHaveBeenCalledWith(mockStorageRef);
      expect(deleteDocument).not.toHaveBeenCalled();
    });

    it('should throw error on delete failure', async () => {
      const mockUrl = 'https://storage.googleapis.com/test/images/test.jpg';

      vi.mocked(ref).mockReturnValue({} as any);
      vi.mocked(deleteObject).mockRejectedValue(new Error('Delete failed'));

      await expect(deleteImage(mockUrl)).rejects.toThrow('Delete failed');
    });
  });

  describe('uploadMultipleImages', () => {
    it('should upload multiple images', async () => {
      const files = [
        new File(['img1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['img2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      vi.mocked(ref).mockReturnValue({} as any);
      vi.mocked(uploadBytes).mockResolvedValue({ ref: {} } as any);
      vi.mocked(getDownloadURL).mockResolvedValueOnce('url1').mockResolvedValueOnce('url2');
      vi.mocked(createDocument).mockResolvedValueOnce('id1').mockResolvedValueOnce('id2');

      const result = await uploadMultipleImages(files, 'images', 'user-123');

      expect(result).toEqual([
        { url: 'url1', mediaId: 'id1' },
        { url: 'url2', mediaId: 'id2' },
      ]);
      expect(uploadBytes).toHaveBeenCalledTimes(2);
    });

    it('should throw error if any upload fails', async () => {
      const files = [
        new File(['img1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['img2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      vi.mocked(ref).mockReturnValue({} as any);
      vi.mocked(uploadBytes)
        .mockResolvedValueOnce({ ref: {} } as any)
        .mockRejectedValueOnce(new Error('Upload 2 failed'));

      await expect(uploadMultipleImages(files, 'images', 'user-123')).rejects.toThrow();
    });
  });

  describe('validateImageFile', () => {
    it('should validate valid JPEG file', () => {
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      expect(validateImageFile(file)).toBe(true);
    });

    it('should validate valid PNG file', () => {
      const file = new File(['image'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      expect(validateImageFile(file)).toBe(true);
    });

    it('should validate valid WebP file', () => {
      const file = new File(['image'], 'test.webp', { type: 'image/webp' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      expect(validateImageFile(file)).toBe(true);
    });

    it('should throw error for invalid file type', () => {
      const file = new File(['doc'], 'test.pdf', { type: 'application/pdf' });

      expect(() => validateImageFile(file)).toThrow('Invalid file type');
    });

    it('should throw error for file exceeding size limit', () => {
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB

      expect(() => validateImageFile(file, 5)).toThrow('File size exceeds 5MB limit');
    });

    it('should use custom size limit', () => {
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 8 * 1024 * 1024 }); // 8MB

      expect(validateImageFile(file, 10)).toBe(true);
      expect(() => validateImageFile(file, 5)).toThrow('File size exceeds 5MB limit');
    });
  });

  describe('getStoragePathFromUrl', () => {
    it('should extract storage path from download URL', () => {
      const url = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/images%2Ftest.jpg?alt=media';

      const path = getStoragePathFromUrl(url);

      expect(path).toBe('images/test.jpg');
    });

    it('should handle encoded paths', () => {
      const url = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/branding%2Fmy%20logo.png?alt=media';

      const path = getStoragePathFromUrl(url);

      expect(path).toBe('branding/my logo.png');
    });

    it('should throw error for invalid URL', () => {
      const invalidUrl = 'https://example.com/not-a-storage-url';

      expect(() => getStoragePathFromUrl(invalidUrl)).toThrow('Invalid storage URL');
    });
  });
});
