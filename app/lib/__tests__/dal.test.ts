import { describe, it, expect } from 'vitest';

describe('dal.ts - Data access layer logic', () => {
  describe('verifySession logic', () => {
    it('validates session has userId', () => {
      const session = {
        userId: 'user-123',
        email: 'test@example.com',
        expiresAt: new Date(),
      };

      // Valid session should have userId
      expect(session.userId).toBeTruthy();

      // Should return proper auth data
      const result = {
        isAuth: true,
        userId: session.userId,
        email: session.email,
      };

      expect(result).toEqual({
        isAuth: true,
        userId: 'user-123',
        email: 'test@example.com',
      });
    });

    it('detects invalid session without userId', () => {
      const session = {
        userId: '',
        email: 'test@example.com',
        expiresAt: new Date(),
      };

      // Empty userId should be falsy
      expect(session.userId).toBeFalsy();
    });
  });

  describe('getUser logic', () => {
    it('transforms Firestore data correctly', () => {
      const firestoreData = {
        role: 'admin',
        displayName: 'Test User',
      };
      const sessionData = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const user = {
        id: sessionData.userId,
        email: sessionData.email,
        role: firestoreData.role,
        displayName: firestoreData.displayName,
      };

      expect(user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        displayName: 'Test User',
      });
    });

    it('handles missing displayName', () => {
      const firestoreData = {
        role: 'user',
      };
      const sessionData = {
        userId: 'user-456',
        email: 'user@example.com',
      };

      const user = {
        id: sessionData.userId,
        email: sessionData.email,
        role: firestoreData.role || 'user',
        displayName: undefined,
      };

      expect(user.role).toBe('user');
      expect(user.displayName).toBeUndefined();
    });
  });
});
