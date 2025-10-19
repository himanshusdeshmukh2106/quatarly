/**
 * useAssetActions Hook
 * 
 * Custom hook for handling asset action operations (edit, delete, long press)
 * Extracted from AssetsScreen to improve code organization and reusability
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { Asset } from '../../../../types';
import { handleApiError } from '../../../../utils/errors';

export interface UseAssetActionsState {
  // Modal states
  showActionSheet: boolean;
  showEditModal: boolean;
  savingAsset: boolean;
  
  // Selected assets
  selectedAssetForAction: Asset | null;
  editingAsset: Asset | null;
}

export interface UseAssetActionsReturn extends UseAssetActionsState {
  // Action handlers
  handleAssetLongPress: (asset: Asset) => void;
  handleEditAsset: (asset: Asset) => void;
  handleSaveAsset: (
    updatedAsset: Asset,
    updateFn: (id: string, data: Asset) => Promise<void>
  ) => Promise<void>;
  handleDeleteAsset: (
    asset: Asset,
    deleteFn: (id: string) => Promise<void>
  ) => Promise<void>;
  
  // Modal controls
  closeActionSheet: () => void;
  closeEditModal: () => void;
}

/**
 * Hook for managing asset actions (edit, delete, long press)
 * 
 * @returns Asset action handlers and state
 */
export const useAssetActions = (): UseAssetActionsReturn => {
  const [state, setState] = useState<UseAssetActionsState>({
    showActionSheet: false,
    showEditModal: false,
    savingAsset: false,
    selectedAssetForAction: null,
    editingAsset: null,
  });

  const updateState = useCallback((updates: Partial<UseAssetActionsState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Handle long press on an asset card
   * Opens the action sheet with edit/delete options
   */
  const handleAssetLongPress = useCallback((asset: Asset) => {
    updateState({
      selectedAssetForAction: asset,
      showActionSheet: true,
    });
  }, [updateState]);

  /**
   * Handle edit action for an asset
   * Opens the edit modal with the selected asset
   */
  const handleEditAsset = useCallback((asset: Asset) => {
    updateState({
      editingAsset: asset,
      showEditModal: true,
      showActionSheet: false,
    });
  }, [updateState]);

  /**
   * Handle save action for an edited asset
   * Calls the provided update function and handles errors
   */
  const handleSaveAsset = useCallback(
    async (
      updatedAsset: Asset,
      updateFn: (id: string, data: Asset) => Promise<void>
    ) => {
      updateState({ savingAsset: true });
      
      try {
        await updateFn(updatedAsset.id, updatedAsset);
        
        // Close modal and clear editing state on success
        updateState({
          showEditModal: false,
          editingAsset: null,
          savingAsset: false,
        });
      } catch (error) {
        const apiError = handleApiError(error);
        
        Alert.alert(
          'Update Failed',
          apiError.userMessage || 'Failed to update asset. Please try again.',
          [{ text: 'OK' }]
        );
        
        updateState({ savingAsset: false });
      }
    },
    [updateState]
  );

  /**
   * Handle delete action for an asset
   * Shows confirmation dialog and calls the provided delete function
   */
  const handleDeleteAsset = useCallback(
    async (
      asset: Asset,
      deleteFn: (id: string) => Promise<void>
    ) => {
      Alert.alert(
        'Delete Asset',
        `Are you sure you want to delete "${asset.name}"? This action cannot be undone.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteFn(asset.id);
                
                // Close action sheet on success
                updateState({
                  showActionSheet: false,
                  selectedAssetForAction: null,
                });
              } catch (error) {
                const apiError = handleApiError(error);
                
                Alert.alert(
                  'Delete Failed',
                  apiError.userMessage || 'Failed to delete asset. Please try again.',
                  [{ text: 'OK' }]
                );
              }
            },
          },
        ]
      );
    },
    [updateState]
  );

  /**
   * Close the action sheet
   */
  const closeActionSheet = useCallback(() => {
    updateState({
      showActionSheet: false,
      selectedAssetForAction: null,
    });
  }, [updateState]);

  /**
   * Close the edit modal
   */
  const closeEditModal = useCallback(() => {
    updateState({
      showEditModal: false,
      editingAsset: null,
    });
  }, [updateState]);

  return {
    // State
    showActionSheet: state.showActionSheet,
    showEditModal: state.showEditModal,
    savingAsset: state.savingAsset,
    selectedAssetForAction: state.selectedAssetForAction,
    editingAsset: state.editingAsset,
    
    // Action handlers
    handleAssetLongPress,
    handleEditAsset,
    handleSaveAsset,
    handleDeleteAsset,
    
    // Modal controls
    closeActionSheet,
    closeEditModal,
  };
};
