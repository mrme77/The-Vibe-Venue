/**
 * ExportButtons Component
 * Provides button to copy plan to clipboard with refined design
 */

import { useState } from 'react';
import type { RecommendedVenue } from '@/types/venue';
import type { UserPreferences } from '@/types/user-preferences';
import { generateTextSummary } from '@/lib/pdf-generator';

interface ExportButtonsProps {
  recommendations: RecommendedVenue[];
  userPreferences: UserPreferences;
}

export default function ExportButtons({
  recommendations,
  userPreferences,
}: ExportButtonsProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      const summary = generateTextSummary(recommendations, userPreferences);
      await navigator.clipboard.writeText(summary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Error copying to clipboard. Please try again.');
    }
  };

  return (
    <button
      onClick={handleCopyToClipboard}
      disabled={recommendations.length === 0}
      className={`flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium transition-all duration-200
        ${copySuccess
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
          : recommendations.length === 0
          ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
          : 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0'
        }`}
    >
      {copySuccess ? (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy Plan
        </>
      )}
    </button>
  );
}
