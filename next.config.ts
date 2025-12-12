import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize server-only packages to prevent them from being bundled in client
  serverExternalPackages: ['async_hooks'],
  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {},
};

export default nextConfig;
