/**
 * Core types for ADK service endpoint mapping
 */

/**
 * Routing information for mapping ADK objects to ADT endpoints
 */
export interface AdtEndpointMapping {
  /** Base endpoint for CRUD operations */
  baseEndpoint: string;
  /** Content type for requests */
  contentType: string;
  /** Accept header for responses */
  acceptType: string;
  /** Function to get source endpoint for object */
  getSourceEndpoint?: (objectName: string) => string;
  /** Function to get activation URI for object */
  getActivationUri?: (objectName: string) => string;
}

/**
 * Registry for mapping ADK object kinds to ADT endpoints
 */
export interface AdtEndpointRegistry {
  /**
   * Get endpoint mapping for a given object kind
   */
  getMapping(kind: string): AdtEndpointMapping | undefined;

  /**
   * Register a new endpoint mapping
   */
  register(kind: string, mapping: AdtEndpointMapping): void;

  /**
   * Get all supported object kinds
   */
  getSupportedKinds(): string[];

  /**
   * Check if a kind is supported
   */
  supports(kind: string): boolean;
}
