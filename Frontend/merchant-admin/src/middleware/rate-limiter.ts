import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  token: process.env.REDIS_PASSWORD || '',
});

// Create rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
});

export async function rateLimiter(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 
             request.headers.get('x-real-ip') ?? 
             '127.0.0.1';
  
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }
  
  return null; // Continue with request
}

// Alternative in-memory rate limiting for development
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function simpleRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 10000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries (avoid iterator issues)
  const entriesToDelete: string[] = [];
  requestCounts.forEach((value, key) => {
    if (value.resetTime < windowStart) {
      entriesToDelete.push(key);
    }
  });
  
  entriesToDelete.forEach(key => {
    requestCounts.delete(key);
  });
  
  const entry = requestCounts.get(identifier) || { count: 0, resetTime: now + windowMs };
  
  if (entry.count >= maxRequests) {
    return {
      success: false,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    };
  }
  
  entry.count++;
  requestCounts.set(identifier, entry);
  
  return { success: true };
}