import Head from 'next/head';
import { useState } from 'react';
import PlanningForm from '@/components/PlanningForm';
import VenueCard from '@/components/VenueCard';
import MapView from '@/components/MapView';
import ExportButtons from '@/components/ExportButtons';
import CreditsModal from '@/components/CreditsModal';
import BackgroundMusic from '@/components/BackgroundMusic';
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
  const [currentStep, setCurrentStep] = useState<string>('');

  /**
   * Main handler for form submission
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden">
      <Head>
        <title>VenueVibe - AI-Powered Venue Discovery</title>
        <meta name="description" content="Discover perfect venues for any occasion with AI-powered recommendations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient mesh */}
        <div className="absolute inset-0 gradient-mesh" />
        {/* Noise texture */}
        <div className="absolute inset-0 noise-overlay" />
        {/* Decorative shapes */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-teal-500/10 dark:bg-teal-400/5 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 dark:bg-amber-400/5 blur-3xl animate-float animation-delay-2000" />
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass rounded-2xl shadow-2xl p-10 max-w-sm mx-4 text-center border border-white/10">
            {/* Animated loader */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-teal-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-amber-500/20" />
              <div className="absolute inset-2 rounded-full border-4 border-amber-500 border-b-transparent animate-spin-slow" style={{ animationDirection: 'reverse' }} />
            </div>
            <h3 className="text-xl font-display font-semibold text-[var(--foreground)] mb-2">
              {currentStep}
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Finding the perfect spots for you...
            </p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <header className="pt-8 pb-6 md:pt-12 md:pb-8">
          <div className="flex items-center justify-center gap-4 animate-fade-up">
            {/* Logo */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25 hover-lift">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              {/* Accent dot */}
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 animate-glow" />
            </div>
            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
                <span className="text-gradient">VenueVibe</span>
              </h1>
              <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 font-medium mt-1">
                Find the perfect place for every moment
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-8 pb-16" style={{ listStyle: 'none' }}>
          {/* Form Section */}
          <section className="animate-fade-up stagger-1">
            <div className="glass rounded-2xl shadow-xl border border-[var(--card-border)] overflow-hidden card-hover">
              {/* Section Header */}
              <div
                className="flex justify-between items-center px-6 py-4 cursor-pointer border-b border-[var(--card-border)] hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors"
                onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                    1
                  </span>
                  <h2 className="text-lg font-display font-semibold">Your Preferences</h2>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                  aria-label={isFormCollapsed ? "Expand preferences" : "Collapse preferences"}
                >
                  <svg
                    className={`w-5 h-5 text-stone-500 transform transition-transform duration-300 ${isFormCollapsed ? '-rotate-90' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Form Content */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFormCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}`}>
                <div className="p-6">
                  <PlanningForm onSubmit={handleFormSubmit} loading={loading} />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mx-6 mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold">Something went wrong</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Results Section */}
          <section id="results-section" style={{ listStyle: 'none' }}>
            {/* Empty State */}
            {!recommendations && !loading && !venues && (
              <div className="glass rounded-2xl shadow-xl border border-[var(--card-border)] p-12 text-center animate-fade-up stagger-2">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-100 to-amber-100 dark:from-teal-900/30 dark:to-amber-900/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">Ready to discover?</h3>
                <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                  Tell us about your occasion and we&apos;ll find the perfect venues for you.
                </p>
              </div>
            )}

            {/* Results */}
            {recommendations && recommendations.length > 0 && userPreferences && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Results Header */}
                <div className="glass rounded-2xl shadow-xl border border-[var(--card-border)] p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                        2
                      </span>
                      <div>
                        <h2 className="text-lg font-display font-semibold">Your Recommendations</h2>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          {recommendations.length} perfect {recommendations.length === 1 ? 'spot' : 'spots'} for your {userPreferences.occasion.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        onClick={handleReset}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all hover-lift"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Start Over
                      </button>
                      <ExportButtons
                        recommendations={recommendations}
                        userPreferences={userPreferences}
                      />
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="glass rounded-2xl shadow-xl border border-[var(--card-border)] overflow-hidden">
                  <div className="w-full h-[450px] sm:h-[500px]">
                    <MapView
                      venues={recommendations}
                      center={recommendations[0]?.location || { lat: 0, lng: 0 }}
                    />
                  </div>
                </div>

                {/* Venue Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {recommendations.map((venue, index) => (
                    <VenueCard key={venue.placeId} venue={venue} index={index} />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
            VenueVibe &copy; 2026. Built with open-source technologies.
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Powered by{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">OpenStreetMap</a>
            {', '}
            <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">Leaflet</a>
            {', '}
            <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">OpenRouter</a>
            {', and '}
            <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">Next.js</a>
          </p>
        </div>
      </footer>

      {/* Credits Modal */}
      <CreditsModal />

      {/* Background Music Player */}
      <BackgroundMusic />
    </div>
  );
}
