import { NextRequest } from 'next/server';
import { createErrorResponse, ApiLogger } from '@/lib/validation';

// Rate limiting for image proxy
const RATE_LIMIT = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = RATE_LIMIT.get(ip);

  if (!window || now > window.resetTime) {
    RATE_LIMIT.set(ip, {
      count: 1,
      resetTime: now + 60000, // 1 minute window
    });
    return true;
  }

  if (window.count >= 20) { // 20 requests per minute
    return false;
  }

  window.count++;
  RATE_LIMIT.set(ip, window);
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting
    if (!checkRateLimit(ip)) {
      ApiLogger.warn('Image proxy rate limit exceeded', { ip });
      return createErrorResponse('Rate limit exceeded', 429);
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const transformations = searchParams.toString().replace(`url=${encodeURIComponent(imageUrl || '')}&`, '');

    if (!imageUrl) {
      return createErrorResponse('Image URL is required', 400);
    }

    // Validate image URL
    try {
      new URL(imageUrl);
    } catch {
      return createErrorResponse('Invalid image URL', 400);
    }

    // Security: Only allow certain domains
    const allowedDomains = [
      'images.unsplash.com',
      'res.cloudinary.com',
      'picsum.photos',
      'placehold.co'
    ];

    const imageDomain = new URL(imageUrl).hostname;
    if (!allowedDomains.includes(imageDomain)) {
      ApiLogger.warn('Blocked image domain', { domain: imageDomain, ip });
      return createErrorResponse('Image domain not allowed', 403);
    }

    // Fetch and proxy the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Vayva-Fashion-Template/1.0',
      },
    });

    if (!response.ok) {
      ApiLogger.error('Failed to fetch image', { 
        status: response.status, 
        url: imageUrl,
        ip
      });
      return createErrorResponse('Failed to fetch image', 502);
    }

    // Return the image with proper caching headers
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const cacheControl = 'public, max-age=31536000, immutable'; // 1 year cache

    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'Content-Security-Policy': "img-src 'self' data: https:;",
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    ApiLogger.error('Image proxy error', error);
    return createErrorResponse('Internal server error', 500);
  }
}