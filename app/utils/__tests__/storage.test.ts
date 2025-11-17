import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
});
