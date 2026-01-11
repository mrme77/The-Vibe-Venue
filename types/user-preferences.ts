/**
 * User preferences for event planning and venue search
 * Captured from the planning form and used to generate personalized recommendations
 */
export interface UserPreferences {
  /**
   * Type of occasion or event
   * @example "date night", "team outing", "birthday celebration", "anniversary dinner"
   */
  occasion: string;

  /**
   * Starting location (city name or zip code)
   * @example "New York, NY", "10001", "San Francisco"
   */
  location: string;

  /**
   * Search radius in meters from the starting location
   * @example 5000 (approximately 3 miles)
   */
  radius: number;

  /**
   * Budget preference level
   * - 'low': $ (budget-friendly)
   * - 'medium': $$ (moderate)
   * - 'high': $$$ - $$$$ (upscale)
   * - 'any': No budget preference
   */
  budget: 'low' | 'medium' | 'high' | 'any';

  /**
   * Dietary restrictions or preferences (optional)
   * @example ["vegetarian", "gluten-free", "vegan"]
   */
  dietaryRestrictions?: string[];

  /**
   * Desired atmosphere or vibe (optional)
   * @example "romantic", "casual", "upscale", "lively", "quiet"
   */
  atmosphere?: string;

  /**
   * Number of people in the group (optional)
   * @example 2 for a couple, 8 for a team outing
   */
  groupSize?: number;

  /**
   * Any additional preferences or requirements (optional)
   * Free-form text for specific requests
   * @example "Must have outdoor seating", "Live music preferred", "Kid-friendly"
   */
  additionalPreferences?: string;
}
