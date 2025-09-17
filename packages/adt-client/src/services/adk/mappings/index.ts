import { AdtEndpointMapping } from '../types.js';
import { OO_MAPPINGS } from './oo-mappings.js';
import { DDIC_MAPPINGS } from './ddic-mappings.js';

/**
 * Combined default mappings from all categories
 */
export const DEFAULT_MAPPINGS: Record<string, AdtEndpointMapping> = {
  ...OO_MAPPINGS,
  ...DDIC_MAPPINGS,
};

// Re-export individual mapping categories for selective use
export { OO_MAPPINGS } from './oo-mappings.js';
export { DDIC_MAPPINGS } from './ddic-mappings.js';
