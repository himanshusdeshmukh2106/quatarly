/**
 * Tests for useAssetActions Hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAssetActions } from '../useAssetActions';
import { Asset } from '../../../../../types';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock error handler
jest.mock('../../../../../utils/errors', () => ({
    handleApiError: jest.fn((error) => ({
        statusCode: 500,
        code: 'UNKNOWN_ERROR',
        userMessage: error.message || 'An error occurred',
        originalError: error,
    })),
}));

describe('useAssetActions', () => {
    const mockAsset: Asset = {
        id: 'asset-1',
        name: 'Test Asset',
        assetType: 'stock',
        totalValue: 1200,
        totalGainLoss: 200,
        totalGainLossPercent: 20,
        aiAnalysis: 'Test analysis',
        riskLevel: 'medium',
        recommendation: 'buy',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
        lastUpdated: '2024-01-15',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (Alert.alert as jest.Mock).mockClear();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    describe('Initial State', () => {
        it('should initialize with correct default values', () => {
            const { result } = renderHook(() => useAssetActions());

            expect(result.current.showActionSheet).toBe(false);
            expect(result.current.showEditModal).toBe(false);
            expect(result.current.savingAsset).toBe(false);
            expect(result.current.selectedAssetForAction).toBeNull();
            expect(result.current.editingAsset).toBeNull();
        });
    });

    describe('handleAssetLongPress', () => {
        it('should set selected asset and show action sheet', () => {
            const { result } = renderHook(() => useAssetActions());

            act(() => {
                result.current.handleAssetLongPress(mockAsset);
            });

            expect(result.current.selectedAssetForAction).toEqual(mockAsset);
            expect(result.current.showActionSheet).toBe(true);
        });

        it('should handle multiple long presses', () => {
            const { result } = renderHook(() => useAssetActions());
            const secondAsset: Asset = { ...mockAsset, id: 'asset-2', name: 'Second Asset' };

            act(() => {
                result.current.handleAssetLongPress(mockAsset);
            });

            expect(result.current.selectedAssetForAction).toEqual(mockAsset);

            act(() => {
                result.current.handleAssetLongPress(secondAsset);
            });

            expect(result.current.selectedAssetForAction).toEqual(secondAsset);
        });
    });

    describe('handleEditAsset', () => {
        it('should set editing asset and show edit modal', () => {
            const { result } = renderHook(() => useAssetActions());

            act(() => {
                result.current.handleEditAsset(mockAsset);
            });

            expect(result.current.editingAsset).toEqual(mockAsset);
            expect(result.current.showEditModal).toBe(true);
        });

        it('should close action sheet when opening edit modal', () => {
            const { result } = renderHook(() => useAssetActions());

            // First open action sheet
            act(() => {
                result.current.handleAssetLongPress(mockAsset);
            });

            expect(result.current.showActionSheet).toBe(true);

            // Then open edit modal
            act(() => {
                result.current.handleEditAsset(mockAsset);
            });

            expect(result.current.showActionSheet).toBe(false);
            expect(result.current.showEditModal).toBe(true);
        });
    });

    describe('handleSaveAsset', () => {
        it('should call update function and close modal on success', async () => {
            const { result } = renderHook(() => useAssetActions());
            const mockUpdateFn = jest.fn().mockResolvedValue(undefined);
            const updatedAsset = { ...mockAsset, name: 'Updated Asset' };

            // Open edit modal first
            act(() => {
                result.current.handleEditAsset(mockAsset);
            });

            expect(result.current.showEditModal).toBe(true);

            // Save the asset
            await act(async () => {
                await result.current.handleSaveAsset(updatedAsset, mockUpdateFn);
            });

            expect(mockUpdateFn).toHaveBeenCalledWith(updatedAsset.id, updatedAsset);
            expect(result.current.showEditModal).toBe(false);
            expect(result.current.editingAsset).toBeNull();
            expect(result.current.savingAsset).toBe(false);
        });

        it('should set savingAsset to false after save completes', async () => {
            const { result } = renderHook(() => useAssetActions());
            const mockUpdateFn = jest.fn().mockResolvedValue(undefined);

            act(() => {
                result.current.handleEditAsset(mockAsset);
            });

            await act(async () => {
                await result.current.handleSaveAsset(mockAsset, mockUpdateFn);
            });

            expect(result.current.savingAsset).toBe(false);
        });

        it('should show error alert and keep modal open on failure', async () => {
            const { result, unmount } = renderHook(() => useAssetActions());
            const mockError = new Error('Update failed');
            const mockUpdateFn = jest.fn().mockRejectedValue(mockError);

            act(() => {
                result.current.handleEditAsset(mockAsset);
            });

            await act(async () => {
                await result.current.handleSaveAsset(mockAsset, mockUpdateFn);
            });

            expect((Alert.alert as jest.Mock)).toHaveBeenCalledWith(
                'Update Failed',
                'Update failed',
                [{ text: 'OK' }]
            );
            expect(result.current.showEditModal).toBe(true);
            expect(result.current.savingAsset).toBe(false);

            unmount();
        });

        it('should handle API errors with user-friendly messages', async () => {
            const { result, unmount } = renderHook(() => useAssetActions());
            const mockError = new Error('Network error');
            const mockUpdateFn = jest.fn().mockRejectedValue(mockError);

            act(() => {
                result.current.handleEditAsset(mockAsset);
            });

            await act(async () => {
                await result.current.handleSaveAsset(mockAsset, mockUpdateFn);
            });

            expect((Alert.alert as jest.Mock)).toHaveBeenCalled();
            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            expect(alertCall[0]).toBe('Update Failed');
            expect(alertCall[1]).toContain('Network error');

            unmount();
        });
    });

    describe('handleDeleteAsset', () => {
        it('should show confirmation dialog', async () => {
            const { result, unmount } = renderHook(() => useAssetActions());
            const mockDeleteFn = jest.fn().mockResolvedValue(undefined);

            await act(async () => {
                await result.current.handleDeleteAsset(mockAsset, mockDeleteFn);
            });

            expect((Alert.alert as jest.Mock)).toHaveBeenCalledWith(
                'Delete Asset',
                expect.stringContaining('Test Asset'),
                expect.arrayContaining([
                    expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
                    expect.objectContaining({ text: 'Delete', style: 'destructive' }),
                ])
            );

            unmount();
        });

        it('should call delete function when confirmed', async () => {
            const { result, unmount } = renderHook(() => useAssetActions());
            const mockDeleteFn = jest.fn().mockResolvedValue(undefined);

            // Mock Alert.alert to automatically confirm
            (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
                const deleteButton = buttons.find((b: any) => b.text === 'Delete');
                if (deleteButton && deleteButton.onPress) {
                    deleteButton.onPress();
                }
            });

            // Open action sheet first
            act(() => {
                result.current.handleAssetLongPress(mockAsset);
            });

            await act(async () => {
                await result.current.handleDeleteAsset(mockAsset, mockDeleteFn);
            });

            await waitFor(() => {
                expect(mockDeleteFn).toHaveBeenCalledWith(mockAsset.id);
            });

            unmount();
        });

        it('should close action sheet after successful delete', async () => {
            const { result, unmount } = renderHook(() => useAssetActions());
            const mockDeleteFn = jest.fn().mockResolvedValue(undefined);

            // Mock Alert.alert to automatically confirm
            (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
                const deleteButton = buttons.find((b: any) => b.text === 'Delete');
                if (deleteButton && deleteButton.onPress) {
                    deleteButton.onPress();
                }
            });

            // Open action sheet first
            act(() => {
                result.current.handleAssetLongPress(mockAsset);
            });

            expect(result.current.showActionSheet).toBe(true);

            await act(async () => {
                await result.current.handleDeleteAsset(mockAsset, mockDeleteFn);
            });

            await waitFor(() => {
                expect(result.current.showActionSheet).toBe(false);
                expect(result.current.selectedAssetForAction).toBeNull();
            });

            unmount();
        });

        it('should show error alert on delete failure', async () => {
            const { result, unmount } = renderHook(() => useAssetActions());
            const mockError = new Error('Delete failed');
            const mockDeleteFn = jest.fn().mockRejectedValue(mockError);

            // Mock Alert.alert to automatically confirm
            let errorAlertShown = false;
            (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
                if (title === 'Delete Failed') {
                    errorAlertShown = true;
                    return;
                }
                const deleteButton = buttons?.find((b: any) => b.text === 'Delete');
                if (deleteButton && deleteButton.onPress) {
                    deleteButton.onPress();
                }
            });

            await act(async () => {
                await result.current.handleDeleteAsset(mockAsset, mockDeleteFn);
            });

            await waitFor(() => {
                expect(errorAlertShown).toBe(true);
            });

            unmount();
        });

        it('should not call delete function when cancelled', async () => {
            const { result, unmount } = renderHook(() => useAssetActions());
            const mockDeleteFn = jest.fn().mockResolvedValue(undefined);

            // Mock Alert.alert to automatically cancel
            (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
                const cancelButton = buttons.find((b: any) => b.text === 'Cancel');
                if (cancelButton && cancelButton.onPress) {
                    cancelButton.onPress();
                }
            });

            await act(async () => {
                await result.current.handleDeleteAsset(mockAsset, mockDeleteFn);
            });

            expect(mockDeleteFn).not.toHaveBeenCalled();

            unmount();
        });
    });

    describe('closeActionSheet', () => {
        it('should close action sheet and clear selected asset', () => {
            const { result, unmount } = renderHook(() => useAssetActions());

            // Open action sheet first
            act(() => {
                result.current.handleAssetLongPress(mockAsset);
            });

            expect(result.current.showActionSheet).toBe(true);
            expect(result.current.selectedAssetForAction).toEqual(mockAsset);

            // Close action sheet
            act(() => {
                result.current.closeActionSheet();
            });

            expect(result.current.showActionSheet).toBe(false);
            expect(result.current.selectedAssetForAction).toBeNull();

            unmount();
        });
    });

    describe('closeEditModal', () => {
        it('should close edit modal and clear editing asset', () => {
            const { result, unmount } = renderHook(() => useAssetActions());

            // Open edit modal first
            act(() => {
                result.current.handleEditAsset(mockAsset);
            });

            expect(result.current.showEditModal).toBe(true);
            expect(result.current.editingAsset).toEqual(mockAsset);

            // Close edit modal
            act(() => {
                result.current.closeEditModal();
            });

            expect(result.current.showEditModal).toBe(false);
            expect(result.current.editingAsset).toBeNull();

            unmount();
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle complete edit flow', async () => {
            const { result, unmount } = renderHook(() => useAssetActions());
            const mockUpdateFn = jest.fn().mockResolvedValue(undefined);

            // 1. Long press to open action sheet
            act(() => {
                result.current.handleAssetLongPress(mockAsset);
            });

            expect(result.current.showActionSheet).toBe(true);

            // 2. Select edit
            act(() => {
                result.current.handleEditAsset(mockAsset);
            });

            expect(result.current.showEditModal).toBe(true);
            expect(result.current.showActionSheet).toBe(false);

            // 3. Save changes
            const updatedAsset = { ...mockAsset, name: 'Updated Name' };
            await act(async () => {
                await result.current.handleSaveAsset(updatedAsset, mockUpdateFn);
            });

            expect(mockUpdateFn).toHaveBeenCalled();
            expect(result.current.showEditModal).toBe(false);

            unmount();
        });

        it('should handle complete delete flow', async () => {
            const { result, unmount } = renderHook(() => useAssetActions());
            const mockDeleteFn = jest.fn().mockResolvedValue(undefined);

            // Mock Alert.alert to automatically confirm
            (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
                const deleteButton = buttons.find((b: any) => b.text === 'Delete');
                if (deleteButton && deleteButton.onPress) {
                    deleteButton.onPress();
                }
            });

            // 1. Long press to open action sheet
            act(() => {
                result.current.handleAssetLongPress(mockAsset);
            });

            expect(result.current.showActionSheet).toBe(true);

            // 2. Select delete and confirm
            await act(async () => {
                await result.current.handleDeleteAsset(mockAsset, mockDeleteFn);
            });

            await waitFor(() => {
                expect(mockDeleteFn).toHaveBeenCalled();
                expect(result.current.showActionSheet).toBe(false);
            });

            unmount();
        });
    });
});


