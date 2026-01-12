/**
 * PlanningForm Component
 * User input form for event planning - location, occasion, preferences, etc.
 * Redesigned with modern UI/UX best practices
 */

import { useState } from 'react';
import type { UserPreferences } from '@/types/user-preferences';

// Popular occasion presets
const OCCASION_PRESETS = [
  'Date night',
  'Birthday',
  'Team dinner',
  'Client meeting',
];

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

  // UI state
  const [showOptionalFields, setShowOptionalFields] = useState(false);

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

  // Check if form is ready to submit
  const isFormValid = location.trim() && occasion.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location and Occasion - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Location - 5 columns on desktop */}
        <div className="md:col-span-5">
          <label htmlFor="location" className="block text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400 mb-2">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or ZIP code"
              className={`block w-full pl-10 pr-3 py-3 rounded-lg border ${
                errors.location ? 'border-red-300 dark:border-red-700 ring-2 ring-red-100 dark:ring-red-900/50' : 'border-gray-300 dark:border-zinc-600'
              } bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500`}
              disabled={loading}
            />
          </div>
          {errors.location && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.location}</p>
          )}
          <p className="mt-1.5 text-xs text-gray-500 dark:text-zinc-500">City, neighborhood, or ZIP code</p>
        </div>

        {/* Occasion - 7 columns on desktop */}
        <div className="md:col-span-7">
          <label htmlFor="occasion" className="block text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400 mb-2">
            Occasion <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-xl">🎉</span>
            </div>
            <input
              type="text"
              id="occasion"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="What's the occasion?"
              list="occasion-suggestions"
              className={`block w-full pl-10 pr-3 py-3 rounded-lg border ${
                errors.occasion ? 'border-red-300 dark:border-red-700 ring-2 ring-red-100 dark:ring-red-900/50' : 'border-gray-300 dark:border-zinc-600'
              } bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500`}
              disabled={loading}
            />
            <datalist id="occasion-suggestions">
              {OCCASION_PRESETS.map((preset) => (
                <option key={preset} value={preset} />
              ))}
            </datalist>
          </div>
          {errors.occasion && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.occasion}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {OCCASION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setOccasion(preset)}
                className="px-3 py-1 text-xs font-medium rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                disabled={loading}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Budget - Segmented Control */}
      <div>
        <label className="block text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400 mb-3">
          Budget
        </label>
        <div className="inline-flex rounded-lg bg-gray-100 dark:bg-zinc-800 p-1 shadow-sm w-full">
          {(['low', 'medium', 'high', 'any'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setBudget(level)}
              disabled={loading}
              aria-pressed={budget === level}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-semibold transition-all duration-200 ${
                budget === level
                  ? level === 'high'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                    : level === 'medium'
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30 scale-105'
                    : level === 'low'
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-md scale-105'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-700/50'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {level === 'low' && '$'}
              {level === 'medium' && '$$'}
              {level === 'high' && '$$$'}
              {level === 'any' && 'Any'}
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-zinc-500">
          <span>Budget</span>
          <span>Moderate</span>
          <span>Upscale</span>
          <span>Flexible</span>
        </div>
      </div>

      {/* Radius Slider */}
      <div>
        <label htmlFor="radius" className="block text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400 mb-3">
          Search Radius: <span className="text-purple-600 dark:text-purple-400 font-bold">{radius} miles</span>
        </label>
        <div className="relative">
          <input
            type="range"
            id="radius"
            min="1"
            max="25"
            step="1"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            disabled={loading}
            className="w-full h-3 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-purple-500/50 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-purple-500 [&::-moz-range-thumb]:to-pink-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-purple-500/50 [&::-moz-range-thumb]:border-0"
          />
          {/* Tick marks */}
          <div className="flex justify-between mt-2 px-0.5">
            {[1, 5, 10, 25].map((tick) => (
              <div key={tick} className="flex flex-col items-center">
                <div className={`w-0.5 h-2 ${radius === tick ? 'bg-purple-500' : 'bg-gray-300 dark:bg-zinc-600'}`}></div>
                <span className="text-xs text-gray-500 dark:text-zinc-500 mt-1">{tick}</span>
              </div>
            ))}
          </div>
        </div>
        {errors.radius && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.radius}</p>
        )}
      </div>

      {/* Progressive Disclosure - Optional Fields */}
      <div>
        <button
          type="button"
          onClick={() => setShowOptionalFields(!showOptionalFields)}
          className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          disabled={loading}
        >
          <svg
            className={`w-4 h-4 transition-transform ${showOptionalFields ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {showOptionalFields ? 'Hide' : 'Show'} more preferences
        </button>

        {showOptionalFields && (
          <div className="mt-4 space-y-4 animate-fade-in-up">
            {/* Group Size */}
            <div>
              <label htmlFor="groupSize" className="block text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400 mb-2">
                Group Size
              </label>
              <input
                type="number"
                id="groupSize"
                min="1"
                max="100"
                value={groupSize}
                onChange={(e) => setGroupSize(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g., 2 for a couple, 8 for a team"
                className={`block w-full px-3 py-3 rounded-lg border ${
                  errors.groupSize ? 'border-red-300 dark:border-red-700 ring-2 ring-red-100 dark:ring-red-900/50' : 'border-gray-300 dark:border-zinc-600'
                } bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500`}
                disabled={loading}
              />
              {errors.groupSize && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.groupSize}</p>
              )}
            </div>

            {/* Atmosphere */}
            <div>
              <label htmlFor="atmosphere" className="block text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400 mb-2">
                Atmosphere
              </label>
              <input
                type="text"
                id="atmosphere"
                value={atmosphere}
                onChange={(e) => setAtmosphere(e.target.value)}
                placeholder="e.g., romantic, casual, upscale, lively"
                className="block w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                disabled={loading}
              />
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label htmlFor="dietaryRestrictions" className="block text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400 mb-2">
                Dietary Restrictions
              </label>
              <input
                type="text"
                id="dietaryRestrictions"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                placeholder="e.g., vegetarian, gluten-free, vegan (comma-separated)"
                className="block w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                disabled={loading}
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-zinc-500">Separate multiple items with commas</p>
            </div>

            {/* Additional Preferences */}
            <div>
              <label htmlFor="additionalPreferences" className="block text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400 mb-2">
                Additional Preferences
              </label>
              <textarea
                id="additionalPreferences"
                rows={3}
                value={additionalPreferences}
                onChange={(e) => setAdditionalPreferences(e.target.value)}
                placeholder="e.g., Must have outdoor seating, live music preferred, kid-friendly"
                className="block w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                disabled={loading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg shadow-lg text-base font-semibold text-white transition-all duration-200 ${
            loading || !isFormValid
              ? 'bg-gray-400 dark:bg-zinc-700 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 hover:shadow-xl hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              Finding the vibe…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Venues
            </>
          )}
        </button>
      </div>
    </form>
  );
}
