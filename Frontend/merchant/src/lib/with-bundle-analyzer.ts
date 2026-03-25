import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import type { NextConfig } from 'next';

type NextWebpackConfig = Parameters<NonNullable<NextConfig['webpack']>>[0];
type NextWebpackContext = Parameters<NonNullable<NextConfig['webpack']>>[1];

interface WithBundleAnalyzerOptions {
  analyzerMode?: 'server' | 'static' | 'disabled';
  analyzerHost?: string;
  analyzerPort?: number;
  openAnalyzer?: boolean;
  generateStatsFile?: boolean;
  statsFilename?: string;
}

/**
 * Next.js plugin to add webpack bundle analyzer
 * Generates interactive treemap visualization of bundle contents
 */
export function withBundleAnalyzer(
  nextConfig: NextConfig,
  options: WithBundleAnalyzerOptions = {}
): NextConfig {
  const {
    analyzerMode = 'server',
    analyzerHost = '127.0.0.1',
    analyzerPort = 8888,
    openAnalyzer = true,
    generateStatsFile = true,
    statsFilename = 'stats.json',
  } = options;

  return {
    ...nextConfig,
    webpack: (config: NextWebpackConfig, context: NextWebpackContext) => {
      const { dev, isServer } = context;

      // Only run bundle analysis in production builds
      if (!dev && !isServer) {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode,
            analyzerHost,
            analyzerPort,
            openAnalyzer,
            generateStatsFile,
            statsFilename,
            logLevel: 'info',
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
