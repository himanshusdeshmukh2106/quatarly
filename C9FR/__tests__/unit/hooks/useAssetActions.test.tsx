import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAssetActions } from '../../../src/screens/main/AssetsScreen/hooks/useAssetActions';
import { useAssets } from '../../../src/hooks/useAssets';
import { Asset } from '../../../src/types';

// Mock useAssets hook
jest.mock('../../../src/hooks/useAssets', () => ({
  useAssets: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockUpdateExistingAsset = jest.fn();
const mockDeleteExistingAsset = jest.fn();

const mockAsset: Asset = {
  id: '1',
  name: 'Test Asset',
  assetType: 'stock',
  symbol: 'TEST',
  quantity: 10,
  price: 100,
};

describe('useAssetActions', () => {
  beforeEach(() => {
    (useAssets as jest.Mock).mockReturnValue({
      updateExistingAsset: mockUpdateExistingAsset,
      deleteExistingAsset: mockDeleteExistingAsset,
    });
    jest.clearAllMocks();
  });

  it('should handle long press and show action sheet', () => {
    const { result } = renderHook(() => useAssetActions());

    expect(result.current.showActionSheet).toBe(false);
    expect(result.current.selectedAssetForAction).toBeNull();

    act(() => {
      result.current.handleAssetLongPress(mockAsset);
    });

    expect(result.current.showActionSheet).toBe(true);
    expect(result.current.selectedAssetForAction).toEqual(mockAsset);
  });

  it('should close the action sheet', () => {
    const { result } = renderHook(() => useAssetActions());

    act(() => {
      result.current.handleAssetLongPress(mockAsset);
    });

    expect(result.current.showActionSheet).toBe(true);

    act(() => {
      result.current.closeActionSheet();
    });

    expect(result.current.showActionSheet).toBe(false);
    expect(result.current.selectedAssetForAction).toBeNull();
  });

  it('should open the edit modal from action sheet', () => {
    const { result } = renderHook(() => useAssetActions());

    act(() => {
      result.current.handleAssetLongPress(mockAsset);
    });

    act(() => {
      result.current.handleEditRequest();
    });

    expect(result.current.showEditModal).toBe(true);
    expect(result.current.editingAsset).toEqual(mockAsset);
    expect(result.current.showActionSheet).toBe(false);
  });

  it('should save an asset and close the edit modal', async () => {
    mockUpdateExistingAsset.mockResolvedValueOnce({});
    const { result } = renderHook(() => useAssetActions());

    const updatedAsset = { ...mockAsset, name: 'Updated Asset' };

    await act(async () => {
      await result.current.handleSaveAsset(updatedAsset);
    });

    expect(mockUpdateExistingAsset).toHaveBeenCalledWith(updatedAsset.id, updatedAsset);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.showEditModal).toBe(false);
    expect(result.current.editingAsset).toBeNull();
  });

  it('should handle errors when saving an asset', async () => {
    mockUpdateExistingAsset.mockRejectedValueOnce(new Error('Update failed'));
    const { result } = renderHook(() => useAssetActions());

    await act(async () => {
      await result.current.handleSaveAsset(mockAsset);
    });

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to update asset. Please try again.');
    expect(result.current.isSaving).toBe(false);
  });

  it('should show a confirmation alert on delete request', () => {
    const { result } = renderHook(() => useAssetActions());

    act(() => {
      result.current.handleAssetLongPress(mockAsset);
    });

    act(() => {
      result.current.handleDeleteRequest();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Asset',
      `Are you sure you want to delete ${mockAsset.name}? This action cannot be undone.`,
      expect.any(Array)
    );
  });
});
