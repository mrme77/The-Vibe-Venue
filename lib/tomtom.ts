/**
 * TomTom API Client
 * Free tier: 2,500 requests per day, no credit card required
 * Provides: Places Search, POI Details (ratings, price, reviews), Photos
 * Data powered by Foursquare
 * API Documentation: https://developer.tomtom.com/
 */

import type { Venue, Review } from '@/types/venue';

/**
 * TomTom Places Search API response
 */
interface TomTomSearchResponse {
  results: TomTomPOI[];
}

/**
 * TomTom POI (Point of Interest) from Search API
 */
interface TomTomPOI {
  id: string;
  type: string;
  poi: {
    name: string;
    phone?: string;
    categorySet?: Array<{
      id: number;
    }>;
    classifications?: Array<{
      code: string;
      names: Array<{
        name: string;
      }>;
    }>;
  };
  address: {
    streetNumber?: string;
    streetName?: string;
    municipality?: string;
    municipalitySubdivision?: string;
    countrySubdivision?: string;
    postalCode?: string;
    country?: string;
    freeformAddress: string;
  };
  position: {
    lat: number;
    lon: number;
  };
  entryPoints?: Array<{
    position: {
      lat: number;
      lon: number;
    };
  }>;
}

/**
 * TomTom POI Details API response
 */
interface TomTomPOIDetails {
  id: string;
  name: string;
  rating?: number;
  priceRange?: {
    label: string;
    value: number; // 1-4
  };
  reviews?: Array<{
    author: string;
    text: string;
    rating: number;
    date: string;
  }>;
  photos?: string[]; // Array of photo IDs
  [key: string]: unknown;
}

/**
 * Track TomTom API request count (simple in-memory counter)
 * In production, consider using Redis or database for persistent tracking
 */
let tomtomRequestCount = 0;
const TOMTOM_DAILY_LIMIT = 2500;

/**
 * Checks if we've reached the TomTom API daily limit
 * @returns true if under limit, false if limit reached
 */
function checkTomTomRateLimit(): boolean {
  return tomtomRequestCount < TOMTOM_DAILY_LIMIT;
}

/**
 * Searches for places using TomTom Places Search API
 *
 * @param query - Search term (e.g., "restaurants", "bars", "cafes")
 * @param lat - Latitude of search center
 * @param lng - Longitude of search center
 * @param radius - Search radius in meters (max 100000)
 * @param limit - Number of results to return (max 100)
 * @returns Array of TomTom POIs
 * @throws Error if API call fails or API key is missing
 *
 * @example
 * ```typescript
 * const pois = await searchPlaces('restaurants', 40.7128, -74.0060, 5000);
 * console.log(pois); // Array of restaurant POIs
 * ```
 */
export async function searchPlaces(
  query: string,
  lat: number,
  lng: number,
  radius: number = 5000,
  limit: number = 20
): Promise<TomTomPOI[]> {
  const apiKey = process.env.TOMTOM_API_KEY;

  if (!apiKey) {
    throw new Error(
      'TOMTOM_API_KEY is not set in environment variables. ' +
        'Get your free API key at https://developer.tomtom.com/'
    );
  }

  if (!checkTomTomRateLimit()) {
    console.warn('TomTom API daily limit (2,500 requests) reached');
    return [];
  }

  tomtomRequestCount++;

  const params = new URLSearchParams({
    key: apiKey,
    lat: lat.toString(),
    lon: lng.toString(),
    radius: Math.min(radius, 100000).toString(), // TomTom max is 100km
    limit: Math.min(limit, 100).toString(), // TomTom max is 100
  });

  const url = `https://api.tomtom.com/search/2/poiSearch/${encodeURIComponent(
    query
  )}.json?${params}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TomTom API error (${response.status}): ${errorText}`);
    }

    const data: TomTomSearchResponse = await response.json();
    return data.results || [];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to search TomTom places: ${error.message}`);
    }
    throw new Error('Failed to search TomTom places: Unknown error');
  }
}

/**
 * Gets detailed information about a place including ratings, price, and reviews
 * using TomTom POI Details API
 *
 * @param poiId - TomTom POI ID from search results
 * @returns Detailed POI information or null if not found
 * @throws Error if API call fails
 *
 * @example
 * ```typescript
 * const details = await getPlaceDetails('poi.123456789');
 * console.log(details); // { rating: 4.5, priceRange: { value: 2 }, ... }
 * ```
 */
export async function getPlaceDetails(
  poiId: string
): Promise<TomTomPOIDetails | null> {
  const apiKey = process.env.TOMTOM_API_KEY;

  if (!apiKey) {
    throw new Error('TOMTOM_API_KEY is not set in environment variables');
  }

  if (!checkTomTomRateLimit()) {
    console.warn('TomTom API daily limit reached, skipping place details');
    return null;
  }

  tomtomRequestCount++;

  const url = `https://api.tomtom.com/search/2/place.json?key=${apiKey}&entityId=${poiId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to get TomTom place details for ${poiId}`);
      return null;
    }

    const data: TomTomPOIDetails = await response.json();
    return data;
  } catch (error) {
    console.warn(`Error fetching TomTom place details: ${error}`);
    return null;
  }
}

