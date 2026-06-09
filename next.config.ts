import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to THIS tree. Several package-lock.json files exist up
  // the path (home dir, main repo, this worktree), so Turbopack otherwise infers
  // the wrong root and compiles the main repo's stale auth `src/middleware.ts`.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "places.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
