export interface AdtResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  etag?: string;
}

export interface AdtErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string;
    severity: 'error' | 'warning' | 'info';
  };
  status: number;
  statusText: string;
}

export interface AuthenticationResponse {
  success: boolean;
  sessionId?: string;
  csrfToken?: string;
  cookies?: Record<string, string>;
  expiresAt?: Date;
  error?: string;
}

export interface ValidationResponse {
  valid: boolean;
  messages: ValidationMessage[];
}

export interface ValidationMessage {
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
  code?: string;
}

export interface RequestRecord {
  timestamp: Date;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  response?: {
    status: number;
    headers: Record<string, string>;
    body?: string;
  };
  duration: number;
  error?: Error;
}
