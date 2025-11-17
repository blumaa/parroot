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
    it('shows toast with correct properties', () => {
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

    it('dismisses toast by id', () => {
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

    it('handles multiple toasts independently', () => {
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
  });
});
