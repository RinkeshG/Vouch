import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  // Compress responses for faster transfer
  compress: true,
  experimental: {
    // Tree-shake barrel imports for smaller bundles
    optimizePackageImports: ["@supabase/supabase-js", "@supabase/ssr"],
  },
};

export default nextConfig;
