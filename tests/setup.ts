import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js Link component - just return children, ignore href
vi.mock('next/link', () => ({
  default: ({ children }: any) => children,
}))

// Mock Stack Auth
vi.mock('@stackframe/stack', () => ({
  StackProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  StackTheme: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  useUser: () => ({ user: null, isLoading: false }),
  useStackApp: () => ({
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}))

vi.mock('@/lib/stack', () => ({
  stackServerApp: {},
}))

// Mock animated components to render children immediately
vi.mock('@/components/landing/animated-section', () => ({
  AnimatedSection: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}))

// Mock visualization component
vi.mock('@/components/landing/variant-visualization', () => ({
  VariantVisualization: () => React.createElement('div', { 'data-testid': 'variant-visualization' }, 'Variant Visualization'),
}))
