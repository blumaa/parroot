import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInWithEmailAndPassword } from 'firebase/auth';

describe('Auth Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInUser', () => {
    it('should sign in user with email and password', async () => {
      const mockUser = { uid: '123', email: 'test@test.com' };
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as never);

      const { signInUser } = await import('../auth');
      const result = await signInUser('test@test.com', 'password123');

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@test.com',
        'password123'
      );
      expect(result.user).toEqual(mockUser);
    });
  });
});
