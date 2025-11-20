/**
 * Speci REST - Client Types
 *
 * REST-specific client interface types.
 */

import type {
  Contract,
  OperationFunction,
  ExtractParams,
  ExtractDescriptor,
} from '../../core/types';
import type {
  RestEndpointDescriptor,
  InferSuccessResponse,
  InferErrorResponse,
} from '../types';

/**
 * HTTP error with typed payload
 */
export class HttpError<TPayload = unknown> extends Error {
  constructor(
    public readonly status: number,
    public readonly payload: TPayload,
    message?: string
  ) {
    super(message || `HTTP ${status}`);
    this.name = 'HttpError';
  }
}

/**
 * HTTP adapter interface - consumer provides their own implementation
 */
export interface HttpAdapter {
  /**
   * Execute an HTTP request
   */
  request<TResponse = unknown>(options: {
    method: string;
    url: string;
    body?: unknown;
    query?: Record<string, any>;
    headers?: Record<string, string>;
  }): Promise<TResponse>;
}

/**
 * Client configuration
 */
export interface ClientConfig {
  /** Base URL for all requests */
  baseUrl: string;

  /** HTTP adapter implementation */
  adapter: HttpAdapter;

  /** Default headers for all requests */
  headers?: Record<string, string>;

  /** Request interceptor */
  onRequest?: (options: any) => any | Promise<any>;

  /** Response interceptor */
  onResponse?: (response: any) => any | Promise<any>;

  /** Error interceptor */
  onError?: (error: any) => any | Promise<any>;
}

/**
 * Convert a REST operation function to a client method
 * Only returns success response types (2xx) - errors are thrown as HttpError
 * Includes typed error property for error response payloads
 */
export type RestClientMethod<T extends OperationFunction> = {
  (...params: ExtractParams<T>): Promise<
    ExtractDescriptor<T> extends RestEndpointDescriptor
      ? InferSuccessResponse<ExtractDescriptor<T>>
      : never
  >;
  /** Typed error response payload - use with HttpError */
  error: ExtractDescriptor<T> extends RestEndpointDescriptor
    ? InferErrorResponse<ExtractDescriptor<T>>
    : never;
  /** Check if error is from this endpoint */
  isError(
    error: unknown
  ): error is HttpError<
    ExtractDescriptor<T> extends RestEndpointDescriptor
      ? InferErrorResponse<ExtractDescriptor<T>>
      : never
  >;
};

/**
 * Convert a REST contract to a typed client
 */
export type RestClient<T extends Contract> = {
  [K in keyof T]: T[K] extends OperationFunction
    ? RestClientMethod<T[K]>
    : T[K] extends Contract
    ? RestClient<T[K]>
    : never;
};
