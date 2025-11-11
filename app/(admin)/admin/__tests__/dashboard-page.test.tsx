import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import DashboardPage from '../page';

// Mock MDS components
vi.mock('@mond-design-system/theme', () => ({
  Box: ({ children, ...props }: React.ComponentProps<'div'>) => <div data-testid="mds-box" {...props}>{children}</div>,
  Heading: ({ children, level, ...props }: { children: React.ReactNode; level: number; [key: string]: unknown }) => <div data-testid={`heading-${level}`} {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
}));

describe('DashboardPage', () => {
  it('renders Dashboard title', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders Welcome message', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
  });

  it('renders metrics placeholders', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Total Pages')).toBeInTheDocument();
    expect(screen.getByText('Total Posts')).toBeInTheDocument();
  });

  it('renders all metrics with 0 values', () => {
    render(<DashboardPage />);
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(3);
  });
});
