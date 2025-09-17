import { AdtEndpointMapping, AdtEndpointRegistry } from './types.js';
import { DEFAULT_MAPPINGS } from './mappings/index.js';

/**
 * Default implementation of ADT endpoint registry
 * Allows extension for new object types without changing client code
 */
export class DefaultEndpointRegistry implements AdtEndpointRegistry {
  private mappings: Map<string, AdtEndpointMapping> = new Map();

  constructor(
    initialMappings: Record<string, AdtEndpointMapping> = DEFAULT_MAPPINGS
  ) {
    // Register provided mappings
    Object.entries(initialMappings).forEach(([kind, mapping]) => {
      this.mappings.set(kind, mapping);
    });
  }

  getMapping(kind: string): AdtEndpointMapping | undefined {
    return this.mappings.get(kind);
  }

  register(kind: string, mapping: AdtEndpointMapping): void {
    this.mappings.set(kind, mapping);
  }

  /**
   * Get all registered kinds
   */
  getSupportedKinds(): string[] {
    return Array.from(this.mappings.keys());
  }

  /**
   * Check if a kind is supported
   */
  supports(kind: string): boolean {
    return this.mappings.has(kind);
  }
}
