/**
 * VenueCard Component
 * Displays clean venue information with AI recommendations
 */

import type { RecommendedVenue } from '@/types/venue';

interface VenueCardProps {
  venue: RecommendedVenue;
  index: number;
}

export default function VenueCard({ venue, index }: VenueCardProps) {
  /**
   * Renders match score badge
   */
  const renderMatchScore = () => {
    const score = venue.matchScore;
    let bgColor = 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200';
    let label = 'Match';

    if (score >= 90) {
      bgColor = 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      label = 'Excellent Match';
    } else if (score >= 75) {
      bgColor = 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      label = 'Great Match';
    } else if (score >= 60) {
      bgColor = 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      label = 'Good Match';
    }

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} transition-colors shadow-sm`}>
        <span className="mr-1">{score}%</span>
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-zinc-800">
      {/* Rank Badge */}
      {index === 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-center font-bold tracking-wide">
          🏆 Top Recommendation
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Header with Match Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 leading-tight">{venue.name}</h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">{venue.address}</p>
          </div>
          <div className="flex-shrink-0">
            {renderMatchScore()}
          </div>
        </div>

        {/* AI Reasoning */}
        {venue.aiReasoning && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-700 p-4 rounded">
            <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
              <span className="font-semibold text-blue-700 dark:text-blue-400">Why this spot: </span>
              {venue.aiReasoning}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              venue.name + ' ' + venue.address
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
          >
            View More on Google →
          </a>
        </div>
      </div>
    </div>
  );
}
