/**
 * CreditsModal Component
 * Displays detailed attributions with refined editorial design
 */

import { useState } from 'react';

export default function CreditsModal() {
  const [isOpen, setIsOpen] = useState(false);

  const credits = [
    {
      name: 'OpenStreetMap',
      url: 'https://www.openstreetmap.org/copyright',
      description: 'Free geographic data and mapping',
      license: 'ODbL',
      usage: 'Map tiles, geocoding (Nominatim), and venue data (Overpass API)',
    },
    {
      name: 'Leaflet',
      url: 'https://leafletjs.com/',
      description: 'Open-source JavaScript library for interactive maps',
      license: 'BSD-2-Clause',
      usage: 'Interactive map rendering and marker display',
    },
    {
      name: 'WikiData',
      url: 'https://www.wikidata.org/',
      description: 'Free collaborative knowledge base',
      license: 'CC0',
      usage: 'Venue descriptions and enrichment data',
    },
    {
      name: 'OpenRouter',
      url: 'https://openrouter.ai/',
      description: 'Unified AI model API gateway',
      license: 'Proprietary (Free tier available)',
      usage: 'AI-powered search query generation and venue recommendations',
    },
    {
      name: 'Gemini AI',
      url: 'https://ai.google.dev/',
      description: 'Google\'s advanced AI models',
      license: 'Proprietary (Free tier via OpenRouter)',
      usage: 'Natural language understanding and personalized recommendations',
    },
    {
      name: 'Next.js',
      url: 'https://nextjs.org/',
      description: 'React framework for production',
      license: 'MIT',
      usage: 'Full-stack web application framework',
    },
    {
      name: 'React',
      url: 'https://reactjs.org/',
      description: 'JavaScript library for building user interfaces',
      license: 'MIT',
      usage: 'Component-based UI architecture',
    },
    {
      name: 'Tailwind CSS',
      url: 'https://tailwindcss.com/',
      description: 'Utility-first CSS framework',
      license: 'MIT',
      usage: 'Styling and responsive design',
    },
  ];

  return (
    <>
      {/* Credits Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 glass rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 border border-[var(--card-border)]"
        aria-label="View credits and attributions"
      >
        <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Credits</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[var(--card-border)]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--card-border)] flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-stone-900 dark:text-stone-100">Credits & Attributions</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Built with open-source technologies and free APIs
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label="Close credits modal"
              >
                <svg className="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* About Developer */}
              <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/20 dark:to-teal-800/10 border border-teal-100 dark:border-teal-800/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-stone-900 dark:text-stone-100 mb-1">About the Developer</h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                      Developed by Pasquale Salomone. Visit{' '}
                      <a href="https://www.pasqualesalomone.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
                        pasqualesalomone.com
                      </a>{' '}
                      to see more projects.
                    </p>
                  </div>
                </div>
              </div>

              {/* Credits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {credits.map((credit) => (
                  <div
                    key={credit.name}
                    className="p-4 rounded-xl border border-[var(--card-border)] bg-white/50 dark:bg-stone-800/50 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <a
                      href={credit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-display font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-2 transition-colors"
                    >
                      {credit.name}
                      <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{credit.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                        {credit.license}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* About Project */}
              <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-100 dark:border-amber-800/50">
                <h3 className="font-display font-semibold text-stone-900 dark:text-stone-100 mb-2">About VenueVibe</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  A privacy-first, stateless web application that uses 100% free and open-source technologies
                  for AI-powered venue recommendations. No user data is stored or tracked. All recommendations
                  are generated in real-time using publicly available data.
                </p>
              </div>

              {/* Legal Notice */}
              <div className="mt-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-[var(--card-border)]">
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  Map data &copy;{' '}
                  <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">
                    OpenStreetMap
                  </a>{' '}
                  contributors (ODbL). WikiData content available under{' '}
                  <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">
                    CC0
                  </a>.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--card-border)] flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all duration-200 font-medium shadow-md shadow-teal-500/25 hover:shadow-lg hover:-translate-y-0.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
