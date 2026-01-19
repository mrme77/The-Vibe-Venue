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

  const prompt = `You are an expert event planner. Analyze these venues and recommend the BEST matches for the user's specific occasion and preferences.

USER CONTEXT:
Occasion: ${preferences.occasion}
Budget: ${preferences.budget}
Group Size: ${preferences.groupSize || 'not specified'}
Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'none'}
Desired Atmosphere: ${preferences.atmosphere || 'any'}
Additional Preferences: ${preferences.additionalPreferences || 'none'}

AVAILABLE VENUES:
${JSON.stringify(venueData, null, 2)}

TASK: Analyze each venue and provide:
1. **matchScore** (0-100): How well this venue matches the user's specific needs
   - Consider: occasion appropriateness, budget fit, atmosphere match, dietary compatibility
   - 90-100: Perfect match
   - 70-89: Great match with minor compromises
   - 50-69: Good option but notable limitations
   - Below 50: Poor match

2. **aiReasoning** (2-3 sentences): Explain WHY this venue works for THIS specific occasion
   - Be specific to the user's occasion and preferences
   - Reference the venue's actual features and atmosphere
   - Do NOT mention ratings or review scores

3. **pros** (2-4 items): Specific advantages for THIS occasion
   - Focus on what makes it great for their needs
   - Be concrete and actionable

4. **cons** (1-2 items): Honest potential drawbacks
   - Practical considerations (reservations, parking, etc.)
   - Be helpful, not overly negative

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, just the JSON array.
Format:
[
  {
    "venueName": "Exact Venue Name from list",
    "matchScore": 95,
    "aiReasoning": "This venue is perfect because...",
    "pros": ["Specific advantage 1", "Specific advantage 2", "Specific advantage 3"],
    "cons": ["Practical consideration"]
  }
]

Return TOP 5 recommendations ONLY, sorted by matchScore (highest first).`;

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

    // Sort by match score (highest first) and limit to top 5
    return recommendedVenues.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
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
    const recommendations = await generateRecommendations(venues, preferences);

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
