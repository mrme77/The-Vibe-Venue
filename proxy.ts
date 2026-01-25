/**
 * Next.js Edge Proxy
 * Runs before all API routes to provide global rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getClientIP, calculateRetryAfter } from './lib/rate-limiter';

/**
 * Proxy function that runs on Edge before API routes
 * Implements global rate limiting: 30 requests per minute per IP
 */
export function middleware(request: NextRequest) {
  // Extract client IP
  const ip = getClientIP(request);

  // Global rate limit: 30 requests per minute per IP across all routes
  const result = rateLimiter.check(`global:${ip}`, 30, 60000);

  if (!result.allowed) {
    const retryAfter = calculateRetryAfter(result);

    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
        },
      }
    );
  }

  // Add rate limit headers to response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', '30');
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

  return response;
}

/**
 * Configure which routes the proxy runs on
 * Only runs on API routes (/api/*)
 */
export const config = {
  matcher: '/api/:path*',
};
