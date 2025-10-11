/**
 * ErrorHandler Unit Tests
 */

import { AxiosError } from 'axios';
import { ApiError } from '../../../utils/errors/ApiError';
import {
  handleApiError,
  shouldLogout,
  isRetryableError,
} from '../../../utils/errors/ErrorHandler';

describe('ErrorHandler', () => {
  describe('handleApiError', () => {
    it('returns ApiError as-is', () => {
      const originalError = new ApiError(
        'Test error',
        404,
        'NOT_FOUND',
        'Not found'
      );

      const result = handleApiError(originalError);

      expect(result).toBe(originalError);
    });

    it('converts Axios error with response to ApiError', () => {
      const axiosError = {
        response: {
          status: 404,
          data: {
            code: 'NOT_FOUND',
            message: 'Resource not found',
          },
        },
        message: 'Request failed with status code 404',
        isAxiosError: true,
      } as AxiosError;

      const result = handleApiError(axiosError);

      expect(result).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(404);
      expect(result.code).toBe('NOT_FOUND');
      expect(result.userMessage).toBeTruthy();
    });

    it('converts Axios network error to ApiError', () => {
      const axiosError = {
        message: 'Network Error',
        isAxiosError: true,
      } as AxiosError;

      const result = handleApiError(axiosError);

      expect(result).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(0);
      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.isNetworkError()).toBe(true);
    });

    it('converts Axios error with validation details', () => {
      const axiosError = {
        response: {
          status: 400,
          data: {
            code: 'VALIDATION_ERROR',
            errors: {
              email: ['Email is required'],
              password: ['Password is too short'],
            },
          },
        },
        message: 'Validation failed',
        isAxiosError: true,
      } as AxiosError;

      const result = handleApiError(axiosError);

      expect(result).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(400);
      expect(result.details).toEqual({
        email: ['Email is required'],
        password: ['Password is too short'],
      });
    });

    it('converts standard Error to ApiError', () => {
      const error = new Error('Something went wrong');

      const result = handleApiError(error);

      expect(result).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(500);
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.message).toBe('Something went wrong');
    });

    it('converts unknown error to ApiError', () => {
      const error = 'String error';

      const result = handleApiError(error);

      expect(result).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(500);
      expect(result.code).toBe('UNKNOWN_ERROR');
    });

    it('extracts error code from different response formats', () => {
      const testCases = [
        { data: { code: 'TEST_CODE' }, expected: 'TEST_CODE' },
        { data: { error_code: 'TEST_CODE' }, expected: 'TEST_CODE' },
        { data: { errorCode: 'TEST_CODE' }, expected: 'TEST_CODE' },
      ];

      testCases.forEach(({ data, expected }) => {
        const axiosError = {
          response: {
            status: 400,
            data,
          },
          message: 'Error',
          isAxiosError: true,
        } as AxiosError;

        const result = handleApiError(axiosError);
        expect(result.code).toBe(expected);
      });
    });

    it('generates error code from status when not provided', () => {
      const statusToCode = [
        { status: 400, expected: 'VALIDATION_ERROR' },
        { status: 401, expected: 'UNAUTHORIZED' },
        { status: 403, expected: 'FORBIDDEN' },
        { status: 404, expected: 'NOT_FOUND' },
        { status: 409, expected: 'CONFLICT' },
        { status: 422, expected: 'VALIDATION_FAILED' },
        { status: 429, expected: 'RATE_LIMIT_EXCEEDED' },
        { status: 500, expected: 'SERVER_ERROR' },
      ];

      statusToCode.forEach(({ status, expected }) => {
        const axiosError = {
          response: {
            status,
            data: {},
          },
          message: 'Error',
          isAxiosError: true,
        } as AxiosError;

        const result = handleApiError(axiosError);
        expect(result.code).toBe(expected);
      });
    });
  });

  describe('shouldLogout', () => {
    it('returns true for TOKEN_EXPIRED error', () => {
      const error = new ApiError(
        'Token expired',
        401,
        'TOKEN_EXPIRED',
        'Session expired'
      );

      expect(shouldLogout(error)).toBe(true);
    });

    it('returns true for INVALID_TOKEN error', () => {
      const error = new ApiError(
        'Invalid token',
        401,
        'INVALID_TOKEN',
        'Invalid session'
      );

      expect(shouldLogout(error)).toBe(true);
    });

    it('returns false for other auth errors', () => {
      const error = new ApiError(
        'Unauthorized',
        401,
        'UNAUTHORIZED',
        'Please log in'
      );

      expect(shouldLogout(error)).toBe(false);
    });

    it('returns false for non-auth errors', () => {
      const error = new ApiError(
        'Not found',
        404,
        'NOT_FOUND',
        'Not found'
      );

      expect(shouldLogout(error)).toBe(false);
    });
  });

  describe('isRetryableError', () => {
    it('returns true for network errors', () => {
      const error = new ApiError(
        'Network error',
        0,
        'NETWORK_ERROR',
        'No connection'
      );

      expect(isRetryableError(error)).toBe(true);
    });

    it('returns true for server errors (5xx)', () => {
      const serverErrors = [500, 502, 503, 504];

      serverErrors.forEach((status) => {
        const error = new ApiError(
          'Server error',
          status,
          'SERVER_ERROR',
          'Server error'
        );

        expect(isRetryableError(error)).toBe(true);
      });
    });

    it('returns true for rate limit errors (429)', () => {
      const error = new ApiError(
        'Rate limit',
        429,
        'RATE_LIMIT_EXCEEDED',
        'Too many requests'
      );

      expect(isRetryableError(error)).toBe(true);
    });

    it('returns false for client errors (4xx except 429)', () => {
      const clientErrors = [400, 401, 403, 404];

      clientErrors.forEach((status) => {
        const error = new ApiError(
          'Client error',
          status,
          'CLIENT_ERROR',
          'Client error'
        );

        expect(isRetryableError(error)).toBe(false);
      });
    });
  });
});
