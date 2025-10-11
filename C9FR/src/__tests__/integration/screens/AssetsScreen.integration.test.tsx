/**
 * Integration Tests for AssetsScreen Components
 * 
 * Tests the integration between hooks and components:
 * - useAssets hook with API
 * - useAssetActions hook with useAssets
 * - Complete CRUD flows
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAssets } from '../../../hooks/useAssets';
import { useAssetActions } from '../../../screens/main/AssetsScreen/hooks/useAssetActions';
import { assetsApi } from '../../../api/assets';
import { Asset } from '../../../types';

// Mock the API
jest.mock('../../../api/assets', () => ({
  assetsApi: {
    fetchAll: jest.fn(),
    fetchById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock services
jest.mock('../../../services/investmentCache', () => ({
  __esModule: true,
  default: {
    getCachedAssets: jest.fn().mockResolvedValue([]),
    cacheAssets: jest.fn(),
    clearCache: jest.fn(),
    optimizeMemory: jest.fn(),
  },
}));

jest.mock('../../../services/priceUpdateService', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    startPriceUpdates: jest.fn(),
    stopPriceUpdates: jest.fn(),
    updateAssetPrice: jest.fn(),
    destroy: jest.fn(),
  },
}));

const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'Apple Stock',
    assetType: 'stock',
    totalValue: 1800,
    totalGainLoss: 300,
    totalGainLossPercent: 20,
    aiAnalysis: 'Strong performance',
    riskLevel: 'medium',
    recommendation: 'buy',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'asset-2',
    name: 'Gold Holdings',
    assetType: 'gold',
    totalValue: 5500,
    totalGainLoss: 500,
    totalGainLossPercent: 10,
    aiAnalysis: 'Good hedge',
    riskLevel: 'low',
    recommendation: 'hold',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    lastUpdated: '2024-01-15',
  },
];

describe('AssetsScreen Integration Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (assetsApi.fetchAll as jest.Mock).mockResolvedValue(mockAssets);
    (Alert.alert as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Assets Loading Flow', () => {
    it('should load assets successfully', async () => {
      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.assets).toHaveLength(2);
      expect(result.current.assets[0].name).toBe('Apple Stock');
      expect(result.current.error).toBeNull();
    });

    it('should handle loading errors', async () => {
      (assetsApi.fetchAll as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.assets).toHaveLength(0);
    });

    it('should refresh assets', async () => {
      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.assets).toHaveLength(2);

      // Refresh should call the API again
      await act(async () => {
        await result.current.refreshAssets();
      });

      await waitFor(() => {
        expect(result.current.refreshing).toBe(false);
      });

      // Assets should still be loaded
      expect(result.current.assets.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Create Asset Flow', () => {
    it('should create new asset successfully', async () => {
      const newAsset = {
        id: 'asset-3',
        name: 'Tesla Stock',
        assetType: 'stock',
        symbol: 'TSLA',
        quantity: 5,
        purchasePrice: 200,
        currentPrice: 200,
        totalValue: 1000,
        gainLoss: 0,
        gainLossPercent: 0,
        purchaseDate: '2024-01-10',
      };

      (assetsApi.create as jest.Mock).mockResolvedValue(newAsset);

      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createNewAsset({
          name: 'Tesla Stock',
          assetType: 'stock',
          symbol: 'TSLA',
          quantity: 5,
          purchasePrice: 200,
        });
      });

      expect(assetsApi.create).toHaveBeenCalledWith({
        name: 'Tesla Stock',
        assetType: 'stock',
        symbol: 'TSLA',
        quantity: 5,
        purchasePrice: 200,
      });
    });

    it('should handle creation errors', async () => {
      (assetsApi.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.createNewAsset({
            name: 'Test Asset',
            assetType: 'stock',
            quantity: 1,
            purchasePrice: 100,
          });
        })
      ).rejects.toThrow();
    });
  });

  describe('Update Asset Flow', () => {
    it('should update asset successfully', async () => {
      const updatedAsset = {
        ...mockAssets[0],
        name: 'Apple Inc. Updated',
        quantity: 15,
      };

      (assetsApi.update as jest.Mock).mockResolvedValue(updatedAsset);

      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateExistingAsset('asset-1', {
          name: 'Apple Inc. Updated',
        });
      });

      expect(assetsApi.update).toHaveBeenCalledWith('asset-1', {
        name: 'Apple Inc. Updated',
      });
    });

    it('should handle update errors', async () => {
      (assetsApi.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.updateExistingAsset('asset-1', { name: 'Updated' });
        })
      ).rejects.toThrow();
    });
  });

  describe('Delete Asset Flow', () => {
    it('should delete asset successfully', async () => {
      (assetsApi.delete as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.assets.length;

      await act(async () => {
        await result.current.deleteExistingAsset('asset-1');
      });

      expect(assetsApi.delete).toHaveBeenCalledWith('asset-1');
      
      // Note: The actual removal from state happens after API success
      // In a real scenario, we'd refetch or update state
    });

    it('should handle delete errors', async () => {
      (assetsApi.delete as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.deleteExistingAsset('asset-1');
        })
      ).rejects.toThrow();
    });
  });

  describe('Asset Actions Integration', () => {
    it('should handle complete edit flow with useAssetActions', async () => {
      const { result: assetsResult } = renderHook(() => useAssets());
      const { result: actionsResult } = renderHook(() => useAssetActions());

      await waitFor(() => {
        expect(assetsResult.current.loading).toBe(false);
      });

      const asset = mockAssets[0];

      // Simulate long press
      act(() => {
        actionsResult.current.handleAssetLongPress(asset);
      });

      expect(actionsResult.current.showActionSheet).toBe(true);
      expect(actionsResult.current.selectedAssetForAction).toEqual(asset);

      // Simulate edit action
      act(() => {
        actionsResult.current.handleEditAsset(asset);
      });

      expect(actionsResult.current.showEditModal).toBe(true);
      expect(actionsResult.current.editingAsset).toEqual(asset);

      // Simulate save
      const updatedAsset = { ...asset, name: 'Updated Name' };
      (assetsApi.update as jest.Mock).mockResolvedValue(updatedAsset);

      await act(async () => {
        await actionsResult.current.handleSaveAsset(
          updatedAsset,
          assetsResult.current.updateExistingAsset
        );
      });

      expect(assetsApi.update).toHaveBeenCalled();
      expect(actionsResult.current.showEditModal).toBe(false);
    });

    it('should handle complete delete flow with confirmation', async () => {
      const { result: assetsResult } = renderHook(() => useAssets());
      const { result: actionsResult } = renderHook(() => useAssetActions());

      await waitFor(() => {
        expect(assetsResult.current.loading).toBe(false);
      });

      const asset = mockAssets[0];

      // Mock Alert to auto-confirm
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        const deleteButton = buttons.find((b: any) => b.text === 'Delete');
        if (deleteButton && deleteButton.onPress) {
          deleteButton.onPress();
        }
      });

      (assetsApi.delete as jest.Mock).mockResolvedValue(undefined);

      // Simulate long press
      act(() => {
        actionsResult.current.handleAssetLongPress(asset);
      });

      // Simulate delete action
      await act(async () => {
        await actionsResult.current.handleDeleteAsset(
          asset,
          assetsResult.current.deleteExistingAsset
        );
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Delete Asset',
          expect.stringContaining(asset.name),
          expect.any(Array)
        );
        expect(assetsApi.delete).toHaveBeenCalledWith(asset.id);
      });
    });

    it('should handle edit errors with user feedback', async () => {
      const { result: assetsResult } = renderHook(() => useAssets());
      const { result: actionsResult } = renderHook(() => useAssetActions());

      await waitFor(() => {
        expect(assetsResult.current.loading).toBe(false);
      });

      const asset = mockAssets[0];

      act(() => {
        actionsResult.current.handleEditAsset(asset);
      });

      (assetsApi.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await act(async () => {
        await actionsResult.current.handleSaveAsset(
          asset,
          assetsResult.current.updateExistingAsset
        );
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Update Failed',
          expect.any(String),
          expect.any(Array)
        );
        expect(actionsResult.current.showEditModal).toBe(true);
      });
    });
  });

  describe('Portfolio Calculations', () => {
    it('should calculate total portfolio value', async () => {
      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const totalValue = result.current.getTotalPortfolioValue();
      expect(totalValue).toBe(7300); // 1800 + 5500
    });

    it('should calculate total gain/loss', async () => {
      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const gainLoss = result.current.getTotalGainLoss();
      
      // The calculation should return an object with amount and percentage
      expect(gainLoss).toHaveProperty('amount');
      expect(gainLoss).toHaveProperty('percentage');
      expect(typeof gainLoss.amount).toBe('number');
      expect(typeof gainLoss.percentage).toBe('number');
    });

    it('should filter assets by type', async () => {
      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const stockAssets = result.current.getFilteredAssets('stock');
      expect(stockAssets).toHaveLength(1);
      expect(stockAssets[0].assetType).toBe('stock');

      const goldAssets = result.current.getFilteredAssets('gold');
      expect(goldAssets).toHaveLength(1);
      expect(goldAssets[0].assetType).toBe('gold');
    });

    it('should count assets by type', async () => {
      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.getAssetTypeCount('stock')).toBe(1);
      expect(result.current.getAssetTypeCount('gold')).toBe(1);
      expect(result.current.getAssetTypeCount('crypto')).toBe(0);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from failed load and retry successfully', async () => {
      (assetsApi.fetchAll as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockAssets);

      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      await act(async () => {
        await result.current.loadAssets();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.assets).toHaveLength(2);
      });
    });

    it('should maintain state after failed operations', async () => {
      const { result } = renderHook(() => useAssets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialAssets = result.current.assets;

      (assetsApi.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      await expect(
        act(async () => {
          await result.current.createNewAsset({
            name: 'Test',
            assetType: 'stock',
            quantity: 1,
            purchasePrice: 100,
          });
        })
      ).rejects.toThrow();

      // Assets should remain unchanged after failed creation
      expect(result.current.assets).toEqual(initialAssets);
    });
  });
});
