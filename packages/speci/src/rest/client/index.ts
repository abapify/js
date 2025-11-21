/**
 * Speci REST - Client Exports
 *
 * REST-specific client generation utilities.
 */

export * from './types';
export * from './create-client';
export * from './fetch-adapter';

// Re-export HttpError for convenience
export { HttpError } from './types';
