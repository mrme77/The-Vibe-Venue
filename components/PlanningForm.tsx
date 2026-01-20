/**
 * PlanningForm Component
 * User input form for event planning with refined editorial design
 */

import { useState } from 'react';
import type { UserPreferences } from '@/types/user-preferences';

const OCCASION_PRESETS = [
  { label: 'Date Night', icon: '💕' },
  { label: 'Birthday', icon: '🎂' },
  { label: 'Team Dinner', icon: '👥' },
  { label: 'Client Meeting', icon: '💼' },
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
  const [radius, setRadius] = useState(5);
  const [groupSize, setGroupSize] = useState<number | ''>('');
  const [atmosphere, setAtmosphere] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [additionalPreferences, setAdditionalPreferences] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!occasion.trim()) newErrors.occasion = 'Occasion is required';
    if (radius < 1 || radius > 25) newErrors.radius = 'Radius must be between 1 and 25 miles';
    if (groupSize !== '' && (groupSize < 1 || groupSize > 100)) newErrors.groupSize = 'Group size must be between 1 and 100';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dietaryArray = dietaryRestrictions
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const preferences: UserPreferences = {
      location: location.trim(),
      occasion: occasion.trim(),
      budget,
      radius: radius * 1609.34,
      groupSize: groupSize === '' ? undefined : Number(groupSize),
      atmosphere: atmosphere.trim() || undefined,
      dietaryRestrictions: dietaryArray.length > 0 ? dietaryArray : undefined,
      additionalPreferences: additionalPreferences.trim() || undefined,
    };

    onSubmit(preferences);
  };

  const isFormValid = location.trim() && occasion.trim();

  const inputClasses = (hasError: boolean) =>
    `block w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
    ${hasError
      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800'
    }
    text-stone-900 dark:text-stone-100
    placeholder:text-stone-400 dark:placeholder:text-stone-500
    focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10
    disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Location & Occasion Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            Location <span className="text-amber-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, neighborhood, or ZIP"
              className={`${inputClasses(!!errors.location)} pl-12`}
              disabled={loading}
            />
          </div>
          {errors.location && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.location}
            </p>
          )}
        </div>

        {/* Occasion */}
        <div>
          <label htmlFor="occasion" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            Occasion <span className="text-amber-500">*</span>
          </label>
          <input
            type="text"
            id="occasion"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="What are you celebrating?"
            className={inputClasses(!!errors.occasion)}
            disabled={loading}
          />
          {errors.occasion && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.occasion}
            </p>
          )}
          {/* Quick Presets */}
          <div className="mt-3 flex flex-wrap gap-2">
            {OCCASION_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setOccasion(preset.label)}
                disabled={loading}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                  ${occasion === preset.label
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span>{preset.icon}</span>
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Selection */}
      <div>
        <label className="block text-base font-bold text-stone-700 dark:text-stone-300 mb-3">
          Budget
        </label>
        <div className="grid grid-cols-4 gap-2 p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800">
          {(['low', 'medium', 'high', 'any'] as const).map((level) => {
            const isSelected = budget === level;
            const labels = { low: '$', medium: '$$', high: '$$$', any: 'Any' };
            const descriptions = { low: 'Budget', medium: 'Moderate', high: 'Upscale', any: 'Flexible' };

            return (
              <button
                key={level}
                type="button"
                onClick={() => setBudget(level)}
                disabled={loading}
                aria-pressed={isSelected}
                className={`relative px-4 py-3 rounded-lg text-center transition-all duration-200
                  ${isSelected
                    ? 'bg-white dark:bg-stone-700 shadow-md'
                    : 'hover:bg-white/50 dark:hover:bg-stone-700/50'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className={`block text-xl font-bold ${isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-stone-500 dark:text-stone-400'}`}>
                  {labels[level]}
                </span>
                <span className={`block text-sm mt-0.5 font-medium ${isSelected ? 'text-stone-600 dark:text-stone-300' : 'text-stone-400 dark:text-stone-500'}`}>
                  {descriptions[level]}
                </span>
                {isSelected && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-teal-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Radius */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label htmlFor="radius" className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            Search Radius
          </label>
          <span className="text-sm font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full">
            {radius} miles
          </span>
        </div>
        <div className="relative pt-2">
          <input
            type="range"
            id="radius"
            min="1"
            max="25"
            step="1"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            disabled={loading}
            className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-teal-500/30
              [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-teal-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {/* Track fill */}
          <div
            className="absolute top-2 left-0 h-2 bg-teal-500 rounded-full pointer-events-none"
            style={{ width: `${((radius - 1) / 24) * 100}%` }}
          />
        </div>
        {/* Tick marks */}
        <div className="flex justify-between mt-2 px-1">
          {[1, 5, 10, 15, 20, 25].map((tick) => (
            <span key={tick} className={`text-xs ${radius === tick ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-stone-400'}`}>
              {tick}
            </span>
          ))}
        </div>
      </div>

      {/* Optional Fields Toggle */}
      <div className="border-t border-stone-200 dark:border-stone-700 pt-6">
        <button
          type="button"
          onClick={() => setShowOptionalFields(!showOptionalFields)}
          disabled={loading}
          className={`group relative inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-base font-semibold transition-all duration-300 disabled:opacity-50
            ${showOptionalFields
              ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              : 'bg-gradient-to-r from-teal-50 to-amber-50 dark:from-teal-950/30 dark:to-amber-950/30 text-teal-700 dark:text-teal-300 shadow-md shadow-teal-500/10 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.02]'
            }`}
        >
          {/* Subtle pulse glow when closed */}
          {!showOptionalFields && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400/20 to-amber-400/20 animate-pulse" />
          )}

          <svg
            className={`relative z-10 w-5 h-5 transition-transform duration-300 ${showOptionalFields ? 'rotate-90 text-stone-500' : 'text-teal-600 dark:text-teal-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <span className="relative z-10">
            {showOptionalFields ? 'Less options' : 'More options'}
          </span>

          {/* Badge indicator when closed */}
          {!showOptionalFields && (
            <span className="relative z-10 ml-1 px-2 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
              Customize
            </span>
          )}
        </button>

        {showOptionalFields && (
          <div className="mt-6 space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Group Size */}
              <div>
                <label htmlFor="groupSize" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  Group Size
                </label>
                <input
                  type="number"
                  id="groupSize"
                  min="1"
                  max="100"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Number of people"
                  className={inputClasses(!!errors.groupSize)}
                  disabled={loading}
                />
                {errors.groupSize && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.groupSize}</p>
                )}
              </div>

              {/* Atmosphere */}
              <div>
                <label htmlFor="atmosphere" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  Atmosphere
                </label>
                <input
                  type="text"
                  id="atmosphere"
                  value={atmosphere}
                  onChange={(e) => setAtmosphere(e.target.value)}
                  placeholder="Romantic, casual, lively..."
                  className={inputClasses(false)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label htmlFor="dietaryRestrictions" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                Dietary Restrictions
              </label>
              <input
                type="text"
                id="dietaryRestrictions"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                placeholder="Vegetarian, gluten-free, vegan..."
                className={inputClasses(false)}
                disabled={loading}
              />
              <p className="mt-1.5 text-xs text-stone-500">Separate multiple with commas</p>
            </div>

            {/* Additional Preferences */}
            <div>
              <label htmlFor="additionalPreferences" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                Additional Notes
              </label>
              <textarea
                id="additionalPreferences"
                rows={3}
                value={additionalPreferences}
                onChange={(e) => setAdditionalPreferences(e.target.value)}
                placeholder="Outdoor seating, live music, kid-friendly..."
                className={`${inputClasses(false)} resize-none`}
                disabled={loading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isFormValid}
        className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200
          ${loading || !isFormValid
            ? 'bg-stone-300 dark:bg-stone-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0'
          }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Finding venues...
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
    </form>
  );
}
