import Head from 'next/head';
import { useState } from 'react';
import PlanningForm from '@/components/PlanningForm';
import VenueCard from '@/components/VenueCard';
import MapView from '@/components/MapView';
import ExportButtons from '@/components/ExportButtons';
import CreditsModal from '@/components/CreditsModal';
import type { UserPreferences } from '@/types/user-preferences';
import type { Venue, RecommendedVenue, RecommendationResponse, VenueSearchResponse } from '@/types/venue';
import axios from 'axios';

export default function Home() {
  // State
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedVenue[] | null>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>(''); // 'geocoding', 'searching', 'analyzing'

  /**
   * Main handler for form submission
   * Orchestrates the API calls: Geocode -> Search -> Recommend
   */
  const handleFormSubmit = async (prefs: UserPreferences) => {
    setLoading(true);
    setError(null);
    setUserPreferences(prefs);
    setVenues(null);
    setRecommendations(null);

    try {
      // Step 1: Geocode Location
      setCurrentStep('Locating...');
      const geocodeRes = await axios.post('/api/geocode', {
        location: prefs.location,
      });
      const { lat, lng } = geocodeRes.data;

      // Step 2: Search Venues
      setCurrentStep('Searching venues...');
      const searchRes = await axios.post<VenueSearchResponse>('/api/search-venues', {
        occasion: prefs.occasion,
        location: { lat, lng },
        radius: prefs.radius,
        preferences: prefs,
      });

      const foundVenues = searchRes.data.venues;
      setVenues(foundVenues);

      if (foundVenues.length === 0) {
        setError('No venues found. Try increasing the search radius or choosing a different location.');
        setLoading(false);
        setCurrentStep('');
        return;
      }

      // Step 3: Get AI Recommendations
      setCurrentStep('Analyzing matches...');
      const recRes = await axios.post<RecommendationResponse>('/api/recommendations', {
        venues: foundVenues,
        preferences: prefs,
      });

      setRecommendations(recRes.data.recommendations);
      setIsFormCollapsed(true);

      // Auto-scroll to results section after a brief delay for collapse animation
      setTimeout(() => {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      console.error('Planning error:', err);
      setError(
        error.response?.data?.error ||
        error.message ||
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
      setCurrentStep('');
    }
  };

  const handleReset = () => {
    setUserPreferences(null);
    setVenues(null);
    setRecommendations(null);
    setError(null);
    setIsFormCollapsed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 text-gray-900 dark:text-zinc-100 font-sans transition-colors duration-300 relative overflow-hidden">
      <Head>
        <title>VenueVibe - AI-Powered Venue Discovery</title>
        <meta name="description" content="Discover perfect venues for any occasion with AI-powered recommendations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Subtle Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft gradient orbs */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-200/30 dark:bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 bg-pink-200/30 dark:bg-pink-500/10 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-violet-200/30 dark:bg-violet-500/10 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Fullscreen Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-violet-200 dark:border-violet-900 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-violet-600 dark:border-violet-400 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
              {currentStep}
            </h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              This uses live AI and real-time data. Please wait...
            </p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <header className="text-center py-4 md:py-6 mb-6 relative">
          <div className="relative z-10">
            {/* Logo and Title */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 transform hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                VenueVibe
              </h1>
            </div>
            {/* Tagline */}
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium animate-pulse-slow">
              Find the perfect place for every moment
            </p>
          </div>
        </header>

        {/* Main Layout */}
        <div className="space-y-6 pb-12" style={{ listStyle: 'none' }}>

          {/* Form Section */}
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-purple-200/50 dark:border-purple-700/50 transition-all duration-300">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
            >
              <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-zinc-100 select-none">
                <span className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-2 rounded-full mr-3 text-sm shadow-lg">1</span>
                Your Preferences
              </h2>
              <button 
                type="button"
                className="text-gray-500 hover:text-purple-600 transition-colors focus:outline-none"
                aria-label={isFormCollapsed ? "Expand preferences" : "Collapse preferences"}
              >
                <svg 
                  className={`w-6 h-6 transform transition-transform duration-300 ${isFormCollapsed ? '-rotate-90' : 'rotate-0'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFormCollapsed ? 'max-h-0 opacity-0 mt-0' : 'max-h-[2000px] opacity-100 mt-4'}`}>
              <PlanningForm onSubmit={handleFormSubmit} loading={loading} />

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-700 backdrop-blur-sm">
                  <p className="font-bold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div id="results-section" style={{ listStyle: 'none' }}>

            {/* Welcome State */}
            {!recommendations && !loading && !venues && (
              <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-purple-200/50 dark:border-purple-700/50 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100 mb-2">Ready to Plan?</h3>
                <p className="text-gray-500 dark:text-zinc-400 max-w-md">
                  Fill out the form on the left to discover curated venues for your special occasion.
                </p>
              </div>
            )}

            {/* Recommended Plan - Shows in Right Column */}
            {recommendations && recommendations.length > 0 && userPreferences && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-4 rounded-lg shadow-2xl border border-purple-200/50 dark:border-purple-700/50">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100 flex items-center">
                    <span className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-2 rounded-full mr-3 text-sm shadow-lg">2</span>
                    Recommended Plan
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md bg-gradient-to-r from-gray-600 to-gray-700 dark:from-zinc-600 dark:to-zinc-700 text-white hover:from-gray-700 hover:to-gray-800 dark:hover:from-zinc-500 dark:hover:to-zinc-600 hover:shadow-lg hover:scale-[1.02] active:scale-95"
                    >
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Start Over
                    </button>
                    <ExportButtons
                      recommendations={recommendations}
                      userPreferences={userPreferences}
                    />
                  </div>
                </div>

                {/* Map View */}
                <div className="w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-200/50 dark:border-purple-700/50 overflow-hidden">
                  <div className="w-full h-[500px]">
                    <MapView
                      venues={recommendations}
                      center={recommendations[0]?.location || { lat: 0, lng: 0 }}
                    />
                  </div>
                </div>

                {/* Recommendations List */}
                <div className="grid grid-cols-1 gap-6">
                  {recommendations.map((venue, index) => (
                    <VenueCard key={venue.placeId} venue={venue} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400 relative z-10">
        <div className="container mx-auto px-4">
          <p className="mb-3 font-medium">© 2026 VenueVibe. Built with open-source technologies.</p>
          <p className="text-xs">
            Powered by{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 hover:underline transition-colors">
              OpenStreetMap
            </a>
            {' '}contributors,{' '}
            <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 hover:underline transition-colors">
              Leaflet
            </a>
            ,{' '}
            <a href="https://www.wikidata.org/" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 hover:underline transition-colors">
              WikiData
            </a>
            ,{' '}
            <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 hover:underline transition-colors">
              OpenRouter
            </a>
            {' '}(Gemini AI), and{' '}
            <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 hover:underline transition-colors">
              Next.js
            </a>
          </p>
        </div>
      </footer>

      {/* Credits Modal */}
      <CreditsModal />
    </div>
  );
}
