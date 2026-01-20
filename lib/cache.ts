/**
 * LRU Cache with TTL Support
 *
 * Provides in-memory caching with:
 * - Least Recently Used (LRU) eviction policy
 * - Time-To-Live (TTL) expiration
 * - Cache statistics for monitoring
 * - Automatic cleanup of expired entries
 */

import { CacheEntry, CacheStats } from '@/types/cache';
import { GeocodedLocation } from './nominatim';
import { Venue } from '@/types/venue';

/**
 * Generic LRU Cache implementation
 */
class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private stats: { hits: number; misses: number; evictions: number };
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.stats = { hits: 0, misses: 0, evictions: 0 };
    this.cleanupInterval = null;

    // Start automatic cleanup of expired entries every 60 seconds
    this.startCleanupInterval();
  }

  /**
   * Get a value from cache
   * Returns null if not found or expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    // Not in cache
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access time for LRU
    entry.accessTime = Date.now();
    this.cache.set(key, entry);

    this.stats.hits++;
    console.log(`[CACHE HIT] ${key}`);
    return entry.value;
  }

  /**
   * Set a value in cache with TTL
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlMs - Time-to-live in milliseconds
   */
  set(key: string, value: T, ttlMs: number): void {
    // Check if we need to evict
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      expires: Date.now() + ttlMs,
      accessTime: Date.now(),
    };

    this.cache.set(key, entry);
    console.log(`[CACHE SET] ${key} (TTL: ${ttlMs}ms)`);
  }

  /**
   * Remove least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    // Find the least recently used entry
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessTime < oldestTime) {
        oldestTime = entry.accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      console.log(`[CACHE EVICT] ${oldestKey} (LRU)`);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      console.log(`[CACHE CLEANUP] Removed ${expiredCount} expired entries`);
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    // Run cleanup every 60 seconds
    // Note: In serverless environments, cleanup happens automatically when function terminates
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
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
   * Clear all entries from cache
   */
  clear(): void {
    this.cache.clear();
    console.log('[CACHE CLEAR] All entries removed');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100, // Round to 2 decimals
    };
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * Check if key exists (without updating access time)
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

/**
 * Geocoding cache instance
 * TTL: 24 hours (coordinates don't change)
 * Max size: 100 entries (~5MB)
 */
export const geocodeCache = new LRUCache<GeocodedLocation>(100);

/**
 * Overpass venue search cache instance
 * TTL: 6 hours (venue data relatively stable)
 * Max size: 200 entries (~40MB)
 */
export const overpassCache = new LRUCache<(Partial<Venue> & { wikidata?: string })[]>(200);

/**
 * Cache TTL constants (in milliseconds)
 */
export const CACHE_TTL = {
  GEOCODE: 24 * 60 * 60 * 1000,     // 24 hours
  OVERPASS: 6 * 60 * 60 * 1000,      // 6 hours
};
