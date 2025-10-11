import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Opportunity } from '../types';
import { opportunitiesApi } from '../api/opportunities';
import { handleApiError } from '../utils/errors';

interface UseOpportunitiesState {
  opportunities: Opportunity[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: string | null;
}

interface UseOpportunitiesReturn extends UseOpportunitiesState {
  loadOpportunities: (showLoading?: boolean) => Promise<void>;
  refreshOpportunities: () => Promise<void>;
  dismissOpportunity: (opportunityId: string) => Promise<void>;
  markOpportunityViewed: (opportunityId: string) => Promise<void>;
  markOpportunityActedUpon: (opportunityId: string) => Promise<void>;
  getOpportunityById: (opportunityId: string) => Opportunity | undefined;
  getActiveOpportunities: () => Opportunity[];
  getOpportunitiesByCategory: (category: string) => Opportunity[];
  getOpportunitiesByPriority: (
    priority: 'high' | 'medium' | 'low'
  ) => Opportunity[];
  getHighPriorityOpportunities: () => Opportunity[];
  getUnviewedOpportunities: () => Opportunity[];
}

export const useOpportunities = (): UseOpportunitiesReturn => {
  const [state, setState] = useState<UseOpportunitiesState>({
    opportunities: [],
    loading: true,
    refreshing: false,
    error: null,
    lastUpdated: null,
  });

  const updateState = useCallback((updates: Partial<UseOpportunitiesState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const loadOpportunities = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          updateState({ loading: true, error: null });
        }

        const opportunitiesData = await opportunitiesApi.fetchAll();

        updateState({
          opportunities: opportunitiesData,
          loading: false,
          error: null,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to load opportunities:', error);
        const apiError = handleApiError(error);

        updateState({
          loading: false,
          error: apiError.userMessage,
        });
      }
    },
    [updateState]
  );

  const refreshOpportunities = useCallback(async () => {
    updateState({ refreshing: true });

    try {
      const response = await opportunitiesApi.refresh();

      updateState({
        opportunities: response.opportunities,
        refreshing: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      });

      Alert.alert(
        'Success',
        `${response.count} new opportunities generated!`
      );
    } catch (error) {
      console.error('Failed to refresh opportunities:', error);
      const apiError = handleApiError(error);
      Alert.alert('Refresh Failed', apiError.userMessage);
      updateState({ refreshing: false });
    }
  }, [updateState]);

  const dismissOpportunity = useCallback(
    async (opportunityId: string) => {
      try {
        await opportunitiesApi.dismiss(opportunityId);

        // Reload opportunities after dismissing
        await loadOpportunities(false);

        Alert.alert('Success', 'Opportunity dismissed successfully!');
      } catch (error) {
        console.error('Failed to dismiss opportunity:', error);
        const apiError = handleApiError(error);
        Alert.alert('Error', apiError.userMessage);
        throw error;
      }
    },
    [loadOpportunities]
  );

  const markOpportunityViewed = useCallback(
    async (opportunityId: string) => {
      try {
        await opportunitiesApi.markViewed(opportunityId);

        // Reload opportunities after marking viewed
        await loadOpportunities(false);
      } catch (error) {
        console.error('Failed to mark opportunity as viewed:', error);
        const apiError = handleApiError(error);
        // Silent failure for viewed status
        console.error(apiError.userMessage);
      }
    },
    [loadOpportunities]
  );

  const markOpportunityActedUpon = useCallback(
    async (opportunityId: string) => {
      try {
        await opportunitiesApi.markActedUpon(opportunityId);

        // Reload opportunities after marking acted upon
        await loadOpportunities(false);

        Alert.alert('Success', 'Opportunity marked as acted upon!');
      } catch (error) {
        console.error('Failed to mark opportunity as acted upon:', error);
        const apiError = handleApiError(error);
        Alert.alert('Error', apiError.userMessage);
        throw error;
      }
    },
    [loadOpportunities]
  );

  const getOpportunityById = useCallback(
    (opportunityId: string): Opportunity | undefined => {
      return state.opportunities.find((opp) => opp.id === opportunityId);
    },
    [state.opportunities]
  );

  const getActiveOpportunities = useCallback((): Opportunity[] => {
    return state.opportunities.filter((opp) => opp.isActive);
  }, [state.opportunities]);

  const getOpportunitiesByCategory = useCallback(
    (category: string): Opportunity[] => {
      return state.opportunities.filter((opp) => opp.category === category);
    },
    [state.opportunities]
  );

  const getOpportunitiesByPriority = useCallback(
    (priority: 'high' | 'medium' | 'low'): Opportunity[] => {
      return state.opportunities.filter((opp) => opp.priority === priority);
    },
    [state.opportunities]
  );

  const getHighPriorityOpportunities = useCallback((): Opportunity[] => {
    return state.opportunities.filter((opp) => opp.priority === 'high');
  }, [state.opportunities]);

  const getUnviewedOpportunities = useCallback((): Opportunity[] => {
    return state.opportunities.filter((opp) => !(opp as any).viewed);
  }, [state.opportunities]);

  // Auto-load opportunities on mount
  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  return {
    ...state,
    loadOpportunities,
    refreshOpportunities,
    dismissOpportunity,
    markOpportunityViewed,
    markOpportunityActedUpon,
    getOpportunityById,
    getActiveOpportunities,
    getOpportunitiesByCategory,
    getOpportunitiesByPriority,
    getHighPriorityOpportunities,
    getUnviewedOpportunities,
  };
};
