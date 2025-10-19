import { apiClient } from './apiClient';
import { Goal, CreateGoalRequest, UpdateGoalRequest } from '../types';

/**
 * Goals API Service
 * Handles all goal-related API calls
 */
export class GoalsService {
  /**
   * Fetch all goals for the authenticated user
   */
  static async fetchGoals(): Promise<Goal[]> {
    try {
      const response = await apiClient.get('/goals/');
      return response.data;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  }

  /**
   * Create a new goal
   */
  static async createGoal(goalData: CreateGoalRequest): Promise<Goal> {
    try {
      const response = await apiClient.post('/goals/', goalData);
      return response.data;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  /**
   * Update an existing goal
   */
  static async updateGoal(goalId: string, goalData: UpdateGoalRequest): Promise<Goal> {
    try {
      const response = await apiClient.patch(`/goals/${goalId}/`, goalData);
      return response.data;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  /**
   * Delete a goal
   */
  static async deleteGoal(goalId: string): Promise<void> {
    try {
      await apiClient.delete(`/goals/${goalId}/`);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  /**
   * Update goal progress
   */
  static async updateGoalProgress(goalId: string, currentAmount: number): Promise<Goal> {
    try {
      const response = await apiClient.patch(`/goals/${goalId}/progress/`, {
        currentAmount
      });
      return response.data;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  /**
   * Get goal recommendations based on user profile
   */
  static async getGoalRecommendations(): Promise<any[]> {
    try {
      const response = await apiClient.get('/goals/recommendations/');
      return response.data;
    } catch (error) {
      console.error('Error fetching goal recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculate goal projections
   */
  static async calculateGoalProjections(goalId: string): Promise<{
    projectedCompletionDate: string;
    monthlyContributionNeeded: number;
    probabilityOfSuccess: number;
  }> {
    try {
      const response = await apiClient.get(`/goals/${goalId}/projections/`);
      return response.data;
    } catch (error) {
      console.error('Error calculating goal projections:', error);
      throw error;
    }
  }

  /**
   * Get goal categories
   */
  static async getGoalCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get('/goals/categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching goal categories:', error);
      throw error;
    }
  }
}

// Export individual functions for backward compatibility
export const fetchGoals = GoalsService.fetchGoals;
export const createGoal = GoalsService.createGoal;
export const updateGoal = GoalsService.updateGoal;
export const deleteGoal = GoalsService.deleteGoal;
export const updateGoalProgress = GoalsService.updateGoalProgress;
export const getGoalRecommendations = GoalsService.getGoalRecommendations;
export const calculateGoalProjections = GoalsService.calculateGoalProjections;
export const getGoalCategories = GoalsService.getGoalCategories;
