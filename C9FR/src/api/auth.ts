/**
 * Authentication API Module
 * 
 * Handles all authentication-related API calls including:
 * - User registration
 * - User login
 * - User logout
 * - Get user details
 */

import { apiClient } from './client';

/**
 * Registration request data
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password2?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Login request data
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Authentication response with token
 */
export interface AuthResponse {
  key?: string;  // Token from dj-rest-auth
  token?: string;  // Alternative token field
  user?: UserData;
}

/**
 * User data structure
 */
export interface UserData {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

/**
 * User details response
 */
export interface UserDetailsResponse extends UserData {
  // Add any additional user fields here
}

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Register a new user
   * 
   * @param userData - Registration data
   * @returns Authentication response with token
   */
  register: async (userData: RegisterRequest) => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/registration/',
      userData
    );
    return response.data;
  },

  /**
   * Login user
   * 
   * @param credentials - Login credentials
   * @returns Authentication response with token
   */
  login: async (credentials: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/login/',
      credentials
    );
    return response.data;
  },

  /**
   * Logout user
   * 
   * @returns Success response
   */
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout/');
      return response.data;
    } catch (error) {
      // Don't throw error for logout - just log it
      console.warn('Logout request failed:', error);
      return { success: false };
    }
  },

  /**
   * Get current user details
   * 
   * @returns User details
   */
  getUserDetails: async () => {
    const response = await apiClient.get<UserDetailsResponse>('/auth/user/');
    return response.data;
  },

  /**
   * Update user details
   * 
   * @param userData - Updated user data
   * @returns Updated user details
   */
  updateUserDetails: async (userData: Partial<UserData>) => {
    const response = await apiClient.patch<UserDetailsResponse>(
      '/auth/user/',
      userData
    );
    return response.data;
  },

  /**
   * Change password
   * 
   * @param passwords - Old and new passwords
   * @returns Success response
   */
  changePassword: async (passwords: {
    old_password: string;
    new_password1: string;
    new_password2: string;
  }) => {
    const response = await apiClient.post('/auth/password/change/', passwords);
    return response.data;
  },

  /**
   * Request password reset
   * 
   * @param email - User email
   * @returns Success response
   */
  requestPasswordReset: async (email: string) => {
    const response = await apiClient.post('/auth/password/reset/', { email });
    return response.data;
  },

  /**
   * Confirm password reset
   * 
   * @param data - Reset token and new password
   * @returns Success response
   */
  confirmPasswordReset: async (data: {
    uid: string;
    token: string;
    new_password1: string;
    new_password2: string;
  }) => {
    const response = await apiClient.post(
      '/auth/password/reset/confirm/',
      data
    );
    return response.data;
  },
};
