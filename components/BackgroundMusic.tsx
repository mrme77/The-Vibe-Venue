/**
 * BackgroundMusic Component
 * Provides autoplay background music with user controls
 */

import { useState, useRef, useEffect } from 'react';

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Initialize with consistent defaults (same on server and client)
  // Volume starts at 20% (0.2) to be subtle and not overwhelming
  const [volume, setVolume] = useState(0.2);
  // isPlaying starts false for hydration, then restored from localStorage
  const [isPlaying, setIsPlaying] = useState(false);

  // Hydrate from localStorage after mount (client-side only)
  useEffect(() => {
    // Restore volume from localStorage (defaults to 20% if not saved)
    const savedVolume = localStorage.getItem('musicVolume');
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }

    // Restore play state from localStorage
    // AUTOPLAY: Defaults to TRUE (autoplay) unless user has explicitly paused it before
    const savedPlayState = localStorage.getItem('musicPlaying');
    const shouldAutoplay = savedPlayState !== 'false'; // null → true (autoplay), 'false' → false (paused), 'true' → true (playing)
    setIsPlaying(shouldAutoplay);
  }, []);

  // Handle play/pause whenever isPlaying changes (including initial autoplay)
  useEffect(() => {
    const attemptPlayback = async () => {
      if (!audioRef.current) return;

      if (isPlaying) {
        try {
          await audioRef.current.play();
          setAutoplayBlocked(false);
          localStorage.setItem('musicPlaying', 'true');
        } catch (err) {
          console.log('Autoplay blocked by browser:', err);
          setAutoplayBlocked(true);
          setIsPlaying(false);
        }
      } else {
        audioRef.current.pause();
      }
    };

    // Small delay to ensure audio element is ready
    const timer = setTimeout(attemptPlayback, 500);
    return () => clearTimeout(timer);
  }, [isPlaying]);

  // Update audio element when volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (typeof window !== 'undefined') {
        localStorage.setItem('musicVolume', volume.toString());
      }
    }
  }, [volume]);

  const togglePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('musicPlaying', 'false');
        }
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setAutoplayBlocked(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('musicPlaying', 'true');
          }
        } catch (err) {
          console.error('Error playing audio:', err);
        }
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <div className="fixed top-6 right-6 z-40 group">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="/music/background-music.mp3"
      />

      {/* Autoplay Blocked Notification */}
      {autoplayBlocked && (
        <div className="absolute top-full right-0 mt-2 glass rounded-xl p-3 shadow-xl border border-[var(--card-border)] animate-fade-in w-64">
          <p className="text-xs text-stone-600 dark:text-stone-400">
            🎵 Click to start background music
          </p>
        </div>
      )}

      {/* Volume Slider - appears on hover */}
      {showVolumeSlider && (
        <div
          className="absolute top-full right-0 pt-3 -mt-2 glass rounded-xl px-4 pb-4 shadow-xl border border-[var(--card-border)] animate-fade-in"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <div className="flex items-center gap-3 min-w-[160px]">
            <svg className="w-4 h-4 text-stone-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-full appearance-none cursor-pointer accent-teal-500"
              aria-label="Volume control"
            />
            <span className="text-xs text-stone-600 dark:text-stone-400 font-medium w-9 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      )}

      {/* Elegant Music Control Bar */}
      <div
        className="glass rounded-full px-3 py-2.5 shadow-lg border border-[var(--card-border)] flex items-center gap-3 hover:shadow-xl transition-all duration-300 hover-lift"
        onMouseEnter={() => setShowVolumeSlider(true)}
        onMouseLeave={() => setShowVolumeSlider(false)}
      >
        {/* Music Note Icon + Label */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className={`w-4 h-4 transition-colors ${isPlaying ? 'text-teal-500' : 'text-stone-400 dark:text-stone-500'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
            {/* Animated pulse when playing */}
            {isPlaying && (
              <div className="absolute -inset-1 rounded-full bg-teal-500/20 animate-ping" />
            )}
          </div>
          <span className="text-xs font-medium text-stone-600 dark:text-stone-300 hidden sm:inline">
            {isPlaying ? 'Playing...' : 'Paused'}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-stone-200 dark:bg-stone-700" />

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isPlaying
              ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-500/25'
              : 'bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-600 dark:text-stone-300'
          }`}
          aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
          title={isPlaying ? 'Pause background music' : 'Play relaxing background music'}
        >
          {isPlaying ? (
            // Pause icon
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            // Play icon
            <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Mini sound wave visualizer */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-4">
            <div className="w-0.5 bg-teal-500 rounded-full animate-sound-wave" style={{ animationDelay: '0ms' }} />
            <div className="w-0.5 bg-teal-500 rounded-full animate-sound-wave" style={{ animationDelay: '150ms' }} />
            <div className="w-0.5 bg-teal-500 rounded-full animate-sound-wave" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  );
}
