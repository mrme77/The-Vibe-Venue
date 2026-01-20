/**
 * Rate Limit Type Definitions
 * Defines interfaces for the rate limiting system
 */

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;    // Timestamp when limit resets
  retryAfter?: number;  // Seconds until next allowed request
}

/**
 * Rate limit entry for tracking request timestamps
 */
export interface RateLimitEntry {
  timestamps: number[];
  lastCleanup?: number;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  limit: number;        // Maximum requests allowed
  windowMs: number;     // Time window in milliseconds
}
