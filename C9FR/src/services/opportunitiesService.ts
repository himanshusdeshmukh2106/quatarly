import { apiClient } from './apiClient';
import { Opportunity } from '../types';

/**
 * Opportunities API Service
 * Handles all opportunity-related API calls
 */
export class OpportunitiesService {
  /**
   * Fetch all opportunities for the authenticated user
   */
  static async fetchOpportunities(): Promise<Opportunity[]> {
    try {
      const response = await apiClient.get('/opportunities/');
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  }

  /**
   * Refresh opportunities (trigger AI analysis)
   */
  static async refreshOpportunities(): Promise<Opportunity[]> {
    try {
      const response = await apiClient.post('/opportunities/refresh/');
      return response.data;
    } catch (error) {
      console.error('Error refreshing opportunities:', error);
      throw error;
    }
  }

  /**
   * Mark opportunity as viewed
   */
  static async markOpportunityAsViewed(opportunityId: string): Promise<void> {
    try {
      await apiClient.patch(`/opportunities/${opportunityId}/`, {
        viewed: true
      });
    } catch (error) {
      console.error('Error marking opportunity as viewed:', error);
      throw error;
    }
  }

  /**
   * Dismiss an opportunity
   */
  static async dismissOpportunity(opportunityId: string): Promise<void> {
    try {
      await apiClient.delete(`/opportunities/${opportunityId}/`);
    } catch (error) {
      console.error('Error dismissing opportunity:', error);
      throw error;
    }
  }

  /**
   * Get opportunity details with AI insights
   */
  static async getOpportunityDetails(opportunityId: string): Promise<{
    opportunity: Opportunity;
    insights: string[];
    riskAnalysis: {
      level: 'low' | 'medium' | 'high';
      factors: string[];
    };
    recommendations: string[];
  }> {
    try {
      const response = await apiClient.get(`/opportunities/${opportunityId}/details/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunity details:', error);
      throw error;
    }
  }

  /**
   * Get opportunities by category
   */
  static async getOpportunitiesByCategory(category: string): Promise<Opportunity[]> {
    try {
      const response = await apiClient.get('/opportunities/', {
        params: { category }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunities by category:', error);
      throw error;
    }
  }

  /**
   * Get opportunity categories
   */
  static async getOpportunityCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get('/opportunities/categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunity categories:', error);
      throw error;
    }
  }

  /**
   * Get personalized opportunity recommendations
   */
  static async getPersonalizedRecommendations(): Promise<Opportunity[]> {
    try {
      const response = await apiClient.get('/opportunities/personalized/');
      return response.data;
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      throw error;
    }
  }

  /**
   * Provide feedback on an opportunity
   */
  static async provideOpportunityFeedback(
    opportunityId: string, 
    feedback: {
      helpful: boolean;
      reason?: string;
      comments?: string;
    }
  ): Promise<void> {
    try {
      await apiClient.post(`/opportunities/${opportunityId}/feedback/`, feedback);
    } catch (error) {
      console.error('Error providing opportunity feedback:', error);
      throw error;
    }
  }
}

// Export individual functions for backward compatibility
export const fetchOpportunities = OpportunitiesService.fetchOpportunities;
export const refreshOpportunities = OpportunitiesService.refreshOpportunities;
export const markOpportunityAsViewed = OpportunitiesService.markOpportunityAsViewed;
export const dismissOpportunity = OpportunitiesService.dismissOpportunity;
export const getOpportunityDetails = OpportunitiesService.getOpportunityDetails;
export const getOpportunitiesByCategory = OpportunitiesService.getOpportunitiesByCategory;
export const getOpportunityCategories = OpportunitiesService.getOpportunityCategories;
export const getPersonalizedRecommendations = OpportunitiesService.getPersonalizedRecommendations;
export const provideOpportunityFeedback = OpportunitiesService.provideOpportunityFeedback;
