/**
 * API Client Unit Tests
 * 
 * Note: Install axios-mock-adapter for full interceptor testing:
 * npm install --save-dev axios-mock-adapter
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, clearAuthToken, isAuthenticated, getAuthToken, apiClient } from '../../../api/client';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

describe('API Client', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('apiClient configuration', () => {
    it('has correct base URL in development', () => {
      expect(apiClient.defaults.baseURL).toBe('http://10.0.2.2:8000/api');
    });

    it('has correct default headers', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('has timeout configured', () => {
      expect(apiClient.defaults.timeout).toBe(30000);
    });
  });

  describe('setAuthToken', () => {
    it('sets Authorization header and stores token', () => {
      const token = 'new-token-123';

      setAuthToken(token);

      expect(apiClient.defaults.headers.common.Authorization).toBe(`Token ${token}`);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', token);
    });

    it('removes Authorization header and token when null', () => {
      // First set a token
      setAuthToken('some-token');
      
      // Then clear it
      setAuthToken(null);

      expect(apiClient.defaults.headers.common.Authorization).toBeUndefined();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('clearAuthToken', () => {
    it('removes Authorization header and clears AsyncStorage', async () => {
      // Set a token first
      setAuthToken('some-token');

      await clearAuthToken();

      expect(apiClient.defaults.headers.common.Authorization).toBeUndefined();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('handles AsyncStorage errors gracefully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(clearAuthToken()).resolves.not.toThrow();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('some-token');

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    it('returns false when token does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });

    it('returns false on AsyncStorage error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getAuthToken', () => {
    it('returns token from AsyncStorage', async () => {
      const token = 'stored-token';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(token);

      const result = await getAuthToken();

      expect(result).toBe(token);
    });

    it('returns null when no token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await getAuthToken();

      expect(result).toBeNull();
    });

    it('returns null on AsyncStorage error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await getAuthToken();

      expect(result).toBeNull();
    });
  });
});
