import { AdtClientError } from '../types/client.js';

export class ErrorHandler {
  /**
   * Creates a standardized ADT client error
   */
  static createError(
    category: AdtClientError['category'],
    message: string,
    statusCode?: number,
    adtErrorCode?: string,
    context?: Record<string, unknown>
  ): AdtClientError {
    const error = new Error(message) as AdtClientError;
    (error as any).category = category;
    if (statusCode) (error as any).statusCode = statusCode;
    if (adtErrorCode) (error as any).adtErrorCode = adtErrorCode;
    if (context) (error as any).context = context;
    return error;
  }

  /**
   * Handles HTTP response errors and converts them to ADT client errors
   */
  static async handleHttpError(
    response: Response,
    context?: Record<string, unknown>
  ): Promise<AdtClientError> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let adtErrorCode: string | undefined;

    try {
      const responseText = await response.text();

      // Try to parse ADT-specific error information from XML
      if (
        responseText &&
        response.headers.get('content-type')?.includes('xml')
      ) {
        const errorInfo = this.parseAdtError(responseText);
        if (errorInfo) {
          errorMessage = errorInfo.message || errorMessage;
          adtErrorCode = errorInfo.code;
        }
      }
    } catch {
      // Ignore parsing errors, use default message
    }

    const category = this.categorizeHttpError(response.status);

    return this.createError(
      category,
      errorMessage,
      response.status,
      adtErrorCode,
      context
    );
  }

  /**
   * Categorizes HTTP status codes into ADT client error categories
   */
  private static categorizeHttpError(
    statusCode: number
  ): AdtClientError['category'] {
    if (statusCode === 401) return 'authentication';
    if (statusCode === 403) return 'authorization';
    if (statusCode >= 400 && statusCode < 500) return 'system';
    if (statusCode >= 500) return 'system';
    return 'network';
  }

  /**
   * Parses ADT-specific error information from XML response
   */
  private static parseAdtError(
    xmlString: string
  ): { message?: string; code?: string } | null {
    try {
      // Simple regex-based parsing for common ADT error patterns
      const messageMatch = xmlString.match(/<message[^>]*>([^<]+)<\/message>/i);
      const codeMatch = xmlString.match(/<code[^>]*>([^<]+)<\/code>/i);

      return {
        message: messageMatch?.[1]?.trim(),
        code: codeMatch?.[1]?.trim(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Handles network errors and converts them to ADT client errors
   */
  static handleNetworkError(
    error: Error,
    context?: Record<string, unknown>
  ): AdtClientError {
    let category: AdtClientError['category'] = 'network';
    let message = error.message;

    // Categorize specific network errors
    if (error.name === 'AbortError') {
      category = 'network';
      message = 'Request timeout';
    } else if (
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ECONNREFUSED')
    ) {
      category = 'connection';
      message = 'Connection failed - check network and server availability';
    } else if (
      error.message.includes('certificate') ||
      error.message.includes('SSL')
    ) {
      category = 'connection';
      message = 'SSL/Certificate error - check server certificate';
    }

    return this.createError(category, message, undefined, undefined, {
      originalError: error.message,
      ...context,
    });
  }
}
