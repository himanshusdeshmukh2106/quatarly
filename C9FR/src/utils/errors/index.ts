/**
 * Error Handling Utilities
 * 
 * This module contains error handling utilities including:
 * - ApiError class for structured error handling
 * - Error handler functions
 * - User-friendly error message mapping
 */

export { ApiError } from './ApiError';
export {
  handleApiError,
  logError,
  shouldLogout,
  isRetryableError,
} from './ErrorHandler';
export {
  getErrorMessage,
  getNetworkErrorMessage,
  formatValidationErrors,
  ERROR_MESSAGES,
  DEFAULT_ERROR_MESSAGES,
} from './errorMessages';
