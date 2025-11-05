import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  signIn,
  signOut,
  createUser,
  resetPassword,
  getCurrentUserRole,
  isAdmin,
  isEditor,
  getCurrentUser,
} from '../auth';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { createDocument, getDocument } from '../firestore';

vi.mock('../firestore', () => ({
  createDocument: vi.fn(),
  getDocument: vi.fn(),
  getUserByEmail: vi.fn(),
}));

describe('Authentication Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in user with email and password', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any);

      const result = await signIn('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });

    it('should throw error on invalid credentials', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error('Invalid credentials'));

      await expect(signIn('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signOut', () => {
    it('should sign out current user', async () => {
      vi.mocked(firebaseSignOut).mockResolvedValue(undefined);

      await signOut();

      expect(firebaseSignOut).toHaveBeenCalled();
    });

    it('should throw error on sign out failure', async () => {
      vi.mocked(firebaseSignOut).mockRejectedValue(new Error('Sign out failed'));

      await expect(signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('createUser', () => {
    it('should create a new user with role', async () => {
      const mockUser = { uid: 'new-uid', email: 'new@example.com' };
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any);
      vi.mocked(updateProfile).mockResolvedValue(undefined);
      vi.mocked(createDocument).mockResolvedValue('doc-id');

      const result = await createUser('new@example.com', 'password123', 'John Doe', 'editor');

      expect(result).toBe('new-uid');
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'new@example.com',
        'password123'
      );
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'John Doe' });
      expect(createDocument).toHaveBeenCalledWith('users', {
        email: 'new@example.com',
        displayName: 'John Doe',
        role: 'editor',
      });
    });

    it('should create admin user', async () => {
      const mockUser = { uid: 'admin-uid', email: 'admin@example.com' };
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any);
      vi.mocked(updateProfile).mockResolvedValue(undefined);
      vi.mocked(createDocument).mockResolvedValue('doc-id');

      await createUser('admin@example.com', 'password123', 'Admin User', 'admin');

      expect(createDocument).toHaveBeenCalledWith('users', {
        email: 'admin@example.com',
        displayName: 'Admin User',
        role: 'admin',
      });
    });

    it('should throw error on user creation failure', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(new Error('Email already exists'));

      await expect(
        createUser('existing@example.com', 'password123', 'Test', 'editor')
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined);

      await resetPassword('user@example.com');

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'user@example.com'
      );
    });

    it('should throw error if email does not exist', async () => {
      vi.mocked(sendPasswordResetEmail).mockRejectedValue(new Error('User not found'));

      await expect(resetPassword('nonexistent@example.com')).rejects.toThrow('User not found');
    });
  });

  describe('getCurrentUserRole', () => {
    it('should return user role for authenticated user', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: '123' };

      vi.mocked(getDocument).mockResolvedValue({
        id: '123',
        role: 'admin',
      } as any);

      const role = await getCurrentUserRole();

      expect(role).toBe('admin');
      expect(getDocument).toHaveBeenCalledWith('users', '123');
    });

    it('should return null if no user is authenticated', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = null;

      const role = await getCurrentUserRole();

      expect(role).toBeNull();
    });

    it('should return null if user document does not exist', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: '123' };

      vi.mocked(getDocument).mockResolvedValue(null);

      const role = await getCurrentUserRole();

      expect(role).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin users', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: '123' };

      vi.mocked(getDocument).mockResolvedValue({
        id: '123',
        role: 'admin',
      } as any);

      const result = await isAdmin();

      expect(result).toBe(true);
    });

    it('should return false for editor users', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: '123' };

      vi.mocked(getDocument).mockResolvedValue({
        id: '123',
        role: 'editor',
      } as any);

      const result = await isAdmin();

      expect(result).toBe(false);
    });

    it('should return false for unauthenticated users', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = null;

      const result = await isAdmin();

      expect(result).toBe(false);
    });
  });

  describe('isEditor', () => {
    it('should return true for admin users', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: '123' };

      vi.mocked(getDocument).mockResolvedValue({
        id: '123',
        role: 'admin',
      } as any);

      const result = await isEditor();

      expect(result).toBe(true);
    });

    it('should return true for editor users', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: '123' };

      vi.mocked(getDocument).mockResolvedValue({
        id: '123',
        role: 'editor',
      } as any);

      const result = await isEditor();

      expect(result).toBe(true);
    });

    it('should return false for unauthenticated users', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = null;

      const result = await isEditor();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = { uid: '123' };

      const mockUserData = {
        id: '123',
        email: 'user@example.com',
        role: 'editor',
        displayName: 'Test User',
      };

      vi.mocked(getDocument).mockResolvedValue(mockUserData as any);

      const result = await getCurrentUser();

      expect(result).toEqual(mockUserData);
    });

    it('should return null if not authenticated', async () => {
      const { auth } = await import('../firebase');
      (auth as any).currentUser = null;

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });
  });
});
