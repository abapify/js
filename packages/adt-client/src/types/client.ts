export interface AdtConnectionConfig {
  serviceKeyPath: string;
  client: string;
  username: string;
  password: string;
  language?: string;
  samlAssertion?: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface AdtClientConfig {
  connection?: AdtConnectionConfig;
  logger?: import('../utils/logger.js').Logger; // Pino logger instance from CLI
  fileLogger?: import('../utils/file-logger.js').FileLogger; // File logger for ADT responses
  cache?: CacheConfig;
  retry?: RetryConfig;
  logging?: LoggingConfig;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
}

export interface RetryConfig {
  attempts: number;
  backoff: 'linear' | 'exponential';
  delay: number;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enabled: boolean;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string;
  timeout?: number;
}

export interface AdtClientError extends Error {
  readonly category:
    | 'connection'
    | 'authentication'
    | 'authorization'
    | 'system'
    | 'network';
  readonly statusCode?: number;
  readonly adtErrorCode?: string;
  readonly context?: Record<string, unknown>;
}

export interface SearchQuery {
  pattern: string;
  objectTypes?: string[];
  packages?: string[];
  maxResults?: number;
  includeSubpackages?: boolean;
}

export interface UpdateResult {
  success: boolean;
  messages: string[];
  etag?: string;
}

export interface CreateResult {
  success: boolean;
  messages: string[];
  objectKey: string;
}

export interface DeleteResult {
  success: boolean;
  messages: string[];
}

export interface AssignResult {
  success: boolean;
  messages: string[];
  transportId: string;
}
