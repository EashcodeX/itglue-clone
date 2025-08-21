/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel-optimized configuration
  compress: true,
  poweredByHeader: false,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  


  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Note: Security headers and redirects don't work with static export
  // They should be configured at the CDN/server level (CloudFront, etc.)
  
  // Build optimization
  // experimental: {
  //   optimizeCss: true,
  // },

  // Disable ESLint during build for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during build for faster deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuration for AWS Amplify deployment
  // Amplify handles server-side rendering and API routes automatically

  // Disable image optimization for static export
  images: {
    unoptimized: true,
    domains: ['your-domain.com', 'images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
}

module.exports = nextConfig
