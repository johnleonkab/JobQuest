import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "img.logo.dev",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
  // Configure Turbopack (empty config to use webpack for PWA)
  turbopack: undefined,
};

export default nextConfig;

