import { apiClient } from './apiClient';
import { QuestionnaireResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(email: string, password: string): Promise<{
    token: string;
    user: any;
  }> {
    try {
      const response = await apiClient.post('/auth/login/', {
        email,
        password
      });
      
      // Store token in AsyncStorage
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('userProfile', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }): Promise<{
    token: string;
    user: any;
  }> {
    try {
      const response = await apiClient.post('/auth/register/', userData);
      
      // Store token in AsyncStorage
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('userProfile', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      // Clear local storage regardless of API call success
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userProfile');
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<any> {
    try {
      const response = await apiClient.get('/auth/user/');
      
      // Update stored user profile
      await AsyncStorage.setItem('userProfile', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    occupation?: string;
    annualIncome?: number;
    riskTolerance?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.patch('/auth/user/', profileData);
      
      // Update stored user profile
      await AsyncStorage.setItem('userProfile', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Submit questionnaire responses
   */
  static async submitQuestionnaire(responses: QuestionnaireResponse[]): Promise<{
    riskProfile: string;
    recommendations: string[];
  }> {
    try {
      const response = await apiClient.post('/auth/questionnaire/', {
        responses
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    try {
      await apiClient.post('/auth/change-password/', {
        current_password: currentPassword,
        new_password: newPassword
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/password-reset/', { email });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post('/auth/verify-email/', { token });
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return false;
      
      // Verify token with server
      await apiClient.get('/auth/verify-token/');
      return true;
    } catch (error) {
      // Token is invalid, clear it
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userProfile');
      return false;
    }
  }
}

// Export individual functions for backward compatibility
export const login = AuthService.login;
export const register = AuthService.register;
export const logout = AuthService.logout;
export const getCurrentUser = AuthService.getCurrentUser;
export const updateProfile = AuthService.updateProfile;
export const submitQuestionnaire = AuthService.submitQuestionnaire;
export const changePassword = AuthService.changePassword;
export const requestPasswordReset = AuthService.requestPasswordReset;
export const verifyEmail = AuthService.verifyEmail;
export const isAuthenticated = AuthService.isAuthenticated;
