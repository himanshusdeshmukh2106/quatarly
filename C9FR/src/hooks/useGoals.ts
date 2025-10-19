import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Goal, CreateGoalRequest, UpdateGoalRequest } from '../types';
import { goalsApi } from '../api/goals';
import { handleApiError } from '../utils/errors';

interface UseGoalsState {
  goals: Goal[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: string | null;
}

interface UseGoalsReturn extends UseGoalsState {
  loadGoals: (showLoading?: boolean) => Promise<void>;
  refreshGoals: () => Promise<void>;
  createNewGoal: (goalData: CreateGoalRequest) => Promise<void>;
  updateExistingGoal: (
    goalId: string,
    goalData: UpdateGoalRequest
  ) => Promise<void>;
  deleteExistingGoal: (goalId: string) => Promise<void>;
  updateGoalProgress: (goalId: string, currentAmount: number) => Promise<void>;
  markGoalCompleted: (goalId: string) => Promise<void>;
  archiveGoal: (goalId: string) => Promise<void>;
  generateGoalImage: (goalId: string) => Promise<void>;
  getGoalById: (goalId: string) => Goal | undefined;
  getActiveGoals: () => Goal[];
  getCompletedGoals: () => Goal[];
  getArchivedGoals: () => Goal[];
  getTotalTargetAmount: () => number;
  getTotalCurrentAmount: () => number;
  getOverallProgress: () => number;
}

export const useGoals = (): UseGoalsReturn => {
  const [state, setState] = useState<UseGoalsState>({
    goals: [],
    loading: true,
    refreshing: false,
    error: null,
    lastUpdated: null,
  });

  const updateState = useCallback((updates: Partial<UseGoalsState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const loadGoals = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          updateState({ loading: true, error: null });
        }

        const goalsData = await goalsApi.fetchAll();

        updateState({
          goals: goalsData,
          loading: false,
          error: null,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to load goals:', error);
        const apiError = handleApiError(error);

        updateState({
          loading: false,
          error: apiError.userMessage,
        });
      }
    },
    [updateState]
  );

  const refreshGoals = useCallback(async () => {
    updateState({ refreshing: true });

    try {
      await loadGoals(false);
    } catch (error) {
      console.error('Failed to refresh goals:', error);
      const apiError = handleApiError(error);
      Alert.alert('Refresh Failed', apiError.userMessage);
    } finally {
      updateState({ refreshing: false });
    }
  }, [updateState, loadGoals]);

  const createNewGoal = useCallback(
    async (goalData: CreateGoalRequest) => {
      try {
        await goalsApi.create(goalData);

        // Reload goals after creation
        await loadGoals(false);

        Alert.alert('Success', 'Goal created successfully!');
      } catch (error) {
        console.error('Failed to create goal:', error);
        const apiError = handleApiError(error);
        Alert.alert('Error', apiError.userMessage);
        throw error;
      }
    },
    [loadGoals]
  );

  const updateExistingGoal = useCallback(
    async (goalId: string, goalData: UpdateGoalRequest) => {
      try {
        await goalsApi.update(goalId, goalData);

        // Reload goals after update
        await loadGoals(false);

        Alert.alert('Success', 'Goal updated successfully!');
      } catch (error) {
        console.error('Failed to update goal:', error);
        const apiError = handleApiError(error);
        Alert.alert('Error', apiError.userMessage);
        throw error;
      }
    },
    [loadGoals]
  );

  const deleteExistingGoal = useCallback(
    async (goalId: string) => {
      try {
        await goalsApi.delete(goalId);

        // Reload goals after deletion
        await loadGoals(false);

        Alert.alert('Success', 'Goal deleted successfully!');
      } catch (error) {
        console.error('Failed to delete goal:', error);
        const apiError = handleApiError(error);
        Alert.alert('Error', apiError.userMessage);
        throw error;
      }
    },
    [loadGoals]
  );

  const updateGoalProgress = useCallback(
    async (goalId: string, currentAmount: number) => {
      try {
        await goalsApi.updateProgress(goalId, currentAmount);

        // Reload goals after progress update
        await loadGoals(false);

        Alert.alert('Success', 'Goal progress updated successfully!');
      } catch (error) {
        console.error('Failed to update goal progress:', error);
        const apiError = handleApiError(error);
        Alert.alert('Error', apiError.userMessage);
        throw error;
      }
    },
    [loadGoals]
  );

  const markGoalCompleted = useCallback(
    async (goalId: string) => {
      try {
        await goalsApi.markCompleted(goalId);

        // Reload goals after marking complete
        await loadGoals(false);

        Alert.alert('Success', 'Goal marked as completed!');
      } catch (error) {
        console.error('Failed to mark goal as completed:', error);
        const apiError = handleApiError(error);
        Alert.alert('Error', apiError.userMessage);
        throw error;
      }
    },
    [loadGoals]
  );

  const archiveGoal = useCallback(
    async (goalId: string) => {
      try {
        await goalsApi.archive(goalId);

        // Reload goals after archiving
        await loadGoals(false);

        Alert.alert('Success', 'Goal archived successfully!');
      } catch (error) {
        console.error('Failed to archive goal:', error);
        const apiError = handleApiError(error);
        Alert.alert('Error', apiError.userMessage);
        throw error;
      }
    },
    [loadGoals]
  );

  const generateGoalImage = useCallback(
    async (goalId: string) => {
      try {
        await goalsApi.generateImage(goalId);

        // Reload goals after image generation
        await loadGoals(false);

        Alert.alert('Success', 'Goal image generated successfully!');
      } catch (error) {
        console.error('Failed to generate goal image:', error);
        const apiError = handleApiError(error);
        Alert.alert('Error', apiError.userMessage);
        throw error;
      }
    },
    [loadGoals]
  );

  const getGoalById = useCallback(
    (goalId: string): Goal | undefined => {
      return state.goals.find((goal) => goal.id === goalId);
    },
    [state.goals]
  );

  const getActiveGoals = useCallback((): Goal[] => {
    // Return goals that haven't reached their target yet
    return state.goals.filter((goal) => goal.currentAmount < goal.targetAmount);
  }, [state.goals]);

  const getCompletedGoals = useCallback((): Goal[] => {
    // Return goals that have reached or exceeded their target
    return state.goals.filter((goal) => goal.currentAmount >= goal.targetAmount);
  }, [state.goals]);

  const getArchivedGoals = useCallback((): Goal[] => {
    // Since there's no status field, return empty array
    // This can be implemented when status field is added to Goal interface
    return [];
  }, [state.goals]);

  const getTotalTargetAmount = useCallback((): number => {
    return state.goals.reduce((total, goal) => total + goal.targetAmount, 0);
  }, [state.goals]);

  const getTotalCurrentAmount = useCallback((): number => {
    return state.goals.reduce((total, goal) => total + goal.currentAmount, 0);
  }, [state.goals]);

  const getOverallProgress = useCallback((): number => {
    const totalTarget = getTotalTargetAmount();
    const totalCurrent = getTotalCurrentAmount();

    if (totalTarget === 0) return 0;

    return (totalCurrent / totalTarget) * 100;
  }, [getTotalTargetAmount, getTotalCurrentAmount]);

  // Auto-load goals on mount
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return {
    ...state,
    loadGoals,
    refreshGoals,
    createNewGoal,
    updateExistingGoal,
    deleteExistingGoal,
    updateGoalProgress,
    markGoalCompleted,
    archiveGoal,
    generateGoalImage,
    getGoalById,
    getActiveGoals,
    getCompletedGoals,
    getArchivedGoals,
    getTotalTargetAmount,
    getTotalCurrentAmount,
    getOverallProgress,
  };
};
