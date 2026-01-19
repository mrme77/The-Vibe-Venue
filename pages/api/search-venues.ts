/**
 * Search Venues API Route
 * Uses:
 * 1. OpenRouter (AI) - To generate relevant search terms
 * 2. Overpass API (OSM) - To find venues
 * 3. WikiData - To get images and descriptions
 * 4. OpenTripMap - To get popularity ratings
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type { UserPreferences } from '@/types/user-preferences';
import type { VenueSearchResponse, Venue } from '@/types/venue';
import { callOpenRouterJSON } from '@/lib/openrouter';
import { searchVenuesOverpass } from '@/lib/overpass';
import { getWikiDataDetails } from '@/lib/wikidata';
import { getOpenTripMapDetails } from '@/lib/opentripmap';

interface SearchVenuesRequest {
  occasion: string;
  location: {
    lat: number;
    lng: number;
  };
  radius: number;
  preferences: Partial<UserPreferences>;
}

/**
 * Generates search queries using AI based on occasion and preferences
 */
async function generateSearchQueries(
  occasion: string,
  preferences: Partial<UserPreferences>
): Promise<string[]> {
  // Build context about dietary restrictions and atmosphere
  const dietaryInfo = preferences.dietaryRestrictions?.length
    ? `Dietary needs: ${preferences.dietaryRestrictions.join(', ')}. `
    : '';
  const atmosphereInfo = preferences.atmosphere
    ? `Desired atmosphere: ${preferences.atmosphere}. `
    : '';
  const additionalInfo = preferences.additionalPreferences
    ? `Additional preferences: ${preferences.additionalPreferences}. `
    : '';

  const prompt = `You are a venue search expert. Generate 3-5 specific OpenStreetMap amenity search terms for finding perfect venues.

OCCASION: ${occasion}
BUDGET: ${preferences.budget || 'any'}
GROUP SIZE: ${preferences.groupSize || 'not specified'}
${dietaryInfo}${atmosphereInfo}${additionalInfo}

IMPORTANT: Return search terms that match OpenStreetMap amenity types. Examples:
- For romantic dates: ["fine_dining", "wine_bar", "french_restaurant"]
- For team outings: ["pub", "brewery", "bbq_restaurant"]
- For casual hangouts: ["cafe", "pizza_restaurant", "ice_cream"]
- For upscale events: ["fine_dining", "cocktail_bar", "steakhouse"]

Return ONLY a valid JSON array of 3-5 specific venue type strings that would be found in OpenStreetMap.
Format: ["venue_type_1", "venue_type_2", "venue_type_3"]`;

  try {
    const queries = await callOpenRouterJSON<string[]>(prompt);
    if (Array.isArray(queries) && queries.length > 0) {
      return queries.slice(0, 5);
    }
    console.warn('AI returned invalid search queries, using fallback');
    return ['restaurant', 'bar', 'cafe'];
  } catch (e) {
    console.error('Failed to generate search queries:', e);
    return ['restaurant', 'bar', 'cafe'];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VenueSearchResponse | { error: string }>
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { occasion, location, radius, preferences } = req.body as SearchVenuesRequest;

    if (!location?.lat || !location?.lng) {
      return res.status(400).json({ error: 'Invalid location' });
    }

    // 1. Generate Search Queries
    const queries = await generateSearchQueries(occasion, preferences);

    // 2. Search Overpass (OSM) sequentially to avoid overwhelming the API
    // Running in parallel can cause 504 timeouts
    const results: (Partial<Venue> & { wikidata?: string })[][] = [];
    for (const query of queries) {
      const venueResults = await searchVenuesOverpass(query, location.lat, location.lng, radius);
      results.push(venueResults);
      // Small delay between queries to be respectful to the free API
      if (queries.indexOf(query) < queries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Flatten and deduplicate
    const rawVenuesMap = new Map<string, Partial<Venue> & { wikidata?: string }>();
    results.flat().forEach(v => {
      if (v.placeId && !rawVenuesMap.has(v.placeId)) {
        rawVenuesMap.set(v.placeId, v);
      }
    });
    
    let venues = Array.from(rawVenuesMap.values());
    
    // Limit to top 20 for enrichment to save time/bandwidth
    venues = venues.slice(0, 20);

    // 3. Enrich with WikiData (Images/Descriptions)
    // Collect all wikidata IDs
    const wikiIds = venues.map(v => v.wikidata).filter((id): id is string => !!id);
    
    // Fetch batch details
    const wikiDetails = await getWikiDataDetails(wikiIds);

    // 4. Enrich loop
    const enrichedVenues: Venue[] = await Promise.all(venues.map(async (v) => {
      let imageUrl: string | undefined;
      let description: string | undefined;
      let rating = 0; // Default 0

      // A. Try WikiData
      if (v.wikidata && wikiDetails[v.wikidata]) {
        imageUrl = wikiDetails[v.wikidata].imageUrl;
        description = wikiDetails[v.wikidata].description;
      }

      // B. Try OpenTripMap if no image or to get 'popularity' as rating
      // (Only do this for a few to avoid rate limits if we didn't get good data)
      if (!imageUrl || !rating) {
        const otm = await getOpenTripMapDetails(v.name!, v.location!.lat, v.location!.lng);
        if (otm) {
          if (!imageUrl) imageUrl = otm.image;
          if (!description) description = otm.text;
          // OTM rate is 1, 2, 3, or 7 (heritage). Map 1-3 to 3-5 stars roughly?
          // Let's just use it raw or map 1->3, 2->4, 3->5
          if (otm.rate) rating = Math.min(5, otm.rate + 2);
        }
      }

      // Final object
      return {
        placeId: v.placeId!,
        name: v.name!,
        address: v.address!,
        location: v.location!,
        priceLevel: 2, // Unknown in OSM, default to medium
        rating: rating || 3.5, // Fallback rating
        photos: imageUrl ? [imageUrl] : [],
        reviews: description ? [{ author: 'Wiki info', rating: 5, text: description, time: Date.now() }] : [],
        openingHours: []
      };
    }));

    // Filter out ones with no name or really bad data if necessary
    const finalVenues = enrichedVenues.filter(v => v.name !== 'Unknown Venue');

    res.status(200).json({
      venues: finalVenues,
      searchQueries: queries
    });

  } catch (error) {
    console.error('Search handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
