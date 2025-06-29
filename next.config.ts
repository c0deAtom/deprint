import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "ssl.gstatic.com",
      "st2.depositphotos.com", 
      "m.media-amazon.com", // Add any other domains you want to allow
      "res.cloudinary.com", // Cloudinary domain for image uploads
      // e.g. "images.unsplash.com", "cdn.example.com"
    ],
  },
};

export default nextConfig;
