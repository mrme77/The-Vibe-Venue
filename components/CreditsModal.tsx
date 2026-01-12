/**
 * CreditsModal Component
 * Displays detailed attributions and credits for all open-source technologies used
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
    {
      name: 'Axios',
      url: 'https://axios-http.com/',
      description: 'Promise-based HTTP client',
      license: 'MIT',
      usage: 'API request handling',
    },
    {
      name: 'TypeScript',
      url: 'https://www.typescriptlang.org/',
      description: 'Typed superset of JavaScript',
      license: 'Apache-2.0',
      usage: 'Type safety and developer experience',
    },
  ];

  return (
    <>
      {/* Credits Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-gray-700 dark:text-zinc-300 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-zinc-700"
        aria-label="View credits and attributions"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium">Credits</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Credits & Attributions</h2>
                <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                  Built with open-source technologies and free APIs
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close credits modal"
              >
                <svg className="w-6 h-6 text-gray-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* About Developer */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100 mb-2">About Developer</h3>
                <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
                  Developed by Pasquale Salomone. Visit <a href="https://www.pasqualesalomone.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">www.pasqualesalomone.com</a> to see more projects and get in touch.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {credits.map((credit) => (
                  <div
                    key={credit.name}
                    className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                  >
                    <a
                      href={credit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-2"
                    >
                      {credit.name}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">{credit.description}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500 dark:text-zinc-500">
                        <span className="font-medium">License:</span> {credit.license}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-500">
                        <span className="font-medium">Usage:</span> {credit.usage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100 mb-2">About This Project</h3>
                <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
                  VenueVibe is a privacy-first, stateless web application that leverages 100% free and open-source
                  technologies to provide AI-powered venue recommendations. No user data is stored or tracked.
                  All recommendations are generated in real-time using publicly available data from OpenStreetMap,
                  WikiData, and AI models accessible through OpenRouter.
                </p>
                <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed mt-2">
                  This project demonstrates the power of combining multiple free APIs and open-source libraries
                  to create a valuable user experience at zero cost.
                </p>
              </div>

              {/* Legal Notice */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-800">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100 mb-2 text-sm">Legal Notice</h3>
                <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                  Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">OpenStreetMap</a> contributors, available under the Open Database License (ODbL).
                  WikiData content available under <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">CC0</a>.
                  All trademarks are the property of their respective owners.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
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