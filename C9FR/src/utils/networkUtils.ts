import { Alert } from 'react-native';

export interface NetworkError extends Error {
  isNetworkError: boolean;
  statusCode?: number;
}

export const createNetworkError = (message: string, statusCode?: number): NetworkError => {
  const error = new Error(message) as NetworkError;
  error.isNetworkError = true;
  error.statusCode = statusCode;
  return error;
};

export const isNetworkError = (error: any): error is NetworkError => {
  return error && (error.isNetworkError || error.code === 'NETWORK_ERROR' || !navigator.onLine);
};

export const getErrorMessage = (error: any): string => {
  if (isNetworkError(error)) {
    return 'Network connection failed. Please check your internet connection and try again.';
  }
  
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication failed. Please log in again.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'Resource not found. The requested data may have been deleted.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Server error (${error.response.status}). Please try again later.`;
    }
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const handleApiError = (error: any, context: string = 'operation') => {
  const message = getErrorMessage(error);
  console.error(`API Error in ${context}:`, error);
  
  if (isNetworkError(error)) {
    Alert.alert(
      'Connection Error',
      message,
      [
        { text: 'OK' },
        { text: 'Retry', onPress: () => window.location.reload() }
      ]
    );
  } else {
    Alert.alert('Error', message);
  }
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !isNetworkError(error)) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};