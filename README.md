# Parroot Website Template

A flexible website template built on the Mond Design System with admin capabilities for content management and brand customization.

## Tech Stack

### Core Framework & Runtime
- **Next.js 16.0.1** (App Router)
- **React 19.2.0**
- **TypeScript** (strict mode)
- **Bun** - Package manager and runtime

### Styling & Design System
- **Mond Design System** (@mond-design-system/theme v1.26.0)
- Component-based styling with design tokens
- Built-in light/dark mode support
- Multi-brand theming capability

### Backend (Planned - See MDS-15)
- Firebase Firestore (database)
- Firebase Authentication
- Firebase Storage

### Testing
- **Vitest** - Unit and component testing
- **@testing-library/react** - Component testing utilities
- **jsdom** - DOM environment for tests
- **@vitest/coverage-v8** - Code coverage

### CI/CD
- **GitHub Actions** - Automated testing and builds
- Pipeline: Lint → Type Check → Test → Build

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) v1.0+
- Node.js 20.9.0+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd parroot

# Install dependencies
bun install
```

### Development

```bash
# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

The page auto-reloads when you edit files.

### Available Scripts

```bash
# Development
bun dev              # Start dev server with Turbopack

# Building
bun run build        # Create production build
bun start            # Start production server

# Code Quality
bun run lint         # Run ESLint
bunx tsc --noEmit   # Run TypeScript type checking

# Testing
bun run test         # Run tests once
bun run test:watch   # Run tests in watch mode
bun run test:coverage # Run tests with coverage report
```

## Project Structure

```
parroot/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   │
│   ├── providers/              # Context providers
│   │   └── AppThemeProvider.tsx # MDS theme provider wrapper
│   │
│   ├── components/             # Reusable components
│   │   ├── ui/                 # UI primitives
│   │   ├── layout/             # Layout components
│   │   ├── admin/              # Admin-specific components
│   │   └── sections/           # Page sections/segments
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions & services
│   └── __tests__/              # Test files
│
├── public/                     # Static assets
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
│
├── Configuration files
├── package.json
├── tsconfig.json
├── next.config.ts
├── vitest.config.ts
├── vitest.setup.ts
├── .eslintrc.json
└── .gitignore
```

## Using the Mond Design System

### Theme Provider

The app is wrapped with `AppThemeProvider` which provides the MDS theme context:

```tsx
// app/providers/AppThemeProvider.tsx
import { ThemeProvider } from "@mond-design-system/theme";

export function AppThemeProvider({ children }) {
  return (
    <ThemeProvider colorScheme="light" brand="default">
      {children}
    </ThemeProvider>
  );
}
```

### Using MDS Components

```tsx
import { Box, Heading, Text, Button } from "@mond-design-system/theme";

export default function MyPage() {
  return (
    <Box display="flex" flexDirection="column" gap={10} padding={20}>
      <Heading size="4xl" semantic="primary">
        Welcome
      </Heading>

      <Text size="lg" semantic="secondary">
        This text uses MDS design tokens
      </Text>

      <Button>Click Me</Button>
    </Box>
  );
}
```

### Design Tokens

MDS provides design tokens for:
- **Colors**: Semantic tokens that adapt to themes
- **Spacing**: Consistent spacing scale (0-64)
- **Typography**: Font sizes, weights, line heights
- **Borders**: Border radius values
- **Shadows**: Box shadow tokens

## Testing

### Writing Tests

Tests are located in `app/__tests__/` directories.

Example test:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppThemeProvider } from '../providers/AppThemeProvider';
import { Text } from '@mond-design-system/theme';

describe('MyComponent', () => {
  it('renders with MDS theme', () => {
    render(
      <AppThemeProvider>
        <Text>Hello World</Text>
      </AppThemeProvider>
    );

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
bun run test

# Watch mode for development
bun run test:watch

# With coverage report
bun run test:coverage
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration. On every push to `main` or pull request:

1. **Lint** - ESLint checks for code quality
2. **Type Check** - TypeScript compilation validation
3. **Test** - Vitest test suite
4. **Build** - Next.js production build

See `.github/workflows/ci.yml` for configuration.

## Next.js Configuration

### Turbopack

The project uses Turbopack for faster development builds (enabled by default in Next.js 16).

### Transpile Packages

MDS package is transpiled for proper ES module support:

```ts
// next.config.ts
const nextConfig = {
  transpilePackages: ["@mond-design-system/theme"],
};
```

## Environment Variables

Create a `.env.local` file for local development:

```env
# Firebase Configuration (when MDS-15 is implemented)
# NEXT_PUBLIC_FIREBASE_API_KEY=
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
# NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
# NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Roadmap

See Linear project "Parroot Website Template" for the full roadmap:

- ✅ **MDS-7**: Project setup with MDS integration
- 🔄 **MDS-15**: Firebase integration (in progress)
- ⏳ **MDS-8**: Admin panel foundation
- ⏳ **MDS-9**: Page management (CRUD)
- ⏳ **MDS-10**: Brand customization layer
- ⏳ **MDS-11**: Page type templates
- ⏳ **MDS-12**: Segment/block system
- ⏳ **MDS-13**: Visual page builder
- ⏳ **MDS-14**: Comprehensive testing suite

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Mond Design System](https://github.com/blumaa/mond-design-system)
- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Bun Documentation](https://bun.sh/docs)

## License

[Add your license here]
