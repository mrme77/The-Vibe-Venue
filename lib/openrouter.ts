/**
 * OpenRouter API Client
 * Uses free Gemini models for AI-powered search query generation and venue recommendations
 * API Documentation: https://openrouter.ai/docs
 */

import { retryWithBackoff } from './retry';

/**
 * OpenRouter API request message format
 * For text-only: content is a string
 * For multimodal (text + images): content is an array of content objects
 */
interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
}

/**
 * OpenRouter API request body
 */
interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
}

/**
 * OpenRouter API response format
 */
interface OpenRouterResponse {
  id: string;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Calls OpenRouter API with a prompt and returns the AI response
 *
 * @param prompt - The user prompt to send to the AI
 * @param model - The model to use (default: google/gemini-2.5-flash-lite-preview-09-2025)
 * @returns The AI's text response
 * @throws Error if API call fails or API key is missing
 *
 * @example
 * ```typescript
 * const response = await callOpenRouter(
 *   'Generate 3 search queries for a romantic date night in a city'
 * );
 * console.log(response); // AI-generated response
 * ```
 */
export async function callOpenRouter(
  prompt: string,
  model: string = 'google/gemini-2.5-flash-lite-preview-09-2025'
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not set in environment variables. ' +
      'Get your free API key at https://openrouter.ai/keys'
    );
  }

  const requestBody: OpenRouterRequest = {
    model,
    messages: [
      {
        role: 'user',
        content: prompt, // Simple string for text-only messages
      },
    ],
  };

  try {
    // Wrap API call with retry logic for resilience
    const data = await retryWithBackoff(
      async () => {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'VenueVibe',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          const error: any = new Error(
            `OpenRouter API error (${response.status}): ${errorText}`
          );
          error.response = { status: response.status };
          throw error;
        }

        const data: OpenRouterResponse = await response.json();
        return data;
      },
      {
        maxAttempts: 3,
        initialDelay: 1000,
        retryableStatusCodes: [429, 500, 502, 503, 504],
      }
    );

    // Extract the AI's response text
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('OpenRouter API returned empty response');
    }

    return aiResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to call OpenRouter API: ${error.message}`);
    }
    throw new Error('Failed to call OpenRouter API: Unknown error');
  }
}

/**
 * Calls OpenRouter API and parses the response as JSON
 * Useful for structured outputs like search queries or recommendations
 *
 * @param prompt - The user prompt requesting JSON output
 * @param model - The model to use (default: google/gemini-2.5-flash-lite-preview-09-2025)
 * @returns Parsed JSON object
 * @throws Error if response is not valid JSON
 *
 * @example
 * ```typescript
 * const queries = await callOpenRouterJSON<string[]>(
 *   'Return a JSON array of 3 search queries for romantic restaurants'
 * );
 * console.log(queries); // ["upscale restaurants", "wine bars", "rooftop dining"]
 * ```
 */
export async function callOpenRouterJSON<T>(
  prompt: string,
  model: string = 'google/gemini-2.5-flash-lite-preview-09-2025'
): Promise<T> {
  const response = await callOpenRouter(prompt, model);

  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;

    return JSON.parse(jsonString.trim()) as T;
  } catch {
    throw new Error(
      `Failed to parse OpenRouter response as JSON. Response: ${response.substring(0, 200)}...`
    );
  }
}
