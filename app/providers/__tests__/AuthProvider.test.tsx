import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children', async () => {
    const { AuthProvider } = await import('../AuthProvider');

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should provide null user initially', async () => {
    const { AuthProvider, useAuth } = await import('../AuthProvider');

    function TestComponent() {
      const { user } = useAuth();
      return <div>{user ? 'User exists' : 'No user'}</div>;
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });
  });

  it('should set loading to false after auth state is determined', async () => {
    const { AuthProvider, useAuth } = await import('../AuthProvider');

    function TestComponent() {
      const { loading } = useAuth();
      return <div>{loading ? 'Loading' : 'Not loading'}</div>;
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not loading')).toBeInTheDocument();
    });
  });

  it('should throw error when useAuth is used outside AuthProvider', async () => {
    const { useAuth } = await import('../AuthProvider');

    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    function TestComponent() {
      useAuth();
      return <div>Test</div>;
    }

    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );

    consoleError.mockRestore();
  });
});
