import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

describe('Storage Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload file and return download URL', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const mockRef = { fullPath: 'uploads/test.txt' };
      const mockUrl = 'https://storage.example.com/test.txt';

      vi.mocked(ref).mockReturnValue(mockRef as never);
      vi.mocked(uploadBytes).mockResolvedValue({ ref: mockRef } as never);
      vi.mocked(getDownloadURL).mockResolvedValue(mockUrl);

      const { uploadFile } = await import('../storage');
      const result = await uploadFile('uploads/test.txt', mockFile);

      expect(ref).toHaveBeenCalledWith(expect.anything(), 'uploads/test.txt');
      expect(uploadBytes).toHaveBeenCalledWith(mockRef, mockFile);
      expect(getDownloadURL).toHaveBeenCalledWith(mockRef);
      expect(result).toBe(mockUrl);
    });
  });

  describe('getFileUrl', () => {
    it('should get download URL for file', async () => {
      const mockRef = { fullPath: 'images/photo.jpg' };
      const mockUrl = 'https://storage.example.com/photo.jpg';

      vi.mocked(ref).mockReturnValue(mockRef as never);
      vi.mocked(getDownloadURL).mockResolvedValue(mockUrl);

      const { getFileUrl } = await import('../storage');
      const result = await getFileUrl('images/photo.jpg');

      expect(ref).toHaveBeenCalledWith(expect.anything(), 'images/photo.jpg');
      expect(getDownloadURL).toHaveBeenCalledWith(mockRef);
      expect(result).toBe(mockUrl);
    });
  });

  describe('deleteFile', () => {
    it('should delete file from storage', async () => {
      const mockRef = { fullPath: 'uploads/test.txt' };

      vi.mocked(ref).mockReturnValue(mockRef as never);
      vi.mocked(deleteObject).mockResolvedValue(undefined);

      const { deleteFile } = await import('../storage');
      await deleteFile('uploads/test.txt');

      expect(ref).toHaveBeenCalledWith(expect.anything(), 'uploads/test.txt');
      expect(deleteObject).toHaveBeenCalledWith(mockRef);
    });
  });
});
