/**
 * Shared utility functions for the VenueVibe application
 */

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