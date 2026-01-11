/**
 * ExportButtons Component
 * Provides button to copy plan to clipboard
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

  /**
   * Copies plan summary to clipboard
   */
  const handleCopyToClipboard = async () => {
    try {
      // Generate text summary
      const summary = generateTextSummary(recommendations, userPreferences);

      // Copy to clipboard
      await navigator.clipboard.writeText(summary);

      // Show success message
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
        className={`flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md ${
          copySuccess
            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white scale-[1.02]'
            : recommendations.length === 0
            ? 'bg-gray-300 dark:bg-zinc-800 text-gray-500 dark:text-zinc-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-gray-700 to-gray-800 dark:from-zinc-700 dark:to-zinc-800 text-white hover:from-gray-800 hover:to-gray-900 dark:hover:from-zinc-600 dark:hover:to-zinc-700 hover:shadow-lg hover:scale-[1.02] active:scale-95'
        }`}
      >
        {copySuccess ? (
        <>
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          Copy to Clipboard
        </>
      )}
    </button>
  );
}
