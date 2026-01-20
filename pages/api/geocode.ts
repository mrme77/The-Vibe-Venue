/**
 * Geocode API Route
 * Converts a location string (city, address, or zip code) to latitude/longitude coordinates
 * Uses free Nominatim API (OpenStreetMap)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { geocodeLocation } from '@/lib/nominatim';
import { rateLimiter, calculateRetryAfter } from '@/lib/rate-limiter';

/**
 * Request body interface
 */
interface GeocodeRequest {
  location: string;
}

/**
 * Success response interface
 */
interface GeocodeSuccessResponse {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Error response interface
 */
interface GeocodeErrorResponse {
  error: string;
  code: string;
  retryAfter?: number;
}

/**
 * Extract client IP from Next.js API request
 */
function getClientIP(req: NextApiRequest): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];

  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list or string array
    const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
    return ip.trim();
  }

  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  return 'unknown';
}

/**
 * Geocode API endpoint handler
 *
 * @route POST /api/geocode
 * @body { location: string } - City name, address, or zip code
 * @returns { lat: number, lng: number, displayName: string }
 *
 * @example
 * POST /api/geocode
 * Body: { "location": "New York, NY" }
 * Response: { "lat": 40.7128, "lng": -74.0060, "displayName": "New York, United States" }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeocodeSuccessResponse | GeocodeErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Use POST.',
      code: 'METHOD_NOT_ALLOWED',
    });
  }

  // Route-specific rate limiting: 10 requests per minute per IP
  const ip = getClientIP(req);
  const rateLimitResult = rateLimiter.check(`geocode:${ip}`, 10, 60000);

  if (!rateLimitResult.allowed) {
    const retryAfter = calculateRetryAfter(rateLimitResult);
    res.setHeader('Retry-After', retryAfter.toString());
    res.setHeader('X-RateLimit-Limit', '10');
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

    return res.status(429).json({
      error: 'Too many geocoding requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter,
    });
  }

  // Add rate limit headers to successful response
  res.setHeader('X-RateLimit-Limit', '10');
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

  try {
    // Parse and validate request body
    const { location } = req.body as GeocodeRequest;

    // Validate location field
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      return res.status(400).json({
        error: 'Location is required and must be a non-empty string.',
        code: 'MISSING_LOCATION',
      });
    }

    // Validate location length (prevent abuse)
    if (location.length > 200) {
      return res.status(400).json({
        error: 'Location string is too long (max 200 characters).',
        code: 'LOCATION_TOO_LONG',
      });
    }

    // Call Nominatim geocoding service
    const geocoded = await geocodeLocation(location);

    // Return success response
    return res.status(200).json({
      lat: geocoded.lat,
      lng: geocoded.lng,
      displayName: geocoded.displayName,
    });
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      // Location not found
      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: error.message,
          code: 'LOCATION_NOT_FOUND',
        });
      }

      // Rate limiting error (Nominatim 1 req/sec)
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again in a moment.',
          code: 'RATE_LIMIT_EXCEEDED',
        });
      }

      // Nominatim API error
      if (error.message.includes('Nominatim API error')) {
        return res.status(503).json({
          error: 'Geocoding service is temporarily unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE',
        });
      }

      // Generic error with message
      console.error('Geocoding error:', error.message);
      return res.status(500).json({
        error: 'Failed to geocode location. Please try a different location or try again later.',
        code: 'GEOCODING_FAILED',
      });
    }

    // Unknown error
    console.error('Unknown geocoding error:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred while geocoding.',
      code: 'INTERNAL_ERROR',
    });
  }
}
