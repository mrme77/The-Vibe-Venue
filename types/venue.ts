/**
 * Represents a customer review for a venue from Google Places
 */
export interface Review {
  /** Name of the review author */
  author: string;
  /** Rating given by the author (1-5) */
  rating: number;
  /** Full text content of the review */
  text: string;
  /** Unix timestamp of when the review was posted */
  time: number;
}

/**
 * Represents a venue (restaurant, bar, etc.) with details from Google Places API
 */
export interface Venue {
  /** Venue name */
  name: string;
  /** Full street address */
  address: string;
  /** Average rating from Google (0-5) */
  rating: number;
  /** Price level indicator (1 = $, 2 = $$, 3 = $$$, 4 = $$$$) */
  priceLevel: number;
  /** Array of photo URLs from Google Places */
  photos: string[];
  /** Customer reviews from Google Places */
  reviews: Review[];
  /** Opening hours (array of strings like "Monday: 5:00 PM – 10:00 PM") */
  openingHours?: string[];
  /** Unique Google Places ID for this venue */
  placeId: string;
  /** Geographic coordinates of the venue */
  location: {
    /** Latitude */
    lat: number;
    /** Longitude */
    lng: number;
  };
}

/**
 * Response from the /api/search-venues endpoint
 * Contains venues found and the AI-generated search queries used
 */
export interface VenueSearchResponse {
  /** Array of venues found matching the search criteria */
  venues: Venue[];
  /** AI-generated search queries that were used to find these venues */
  searchQueries: string[];
}

/**
 * A venue with AI-generated recommendation details
 * Extends the base Venue interface with personalized analysis
 */
export interface RecommendedVenue extends Venue {
  /** AI-generated explanation for why this venue is recommended */
  aiReasoning: string;
  /** Match score from 0-100 indicating how well this venue fits the user's preferences */
  matchScore: number;
  /** List of positive aspects of this venue for the user's occasion */
  pros: string[];
  /** List of potential drawbacks or considerations */
  cons: string[];
}

/**
 * Response from the /api/recommendations endpoint
 * Contains AI-analyzed and ranked venue recommendations
 */
export interface RecommendationResponse {
  /** Array of recommended venues sorted by match score (best first) */
  recommendations: RecommendedVenue[];
}
