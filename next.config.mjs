/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization for property photos from scraped sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mubawab.ma',
      },
      {
        protocol: 'https',
        hostname: '**.avito.ma',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Optimize for 4G in the Medina
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
