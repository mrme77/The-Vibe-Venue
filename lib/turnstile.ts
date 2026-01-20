/**
 * Cloudflare Turnstile Server-Side Verification
 *
 * Provides CAPTCHA verification for advanced bot protection
 * Free tier: 1M verifications/month
 * Privacy-friendly alternative to reCAPTCHA
 */

/**
 * Turnstile verification response from Cloudflare
 */
interface TurnstileVerificationResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
}

/**
 * Verify a Turnstile token with Cloudflare
 *
 * @param token - The Turnstile response token from client
 * @param ip - Client IP address (optional but recommended)
 * @returns Promise<boolean> - True if verification succeeds
 *
 * @example
 * const isValid = await verifyTurnstile(token, clientIP);
 * if (!isValid) {
 *   return res.status(403).json({ error: 'CAPTCHA verification failed' });
 * }
 */
export async function verifyTurnstile(
  token: string,
  ip?: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If Turnstile is not configured, log warning and allow request
  // This provides graceful degradation
  if (!secretKey) {
    console.warn(
      '[TURNSTILE] Secret key not configured. Skipping verification. ' +
      'Set TURNSTILE_SECRET_KEY environment variable to enable CAPTCHA protection.'
    );
    return true;
  }

  // Validate token format
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    console.warn('[TURNSTILE] Invalid token format');
    return false;
  }

  try {
    // Call Cloudflare Turnstile verification endpoint
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
          remoteip: ip, // Optional but recommended for additional security
        }),
      }
    );

    if (!response.ok) {
      console.error(
        `[TURNSTILE] Verification API error: ${response.status}`
      );
      // Gracefully allow request if Turnstile service is down
      // Don't block legitimate users due to service outage
      return true;
    }

    const data: TurnstileVerificationResponse = await response.json();

    if (data.success) {
      console.log('[TURNSTILE] Verification successful');
      return true;
    }

    // Log error codes for debugging
    if (data['error-codes'] && data['error-codes'].length > 0) {
      console.warn(
        `[TURNSTILE] Verification failed: ${data['error-codes'].join(', ')}`
      );
    }

    return false;
  } catch (error) {
    console.error('[TURNSTILE] Verification error:', error);
    // Gracefully allow request if verification fails due to network error
    // This prevents blocking all users if Cloudflare is temporarily unavailable
    return true;
  }
}

/**
 * Check if Turnstile is enabled/configured
 * Useful for conditionally showing CAPTCHA widget on frontend
 */
export function isTurnstileEnabled(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY &&
         !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
}

/**
 * Common Turnstile error codes and their meanings
 * Reference: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export const TURNSTILE_ERROR_CODES: Record<string, string> = {
  'missing-input-secret': 'The secret parameter was not passed',
  'invalid-input-secret': 'The secret parameter was invalid or did not exist',
  'missing-input-response': 'The response parameter (token) was not passed',
  'invalid-input-response': 'The response parameter (token) is invalid or has expired',
  'bad-request': 'The request was rejected because it was malformed',
  'timeout-or-duplicate': 'The response parameter has already been validated before or has expired',
};
