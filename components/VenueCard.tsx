/**
 * VenueCard Component
 * Displays venue information with refined editorial design
 */

import type { RecommendedVenue } from '@/types/venue';

interface VenueCardProps {
  venue: RecommendedVenue;
  index: number;
}

export default function VenueCard({ venue, index }: VenueCardProps) {
  const score = venue.matchScore;

  // Determine match quality styling
  const getMatchStyles = () => {
    if (score >= 90) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        label: 'Excellent Match'
      };
    } else if (score >= 75) {
      return {
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        text: 'text-teal-700 dark:text-teal-400',
        border: 'border-teal-200 dark:border-teal-800',
        label: 'Great Match'
      };
    } else if (score >= 60) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        label: 'Good Match'
      };
    }
    return {
      bg: 'bg-stone-50 dark:bg-stone-800',
      text: 'text-stone-600 dark:text-stone-400',
      border: 'border-stone-200 dark:border-stone-700',
      label: 'Match'
    };
  };

  const matchStyles = getMatchStyles();

  return (
    <article className="group glass rounded-2xl border border-[var(--card-border)] overflow-hidden card-hover">
      {/* Top Recommendation Badge */}
      {index === 0 && (
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 flex items-center justify-center gap-2">
          <span className="text-lg">🏆</span>
          <span className="text-sm font-bold text-white tracking-wide uppercase">Top Pick</span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            {/* Venue Number */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <span className="text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                Recommendation
              </span>
            </div>
            {/* Venue Name */}
            <h3 className="text-xl font-display font-bold text-stone-900 dark:text-stone-100 leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {venue.name}
            </h3>
            {/* Address */}
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{venue.address}</span>
            </p>
          </div>

          {/* Match Score Badge */}
          <div className={`flex-shrink-0 px-3 py-2 rounded-xl ${matchStyles.bg} border ${matchStyles.border}`}>
            <div className={`text-2xl font-bold ${matchStyles.text} text-center`}>
              {score}%
            </div>
            <div className={`text-xs font-medium ${matchStyles.text} text-center whitespace-nowrap`}>
              {matchStyles.label}
            </div>
          </div>
        </div>

        {/* AI Reasoning */}
        {venue.aiReasoning && (
          <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/20 dark:to-teal-800/10 border border-teal-100 dark:border-teal-800/50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                  Why this spot
                </p>
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  {venue.aiReasoning}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + ' ' + venue.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold
            bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900
            hover:bg-stone-800 dark:hover:bg-white
            shadow-md hover:shadow-lg
            transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>View on Google</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </article>
  );
}
