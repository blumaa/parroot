import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppThemeProvider } from '../providers/AppThemeProvider';
import { Text } from '@mond-design-system/theme';

describe('Sample Test', () => {
  it('renders a text component with MDS theme', () => {
    render(
      <AppThemeProvider>
        <Text>Hello World</Text>
      </AppThemeProvider>
    );

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('basic math works', () => {
    expect(1 + 1).toBe(2);
  });
});
