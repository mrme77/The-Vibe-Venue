/**
 * Search Venues API Route
 * AI-powered venue search using:
 * 1. OpenRouter AI - Generate search queries based on occasion
 * 2. TomTom Search API - Search for venues with ratings, photos, price levels
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type { UserPreferences } from '@/types/user-preferences';
import type { VenueSearchResponse } from '@/types/venue';
import { callOpenRouterJSON } from '@/lib/openrouter';
import { searchMultipleQueries } from '@/lib/tomtom';

/**
 * Request body interface
 */
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
 * Error response interface
 */
interface SearchVenuesErrorResponse {
  error: string;
  code: string;
}

/**
 * Generates search queries using AI based on occasion and preferences
 *
 * @param occasion - Type of occasion (e.g., "date night", "team outing")
 * @param preferences - User preferences (budget, atmosphere, dietary restrictions, etc.)
 * @returns Array of search query strings
 */
async function generateSearchQueries(
  occasion: string,
  preferences: Partial<UserPreferences>
): Promise<string[]> {
  const prompt = `You are a local venue search expert. Generate 3-5 specific search queries for finding venues for the following occasion and preferences.

Occasion: ${occasion}
Budget: ${preferences.budget || 'any'}
Atmosphere: ${preferences.atmosphere || 'any'}
Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'none'}
Group Size: ${preferences.groupSize || 'not specified'}
Additional Preferences: ${preferences.additionalPreferences || 'none'}

Generate search queries that are specific and actionable. Focus on venue types, cuisines, and atmospheres that match the occasion.

Examples:
- For "romantic date night" → ["upscale Italian restaurants", "wine bars", "rooftop dining", "intimate bistros"]
- For "team outing" → ["breweries", "sports bars", "group-friendly restaurants", "entertainment venues"]
- For "birthday celebration" → ["trendy restaurants", "cocktail bars", "restaurants with private dining", "celebration venues"]

Return ONLY a JSON array of 3-5 search query strings, no other text.
Format: ["query1", "query2", "query3", "query4", "query5"]`;

  try {
    const queries = await callOpenRouterJSON<string[]>(prompt);

    // Validate response is an array of strings
    if (!Array.isArray(queries) || queries.length === 0) {
      console.warn('AI returned invalid search queries, using fallback');
      return ['restaurants', 'bars', 'cafes'];
    }

    // Filter and validate queries
    const validQueries = queries
      .filter((q) => typeof q === 'string' && q.trim().length > 0)
      .map((q) => q.trim())
      .slice(0, 5); // Max 5 queries

    if (validQueries.length === 0) {
      return ['restaurants', 'bars', 'cafes'];
    }

    return validQueries;
  } catch (error) {
    console.error('Error generating search queries with AI:', error);
    // Fallback to basic queries based on occasion
    return ['restaurants', 'bars', 'cafes'];
  }
}

/**
 * Search Venues API endpoint handler
 *
 * @route POST /api/search-venues
 * @body { occasion, location, radius, preferences }
 * @returns { venues: Venue[], searchQueries: string[] }
 *
 * @example
 * POST /api/search-venues
 * Body: {
 *   "occasion": "romantic date night",
 *   "location": { "lat": 40.7128, "lng": -74.0060 },
 *   "radius": 5000,
 *   "preferences": { "budget": "medium", "atmosphere": "romantic" }
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VenueSearchResponse | SearchVenuesErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Use POST.',
      code: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
    // Parse and validate request body
    const { occasion, location, radius, preferences } =
      req.body as SearchVenuesRequest;

    // Validate required fields
    if (
      !occasion ||
      typeof occasion !== 'string' ||
      occasion.trim().length === 0
    ) {
      return res.status(400).json({
        error: 'Occasion is required and must be a non-empty string.',
        code: 'MISSING_OCCASION',
      });
    }

    if (
      !location ||
      typeof location.lat !== 'number' ||
      typeof location.lng !== 'number'
    ) {
      return res.status(400).json({
        error: 'Location with valid lat/lng coordinates is required.',
        code: 'INVALID_LOCATION',
      });
    }

    if (
      !radius ||
      typeof radius !== 'number' ||
      radius < 100 ||
      radius > 50000
    ) {
      return res.status(400).json({
        error: 'Radius must be a number between 100 and 50000 meters.',
        code: 'INVALID_RADIUS',
      });
    }

    // Validate coordinates
    if (location.lat < -90 || location.lat > 90) {
      return res.status(400).json({
        error: 'Latitude must be between -90 and 90.',
        code: 'INVALID_LATITUDE',
      });
    }

    if (location.lng < -180 || location.lng > 180) {
      return res.status(400).json({
        error: 'Longitude must be between -180 and 180.',
        code: 'INVALID_LONGITUDE',
      });
    }

    // Step 1: Generate search queries using AI
    console.log(`Generating search queries for occasion: ${occasion}`);
    const searchQueries = await generateSearchQueries(
      occasion,
      preferences || {}
    );
    console.log(`Generated queries:`, searchQueries);

    // Step 2: Search TomTom for venues (with ratings, photos, price levels)
    console.log(`Searching for venues with radius: ${radius}m`);
    const venues = await searchMultipleQueries(
      searchQueries,
      location.lat,
      location.lng,
      radius
    );
    console.log(`Found ${venues.length} venues from TomTom`);

    if (venues.length === 0) {
      return res.status(200).json({
        venues: [],
        searchQueries,
      });
    }

    // Step 3: Filter venues with ratings (optional quality filter)
    const filteredVenues = venues.filter((venue) => {
      // Keep venues with good data
      return (
        venue.rating > 0 || venue.photos.length > 0 || venue.reviews.length > 0
      );
    });

    // If filtering removed too many venues, use all venues
    const finalVenues =
      filteredVenues.length >= 5 ? filteredVenues : venues;

    // Step 4: Limit to top 15 venues to control response size
    const limitedVenues = finalVenues.slice(0, 15);

    // Return success response
    return res.status(200).json({
      venues: limitedVenues,
      searchQueries,
    });
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      // OpenRouter API error
      if (error.message.includes('OPENROUTER_API_KEY')) {
        return res.status(500).json({
          error: 'AI service is not configured. Please contact support.',
          code: 'AI_SERVICE_ERROR',
        });
      }

      // TomTom API error
      if (error.message.includes('TOMTOM_API_KEY')) {
        return res.status(500).json({
          error:
            'Venue search service is not configured. Please contact support.',
          code: 'VENUE_SERVICE_ERROR',
        });
      }

      // Rate limiting error
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return res.status(429).json({
          error: 'API rate limit exceeded. Please try again in a moment.',
          code: 'RATE_LIMIT_EXCEEDED',
        });
      }

      // API service unavailable
      if (
        error.message.includes('503') ||
        error.message.includes('unavailable')
      ) {
        return res.status(503).json({
          error:
            'Venue search service is temporarily unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE',
        });
      }

      // Generic error with message
      console.error('Search venues error:', error.message);
      return res.status(500).json({
        error: 'Failed to search for venues. Please try again later.',
        code: 'SEARCH_FAILED',
      });
    }

    // Unknown error
    console.error('Unknown search venues error:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred while searching for venues.',
      code: 'INTERNAL_ERROR',
    });
  }
}
