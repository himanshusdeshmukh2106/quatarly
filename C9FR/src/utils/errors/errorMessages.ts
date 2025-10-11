/**
 * Error Messages
 * 
 * Centralized mapping of error codes to user-friendly messages.
 */

export interface ErrorMessageMap {
  [statusCode: number]: {
    [errorCode: string]: string;
  };
}

/**
 * User-friendly error messages mapped by status code and error code
 */
export const ERROR_MESSAGES: ErrorMessageMap = {
  // 400 - Bad Request
  400: {
    INVALID_DATA: 'Please check your input and try again.',
    VALIDATION_ERROR: 'Some fields are invalid. Please review and correct them.',
    INVALID_REQUEST: 'The request is invalid. Please try again.',
    MISSING_REQUIRED_FIELD: 'Please fill in all required fields.',
  },

  // 401 - Unauthorized
  401: {
    INVALID_CREDENTIALS: 'Invalid username or password. Please try again.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You need to log in to access this feature.',
    INVALID_TOKEN: 'Your session is invalid. Please log in again.',
  },

  // 403 - Forbidden
  403: {
    PERMISSION_DENIED: "You don't have permission to perform this action.",
    FORBIDDEN: 'Access to this resource is forbidden.',
    INSUFFICIENT_PERMISSIONS: 'You need additional permissions to perform this action.',
  },

  // 404 - Not Found
  404: {
    NOT_FOUND: 'The requested resource was not found.',
    ASSET_NOT_FOUND: 'The asset you are looking for does not exist.',
    GOAL_NOT_FOUND: 'The goal you are looking for does not exist.',
    INVESTMENT_NOT_FOUND: 'The investment you are looking for does not exist.',
    USER_NOT_FOUND: 'User not found.',
  },

  // 409 - Conflict
  409: {
    CONFLICT: 'This resource already exists.',
    DUPLICATE_ENTRY: 'A record with this information already exists.',
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  },

  // 422 - Unprocessable Entity
  422: {
    VALIDATION_FAILED: 'Validation failed. Please check your input.',
    INVALID_FORMAT: 'The data format is invalid.',
  },

  // 429 - Too Many Requests
  429: {
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
    TOO_MANY_ATTEMPTS: 'Too many attempts. Please wait before trying again.',
  },

  // 500 - Internal Server Error
  500: {
    SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
    INTERNAL_ERROR: 'An internal error occurred. Please try again.',
  },

  // 502 - Bad Gateway
  502: {
    BAD_GATEWAY: 'Service temporarily unavailable. Please try again later.',
  },

  // 503 - Service Unavailable
  503: {
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
    MAINTENANCE: 'The service is under maintenance. Please try again later.',
  },

  // 504 - Gateway Timeout
  504: {
    GATEWAY_TIMEOUT: 'Request timed out. Please check your connection and try again.',
  },
};

/**
 * Default error messages for each status code category
 */
export const DEFAULT_ERROR_MESSAGES: { [key: number]: string } = {
  0: 'No internet connection. Please check your network and try again.',
  400: 'Invalid request. Please check your input.',
  401: 'Authentication required. Please log in.',
  403: 'Access denied.',
  404: 'Resource not found.',
  409: 'Conflict occurred.',
  422: 'Invalid data provided.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error. Please try again later.',
  502: 'Service unavailable. Please try again later.',
  503: 'Service temporarily unavailable.',
  504: 'Request timed out. Please try again.',
};

/**
 * Get user-friendly error message based on status code and error code
 */
export const getErrorMessage = (
  statusCode: number,
  errorCode: string
): string => {
  // Check for specific error code message
  const statusMessages = ERROR_MESSAGES[statusCode];
  if (statusMessages && statusMessages[errorCode]) {
    return statusMessages[errorCode];
  }

  // Fall back to default message for status code
  if (DEFAULT_ERROR_MESSAGES[statusCode]) {
    return DEFAULT_ERROR_MESSAGES[statusCode];
  }

  // Ultimate fallback
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Get error message for network errors
 */
export const getNetworkErrorMessage = (): string => {
  return DEFAULT_ERROR_MESSAGES[0];
};

/**
 * Format validation errors from API response
 */
export const formatValidationErrors = (
  details: Record<string, string[]>
): string => {
  const errors = Object.entries(details)
    .map(([field, messages]) => {
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
      return `${fieldName}: ${messages.join(', ')}`;
    })
    .join('\n');

  return errors || 'Validation failed. Please check your input.';
};
