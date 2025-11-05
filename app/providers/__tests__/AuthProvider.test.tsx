import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthProvider';
import { onAuthStateChanged } from 'firebase/auth';
import { getCurrentUser } from '../../utils/auth';

vi.mock('../../utils/auth', () => ({
  getCurrentUser: vi.fn(),
}));

// Test component that uses the auth hook
function TestComponent() {
  const { user, userData, loading, isAdmin, isEditor } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="userData">{userData ? userData.displayName : 'No userData'}</div>
      <div data-testid="isAdmin">{isAdmin ? 'true' : 'false'}</div>
      <div data-testid="isEditor">{isEditor ? 'true' : 'false'}</div>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide loading state initially', () => {
    let onAuthCallback: any;
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      onAuthCallback = callback;
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should provide null user when not authenticated', async () => {
    let onAuthCallback: any;
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      onAuthCallback = callback;
      setTimeout(() => callback(null), 0);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('userData')).toHaveTextContent('No userData');
      expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
      expect(screen.getByTestId('isEditor')).toHaveTextContent('false');
    });
  });

  it('should provide user data when authenticated as admin', async () => {
    const mockFirebaseUser = {
      uid: '123',
      email: 'admin@example.com',
    };

    const mockUserData = {
      id: '123',
      email: 'admin@example.com',
      displayName: 'Admin User',
      role: 'admin' as const,
    };

    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      setTimeout(() => callback(mockFirebaseUser as any), 0);
      return vi.fn();
    });

    vi.mocked(getCurrentUser).mockResolvedValue(mockUserData as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('admin@example.com');
      expect(screen.getByTestId('userData')).toHaveTextContent('Admin User');
      expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
      expect(screen.getByTestId('isEditor')).toHaveTextContent('true');
    });
  });

  it('should provide user data when authenticated as editor', async () => {
    const mockFirebaseUser = {
      uid: '456',
      email: 'editor@example.com',
    };

    const mockUserData = {
      id: '456',
      email: 'editor@example.com',
      displayName: 'Editor User',
      role: 'editor' as const,
    };

    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      setTimeout(() => callback(mockFirebaseUser as any), 0);
      return vi.fn();
    });

    vi.mocked(getCurrentUser).mockResolvedValue(mockUserData as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('editor@example.com');
      expect(screen.getByTestId('userData')).toHaveTextContent('Editor User');
      expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
      expect(screen.getByTestId('isEditor')).toHaveTextContent('true');
    });
  });

  it('should update when auth state changes', async () => {
    let onAuthCallback: any;
    const unsubscribe = vi.fn();

    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      onAuthCallback = callback;
      return unsubscribe;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially no user
    onAuthCallback(null);
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    // User signs in
    const mockFirebaseUser = {
      uid: '123',
      email: 'user@example.com',
    };

    const mockUserData = {
      id: '123',
      email: 'user@example.com',
      displayName: 'Test User',
      role: 'editor' as const,
    };

    vi.mocked(getCurrentUser).mockResolvedValue(mockUserData as any);

    onAuthCallback(mockFirebaseUser as any);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('user@example.com');
      expect(screen.getByTestId('userData')).toHaveTextContent('Test User');
    });
  });

  it('should unsubscribe from auth state on unmount', () => {
    const unsubscribe = vi.fn();

    vi.mocked(onAuthStateChanged).mockReturnValue(unsubscribe);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('should provide auth context within provider', () => {
    let onAuthCallback: any;
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      onAuthCallback = callback;
      setTimeout(() => callback(null), 0);
      return vi.fn();
    });

    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Verify the component can access auth context successfully
    waitFor(() => {
      expect(screen.getByTestId('user')).toBeInTheDocument();
    });
  });
});
