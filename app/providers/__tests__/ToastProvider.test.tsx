import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { ToastProvider, useToast, __resetToastState } from '../ToastProvider';
import React from 'react';

// Mock the ToastContainer component to track renders
let mockToasts: Array<{ id: string; title: string; type: string; message?: string }> = [];

vi.mock('@mond-design-system/theme/client', () => {
  return {
    ToastContainer: vi.fn(({ toasts }) => {
      mockToasts = toasts;
      return null;
    }),
  };
});

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetToastState();
    mockToasts = [];
    cleanup();
  });

  afterEach(() => {
    cleanup();
    __resetToastState();
    mockToasts = [];
  });

  describe('useToast hook', () => {
    it('throws error when useToast used outside provider', () => {
      expect(() => {
        renderHook(() => useToast());
      }).toThrow('useToast must be used within a ToastProvider');
    });

    it('showSuccess adds success toast with correct properties', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showSuccess('Success Title', 'Success message');
      });

      expect(mockToasts.length).toBe(1);
      expect(mockToasts[0].type).toBe('success');
      expect(mockToasts[0].title).toBe('Success Title');
      expect(mockToasts[0].message).toBe('Success message');
    });

    it('showError adds error toast with correct properties', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showError('Error Title', 'Error message');
      });

      expect(mockToasts.length).toBe(1);
      expect(mockToasts[0].type).toBe('error');
      expect(mockToasts[0].title).toBe('Error Title');
      expect(mockToasts[0].message).toBe('Error message');
    });

    it('showWarning adds warning toast with correct properties', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showWarning('Warning Title', 'Warning message');
      });

      expect(mockToasts.length).toBe(1);
      expect(mockToasts[0].type).toBe('warning');
      expect(mockToasts[0].title).toBe('Warning Title');
      expect(mockToasts[0].message).toBe('Warning message');
    });

    it('showInfo adds info toast with correct properties', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showInfo('Info Title', 'Info message');
      });

      expect(mockToasts.length).toBe(1);
      expect(mockToasts[0].type).toBe('info');
      expect(mockToasts[0].title).toBe('Info Title');
      expect(mockToasts[0].message).toBe('Info message');
    });

    it('dismissToast removes toast by id', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showSuccess('Test Toast');
      });

      expect(mockToasts.length).toBe(1);
      const toastId = mockToasts[0].id;

      act(() => {
        result.current.dismissToast(toastId);
      });

      expect(mockToasts.length).toBe(0);
    });

    it('clearAllToasts removes all toasts', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showSuccess('Toast 1');
        result.current.showError('Toast 2');
        result.current.showInfo('Toast 3');
      });

      expect(mockToasts.length).toBe(3);

      act(() => {
        result.current.clearAllToasts();
      });

      expect(mockToasts.length).toBe(0);
    });

    it('Toast IDs are unique', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showSuccess('Toast 1');
        result.current.showSuccess('Toast 2');
        result.current.showSuccess('Toast 3');
      });

      expect(mockToasts.length).toBe(3);
      const toastIds = mockToasts.map(t => t.id);
      const uniqueIds = new Set(toastIds);

      expect(uniqueIds.size).toBe(3);
    });

    it('multiple toasts can be added and dismissed independently', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showSuccess('Toast 1');
        result.current.showError('Toast 2');
      });

      expect(mockToasts.length).toBe(2);

      const toast1Id = mockToasts.find(t => t.title === 'Toast 1')?.id;
      expect(toast1Id).toBeDefined();

      act(() => {
        result.current.dismissToast(toast1Id!);
      });

      expect(mockToasts.length).toBe(1);
      expect(mockToasts[0].title).toBe('Toast 2');
    });

    it('toast durations are set correctly by type', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showSuccess('Success');
      });
      expect(mockToasts[0]).toHaveProperty('duration');

      act(() => {
        result.current.clearAllToasts();
        result.current.showError('Error');
      });
      expect(mockToasts[0]).toHaveProperty('duration');

      act(() => {
        result.current.clearAllToasts();
        result.current.showWarning('Warning');
      });
      expect(mockToasts[0]).toHaveProperty('duration');

      act(() => {
        result.current.clearAllToasts();
        result.current.showInfo('Info');
      });
      expect(mockToasts[0]).toHaveProperty('duration');
    });
  });
});
