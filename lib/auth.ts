import { createAuthClient } from '@neondatabase/neon-js/auth/next';

// Server-side auth client - uses NEON_AUTH_BASE_URL from environment
export const authClient = createAuthClient()

