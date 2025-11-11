import { describe, it, expect, vi, beforeEach } from 'vitest';
import { User } from 'firebase/auth';

// Mock firestore module
vi.mock('../firestore', () => ({
  getDocument: vi.fn(),
}));

describe('adminAuth Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isUserAdmin', () => {
    it('should return false if user is null', async () => {
      const { isUserAdmin } = await import('../adminAuth');
      const result = await isUserAdmin(null);

      expect(result).toBe(false);
    });

    it('should return true if user has admin role', async () => {
      const { getDocument } = await import('../firestore');
      const mockUser = { uid: 'admin123', email: 'admin@test.com' } as User;

      vi.mocked(getDocument).mockResolvedValue({
        id: 'admin123',
        email: 'admin@test.com',
        role: 'admin',
      });

      const { isUserAdmin } = await import('../adminAuth');
      const result = await isUserAdmin(mockUser);

      expect(getDocument).toHaveBeenCalledWith('users/admin123');
      expect(result).toBe(true);
    });

    it('should return false if user has editor role', async () => {
      const { getDocument } = await import('../firestore');
      const mockUser = { uid: 'editor123', email: 'editor@test.com' } as User;

      vi.mocked(getDocument).mockResolvedValue({
        id: 'editor123',
        email: 'editor@test.com',
        role: 'editor',
      });

      const { isUserAdmin } = await import('../adminAuth');
      const result = await isUserAdmin(mockUser);

      expect(getDocument).toHaveBeenCalledWith('users/editor123');
      expect(result).toBe(false);
    });

    it('should return false if user document does not exist', async () => {
      const { getDocument } = await import('../firestore');
      const mockUser = { uid: 'unknown123', email: 'unknown@test.com' } as User;

      vi.mocked(getDocument).mockResolvedValue(null);

      const { isUserAdmin } = await import('../adminAuth');
      const result = await isUserAdmin(mockUser);

      expect(getDocument).toHaveBeenCalledWith('users/unknown123');
      expect(result).toBe(false);
    });
  });
});
