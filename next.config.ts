import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "ssl.gstatic.com", // Add any other domains you want to allow
      // e.g. "images.unsplash.com", "cdn.example.com"
    ],
  },
};

export default nextConfig;
