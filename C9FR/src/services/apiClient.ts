import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace with your computer's IP address
// For Android emulator, use 10.0.2.2
// For physical device or iOS simulator, use your computer's IP address
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000/api'  // Android emulator
  : 'http://192.168.1.5:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for automatic auth token injection
apiClient.interceptors.request.use(
  async (config) => {
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
      console.error('Failed to get auth token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth state
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userProfile');
      } catch (storageError) {
        console.error('Failed to clear auth data:', storageError);
      }
      
      // You might want to redirect to login screen here
      // NavigationService.navigate('Login');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
