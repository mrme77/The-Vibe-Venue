/**
 * Shared utility functions for the Date Night Planner application
 */

/**
 * Formats an address string by cleaning up whitespace and formatting
 *
 * @param address - Raw address string
 * @returns Formatted address
 *
 * @example
 * ```typescript
 * formatAddress('  123  Main St,  New York,  NY  '); // "123 Main St, New York, NY"
 * ```
 */
export function formatAddress(address: string): string {
  if (!address) return 'Address not available';

  return address
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(', ');
}

/**
 * Converts a numeric price level (1-4) to dollar sign symbols
 *
 * @param priceLevel - Numeric price level (1 = budget, 4 = expensive)
 * @returns Dollar sign string ($, $$, $$$, $$$$)
 *
 * @example
 * ```typescript
 * getPriceLabel(1); // "$"
 * getPriceLabel(3); // "$$$"
 * getPriceLabel(0); // "Price not available"
 * ```
 */
export function getPriceLabel(priceLevel: number): string {
  if (priceLevel < 1 || priceLevel > 4) {
    return 'Price not available';
  }
  return '$'.repeat(priceLevel);
}

/**
 * Converts dollar sign string to numeric price level
 *
 * @param priceString - Dollar sign string ("$", "$$", etc.)
 * @returns Numeric price level (1-4)
 *
 * @example
 * ```typescript
 * parsePriceLevel('$$'); // 2
 * parsePriceLevel('$$$$'); // 4
 * ```
 */
export function parsePriceLevel(priceString: string): number {
  const level = priceString.replace(/[^$]/g, '').length;
  return Math.max(1, Math.min(4, level || 2)); // Default to 2 if invalid
}

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula
 *
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in meters
 *
 * @example
 * ```typescript
 * const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
 * console.log(distance); // ~3936363 meters (NYC to LA)
 * ```
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Converts meters to miles
 *
 * @param meters - Distance in meters
 * @returns Distance in miles
 *
 * @example
 * ```typescript
 * metersToMiles(5000); // 3.107
 * ```
 */
export function metersToMiles(meters: number): number {
  return meters / 1609.34;
}

/**
 * Converts miles to meters
 *
 * @param miles - Distance in miles
 * @returns Distance in meters
 *
 * @example
 * ```typescript
 * milesToMeters(3); // 4828.032
 * ```
 */
export function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

/**
 * Truncates a string to a maximum length and adds ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 200)
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * ```typescript
 * truncateText('This is a very long review...', 20); // "This is a very long..."
 * ```
 */
export function truncateText(text: string, maxLength: number = 200): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Formats a Unix timestamp to a human-readable date string
 *
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatTimestamp(1609459200); // "January 1, 2021"
 * ```
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculates the average of an array of numbers
 *
 * @param numbers - Array of numbers
 * @returns Average value
 *
 * @example
 * ```typescript
 * average([4, 5, 3, 5]); // 4.25
 * ```
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/**
 * Sanitizes user input by removing potentially dangerous characters
 *
 * @param input - User input string
 * @returns Sanitized string
 *
 * @example
 * ```typescript
 * sanitizeInput('<script>alert("xss")</script>'); // "scriptalert(xss)script"
 * ```
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Validates if a string is a valid URL
 *
 * @param url - URL string to validate
 * @returns true if valid URL, false otherwise
 *
 * @example
 * ```typescript
 * isValidUrl('https://example.com'); // true
 * isValidUrl('not a url'); // false
 * ```
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delays execution for a specified number of milliseconds
 * Useful for rate limiting and throttling
 *
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 *
 * @example
 * ```typescript
 * await delay(1000); // Wait 1 second
 * console.log('Executed after 1 second');
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Rate limiter utility class
 * Ensures functions are not called more frequently than a specified interval
 */
export class RateLimiter {
  private lastCall: number = 0;
  private interval: number;

  /**
   * Creates a new rate limiter
   * @param interval - Minimum milliseconds between calls
   */
  constructor(interval: number) {
    this.interval = interval;
  }

  /**
   * Waits if necessary to enforce the rate limit
   */
  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;

    if (timeSinceLastCall < this.interval) {
      const waitTime = this.interval - timeSinceLastCall;
      await delay(waitTime);
    }

    this.lastCall = Date.now();
  }

  /**
   * Executes a function with rate limiting
   * @param fn - Function to execute
   * @returns Result of the function
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.wait();
    return fn();
  }
}

/**
 * Chunks an array into smaller arrays of specified size
 *
 * @param array - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 *
 * @example
 * ```typescript
 * chunkArray([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Removes duplicate items from an array based on a key function
 *
 * @param array - Array to deduplicate
 * @param keyFn - Function that returns a unique key for each item
 * @returns Deduplicated array
 *
 * @example
 * ```typescript
 * const venues = [{ id: 1, name: 'A' }, { id: 1, name: 'A' }, { id: 2, name: 'B' }];
 * deduplicateBy(venues, v => v.id); // [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]
 * ```
 */
export function deduplicateBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Retries an async function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param baseDelay - Base delay in ms (default: 1000)
 * @returns Result of the function
 * @throws Error if all retries fail
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => fetch('https://api.example.com'),
 *   3,
 *   1000
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delayTime = baseDelay * Math.pow(2, i); // Exponential backoff
        await delay(delayTime);
      }
    }
  }

  throw lastError!;
}
