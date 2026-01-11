/**
 * PlanningForm Component
 * User input form for event planning - location, occasion, preferences, etc.
 */

import { useState } from 'react';
import type { UserPreferences } from '@/types/user-preferences';

interface PlanningFormProps {
  onSubmit: (preferences: UserPreferences) => void;
  loading?: boolean;
}

export default function PlanningForm({ onSubmit, loading = false }: PlanningFormProps) {
  // Form state
  const [location, setLocation] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState<'low' | 'medium' | 'high' | 'any'>('any');
  const [radius, setRadius] = useState(5); // miles
  const [groupSize, setGroupSize] = useState<number | ''>('');
  const [atmosphere, setAtmosphere] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [additionalPreferences, setAdditionalPreferences] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  /**
   * Validates form inputs
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!occasion.trim()) {
      newErrors.occasion = 'Occasion is required';
    }

    if (radius < 1 || radius > 25) {
      newErrors.radius = 'Radius must be between 1 and 25 miles';
    }

    if (groupSize !== '' && (groupSize < 1 || groupSize > 100)) {
      newErrors.groupSize = 'Group size must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Parse dietary restrictions (comma-separated)
    const dietaryArray = dietaryRestrictions
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    // Build preferences object
    const preferences: UserPreferences = {
      location: location.trim(),
      occasion: occasion.trim(),
      budget,
      radius: radius * 1609.34, // Convert miles to meters
      groupSize: groupSize === '' ? undefined : Number(groupSize),
      atmosphere: atmosphere.trim() || undefined,
      dietaryRestrictions: dietaryArray.length > 0 ? dietaryArray : undefined,
      additionalPreferences: additionalPreferences.trim() || undefined,
    };

    onSubmit(preferences);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md transition-colors">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Plan Your Event</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
          Tell us about your occasion and we'll find the perfect venues
        </p>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., New York, NY or 10001"
          className={`mt-1 block w-full rounded-md border ${
            errors.location ? 'border-red-300 dark:border-red-900' : 'border-gray-300 dark:border-zinc-700'
          } bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-zinc-500`}
          disabled={loading}
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>
        )}
      </div>

      {/* Occasion */}
      <div>
        <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
          Occasion <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="occasion"
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          placeholder="e.g., romantic date night, team outing, birthday celebration"
          className={`mt-1 block w-full rounded-md border ${
            errors.occasion ? 'border-red-300 dark:border-red-900' : 'border-gray-300 dark:border-zinc-700'
          } bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-zinc-500`}
          disabled={loading}
        />
        {errors.occasion && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.occasion}</p>
        )}
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          Budget
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(['low', 'medium', 'high', 'any'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setBudget(level)}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                budget === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {level === 'low' && '$ Budget'}
              {level === 'medium' && '$$ Moderate'}
              {level === 'high' && '$$$ Upscale'}
              {level === 'any' && 'Any'}
            </button>
          ))}
        </div>
      </div>

      {/* Radius */}
      <div>
        <label htmlFor="radius" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
          Search Radius: {radius} miles
        </label>
        <input
          type="range"
          id="radius"
          min="1"
          max="25"
          step="1"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          disabled={loading}
          className="mt-2 w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-500 mt-1">
          <span>1 mi</span>
          <span>25 mi</span>
        </div>
        {errors.radius && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.radius}</p>
        )}
      </div>

      {/* Group Size */}
      <div>
        <label htmlFor="groupSize" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
          Group Size (optional)
        </label>
        <input
          type="number"
          id="groupSize"
          min="1"
          max="100"
          value={groupSize}
          onChange={(e) => setGroupSize(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="e.g., 2 for a couple, 8 for a team"
          className={`mt-1 block w-full rounded-md border ${
            errors.groupSize ? 'border-red-300 dark:border-red-900' : 'border-gray-300 dark:border-zinc-700'
          } bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-zinc-500`}
          disabled={loading}
        />
        {errors.groupSize && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.groupSize}</p>
        )}
      </div>

      {/* Atmosphere */}
      <div>
        <label htmlFor="atmosphere" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
          Atmosphere (optional)
        </label>
        <input
          type="text"
          id="atmosphere"
          value={atmosphere}
          onChange={(e) => setAtmosphere(e.target.value)}
          placeholder="e.g., romantic, casual, upscale, lively"
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          disabled={loading}
        />
      </div>

      {/* Dietary Restrictions */}
      <div>
        <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
          Dietary Restrictions (optional)
        </label>
        <input
          type="text"
          id="dietaryRestrictions"
          value={dietaryRestrictions}
          onChange={(e) => setDietaryRestrictions(e.target.value)}
          placeholder="e.g., vegetarian, gluten-free, vegan (comma-separated)"
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">Separate multiple items with commas</p>
      </div>

      {/* Additional Preferences */}
      <div>
        <label htmlFor="additionalPreferences" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
          Additional Preferences (optional)
        </label>
        <textarea
          id="additionalPreferences"
          rows={3}
          value={additionalPreferences}
          onChange={(e) => setAdditionalPreferences(e.target.value)}
          placeholder="e.g., Must have outdoor seating, live music preferred, kid-friendly"
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          disabled={loading}
        />
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white transition-all duration-200 ${
            loading
              ? 'bg-gray-400 dark:bg-zinc-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 hover:shadow-xl hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Searching for venues...
            </span>
          ) : (
            'Find Venues'
          )}
        </button>
      </div>
    </form>
  );
}
