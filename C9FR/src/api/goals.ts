/**
 * Goals API Module
 * 
 * Handles all goal-related API calls including:
 * - Fetch goals
 * - Create goal
 * - Update goal
 * - Delete goal
 * - Generate goal image
 */

import { apiClient } from './client';
import { Goal, CreateGoalRequest, UpdateGoalRequest } from '../types';

/**
 * Goals API
 */
export const goalsApi = {
  /**
   * Fetch all goals for the authenticated user
   * 
   * @returns Array of goals
   */
  fetchAll: async (): Promise<Goal[]> => {
    const response = await apiClient.get<Goal[]>('/goals/');
    return response.data;
  },

  /**
   * Fetch a single goal by ID
   * 
   * @param id - Goal ID
   * @returns Goal details
   */
  fetchById: async (id: string): Promise<Goal> => {
    const response = await apiClient.get<Goal>(`/goals/${id}/`);
    return response.data;
  },

  /**
   * Create a new goal
   * 
   * @param goalData - Goal creation data
   * @returns Created goal
   */
  create: async (goalData: CreateGoalRequest): Promise<Goal> => {
    const response = await apiClient.post<Goal>('/goals/', goalData);
    return response.data;
  },

  /**
   * Update an existing goal
   * 
   * @param id - Goal ID
   * @param goalData - Updated goal data
   * @returns Updated goal
   */
  update: async (id: string, goalData: UpdateGoalRequest): Promise<Goal> => {
    const response = await apiClient.put<Goal>(`/goals/${id}/`, goalData);
    return response.data;
  },

  /**
   * Partially update a goal
   * 
   * @param id - Goal ID
   * @param goalData - Partial goal data
   * @returns Updated goal
   */
  patch: async (id: string, goalData: Partial<UpdateGoalRequest>): Promise<Goal> => {
    const response = await apiClient.patch<Goal>(`/goals/${id}/`, goalData);
    return response.data;
  },

  /**
   * Delete a goal
   * 
   * @param id - Goal ID
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/goals/${id}/`);
  },

  /**
   * Generate a new image for a goal
   * 
   * @param id - Goal ID
   * @returns Updated goal with new image
   */
  generateImage: async (id: string): Promise<Goal> => {
    const response = await apiClient.post<Goal>(`/goals/${id}/generate-image/`);
    return response.data;
  },

  /**
   * Update goal progress
   * 
   * @param id - Goal ID
   * @param currentAmount - Current saved amount
   * @returns Updated goal
   */
  updateProgress: async (id: string, currentAmount: number): Promise<Goal> => {
    const response = await apiClient.patch<Goal>(`/goals/${id}/`, {
      current_amount: currentAmount,
    });
    return response.data;
  },

  /**
   * Mark goal as completed
   * 
   * @param id - Goal ID
   * @returns Updated goal
   */
  markCompleted: async (id: string): Promise<Goal> => {
    const response = await apiClient.patch<Goal>(`/goals/${id}/`, {
      status: 'completed',
    });
    return response.data;
  },

  /**
   * Archive a goal
   * 
   * @param id - Goal ID
   * @returns Updated goal
   */
  archive: async (id: string): Promise<Goal> => {
    const response = await apiClient.patch<Goal>(`/goals/${id}/`, {
      status: 'archived',
    });
    return response.data;
  },
};
