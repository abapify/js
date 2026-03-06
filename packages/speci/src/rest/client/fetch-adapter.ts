/**
 * Speci v0.1 - Fetch Adapter
 *
 * Native fetch API adapter for Speci clients.
 */

import type { HttpAdapter } from './types';
import { HttpError } from './types';

/**
 * Create a fetch-based HTTP adapter
 */
export function createFetchAdapter(options?: RequestInit): HttpAdapter {
  return {
    async request<TResponse = unknown>(opts: {
      method: string;
      url: string;
      body?: unknown;
      query?: Record<string, any>;
      headers?: Record<string, string>;
    }): Promise<TResponse> {
      const { method, url, body, query, headers } = opts;
      // Build query string
      const queryString = query
        ? '?' + new URLSearchParams(query).toString()
        : '';

      const fullUrl = url + queryString;

      // Execute fetch
      const response = await fetch(fullUrl, {
        ...options,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      // Check if response is successful (2xx)
      if (!response.ok) {
        // Parse error response
        const errorData = await response.json().catch(() => ({
          error: 'HTTP Error',
          message: response.statusText,
        }));
        throw new HttpError(response.status, errorData);
      }

      // Parse successful response
      const data = await response.json();
      return data as TResponse;
    },
  };
}
