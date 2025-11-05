import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';

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

  describe('signOutUser', () => {
    it('should sign out current user', async () => {
      vi.mocked(signOut).mockResolvedValue(undefined);

      const { signOutUser } = await import('../auth');
      await signOutUser();

      expect(signOut).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('registerUser', () => {
    it('should create new user with email and password', async () => {
      const mockUser = { uid: '123', email: 'new@test.com' };
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as never);

      const { registerUser } = await import('../auth');
      const result = await registerUser('new@test.com', 'password123');

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'new@test.com',
        'password123'
      );
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined);

      const { resetPassword } = await import('../auth');
      await resetPassword('test@test.com');

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'test@test.com'
      );
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const mockUser = { uid: '123', email: 'test@test.com' };
      vi.mocked(updateProfile).mockResolvedValue(undefined);

      const { updateUserProfile } = await import('../auth');
      await updateUserProfile(mockUser as never, { displayName: 'Test User' });

      expect(updateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'Test User',
      });
    });
  });

  describe('onAuthChange', () => {
    it('should set up auth state listener', async () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(onAuthStateChanged).mockReturnValue(mockUnsubscribe);

      const { onAuthChange } = await import('../auth');
      const callback = vi.fn();
      const unsubscribe = onAuthChange(callback);

      expect(onAuthStateChanged).toHaveBeenCalledWith(
        expect.anything(),
        callback
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });
});
