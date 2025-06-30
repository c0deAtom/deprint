import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "ssl.gstatic.com",
     
      "m.media-amazon.com", // Add any other domains you want to allow
      "res.cloudinary.com", 
      "upload.wikimedia.org", // Cloudinary domain for uploaded images
      // e.g. "images.unsplash.com", "cdn.example.com"
    ],
  },
};

export default nextConfig;
