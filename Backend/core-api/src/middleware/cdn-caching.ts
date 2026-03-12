import { NextRequest, NextResponse } from 'next/server';

/**
 * CDN Caching Strategy for Static Assets
 * 
 * Implements:
 * - Cache-Control headers optimization
 * - Stale-while-revalidate pattern
 * - Asset fingerprinting support
 * - Portfolio image caching
 */

interface CacheConfig {
  // Asset type patterns
  staticAssets: string[];
  images: string[];
  apiResponses: string[];
  
  // Cache durations (in seconds)
  maxAge: {
    staticAssets: number;
    images: number;
    apiResponses: number;
  };
  
  // Revalidation (in seconds)
  staleWhileRevalidate: {
    staticAssets: number;
    images: number;
    apiResponses: number;
  };
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  staticAssets: [
    '/_next/static/',
    '/fonts/',
    '/icons/',
  ],
  images: [
    '/images/',
    '/portfolio/',
    '/uploads/',
    '/api/og/',
  ],
  apiResponses: [
    '/api/creative/dashboard/',
    '/api/creative/ai/',
  ],
  
  maxAge: {
    staticAssets: 31536000, // 1 year
    images: 86400, // 1 day
    apiResponses: 300, // 5 minutes
  },
  
  staleWhileRevalidate: {
    staticAssets: 86400, // 1 day
    images: 3600, // 1 hour
    apiResponses: 60, // 1 minute
  },
};

/**
 * Create CDN caching middleware
 */
export function createCDNCachingMiddleware(config?: Partial<CacheConfig>) {
  const finalConfig: CacheConfig = { ...DEFAULT_CACHE_CONFIG, ...config };

  return function cachingMiddleware(
    req: NextRequest,
    response: NextResponse
  ): NextResponse {
    const url = req.nextUrl.pathname;

    // Determine asset type
    let assetType: 'staticAssets' | 'images' | 'apiResponses' | null = null;

    if (finalConfig.staticAssets.some(pattern => url.startsWith(pattern))) {
      assetType = 'staticAssets';
    } else if (finalConfig.images.some(pattern => url.startsWith(pattern))) {
      assetType = 'images';
    } else if (finalConfig.apiResponses.some(pattern => url.startsWith(pattern))) {
      assetType = 'apiResponses';
    }

    // Apply caching headers if asset type matched
    if (assetType) {
      const maxAge = finalConfig.maxAge[assetType];
      const swr = finalConfig.staleWhileRevalidate[assetType];

      // Set Cache-Control header
      response.headers.set(
        'Cache-Control',
        `public, max-age=${maxAge}, stale-while-revalidate=${swr}`
      );

      // Add Vary header for content negotiation
      response.headers.set('Vary', 'Accept-Encoding');

      // Add CDN-specific headers
      response.headers.set('X-Cache-Status', 'HIT');
      response.headers.set('Surrogate-Control', `max-age=${maxAge}`);

      // For static assets with fingerprints, use immutable
      if (assetType === 'staticAssets' && hasFingerprint(url)) {
        response.headers.set('Cache-Control', `public, max-age=${maxAge}, immutable`);
      }
    }

    return response;
  };
}

/**
 * Check if URL has fingerprint/hash
 */
function hasFingerprint(url: string): boolean {
  // Match patterns like: file.[hash].ext or [hash]-file.ext
  const fingerprintPatterns = [
    /\.[a-f0-9]{8}\./,  // .abc12345.
    /\.[a-f0-9]{20}\./, // Next.js long hash
    /^\/[a-f0-9]{2}-/,  // /ab/- prefix
  ];

  return fingerprintPatterns.some(pattern => pattern.test(url));
}

/**
 * Purge CDN cache for specific paths
 * This would integrate with your CDN provider's API
 */
export async function purgeCDNCache(paths: string[]): Promise<void> {
  const cdnProvider = process.env.CDN_PROVIDER || 'vercel';

  try {
    if (cdnProvider === 'cloudflare') {
      await purgeCloudflareCache(paths);
    } else if (cdnProvider === 'fastly') {
      await purgeFastlyCache(paths);
    } else if (cdnProvider === 'vercel') {
      // Vercel automatically handles cache invalidation on deploy
      console.log('Vercel CDN cache will be invalidated on next deployment');
    }
  } catch (error) {
    console.error('Failed to purge CDN cache:', error);
  }
}

/**
 * Purge Cloudflare cache
 */
async function purgeCloudflareCache(paths: string[]): Promise<void> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiKey = process.env.CLOUDFLARE_API_KEY;

  if (!zoneId || !apiKey) {
    throw new Error('Cloudflare credentials not configured');
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: paths }),
    }
  );

  if (!response.ok) {
    throw new Error(`Cloudflare API error: ${response.status}`);
  }
}

/**
 * Purge Fastly cache
 */
async function purgeFastlyCache(paths: string[]): Promise<void> {
  const serviceId = process.env.FASTLY_SERVICE_ID;
  const apiKey = process.env.FASTLY_API_KEY;

  if (!serviceId || !apiKey) {
    throw new Error('Fastly credentials not configured');
  }

  // Soft purge (allows stale content while revalidating)
  const response = await fetch(
    `https://api.fastly.com/service/${serviceId}/soft_purge_all`,
    {
      method: 'POST',
      headers: {
        'Fastly-Key': apiKey,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Fastly API error: ${response.status}`);
  }
}

/**
 * Generate cache key with version
 */
export function generateCacheKey(path: string, version?: string): string {
  const v = version || process.env.NEXT_PUBLIC_APP_VERSION || 'latest';
  return `${path}?v=${v}`;
}
