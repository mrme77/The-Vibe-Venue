/**
 * Rate Limiter with Sliding Window Algorithm
 *
 * Provides in-memory rate limiting with:
 * - Sliding window algorithm (more accurate than fixed window)
 * - Per-IP tracking
 * - Automatic cleanup of old entries
 * - Configurable limits per route
 */

import { RateLimitResult, RateLimitEntry } from '@/types/rate-limit';

/**
 * Sliding Window Rate Limiter
 */
class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.store = new Map();
    this.cleanupInterval = null;

    // Start automatic cleanup every 60 seconds
    this.startCleanupInterval();
  }

  /**
   * Check if request is allowed under rate limit
   * @param identifier - Unique identifier (e.g., "global:127.0.0.1" or "geocode:127.0.0.1")
   * @param limit - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Rate limit result
   */
  check(identifier: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(identifier) || { timestamps: [] };

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter(
      (timestamp) => now - timestamp < windowMs
    );

    // Check if under limit
    const allowed = entry.timestamps.length < limit;
    const remaining = Math.max(0, limit - entry.timestamps.length);

    // Calculate reset time (when oldest timestamp expires)
    const oldestTimestamp = entry.timestamps[0];
    const resetTime = oldestTimestamp ? oldestTimestamp + windowMs : now + windowMs;

    // Calculate retry after (seconds until next allowed request)
    const retryAfter = allowed ? undefined : Math.ceil((resetTime - now) / 1000);

    // Add new timestamp if allowed
    if (allowed) {
      entry.timestamps.push(now);
      this.store.set(identifier, entry);
    }

    // Log rate limit activity
    if (!allowed) {
      console.warn(
        `[RATE LIMIT] ${identifier} exceeded limit (${limit} req/${windowMs}ms). ` +
        `Retry after ${retryAfter}s`
      );
    }

    return {
      allowed,
      remaining: allowed ? remaining - 1 : 0, // Subtract 1 since we just added a timestamp
      resetTime,
      retryAfter,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   * Useful for testing or manual resets
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
    console.log(`[RATE LIMIT] Reset: ${identifier}`);
  }

  /**
   * Clean up old entries that are outside all reasonable windows
   * Runs automatically every 60 seconds
   */
  private cleanup(): void {
    const now = Date.now();
    const maxWindowMs = 10 * 60 * 1000; // 10 minutes (max reasonable window)
    let cleanedCount = 0;

    for (const [identifier, entry] of this.store.entries()) {
      // Remove timestamps older than max window
      const validTimestamps = entry.timestamps.filter(
        (timestamp) => now - timestamp < maxWindowMs
      );

      if (validTimestamps.length === 0) {
        // No valid timestamps, remove entry
        this.store.delete(identifier);
        cleanedCount++;
      } else if (validTimestamps.length < entry.timestamps.length) {
        // Some timestamps removed, update entry
        entry.timestamps = validTimestamps;
        this.store.set(identifier, entry);
      }
    }

    if (cleanedCount > 0) {
      console.log(`[RATE LIMIT] Cleaned up ${cleanedCount} expired entries`);
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    // Run cleanup every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);

    // Ensure cleanup stops when process exits (for serverless)
    if (typeof process !== 'undefined') {
      process.on('beforeExit', () => this.stopCleanupInterval());
    }
  }

  /**
   * Stop automatic cleanup interval
   */
  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get current store size (for monitoring)
   */
  getStoreSize(): number {
    return this.store.size;
  }

  /**
   * Get entry for identifier (for debugging)
   */
  getEntry(identifier: string): RateLimitEntry | undefined {
    return this.store.get(identifier);
  }
}

/**
 * Global rate limiter instance
 * Shared across all API routes
 */
export const rateLimiter = new RateLimiter();

/**
 * Extract client IP from Next.js request
 * Checks x-forwarded-for (Vercel, proxies) and x-real-ip headers
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback (shouldn't happen on Vercel)
  return 'unknown';
}

/**
 * Calculate Retry-After header value in seconds
 * Based on rate limit result
 */
export function calculateRetryAfter(result: RateLimitResult): number {
  return result.retryAfter || 60; // Default to 60 seconds if not specified
}
