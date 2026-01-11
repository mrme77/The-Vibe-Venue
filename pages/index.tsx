import Head from 'next/head';
import { useState } from 'react';
import PlanningForm from '@/components/PlanningForm';
import VenueCard from '@/components/VenueCard';
import MapView from '@/components/MapView';
import ExportButtons from '@/components/ExportButtons';
import type { UserPreferences } from '@/types/user-preferences';
import type { Venue, RecommendedVenue, RecommendationResponse, VenueSearchResponse } from '@/types/venue';
import axios from 'axios';

export default function Home() {
  // State
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedVenue[] | null>(null);
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
    } catch (err: any) {
      console.error('Planning error:', err);
      setError(
        err.response?.data?.error ||
        err.message ||
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans transition-colors duration-300 relative">
      <Head>
        <title>Date Night & Event Planner</title>
        <meta name="description" content="AI-powered event planner for date nights and outings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600 mb-4">
            Date Night & Event Planner
          </h1>
          <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Let AI plan your perfect outing. Enter your preferences, and we'll find the best spots.
          </p>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-gray-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-zinc-100">
                <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 p-2 rounded-full mr-3 text-sm">1</span>
                Your Preferences
              </h2>
              <PlanningForm onSubmit={handleFormSubmit} loading={loading} />

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="font-bold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 space-y-6">

            {/* Welcome State */}
            {!recommendations && !loading && !venues && (
              <div className="bg-white dark:bg-zinc-900 p-12 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100 flex items-center">
                    <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 p-2 rounded-full mr-3 text-sm">2</span>
                    Recommended Plan
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="px-5 py-2.5 text-sm font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:shadow-md hover:scale-[1.02] active:scale-95 rounded-lg transition-all duration-200 border border-gray-300 dark:border-zinc-700"
                    >
                      Start Over
                    </button>
                    <ExportButtons
                      recommendations={recommendations}
                      userPreferences={userPreferences}
                    />
                  </div>
                </div>

                {/* Map View */}
                <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 overflow-hidden">
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
      <footer className="mt-12 py-6 bg-gray-100 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 text-center text-sm text-gray-500 dark:text-zinc-400">
        <p>© 2026 Date Night Planner. Powered by OpenStreetMap, WikiData & Gemini AI.</p>
      </footer>
    </div>
  );
}
