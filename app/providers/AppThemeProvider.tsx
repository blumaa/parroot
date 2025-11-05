"use client";

import { ThemeProvider } from "@mond-design-system/theme";

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider colorScheme="light" brand="default">
      {children}
    </ThemeProvider>
  );
}
