/**
 * ApiError Class
 * 
 * Custom error class for API-related errors with structured information
 * including status codes, error codes, and user-friendly messages.
 */

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly userMessage: string;
  public readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    userMessage: string,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.userMessage = userMessage;
    this.details = details;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is a network error (no response from server)
   */
  isNetworkError(): boolean {
    return this.statusCode === 0 || this.code === 'NETWORK_ERROR';
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.code === 'UNAUTHORIZED';
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.statusCode === 400 && !!this.details;
  }

  /**
   * Check if error is a server error
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Get formatted error message for logging
   */
  toLogString(): string {
    return `[${this.code}] ${this.message} (Status: ${this.statusCode})`;
  }

  /**
   * Get sanitized error object (without sensitive data)
   */
  toJSON() {
    return {
      name: this.name,
      statusCode: this.statusCode,
      code: this.code,
      userMessage: this.userMessage,
      // Don't include full error message or stack trace in JSON
    };
  }
}
