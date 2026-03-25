import { GenerateSW } from 'workbox-webpack-plugin';
import type { NextConfig } from 'next';

type NextWebpackConfig = Parameters<NonNullable<NextConfig['webpack']>>[0];
type NextWebpackContext = Parameters<NonNullable<NextConfig['webpack']>>[1];

interface WithServiceWorkerOptions {
  swDest?: string;
  globDirectory?: string;
  clientsClaim?: boolean;
  skipWaiting?: boolean;
}

/**
 * Next.js plugin to generate service worker with Workbox
 */
export function withServiceWorker(
  nextConfig: NextConfig,
  options: WithServiceWorkerOptions = {}
): NextConfig {
  const {
    swDest = 'public/sw.js',
    clientsClaim = true,
    skipWaiting = true,
  } = options;

  return {
    ...nextConfig,
    webpack: (config: NextWebpackConfig, context: NextWebpackContext) => {
      const { dev, isServer } = context;

      // Only generate SW in production client builds
      if (!dev && !isServer) {
        config.plugins.push(
          new GenerateSW({
            swDest,
            clientsClaim,
            skipWaiting,
            globPatterns: [
              '**/*.{js,css,html,png,jpg,jpeg,svg,webp,woff,woff2}',
            ],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-webfonts',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                  },
                },
              },
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'images',
                  expiration: {
                    maxEntries: 60,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                  },
                },
              },
              {
                urlPattern: /\/api\//i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60, // 1 hour
                  },
                },
              },
            ],
          })
        );
      }

      // Call original webpack config if it exists
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, context);
      }

      return config;
    },
  };
}
