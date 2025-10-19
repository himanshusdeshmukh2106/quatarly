/**
 * ApiError Unit Tests
 */

import { ApiError } from '../../../utils/errors/ApiError';

describe('ApiError', () => {
  describe('constructor', () => {
    it('creates an ApiError with all properties', () => {
      const error = new ApiError(
        'Test error message',
        404,
        'NOT_FOUND',
        'Resource not found'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Test error message');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.userMessage).toBe('Resource not found');
    });

    it('creates an ApiError with validation details', () => {
      const details = {
        email: ['Email is required', 'Email must be valid'],
        password: ['Password is too short'],
      };

      const error = new ApiError(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        'Please check your input',
        details
      );

      expect(error.details).toEqual(details);
    });
  });

  describe('isNetworkError', () => {
    it('returns true for network errors (status 0)', () => {
      const error = new ApiError(
        'Network error',
        0,
        'NETWORK_ERROR',
        'No connection'
      );

      expect(error.isNetworkError()).toBe(true);
    });

    it('returns true for NETWORK_ERROR code', () => {
      const error = new ApiError(
        'Network error',
        500,
        'NETWORK_ERROR',
        'No connection'
      );

      expect(error.isNetworkError()).toBe(true);
    });

    it('returns false for non-network errors', () => {
      const error = new ApiError(
        'Not found',
        404,
        'NOT_FOUND',
        'Resource not found'
      );

      expect(error.isNetworkError()).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('returns true for 401 status', () => {
      const error = new ApiError(
        'Unauthorized',
        401,
        'UNAUTHORIZED',
        'Please log in'
      );

      expect(error.isAuthError()).toBe(true);
    });

    it('returns true for UNAUTHORIZED code', () => {
      const error = new ApiError(
        'Unauthorized',
        403,
        'UNAUTHORIZED',
        'Please log in'
      );

      expect(error.isAuthError()).toBe(true);
    });

    it('returns false for non-auth errors', () => {
      const error = new ApiError(
        'Not found',
        404,
        'NOT_FOUND',
        'Resource not found'
      );

      expect(error.isAuthError()).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('returns true for 400 status with details', () => {
      const error = new ApiError(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        'Invalid input',
        { email: ['Required'] }
      );

      expect(error.isValidationError()).toBe(true);
    });

    it('returns false for 400 status without details', () => {
      const error = new ApiError(
        'Bad request',
        400,
        'BAD_REQUEST',
        'Invalid request'
      );

      expect(error.isValidationError()).toBe(false);
    });

    it('returns false for non-400 status', () => {
      const error = new ApiError(
        'Server error',
        500,
        'SERVER_ERROR',
        'Server error',
        { field: ['Error'] }
      );

      expect(error.isValidationError()).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('returns true for 500 status', () => {
      const error = new ApiError(
        'Server error',
        500,
        'SERVER_ERROR',
        'Server error'
      );

      expect(error.isServerError()).toBe(true);
    });

    it('returns true for 503 status', () => {
      const error = new ApiError(
        'Service unavailable',
        503,
        'SERVICE_UNAVAILABLE',
        'Service unavailable'
      );

      expect(error.isServerError()).toBe(true);
    });

    it('returns false for non-5xx status', () => {
      const error = new ApiError(
        'Not found',
        404,
        'NOT_FOUND',
        'Not found'
      );

      expect(error.isServerError()).toBe(false);
    });
  });

  describe('toLogString', () => {
    it('formats error for logging', () => {
      const error = new ApiError(
        'Test error',
        404,
        'NOT_FOUND',
        'Resource not found'
      );

      const logString = error.toLogString();

      expect(logString).toBe('[NOT_FOUND] Test error (Status: 404)');
    });
  });

  describe('toJSON', () => {
    it('returns sanitized error object', () => {
      const error = new ApiError(
        'Internal error message',
        500,
        'SERVER_ERROR',
        'User-friendly message'
      );

      const json = error.toJSON();

      expect(json).toEqual({
        name: 'ApiError',
        statusCode: 500,
        code: 'SERVER_ERROR',
        userMessage: 'User-friendly message',
      });

      // Should not include sensitive data
      expect(json).not.toHaveProperty('message');
      expect(json).not.toHaveProperty('stack');
    });
  });
});
