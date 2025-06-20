/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'static1.xdaimages.com',
      "images.unsplash.com",
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig 