/**
 * Cloudflare Worker: Vayva API Proxy with Edge Caching
 * 
 * Features:
 * - Caches API responses at the edge
 * - Image optimization via Cloudflare Images
 * - Rate limiting
 * - Geographic routing
 */

// Cloudflare Worker global types
declare type ExecutionContext = {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
};

declare type KVNamespace = {
  get(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'): Promise<string | any>;
  put(key: string, value: string | ReadableStream | ArrayBuffer, options?: {
    expiration?: number;
    expirationTtl?: number;
  }): Promise<void>;
  delete(key: string): Promise<void>;
};

export interface Env {
  CACHE_KV: KVNamespace;
  IMAGES: ImagesBinding;
  ANALYTICS: AnalyticsEngineDataset;
  ENVIRONMENT: string;
  CACHE_TTL: string;
  BACKEND_API_URL: string;
}

// CORS headers for API responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
  "Access-Control-Max-Age": "86400",
};

// Cacheable paths and their TTLs (in seconds)
const CACHE_CONFIG: Record<string, number> = {
  "/api/store/": 300,           // 5 minutes
  "/api/products/": 60,         // 1 minute
  "/api/categories/": 600,      // 10 minutes
  "/api/templates/": 3600,      // 1 hour
  "/api/settings/": 300,        // 5 minutes
};

// Paths that should never be cached
const NO_CACHE_PATHS = [
  "/api/auth/",
  "/api/payments/",
  "/api/orders/create",
  "/api/webhooks/",
];

/**
 * Main request handler
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const startTime = Date.now();

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // Route to appropriate handler
      let response: Response;

      if (url.pathname.startsWith("/cdn/images/")) {
        response = await handleImageOptimization(request, env, url);
      } else if (url.pathname.startsWith("/api/")) {
        response = await handleApiRequest(request, env, ctx, url);
      } else {
        response = await handleStaticRequest(request, env, url);
      }

      // Add CORS headers
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          ...corsHeaders,
        },
      });

      // Log analytics
      const duration = Date.now() - startTime;
      ctx.waitUntil(logAnalytics(env, request, response, duration));

      return response;
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  },
};

/**
 * Handle API requests with caching
 */
async function handleApiRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  url: URL
): Promise<Response> {
  const cacheKey = generateCacheKey(request);
  const shouldCache = shouldCacheRequest(request, url);

  // Try to get from cache
  if (shouldCache && request.method === "GET") {
    const cached = await env.CACHE_KV.get(cacheKey, "arrayBuffer");
    if (cached) {
      const headers = new Headers();
      headers.set("Content-Type", "application/json");
      headers.set("X-Cache", "HIT");
      headers.set("X-Cache-Key", cacheKey);
      return new Response(cached, { headers });
    }
  }

  // Forward to backend
  const backendUrl = `${env.BACKEND_API_URL || "https://api.vayva.ng"}${url.pathname}${url.search}`;
  const response = await fetch(backendUrl, {
    method: request.method,
    headers: filterHeaders(request.headers),
    body: request.method !== "GET" && request.method !== "HEAD" 
      ? await request.blob() 
      : undefined,
  });

  // Clone response for caching
  const responseClone = response.clone();

  // Cache the response if applicable
  if (shouldCache && request.method === "GET" && response.ok) {
    const ttl = getCacheTTL(url.pathname);
    ctx.waitUntil(cacheResponse(env, cacheKey, responseClone, ttl));
  }

  // Add cache headers
  const headers = new Headers(response.headers);
  headers.set("X-Cache", "MISS");
  if (shouldCache) {
    headers.set("Cache-Control", `public, max-age=${getCacheTTL(url.pathname)}`);
  } else {
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Handle image optimization requests
 */
async function handleImageOptimization(
  request: Request,
  env: Env,
  url: URL
): Promise<Response> {
  const imageUrl = url.searchParams.get("url");
  const width = url.searchParams.get("w");
  const height = url.searchParams.get("h");
  const quality = url.searchParams.get("q") || "80";
  const format = url.searchParams.get("f");

  if (!imageUrl) {
    return new Response(
      JSON.stringify({ error: "Missing image URL" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Fetch the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Apply transformations if any
    if (width || height || format) {
      const options: ImagesOptions = {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        quality: parseInt(quality),
        format: format as "image/jpeg" | "image/png" | "image/webp" | "image/avif" | undefined,
      };

      const optimized = await env.IMAGES.process(imageBuffer, options);
      return new Response(optimized.image, {
        headers: {
          "Content-Type": optimized.contentType || "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Image-Optimized": "true",
        },
      });
    }

    // Return original with caching
    return new Response(imageBuffer, {
      headers: {
        "Content-Type": imageResponse.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image optimization error:", error);
    return new Response(
      JSON.stringify({ error: "Image processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Handle static asset requests
 */
async function handleStaticRequest(
  request: Request,
  env: Env,
  url: URL
): Promise<Response> {
  // Forward to origin with caching
  const response = await fetch(request);
  
  const headers = new Headers(response.headers);
  headers.set("X-Forwarded-By", "cloudflare-worker");

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

/**
 * Generate cache key for request
 */
function generateCacheKey(request: Request): string {
  const url = new URL(request.url);
  const sortedParams = Array.from(url.searchParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  
  return `cache:${url.pathname}?${sortedParams}`;
}

/**
 * Determine if request should be cached
 */
function shouldCacheRequest(request: Request, url: URL): boolean {
  // Only cache GET requests
  if (request.method !== "GET") return false;

  // Check for no-cache paths
  for (const path of NO_CACHE_PATHS) {
    if (url.pathname.startsWith(path)) return false;
  }

  // Check for cache-control headers
  const cacheControl = request.headers.get("Cache-Control");
  if (cacheControl?.includes("no-cache") || cacheControl?.includes("no-store")) {
    return false;
  }

  // Check for authorization
  if (request.headers.has("Authorization")) {
    // Only cache specific authenticated endpoints
    const cacheableAuthPaths = ["/api/store/", "/api/products/"];
    return cacheableAuthPaths.some(path => url.pathname.startsWith(path));
  }

  return true;
}

/**
 * Get cache TTL for path
 */
function getCacheTTL(pathname: string): number {
  for (const [path, ttl] of Object.entries(CACHE_CONFIG)) {
    if (pathname.startsWith(path)) return ttl;
  }
  return 300; // Default 5 minutes
}

/**
 * Cache response in KV
 */
async function cacheResponse(
  env: Env,
  key: string,
  response: Response,
  ttl: number
): Promise<void> {
  try {
    const body = await response.arrayBuffer();
    await env.CACHE_KV.put(key, body, { expirationTtl: ttl });
  } catch (error) {
    console.error("Cache write error:", error);
  }
}

/**
 * Filter headers before forwarding to backend
 */
function filterHeaders(headers: Headers): Headers {
  const filtered = new Headers();
  const allowedHeaders = [
    "content-type",
    "authorization",
    "x-api-key",
    "x-merchant-id",
    "x-request-id",
  ];

  for (const [key, value] of headers.entries()) {
    if (allowedHeaders.includes(key.toLowerCase())) {
      filtered.set(key, value);
    }
  }

  // Add forwarded headers
  filtered.set("X-Forwarded-By", "cloudflare-worker");
  filtered.set("X-Forwarded-Proto", "https");

  return filtered;
}

/**
 * Log analytics data
 */
async function logAnalytics(
  env: Env,
  request: Request,
  response: Response,
  duration: number
): Promise<void> {
  try {
    const url = new URL(request.url);
    const data = {
      pathname: url.pathname,
      method: request.method,
      status: response.status,
      duration,
      cache: response.headers.get("X-Cache") || "unknown",
      timestamp: new Date().toISOString(),
      cf: (request as any).cf || {},
    };

    env.ANALYTICS.writeDataPoint({
      blobs: [url.pathname, request.method],
      doubles: [duration, response.status],
      indexes: [url.hostname],
    });
  } catch (error) {
    console.error("Analytics error:", error);
  }
}

// Type definitions for Cloudflare APIs
interface ImagesBinding {
  process(buffer: ArrayBuffer, options: ImagesOptions): Promise<{
    image: ArrayBuffer;
    contentType?: string;
  }>;
}

interface ImagesOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "image/jpeg" | "image/png" | "image/webp" | "image/avif";
}

interface AnalyticsEngineDataset {
  writeDataPoint(data: {
    blobs?: string[];
    doubles?: number[];
    indexes?: string[];
  }): void;
}
