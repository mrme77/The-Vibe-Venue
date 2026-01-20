/**
 * Retry Logic with Exponential Backoff
 *
 * Provides resilient API call handling with:
 * - Exponential backoff with jitter
 * - Configurable retry conditions
 * - Network error and server error handling
 */

export interface RetryConfig {
  maxAttempts: number;              // Total attempts (initial + retries)
  initialDelay: number;              // Initial delay in milliseconds
  maxDelay: number;                  // Maximum delay cap in milliseconds
  retryableStatusCodes: number[];    // HTTP status codes that trigger retry
  retryableErrors: string[];         // Error messages/types that trigger retry
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalDelay: number;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,                // 1 second
  maxDelay: 10000,                   // 10 seconds
  retryableStatusCodes: [429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED'],
};

/**
 * Calculate exponential backoff delay with jitter
 * Formula: min(initialDelay * 2^attempt + jitter, maxDelay)
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.initialDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 100; // 0-100ms random jitter
  const delay = Math.min(exponentialDelay + jitter, config.maxDelay);
  return Math.floor(delay);
}

/**
 * Check if an error is retryable based on configuration
 */
function isRetryableError(error: any, config: RetryConfig): boolean {
  // Check for HTTP status codes
  if (error.response?.status) {
    return config.retryableStatusCodes.includes(error.response.status);
  }

  // Check for network errors (axios or fetch)
  if (error.code) {
    return config.retryableErrors.includes(error.code);
  }

  // Check for fetch network errors
  if (error.message) {
    const lowerMessage = error.message.toLowerCase();
    if (lowerMessage.includes('network') ||
        lowerMessage.includes('fetch') ||
        lowerMessage.includes('timeout')) {
      return true;
    }
  }

  // Check for timeout errors
  if (error.name === 'AbortError' || error.name === 'TimeoutError') {
    return true;
  }

  return false;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param config - Retry configuration (optional)
 * @returns Promise with retry result
 *
 * @example
 * const result = await retryWithBackoff(
 *   async () => await fetch('https://api.example.com/data'),
 *   { maxAttempts: 3, initialDelay: 1000 }
 * );
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig: RetryConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | undefined;
  let totalDelay = 0;

  for (let attempt = 0; attempt < finalConfig.maxAttempts; attempt++) {
    try {
      // Attempt the function
      const result = await fn();

      // Log success if it took multiple attempts
      if (attempt > 0) {
        console.log(`[RETRY SUCCESS] Succeeded after ${attempt + 1} attempts (total delay: ${totalDelay}ms)`);
      }

      return result;
    } catch (error: any) {
      lastError = error;

      // Check if we should retry
      const shouldRetry = isRetryableError(error, finalConfig);
      const isLastAttempt = attempt === finalConfig.maxAttempts - 1;

      if (!shouldRetry || isLastAttempt) {
        // Don't retry - either not retryable or out of attempts
        if (isLastAttempt && shouldRetry) {
          console.error(`[RETRY FAILED] Max attempts (${finalConfig.maxAttempts}) reached`);
        }
        throw error;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, finalConfig);
      totalDelay += delay;

      console.warn(
        `[RETRY] Attempt ${attempt + 1}/${finalConfig.maxAttempts} failed. ` +
        `Retrying in ${delay}ms... ` +
        `Error: ${error.message || error.code || 'Unknown'}`
      );

      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('Retry failed with unknown error');
}

/**
 * Retry with custom condition function
 * Useful for API-specific retry logic
 *
 * @example
 * await retryWithCondition(
 *   async () => await apiCall(),
 *   (error) => error.response?.status === 503,
 *   { maxAttempts: 5 }
 * );
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: any) => boolean,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig: RetryConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    retryableStatusCodes: [], // Override with custom condition
  };

  let lastError: Error | undefined;
  let totalDelay = 0;

  for (let attempt = 0; attempt < finalConfig.maxAttempts; attempt++) {
    try {
      const result = await fn();

      if (attempt > 0) {
        console.log(`[RETRY SUCCESS] Succeeded after ${attempt + 1} attempts`);
      }

      return result;
    } catch (error: any) {
      lastError = error;
      const isLastAttempt = attempt === finalConfig.maxAttempts - 1;

      if (!shouldRetry(error) || isLastAttempt) {
        throw error;
      }

      const delay = calculateDelay(attempt, finalConfig);
      totalDelay += delay;

      console.warn(`[RETRY] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw lastError || new Error('Retry failed');
}
