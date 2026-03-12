/**
 * Multi-Tenant Middleware
 * 
 * Handles subdomain routing and custom domain resolution
 * - Routes storename.vayva.ng to appropriate merchant store
 * - Handles custom domains (www.merchant.com)
 * - Sets tenant headers for downstream consumption
 */

import { NextResponse, type NextRequest } from 'next/server';

const VAYVA_DOMAIN = process.env.NEXT_PUBLIC_VAYVA_DOMAIN || 'vayva.ng';

// In production, fetch from database or cache
// This is a mock - replace with actual API call
async function getStoreByHostname(hostname: string): Promise<{
  storeId: string;
  storeName: string;
  templateId: string;
  customDomain?: string;
  status: 'active' | 'inactive' | 'suspended';
} | null> {
  // Mock lookup - in production, query your database
  const cleanHostname = hostname.split(':')[0].toLowerCase();
  
  // Extract store slug from subdomain
  let storeSlug: string | null = null;
  
  if (cleanHostname.endsWith(`.${VAYVA_DOMAIN}`)) {
    storeSlug = cleanHostname.replace(`.${VAYVA_DOMAIN}`, '');
  } else if (cleanHostname !== VAYVA_DOMAIN && cleanHostname !== `www.${VAYVA_DOMAIN}`) {
    // Custom domain - lookup by domain
    storeSlug = cleanHostname.replace(/\./g, '-');
  }
  
  if (!storeSlug || storeSlug === 'www') {
    return null;
  }
  
  // Mock store data - replace with database query
  return {
    storeId: storeSlug,
    storeName: storeSlug.charAt(0).toUpperCase() + storeSlug.slice(1),
    templateId: 'standard', // Default or merchant's selected template
    customDomain: cleanHostname.includes(VAYVA_DOMAIN) ? undefined : cleanHostname,
    status: 'active',
  };
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|css|js|ico)$/)
  ) {
    const response = NextResponse.next();
    // Add security headers even for static files
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
  }
  
  // Check if it's the main domain (marketing site)
  const cleanHostname = hostname.split(':')[0].toLowerCase();
  if (cleanHostname === VAYVA_DOMAIN || cleanHostname === `www.${VAYVA_DOMAIN}`) {
    // Allow access to main site
    return NextResponse.next();
  }
  
  // Resolve tenant
  const store = await getStoreByHostname(hostname);
  
  if (!store) {
    // Store not found - could redirect to "create store" page or 404
    return NextResponse.rewrite(new URL('/store-not-found', request.url));
  }
  
  if (store.status !== 'active') {
    // Store suspended or inactive
    return NextResponse.rewrite(new URL('/store-inactive', request.url));
  }
  
  // Clone the request headers and add tenant information
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-store-id', store.storeId);
  requestHeaders.set('x-store-name', store.storeName);
  requestHeaders.set('x-template-id', store.templateId);
  requestHeaders.set('x-store-hostname', hostname);
  
  if (store.customDomain) {
    requestHeaders.set('x-custom-domain', store.customDomain);
  }
  
  // Rewrite to the store page with tenant headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - API routes
     * - Static files
     * - _next internal routes
     */
    '/((?!api|_next|static|favicon.ico).*)',
  ],
};
