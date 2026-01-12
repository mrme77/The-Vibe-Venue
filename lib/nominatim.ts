/**
 * Nominatim API Client (OpenStreetMap Geocoding)
 * 100% FREE - No API key required
 * Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
 * Rate Limit: Maximum 1 request per second
 */

import axios from 'axios';

/**
 * Nominatim API response format
 */
interface NominatimResponse {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
}

/**
 * Geocoded location coordinates
 */
export interface GeocodedLocation {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Rate limiter for Nominatim API
 * Ensures we don't exceed 1 request per second
 */
let lastNominatimRequest = 0;
const NOMINATIM_RATE_LIMIT_MS = 1000; // 1 second

/**
 * Enforces rate limiting for Nominatim API (1 request per second)
 * Waits if necessary before allowing the next request
 */
async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastNominatimRequest;

  if (timeSinceLastRequest < NOMINATIM_RATE_LIMIT_MS) {
    const waitTime = NOMINATIM_RATE_LIMIT_MS - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastNominatimRequest = Date.now();
}

/**
 * Geocodes a location string (city, address, or zip code) to latitude/longitude coordinates
 * using the free Nominatim API (OpenStreetMap)
 *
 * @param locationString - City name, address, or zip code to geocode
 * @returns Geocoded coordinates with display name
 * @throws Error if location cannot be found or API fails
 *
 * @example
 * ```typescript
 * const location = await geocodeLocation('New York, NY');
 * console.log(location); // { lat: 40.7128, lng: -74.0060, displayName: "New York, United States" }
 *
 * const location2 = await geocodeLocation('94102');
 * console.log(location2); // { lat: 37.7749, lng: -122.4194, displayName: "San Francisco, ..." }
 * ```
 */
export async function geocodeLocation(
  locationString: string
): Promise<GeocodedLocation> {
  if (!locationString || locationString.trim().length === 0) {
    throw new Error('Location string cannot be empty');
  }

  // Enforce 1 request per second rate limit (Nominatim requirement)
  await enforceRateLimit();

  const encodedLocation = encodeURIComponent(locationString.trim());
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`;

  try {
    const response = await axios.get<NominatimResponse[]>(url, {
      headers: {
        'User-Agent': 'VenueVibe/1.0 (https://venuevibe.app)',
        'Accept': 'application/json',
      },
    });

    const data = response.data;

    if (!data || data.length === 0) {
      throw new Error(
        `Location "${locationString}" not found. Please try a more specific address or city name.`
      );
    }

    const result = data[0];

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
    };
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw our custom errors
      if (error.message.includes('not found') || error.message.includes('Nominatim')) {
        throw error;
      }
      throw new Error(`Failed to geocode location: ${error.message}`);
    }
    throw new Error('Failed to geocode location: Unknown error');
  }
}

/**
 * Reverse geocodes coordinates to a human-readable address
 * using the free Nominatim API (OpenStreetMap)
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Human-readable address
 * @throws Error if reverse geocoding fails
 *
 * @example
 * ```typescript
 * const address = await reverseGeocode(40.7128, -74.0060);
 * console.log(address); // "New York, New York, United States"
 * ```
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (lng < -180 || lng > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }

  // Enforce 1 request per second rate limit (Nominatim requirement)
  await enforceRateLimit();

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

  try {
    const response = await axios.get<NominatimResponse>(url, {
      headers: {
        'User-Agent': 'VenueVibe/1.0 (https://venuevibe.app)',
        'Accept': 'application/json',
      },
    });

    const data = response.data;

    if (!data || !data.display_name) {
      throw new Error('Unable to reverse geocode coordinates');
    }

    return data.display_name;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to reverse geocode: ${error.message}`);
    }
    throw new Error('Failed to reverse geocode: Unknown error');
  }
}
