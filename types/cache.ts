/**
 * Cache Type Definitions
 * Defines interfaces for the LRU cache system
 */

/**
 * Cache entry with expiration and access tracking
 */
export interface CacheEntry<T> {
  value: T;
  expires: number;      // Timestamp when entry expires
  accessTime: number;   // Last access timestamp (for LRU eviction)
}

/**
 * Cache statistics for monitoring
 */
export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}
