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

// Mock Neon Auth
vi.mock('@neondatabase/neon-auth-next', () => ({
  createAuthClient: vi.fn(() => ({
    useSession: () => ({ data: { user: null }, isLoading: false }),
    getSession: vi.fn(() => Promise.resolve(null)),
  })),
}))

vi.mock('@neondatabase/neon-auth-ui', () => ({
  AuthView: () => React.createElement('div', null, 'Auth View'),
  NeonAuthUIProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({ data: { user: null }, isLoading: false }),
    getSession: vi.fn(() => Promise.resolve(null)),
  },
}))

vi.mock('@/lib/auth', () => ({
  authClient: {
    getSession: vi.fn(() => Promise.resolve(null)),
  },
}))

// Mock animated components to render children immediately
vi.mock('@/components/landing/animated-section', () => ({
  AnimatedSection: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}))

// Mock visualization component
vi.mock('@/components/landing/variant-visualization', () => ({
  VariantVisualization: () => React.createElement('div', { 'data-testid': 'variant-visualization' }, 'Variant Visualization'),
}))
