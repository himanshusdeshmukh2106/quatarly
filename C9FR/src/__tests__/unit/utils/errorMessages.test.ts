/**
 * errorMessages Unit Tests
 */

import {
  getErrorMessage,
  getNetworkErrorMessage,
  formatValidationErrors,
  ERROR_MESSAGES,
  DEFAULT_ERROR_MESSAGES,
} from '../../../utils/errors/errorMessages';

describe('errorMessages', () => {
  describe('getErrorMessage', () => {
    it('returns specific error message for known status and code', () => {
      const message = getErrorMessage(401, 'INVALID_CREDENTIALS');

      expect(message).toBe('Invalid username or password. Please try again.');
    });

    it('returns default message for unknown code', () => {
      const message = getErrorMessage(401, 'UNKNOWN_CODE');

      expect(message).toBe(DEFAULT_ERROR_MESSAGES[401]);
    });

    it('returns generic message for unknown status', () => {
      const message = getErrorMessage(999, 'UNKNOWN_CODE');

      expect(message).toBe('An unexpected error occurred. Please try again.');
    });

    it('handles all defined status codes', () => {
      const statusCodes = [400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504];

      statusCodes.forEach((status) => {
        const message = getErrorMessage(status, 'UNKNOWN_CODE');
        expect(message).toBeTruthy();
        expect(typeof message).toBe('string');
      });
    });

    it('returns correct messages for validation errors', () => {
      expect(getErrorMessage(400, 'INVALID_DATA')).toBe(
        'Please check your input and try again.'
      );
      expect(getErrorMessage(400, 'VALIDATION_ERROR')).toBe(
        'Some fields are invalid. Please review and correct them.'
      );
    });

    it('returns correct messages for auth errors', () => {
      expect(getErrorMessage(401, 'TOKEN_EXPIRED')).toBe(
        'Your session has expired. Please log in again.'
      );
      expect(getErrorMessage(401, 'UNAUTHORIZED')).toBe(
        'You need to log in to access this feature.'
      );
    });

    it('returns correct messages for not found errors', () => {
      expect(getErrorMessage(404, 'NOT_FOUND')).toBe(
        'The requested resource was not found.'
      );
      expect(getErrorMessage(404, 'ASSET_NOT_FOUND')).toBe(
        'The asset you are looking for does not exist.'
      );
    });

    it('returns correct messages for server errors', () => {
      expect(getErrorMessage(500, 'SERVER_ERROR')).toBe(
        'Something went wrong on our end. Please try again later.'
      );
      expect(getErrorMessage(503, 'SERVICE_UNAVAILABLE')).toBe(
        'Service is temporarily unavailable. Please try again later.'
      );
    });
  });

  describe('getNetworkErrorMessage', () => {
    it('returns network error message', () => {
      const message = getNetworkErrorMessage();

      expect(message).toBe(
        'No internet connection. Please check your network and try again.'
      );
      expect(message).toBe(DEFAULT_ERROR_MESSAGES[0]);
    });
  });

  describe('formatValidationErrors', () => {
    it('formats single field error', () => {
      const details = {
        email: ['Email is required'],
      };

      const formatted = formatValidationErrors(details);

      expect(formatted).toBe('Email: Email is required');
    });

    it('formats multiple errors for single field', () => {
      const details = {
        email: ['Email is required', 'Email must be valid'],
      };

      const formatted = formatValidationErrors(details);

      expect(formatted).toBe('Email: Email is required, Email must be valid');
    });

    it('formats multiple fields with errors', () => {
      const details = {
        email: ['Email is required'],
        password: ['Password is too short'],
      };

      const formatted = formatValidationErrors(details);

      expect(formatted).toContain('Email: Email is required');
      expect(formatted).toContain('Password: Password is too short');
    });

    it('capitalizes field names', () => {
      const details = {
        firstName: ['First name is required'],
        lastName: ['Last name is required'],
      };

      const formatted = formatValidationErrors(details);

      expect(formatted).toContain('FirstName:');
      expect(formatted).toContain('LastName:');
    });

    it('returns default message for empty details', () => {
      const formatted = formatValidationErrors({});

      expect(formatted).toBe('Validation failed. Please check your input.');
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('contains messages for all common status codes', () => {
      const requiredStatuses = [400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504];

      requiredStatuses.forEach((status) => {
        expect(ERROR_MESSAGES[status]).toBeDefined();
        expect(Object.keys(ERROR_MESSAGES[status]).length).toBeGreaterThan(0);
      });
    });

    it('all messages are non-empty strings', () => {
      Object.values(ERROR_MESSAGES).forEach((statusMessages) => {
        Object.values(statusMessages as Record<string, string>).forEach((message) => {
          expect(typeof message).toBe('string');
          expect(message.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('DEFAULT_ERROR_MESSAGES', () => {
    it('contains default messages for all status codes', () => {
      const requiredStatuses = [0, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504];

      requiredStatuses.forEach((status) => {
        expect(DEFAULT_ERROR_MESSAGES[status]).toBeDefined();
        expect(typeof DEFAULT_ERROR_MESSAGES[status]).toBe('string');
        expect(DEFAULT_ERROR_MESSAGES[status].length).toBeGreaterThan(0);
      });
    });
  });
});
