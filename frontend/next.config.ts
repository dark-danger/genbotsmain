import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // In local dev: proxy /api/backend/* → backend FastAPI
      {
        source: "/api/backend/:path*",
        destination: "http://localhost:8000/:path*",
      },
      // In local dev: proxy /uploads/* → backend static files
      {
        source: "/uploads/:path*",
        destination: "http://localhost:8000/uploads/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**.vercel.app" },
      { protocol: "https", hostname: "**.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
