/**
 * API Client
 * 
 * Centralized Axios instance with request/response interceptors
 * for authentication and error handling.
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleApiError, logError, shouldLogout } from '../utils/errors';

/**
 * API Base URL
 * - Development: Android emulator uses 10.0.2.2
 * - Production: Update with your production API URL
 */
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000/api'  // Android emulator
  : 'http://192.168.1.6:8000/api';  // TODO: Update with production URL

/**
 * Create Axios instance with base configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request Interceptor
 * Automatically injects authentication token from AsyncStorage
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip if Authorization header already set
    if (config.headers.Authorization) {
      return config;
    }

    // Try to get token from AsyncStorage
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    } catch (error) {
      // Log error but don't block request
      console.warn('Failed to get auth token from storage:', error);
    }

    return config;
  },
  (error) => {
    // Handle request setup errors
    const apiError = handleApiError(error);
    logError(apiError, 'API Request Setup');
    return Promise.reject(apiError);
  }
);

/**
 * Response Interceptor
 * Handles errors and auto-logout on authentication failures
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Successfully received response
    return response;
  },
  async (error) => {
    // Convert to ApiError for consistent handling
    const apiError = handleApiError(error);

    // Log error (without sensitive data)
    logError(apiError, 'API Response');

    // Handle authentication errors
    if (shouldLogout(apiError)) {
      try {
        // Clear auth state
        await AsyncStorage.multiRemove([
          'authToken',
          'user',
          'onboardingComplete',
        ]);

        // TODO: Navigate to login screen
        // This should be handled by the app's navigation logic
        // You might want to emit an event or use a navigation service
      } catch (e) {
        console.error('Failed to clear auth state:', e);
      }
    }

    // Reject with ApiError
    return Promise.reject(apiError);
  }
);

/**
 * Set authentication token
 * Updates the default Authorization header for all requests
 * 
 * @param token - Authentication token or null to remove
 */
export const setAuthToken = (token: string | null): void => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Token ${token}`;
    // Also store in AsyncStorage for persistence
    AsyncStorage.setItem('authToken', token).catch((error) => {
      console.error('Failed to store auth token:', error);
    });
  } else {
    delete apiClient.defaults.headers.common.Authorization;
    // Remove from AsyncStorage
    AsyncStorage.removeItem('authToken').catch((error) => {
      console.error('Failed to remove auth token:', error);
    });
  }
};

/**
 * Clear authentication token
 * Removes token from headers and AsyncStorage
 */
export const clearAuthToken = async (): Promise<void> => {
  delete apiClient.defaults.headers.common.Authorization;
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
};

/**
 * Check if user is authenticated
 * Checks if auth token exists in AsyncStorage
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  } catch (error) {
    console.error('Failed to check authentication status:', error);
    return false;
  }
};

/**
 * Get current auth token
 * Retrieves token from AsyncStorage
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};
