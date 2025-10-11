/**
 * Error Handler
 * 
 * Centralized error handling utilities for converting various error types
 * to ApiError and logging errors safely.
 */

import axios, { AxiosError } from 'axios';
import { ApiError } from './ApiError';
import { getErrorMessage, getNetworkErrorMessage } from './errorMessages';

/**
 * Check if error is an Axios error
 */
const isAxiosError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};

/**
 * Extract error code from API response
 */
const extractErrorCode = (error: AxiosError): string => {
  const responseData = error.response?.data as any;
  
  // Try different common error code fields
  if (responseData?.code) return responseData.code;
  if (responseData?.error_code) return responseData.error_code;
  if (responseData?.errorCode) return responseData.errorCode;
  
  // Generate code from status
  const status = error.response?.status;
  if (status === 400) return 'VALIDATION_ERROR';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 422) return 'VALIDATION_FAILED';
  if (status === 429) return 'RATE_LIMIT_EXCEEDED';
  if (status && status >= 500) return 'SERVER_ERROR';
  
  return 'UNKNOWN_ERROR';
};

/**
 * Extract validation details from API response
 */
const extractValidationDetails = (
  error: AxiosError
): Record<string, string[]> | undefined => {
  const responseData = error.response?.data as any;
  
  // Check for validation errors in common formats
  if (responseData?.errors && typeof responseData.errors === 'object') {
    return responseData.errors;
  }
  
  if (responseData?.details && typeof responseData.details === 'object') {
    return responseData.details;
  }
  
  if (responseData?.fieldErrors && typeof responseData.fieldErrors === 'object') {
    return responseData.fieldErrors;
  }
  
  return undefined;
};

/**
 * Convert Axios error to ApiError
 */
const fromAxiosError = (error: AxiosError): ApiError => {
  // Network error (no response)
  if (!error.response) {
    return new ApiError(
      error.message || 'Network error',
      0,
      'NETWORK_ERROR',
      getNetworkErrorMessage()
    );
  }

  const statusCode = error.response.status;
  const errorCode = extractErrorCode(error);
  const userMessage = getErrorMessage(statusCode, errorCode);
  const details = extractValidationDetails(error);

  return new ApiError(
    error.message,
    statusCode,
    errorCode,
    userMessage,
    details
  );
};

/**
 * Main error handler - converts any error to ApiError
 */
export const handleApiError = (error: unknown): ApiError => {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // Axios error
  if (isAxiosError(error)) {
    return fromAxiosError(error);
  }

  // Standard Error
  if (error instanceof Error) {
    return new ApiError(
      error.message,
      500,
      'UNKNOWN_ERROR',
      'An unexpected error occurred. Please try again.'
    );
  }

  // Unknown error type
  return new ApiError(
    'Unknown error',
    500,
    'UNKNOWN_ERROR',
    'An unexpected error occurred. Please try again.'
  );
};

/**
 * Log error safely (without sensitive data)
 */
export const logError = (error: ApiError, context?: string): void => {
  const logMessage = context 
    ? `[${context}] ${error.toLogString()}`
    : error.toLogString();

  // In development, log full error
  if (__DEV__) {
    console.error(logMessage, {
      statusCode: error.statusCode,
      code: error.code,
      userMessage: error.userMessage,
      // Don't log details as they might contain sensitive data
    });
  } else {
    // In production, only log error code and status
    console.error(logMessage);
  }

  // TODO: Send to error tracking service (Sentry, etc.)
  // if (!__DEV__) {
  //   Sentry.captureException(error, {
  //     tags: {
  //       errorCode: error.code,
  //       statusCode: error.statusCode,
  //     },
  //   });
  // }
};

/**
 * Check if error should trigger logout
 */
export const shouldLogout = (error: ApiError): boolean => {
  return error.isAuthError() && 
    (error.code === 'TOKEN_EXPIRED' || error.code === 'INVALID_TOKEN');
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: ApiError): boolean => {
  // Network errors are retryable
  if (error.isNetworkError()) return true;
  
  // Server errors (5xx) are retryable
  if (error.isServerError()) return true;
  
  // Rate limit errors are retryable (after delay)
  if (error.statusCode === 429) return true;
  
  // Gateway errors are retryable
  if (error.statusCode === 502 || error.statusCode === 503 || error.statusCode === 504) {
    return true;
  }
  
  return false;
};
