/**
 * Example Next.js configuration with all performance optimizations
 * 
 * Copy this pattern to your next.config.js file
 */

const { withServiceWorker } = require('./src/lib/with-service-worker');
const { withBundleAnalyzer } = require('./src/lib/with-bundle-analyzer');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode in development
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react', '@tanstack/react-query'],
    webpackBuildWorker: true,
    swcThreadPlugins: true,
  },
  
  // Compression settings
  compress: true,
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/:all*(ttf|otf|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};

// Apply service worker plugin
const configWithSW = withServiceWorker(nextConfig, {
  swDest: 'public/sw.js',
  clientsClaim: true,
  skipWaiting: true,
});

// Apply bundle analyzer plugin (optional - only for analysis builds)
const finalConfig = withBundleAnalyzer(configWithSW, {
  analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled',
  analyzerPort: 8888,
  openAnalyzer: true,
  generateStatsFile: true,
});

module.exports = finalConfig;
