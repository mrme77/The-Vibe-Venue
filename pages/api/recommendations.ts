/**
 * Recommendations API Route
 * Uses AI to analyze venues and generate personalized recommendations
 * with reasoning, match scores, pros, and cons
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type { UserPreferences } from '@/types/user-preferences';
import type { Venue, RecommendationResponse, RecommendedVenue } from '@/types/venue';
import { callOpenRouterJSON } from '@/lib/openrouter';

/**
 * Request body interface
 */
interface RecommendationsRequest {
  venues: Venue[];
  preferences: UserPreferences;
}

/**
 * Error response interface
 */
interface RecommendationsErrorResponse {
  error: string;
  code: string;
}

/**
 * AI response format for recommendations
 */
interface AIRecommendation {
  venueName: string;
  matchScore: number;
  aiReasoning: string;
  pros: string[];
  cons: string[];
}

/**
 * Generates personalized venue recommendations using AI
 *
 * @param venues - Array of venues to analyze
 * @param preferences - User preferences and occasion context
 * @returns Array of recommended venues with AI analysis
 */
async function generateRecommendations(
  venues: Venue[],
  preferences: UserPreferences
): Promise<RecommendedVenue[]> {
  // Prepare venue data for AI (simplified to reduce token usage)
  const venueData = venues.map((v) => ({
    name: v.name,
    address: v.address,
    rating: v.rating,
    priceLevel: v.priceLevel,
    reviewCount: v.reviews.length,
    topReview: v.reviews[0]?.text || 'No reviews available',
  }));

  const prompt = `You are an expert event planner. Analyze these venues and recommend the best matches for the user's occasion and preferences.

USER CONTEXT:
Occasion: ${preferences.occasion}
Budget: ${preferences.budget}
Atmosphere: ${preferences.atmosphere || 'any'}
Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'none'}
Group Size: ${preferences.groupSize || 'not specified'}
Additional Preferences: ${preferences.additionalPreferences || 'none'}

VENUES TO ANALYZE:
${JSON.stringify(venueData, null, 2)}

For each venue, provide:
1. matchScore (0-100): How well it matches the user's needs
2. aiReasoning: 2-3 sentences explaining why this venue is a good match
3. pros: 2-4 specific advantages for this occasion
4. cons: 1-2 potential drawbacks or considerations

Return ONLY a JSON array of recommendations, sorted by matchScore (highest first).
Format:
[
  {
    "venueName": "Venue Name",
    "matchScore": 95,
    "aiReasoning": "This venue is perfect for...",
    "pros": ["Great atmosphere", "Excellent reviews", "Perfect price range"],
    "cons": ["May need reservations"]
  }
]

Return the top 5-10 recommendations only.`;

  try {
    const aiRecommendations = await callOpenRouterJSON<AIRecommendation[]>(prompt);

    // Validate response
    if (!Array.isArray(aiRecommendations) || aiRecommendations.length === 0) {
      console.warn('AI returned invalid recommendations');
      // Fallback: return venues sorted by rating
      return venues.slice(0, 5).map((venue, index) => ({
        ...venue,
        matchScore: Math.max(0, 100 - index * 10),
        aiReasoning: `This venue has a ${venue.rating} star rating and matches your search criteria.`,
        pros: venue.rating >= 4 ? ['Highly rated'] : ['Available in your area'],
        cons: venue.reviews.length === 0 ? ['Limited review data'] : [],
      }));
    }

    // Match AI recommendations with venue objects
    const recommendedVenues: RecommendedVenue[] = [];

    for (const aiRec of aiRecommendations) {
      const venue = venues.find(
        (v) => v.name.toLowerCase() === aiRec.venueName.toLowerCase()
      );

      if (venue) {
        recommendedVenues.push({
          ...venue,
          matchScore: aiRec.matchScore,
          aiReasoning: aiRec.aiReasoning,
          pros: aiRec.pros,
          cons: aiRec.cons,
        });
      }
    }

    // If AI didn't match all venues, add remaining ones with lower scores
    if (recommendedVenues.length < 5) {
      const unmatchedVenues = venues.filter(
        (v) => !recommendedVenues.find((rv) => rv.name === v.name)
      );

      for (const venue of unmatchedVenues.slice(0, 5 - recommendedVenues.length)) {
        recommendedVenues.push({
          ...venue,
          matchScore: 50,
          aiReasoning: `This venue matches your search criteria and is located in your desired area.`,
          pros: [`${venue.rating} star rating`],
          cons: ['Limited matching data'],
        });
      }
    }

    // Sort by match score (highest first)
    return recommendedVenues.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  } catch (error) {
    console.error('Error generating recommendations with AI:', error);
    // Fallback: return venues sorted by rating
    return venues.slice(0, 5).map((venue, index) => ({
      ...venue,
      matchScore: Math.max(0, 100 - index * 10),
      aiReasoning: `This venue has a ${venue.rating} star rating and is available in your search area.`,
      pros: venue.rating >= 4 ? ['Highly rated', 'Good reviews'] : ['Available in your area'],
      cons: venue.reviews.length === 0 ? ['Limited review data'] : [],
    }));
  }
}

/**
 * Recommendations API endpoint handler
 *
 * @route POST /api/recommendations
 * @body { venues: Venue[], preferences: UserPreferences }
 * @returns { recommendations: RecommendedVenue[] }
 *
 * @example
 * POST /api/recommendations
 * Body: {
 *   "venues": [...],
 *   "preferences": { "occasion": "date night", "budget": "medium", ... }
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RecommendationResponse | RecommendationsErrorResponse>
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
    const { venues, preferences } = req.body as RecommendationsRequest;

    // Validate venues array
    if (!Array.isArray(venues) || venues.length === 0) {
      return res.status(400).json({
        error: 'Venues array is required and must not be empty.',
        code: 'MISSING_VENUES',
      });
    }

    // Validate preferences
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        error: 'User preferences are required.',
        code: 'MISSING_PREFERENCES',
      });
    }

    if (!preferences.occasion || typeof preferences.occasion !== 'string') {
      return res.status(400).json({
        error: 'Occasion is required in preferences.',
        code: 'MISSING_OCCASION',
      });
    }

    // Generate recommendations using AI
    console.log(`Generating recommendations for ${venues.length} venues`);
    const recommendations = await generateRecommendations(venues, preferences);
    console.log(`Generated ${recommendations.length} recommendations`);

    // Return success response
    return res.status(200).json({
      recommendations,
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
            'Recommendation service is temporarily unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE',
        });
      }

      // Generic error with message
      console.error('Recommendations error:', error.message);
      return res.status(500).json({
        error: 'Failed to generate recommendations. Please try again later.',
        code: 'RECOMMENDATION_FAILED',
      });
    }

    // Unknown error
    console.error('Unknown recommendations error:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred while generating recommendations.',
      code: 'INTERNAL_ERROR',
    });
  }
}
