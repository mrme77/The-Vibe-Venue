/**
 * Overpass API Client
 * Used to search for venues in OpenStreetMap (OSM)
 * Free API, no key required.
 * Respect rate limits!
 */

import { Venue } from '@/types/venue';

// Define the OSM element interface
interface OSMElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:city'?: string;
    amenity?: string;
    cuisine?: string;
    website?: string;
    phone?: string;
    wikidata?: string; // Critical for linking to images
    [key: string]: string | undefined;
  };
}

interface OverpassResponse {
  version: number;
  generator: string;
  osm3s: {
    timestamp_osm_base: string;
    copyright: string;
  };
  elements: OSMElement[];
}

/**
 * Maps common search terms to Overpass QL amenity/shop types
 */
function mapQueryToOSMTags(query: string): string {
  const q = query.toLowerCase();
  
  if (q.includes('restaurant') || q.includes('dining')) return '["amenity"="restaurant"]';
  if (q.includes('bar') || q.includes('pub')) return '["amenity"~"bar|pub"]';
  if (q.includes('cafe') || q.includes('coffee')) return '["amenity"="cafe"]';
  if (q.includes('museum')) return '["tourism"="museum"]';
  if (q.includes('park')) return '["leisure"="park"]';
  if (q.includes('cinema') || q.includes('movie')) return '["amenity"="cinema"]';
  if (q.includes('theater')) return '["amenity"="theatre"]';
  
  // Default fallback - search widely for amenities
  return '["amenity"~"restaurant|bar|cafe|pub"]';
}

/**
 * Searches for venues using Overpass API
 * @param query Search query (e.g., "Italian restaurants")
 * @param lat Latitude
 * @param lng Longitude
 * @param radius Radius in meters
 */
export async function searchVenuesOverpass(
  query: string,
  lat: number,
  lng: number,
  radius: number = 2000
): Promise<(Partial<Venue> & { wikidata?: string })[]> {
  // Construct Overpass QL
  // We use [out:json]; to get JSON response
  // We search for nodes, ways, and relations
  
  const tagFilter = mapQueryToOSMTags(query);
  
  // Custom filter for specific cuisines if mentioned
  let cuisineFilter = '';
  if (query.toLowerCase().includes('italian')) cuisineFilter = '["cuisine"~"italian"]';
  if (query.toLowerCase().includes('mexican')) cuisineFilter = '["cuisine"~"mexican"]';
  if (query.toLowerCase().includes('chinese')) cuisineFilter = '["cuisine"~"chinese"]';
  if (query.toLowerCase().includes('pizza')) cuisineFilter = '["cuisine"~"pizza"]';
  if (query.toLowerCase().includes('burger')) cuisineFilter = '["cuisine"~"burger"]';
  
  // Combine filters
  // Example: node["amenity"="restaurant"]["cuisine"~"italian"](around:radius,lat,lng);
  const selector = `${tagFilter}${cuisineFilter}`;
  
  // Limit radius to max 5km to avoid timeouts
  const limitedRadius = Math.min(radius, 5000);

  const ql = `
    [out:json][timeout:15];
    (
      node${selector}(around:${limitedRadius},${lat},${lng});
      way${selector}(around:${limitedRadius},${lat},${lng});
    );
    out center 20;
  `;

  // Use alternative Overpass servers for better reliability
  const servers = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter',
  ];

  let lastError: Error | null = null;

  // Try each server with retry logic
  for (const url of servers) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: `data=${encodeURIComponent(ql)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        // If timeout, try next server
        if (response.status === 504 || response.status === 503) {
          console.warn(`Overpass server ${url} timed out, trying next...`);
          continue;
        }
        throw new Error(`Overpass API error: ${response.status}`);
      }

      const data: OverpassResponse = await response.json();

      // If we get here, query succeeded
      return parseOverpassResponse(data);
    } catch (error) {
      console.warn(`Overpass server ${url} failed:`, error);
      lastError = error as Error;
      continue;
    }
  }

  // All servers failed
  console.error('All Overpass servers failed:', lastError);
  return [];
}

/**
 * Parses Overpass API response into venue objects
 */
function parseOverpassResponse(data: OverpassResponse): (Partial<Venue> & { wikidata?: string })[] {
  return data.elements
    .filter(el => el.tags && el.tags.name) // Must have a name
    .map(el => {
      const lat = el.lat || el.center?.lat || 0;
      const lng = el.lon || el.center?.lon || 0;

      // Construct address
      const street = el.tags?.['addr:street'] || '';
      const number = el.tags?.['addr:housenumber'] || '';
      const city = el.tags?.['addr:city'] || '';
      const address = `${number} ${street}, ${city}`.trim().replace(/^,/, '').trim() || 'Address not available';

      return {
        name: el.tags?.name || 'Unknown Venue',
        address,
        placeId: `osm-${el.type}-${el.id}`,
        location: { lat, lng },
        // Pass wikidata ID for enrichment later
        wikidata: el.tags?.wikidata
      };
    });
}