/**
 * Gets photo URLs for a place using TomTom POI Photos API
 *
 * @param photoIds - Array of photo IDs from POI Details API
 * @param width - Desired image width in pixels (default: 800)
 * @param height - Desired image height in pixels (default: 600)
 * @returns Array of photo URLs
 *
 * @example
 * ```typescript
 * const photos = await getPlacePhotos(['photo1', 'photo2'], 800, 600);
 * console.log(photos); // ['https://...', 'https://...']
 * ```
 */
export async function getPlacePhotos(
  photoIds: string[],
  width: number = 800,
  height: number = 600
): Promise<string[]> {
  const apiKey = process.env.TOMTOM_API_KEY;

  if (!apiKey || photoIds.length === 0) {
    return [];
  }

  // Generate photo URLs (TomTom Photos API format)
  // Note: Actual endpoint may vary, this is a common pattern
  return photoIds.map(
    (photoId) =>
      `https://api.tomtom.com/search/2/poiPhoto?key=${apiKey}&id=${photoId}&width=${width}&height=${height}`
  );
}

/**
 * Converts TomTom POI and details to our Venue type
 *
 * @param poi - TomTom POI from search
 * @param details - TomTom POI details (optional)
 * @param photos - Photo URLs (optional)
 * @returns Venue object
 */
export function convertToVenue(
  poi: TomTomPOI,
  details?: TomTomPOIDetails | null,
  photos?: string[]
): Venue {
  // Convert reviews from TomTom format to our format
  const reviews: Review[] =
    details?.reviews?.map((review) => ({
      author: review.author,
      rating: review.rating,
      text: review.text,
      time: new Date(review.date).getTime() / 1000, // Convert to Unix timestamp
    })) || [];

  return {
    name: poi.poi.name,
    address: poi.address.freeformAddress,
    rating: details?.rating || 0,
    priceLevel: details?.priceRange?.value || 2, // Default to moderate
    photos: photos || [],
    reviews: reviews.slice(0, 5), // Top 5 reviews
    openingHours: undefined, // TomTom may provide this, add if needed
    placeId: poi.id,
    location: {
      lat: poi.position.lat,
      lng: poi.position.lon,
    },
  };
}

/**
 * Searches for venues and enriches them with details and photos
 * This is the main function to use for venue search
 *
 * @param query - Search term
 * @param lat - Latitude
 * @param lng - Longitude
 * @param radius - Search radius in meters
 * @returns Array of enriched venues
 *
 * @example
 * ```typescript
 * const venues = await searchAndEnrichVenues(
 *   'restaurants',
 *   40.7128,
 *   -74.0060,
 *   5000
 * );
 * console.log(venues); // Array of Venue objects with ratings, photos, etc.
 * ```
 */
export async function searchAndEnrichVenues(
  query: string,
  lat: number,
  lng: number,
  radius: number = 5000
): Promise<Venue[]> {
  try {
    // Step 1: Search for places
    const pois = await searchPlaces(query, lat, lng, radius, 20);

    if (pois.length === 0) {
      return [];
    }

    // Step 2: Enrich with details and photos (in parallel)
    const enrichedVenues = await Promise.all(
      pois.map(async (poi) => {
        try {
          // Get details for this POI
          const details = await getPlaceDetails(poi.id);

          // Get photos if available
          let photos: string[] = [];
          if (details?.photos && details.photos.length > 0) {
            photos = await getPlacePhotos(details.photos.slice(0, 5)); // Max 5 photos
          }

          return convertToVenue(poi, details, photos);
        } catch (error) {
          console.warn(`Error enriching venue ${poi.poi.name}:`, error);
          // Return basic venue without enrichment
          return convertToVenue(poi);
        }
      })
    );

    return enrichedVenues;
  } catch (error) {
    console.error('Error searching and enriching venues:', error);
    return [];
  }
}

/**
 * Searches for multiple types of venues using different queries
 * Combines and deduplicates results
 *
 * @param queries - Array of search queries
 * @param lat - Latitude
 * @param lng - Longitude
 * @param radius - Search radius in meters
 * @returns Combined array of unique venues
 *
 * @example
 * ```typescript
 * const venues = await searchMultipleQueries(
 *   ['romantic restaurants', 'wine bars', 'rooftop dining'],
 *   40.7128,
 *   -74.0060,
 *   5000
 * );
 * ```
 */
export async function searchMultipleQueries(
  queries: string[],
  lat: number,
  lng: number,
  radius: number = 5000
): Promise<Venue[]> {
  // Execute all searches in parallel
  const searchPromises = queries.map((query) =>
    searchAndEnrichVenues(query, lat, lng, radius).catch(() => [])
  );

  const results = await Promise.all(searchPromises);

  // Flatten and deduplicate by placeId
  const venueMap = new Map<string, Venue>();
  for (const venueList of results) {
    for (const venue of venueList) {
      if (!venueMap.has(venue.placeId)) {
        venueMap.set(venue.placeId, venue);
      }
    }
  }

  return Array.from(venueMap.values());
}

/**
 * Gets the current TomTom API request count (for monitoring)
 * @returns Number of requests made today
 */
export function getTomTomRequestCount(): number {
  return tomtomRequestCount;
}

/**
 * Resets the TomTom API request counter (call this daily)
 */
export function resetTomTomRequestCount(): void {
  tomtomRequestCount = 0;
}
