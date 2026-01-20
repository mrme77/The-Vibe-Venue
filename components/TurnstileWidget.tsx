/**
 * Cloudflare Turnstile Widget Component
 * Privacy-friendly CAPTCHA alternative to reCAPTCHA
 * Free tier: 1M verifications/month
 */

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}

/**
 * Turnstile Widget Component
 * Renders Cloudflare Turnstile CAPTCHA challenge
 *
 * @param onVerify - Callback when user completes challenge successfully
 * @param onError - Callback when challenge fails
 * @param theme - Widget theme (default: 'light')
 * @param size - Widget size (default: 'normal')
 *
 * @example
 * <TurnstileWidget
 *   onVerify={(token) => console.log('CAPTCHA completed:', token)}
 *   onError={() => console.error('CAPTCHA failed')}
 * />
 */
export default function TurnstileWidget({
  onVerify,
  onError,
  theme = 'light',
  size = 'normal',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    // Skip if Turnstile is not configured
    if (!siteKey) {
      console.warn('[TURNSTILE] Site key not configured. CAPTCHA disabled.');
      // Automatically call onVerify with empty token to allow form submission
      onVerify('bypass-no-config');
      return;
    }

    // Load Turnstile script if not already loaded
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        renderWidget();
      };

      script.onerror = () => {
        console.error('[TURNSTILE] Failed to load Turnstile script');
        if (onError) {
          onError();
        } else {
          // Gracefully allow form submission if script fails to load
          onVerify('bypass-script-error');
        }
      };

      document.head.appendChild(script);
    } else {
      // Script already loaded, render widget
      renderWidget();
    }

    function renderWidget() {
      if (!containerRef.current || !window.turnstile || !siteKey) return;

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            console.log('[TURNSTILE] Challenge completed successfully');
            onVerify(token);
          },
          'error-callback': () => {
            console.error('[TURNSTILE] Challenge failed');
            if (onError) {
              onError();
            }
          },
          theme,
          size,
        });
      } catch (error) {
        console.error('[TURNSTILE] Error rendering widget:', error);
        if (onError) {
          onError();
        } else {
          // Gracefully allow form submission on render error
          onVerify('bypass-render-error');
        }
      }
    }

    // Cleanup on unmount
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error('[TURNSTILE] Error removing widget:', error);
        }
      }
    };
  }, [onVerify, onError, theme, size]);

  return (
    <div className="flex justify-center my-4">
      <div ref={containerRef} className="cf-turnstile" />
    </div>
  );
}
