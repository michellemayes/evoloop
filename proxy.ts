import { neonAuthMiddleware } from "@neondatabase/neon-js/auth/next";

export default neonAuthMiddleware({
  // Redirects unauthenticated users to sign-in page
  loginUrl: "/auth/sign-in",
  // You can add custom logic here to set user info in cookies
  // after successful authentication
});

export const config = {
  matcher: [
    // Protected routes requiring authentication
    "/dashboard/:path*",
  ],
};
