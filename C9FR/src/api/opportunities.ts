/**
 * Opportunities API Module
 * 
 * Handles all opportunity-related API calls including:
 * - Fetch opportunities
 * - Refresh opportunities
 * - Dismiss opportunity
 */

import { apiClient } from './client';
import { Opportunity } from '../types';

/**
 * Refresh opportunities response
 */
export interface RefreshOpportunitiesResponse {
  success: boolean;
  count: number;
  message: string;
  opportunities: Opportunity[];
}

/**
 * Opportunities API
 */
export const opportunitiesApi = {
  /**
   * Fetch all opportunities for the authenticated user
   * 
   * @returns Array of opportunities
   */
  fetchAll: async (): Promise<Opportunity[]> => {
    const response = await apiClient.get<Opportunity[]>('/opportunities/');
    return response.data;
  },

  /**
   * Fetch a single opportunity by ID
   * 
   * @param id - Opportunity ID
   * @returns Opportunity details
   */
  fetchById: async (id: string): Promise<Opportunity> => {
    const response = await apiClient.get<Opportunity>(`/opportunities/${id}/`);
    return response.data;
  },

  /**
   * Refresh/regenerate opportunities
   * 
   * @returns Refresh result with new opportunities
   */
  refresh: async (): Promise<RefreshOpportunitiesResponse> => {
    const response = await apiClient.post<RefreshOpportunitiesResponse>(
      '/opportunities/refresh/'
    );
    return response.data;
  },

  /**
   * Dismiss an opportunity
   * 
   * @param id - Opportunity ID
   * @returns Updated opportunity
   */
  dismiss: async (id: string): Promise<Opportunity> => {
    const response = await apiClient.patch<Opportunity>(
      `/opportunities/${id}/`,
      {
        status: 'dismissed',
      }
    );
    return response.data;
  },

  /**
   * Mark opportunity as viewed
   * 
   * @param id - Opportunity ID
   * @returns Updated opportunity
   */
  markViewed: async (id: string): Promise<Opportunity> => {
    const response = await apiClient.patch<Opportunity>(
      `/opportunities/${id}/`,
      {
        viewed: true,
      }
    );
    return response.data;
  },

  /**
   * Mark opportunity as acted upon
   * 
   * @param id - Opportunity ID
   * @returns Updated opportunity
   */
  markActedUpon: async (id: string): Promise<Opportunity> => {
    const response = await apiClient.patch<Opportunity>(
      `/opportunities/${id}/`,
      {
        status: 'acted_upon',
      }
    );
    return response.data;
  },

  /**
   * Get opportunities by category
   * 
   * @param category - Opportunity category
   * @returns Filtered opportunities
   */
  fetchByCategory: async (category: string): Promise<Opportunity[]> => {
    const response = await apiClient.get<Opportunity[]>('/opportunities/', {
      params: { category },
    });
    return response.data;
  },

  /**
   * Get opportunities by priority
   * 
   * @param priority - Priority level (high, medium, low)
   * @returns Filtered opportunities
   */
  fetchByPriority: async (
    priority: 'high' | 'medium' | 'low'
  ): Promise<Opportunity[]> => {
    const response = await apiClient.get<Opportunity[]>('/opportunities/', {
      params: { priority },
    });
    return response.data;
  },
};
