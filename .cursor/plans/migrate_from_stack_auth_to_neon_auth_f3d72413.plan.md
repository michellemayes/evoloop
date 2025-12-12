---
name: Migrate from Stack Auth to Neon Auth
overview: Migrate the authentication system from Stack Auth to Neon Auth (Better Auth), replacing all Stack Auth dependencies, environment variables, and code references with the new Neon Auth implementation.
todos:
  - id: update-dependencies
    content: "Update package.json: remove @stackframe/stack, add @neondatabase/neon-auth-next and @neondatabase/neon-auth-ui"
    status: completed
  - id: create-auth-client
    content: Create lib/auth.ts with createAuthClient from Neon Auth, replacing lib/stack.ts
    status: completed
    dependencies:
      - update-dependencies
  - id: update-root-layout
    content: Update app/layout.tsx to remove StackProvider/StackTheme and use Neon Auth
    status: completed
    dependencies:
      - create-auth-client
  - id: update-dashboard-layout
    content: Update app/(dashboard)/layout.tsx to use Neon Auth session check instead of stackServerApp.getUser
    status: completed
    dependencies:
      - create-auth-client
  - id: update-api-routes
    content: Update app/api/sites/route.ts to use Neon Auth session instead of stackServerApp.getUser
    status: completed
    dependencies:
      - create-auth-client
  - id: update-client-components
    content: Update components/dashboard/header.tsx and app/(dashboard)/dashboard/settings/page.tsx to use authClient.useSession()
    status: completed
    dependencies:
      - create-auth-client
  - id: update-auth-handler
    content: Replace app/handler/[...stack]/page.tsx with Neon Auth UI component (AuthView)
    status: completed
    dependencies:
      - update-dependencies
  - id: update-middleware
    content: Update middleware.ts to handle new Neon Auth routes
    status: completed
    dependencies:
      - update-auth-handler
  - id: update-test-mocks
    content: Update tests/setup.ts to mock Neon Auth instead of Stack Auth
    status: completed
    dependencies:
      - create-auth-client
  - id: update-documentation
    content: Update README.md and docs/TECHNICAL.md with new environment variable (NEXT_PUBLIC_NEON_AUTH_URL)
    status: completed
  - id: update-auth-links
    content: Update all /handler/* links to new Neon Auth routes throughout the codebase
    status: completed
    dependencies:
      - update-auth-handler
---

# Migrate from Stack Auth to Neon Auth

## Overview

Replace Stack Auth with Neon Auth (Better Auth) which uses a single environment variable (`NEXT_PUBLIC_NEON_AUTH_URL`) instead of multiple Stack Auth keys. This simplifies configuration and provides native database branching support.

## Changes Required

### 1. Update Dependencies (`package.json`)

- Remove: `@stackframe/stack`
- Add: `@neondatabase/neon-auth-next` and `@neondatabase/neon-auth-ui`

### 2. Replace Server-Side Auth (`lib/stack.ts`)

- Replace `StackServerApp` with `createAuthClient` from `@neondatabase/neon-auth-next`
- Update initialization to use `NEXT_PUBLIC_NEON_AUTH_URL` environment variable
- Rename file to `lib/auth.ts` for clarity

### 3. Update Root Layout (`app/layout.tsx`)

- Remove `StackProvider` and `StackTheme` imports
- Replace with Neon Auth provider (if needed) or remove wrapper entirely
- Update to use new auth client

### 4. Update Dashboard Layout (`app/(dashboard)/layout.tsx`)

- Replace `stackServerApp.getUser({ or: "redirect" })` with Neon Auth session check
- Use `authClient.useSession()` or server-side session verification

### 5. Update API Routes (`app/api/sites/route.ts`)

- Replace `stackServerApp.getUser()` with Neon Auth session retrieval
- Update user ID access pattern (may differ between Stack Auth and Better Auth)

### 6. Update Client Components

- **`components/dashboard/header.tsx`**: Replace `useUser()` from Stack Auth with `authClient.useSession()`
- **`app/(dashboard)/dashboard/settings/page.tsx`**: Replace `useUser()` with Neon Auth session hook
- Update user property access (e.g., `user.primaryEmail` → `user.email`)

### 7. Replace Auth Handler Route (`app/handler/[...stack]/page.tsx`)

- Replace `StackHandler` with Neon Auth UI component (`AuthView` from `@neondatabase/neon-auth-ui`)
- Update route structure if needed (may need to change from `/handler/[...stack]` to `/auth/[...auth]`)

### 8. Update Middleware (`middleware.ts`)

- Update route matching to handle new auth routes
- Remove Stack Auth-specific handler route logic

### 9. Update Test Mocks (`tests/setup.ts`)

- Replace Stack Auth mocks with Neon Auth mocks
- Update `useUser` mock to match Better Auth session structure

### 10. Update Documentation

- **`README.md`**: Update environment variables section
  - Remove: `NEXT_PUBLIC_STACK_PROJECT_ID`, `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`, `STACK_SECRET_SERVER_KEY`
  - Add: `NEXT_PUBLIC_NEON_AUTH_URL`
- **`docs/TECHNICAL.md`**: Update auth section with new environment variables

### 11. Update Links/References

- Update all `/handler/account-settings` links to new auth routes
- Update `/handler/sign-out` links to new sign-out route
- Check for any other Stack Auth route references

## Environment Variable Changes

**Before:**

```env
NEXT_PUBLIC_STACK_PROJECT_ID=your-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your-key
STACK_SECRET_SERVER_KEY=your-secret
```

**After:**

```env
NEXT_PUBLIC_NEON_AUTH_URL=https://ep-xxx.neonauth.us-east-2.aws.neon.build/neondb/auth
```

The Neon Auth URL can be found in the Neon Console under **Auth** → **Configuration**.

## Key Code Changes

### Server-Side Auth Client

```typescript
// lib/auth.ts (renamed from lib/stack.ts)
import { createAuthClient } from '@neondatabase/neon-auth-next';

export const authClient = createAuthClient({
  url: process.env.NEXT_PUBLIC_NEON_AUTH_URL!,
});
```

### Client-Side Session Hook

```typescript
// Replace useUser() with:
const { data: session } = authClient.useSession();
const user = session?.user;
```

### Server-Side Session Check

```typescript
// Replace stackServerApp.getUser() with:
const session = await authClient.getSession();
if (!session) {
  redirect('/sign-in');
}
```

## Testing Checklist

- [ ] Verify sign-in/sign-up flow works
- [ ] Verify protected routes redirect when not authenticated
- [ ] Verify user data displays correctly in header and settings
- [ ] Verify API routes correctly identify authenticated users
- [ ] Verify sign-out functionality
- [ ] Update and verify test mocks work correctly

## Notes

- User property names may differ between Stack Auth and Better Auth (e.g., `primaryEmail` vs `email`)
- Auth routes may need to be restructured (e.g., `/handler/[...stack]` → `/auth/[...auth]`)
- The migration page mentioned only needing the Vite public URL, which aligns with `NEXT_PUBLIC_NEON_AUTH_URL`