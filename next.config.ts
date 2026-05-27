import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables "use cache", cacheTag(), and cacheLife() in Next.js 16
  cacheComponents: true,
};

export default nextConfig;
