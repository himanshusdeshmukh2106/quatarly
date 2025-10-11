import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Asset,
  AssetType,
  CreateAssetRequest,
  ParsedAssetData,
  MarketStatus,
} from '../types';
import { assetsApi } from '../api/assets';
import { handleApiError, getErrorMessage } from '../utils/errors';
import { debounce } from '../utils/debounce';
import InvestmentCache from '../services/investmentCache';
import PriceUpdateService from '../services/priceUpdateService';

interface UseAssetsState {
  assets: Asset[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  marketStatus: MarketStatus;
  lastUpdated: string | null;
}

interface UseAssetsReturn extends UseAssetsState {
  loadAssets: (showLoading?: boolean) => Promise<void>;
  refreshAssets: () => Promise<void>;
  createNewAsset: (assetData: CreateAssetRequest) => Promise<void>;
  updateExistingAsset: (
    assetId: string,
    assetData: Partial<Asset>
  ) => Promise<void>;
  deleteExistingAsset: (assetId: string) => Promise<void>;
  bulkImportAssets: (assets: ParsedAssetData[]) => Promise<void>;
  updatePhysicalAssetValue: (
    assetId: string,
    newMarketPrice: number
  ) => Promise<void>;
  getFilteredAssets: (filter: string) => Asset[];
  getTotalPortfolioValue: () => number;
  getTotalGainLoss: () => { amount: number; percentage: number };
  getAssetTypeCount: (assetType: AssetType) => number;
  getAssetById: (assetId: string) => Asset | undefined;
}

export const useAssets = (): UseAssetsReturn => {
  const [state, setState] = useState<UseAssetsState>({
    assets: [],
    loading: true,
    refreshing: false,
    error: null,
    marketStatus: 'closed',
    lastUpdated: null,
  });

  const updateState = useCallback((updates: Partial<UseAssetsState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const loadAssets = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          updateState({ loading: true, error: null });
        }

        // Try to load from cache first
        const cachedAssets = await InvestmentCache.getCachedAssets();
        if (cachedAssets && cachedAssets.length > 0) {
          updateState({
            assets: cachedAssets,
            loading: false,
            error: null,
            lastUpdated: new Date().toISOString(),
          });

          // If we have cached data, don't show loading for background refresh
          showLoading = false;
        }

        // Fetch fresh data from API
        const assetsData = await assetsApi.fetchAll();

        // Cache the fresh data
        await InvestmentCache.cacheAssets(assetsData);

        updateState({
          assets: assetsData,
          loading: false,
          error: null,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to load assets:', error);
        const apiError = handleApiError(error);

        // If we have cached data and network fails, keep using cached data
        const cachedAssets = await InvestmentCache.getCachedAssets();
        if (cachedAssets && cachedAssets.length > 0) {
          updateState({
            assets: cachedAssets,
            loading: false,
            error: null, // Don't show error if we have cached data
            lastUpdated: new Date().toISOString(),
          });
        } else {
          updateState({
            loading: false,
            error: apiError.userMessage,
          });
        }
      }
    },
    [updateState]
  );

  // Debounced refresh to prevent multiple rapid calls
  const refreshAssetsInternal = useCallback(async () => {
    updateState({ refreshing: true });

    try {
      // Force price update through the service
      await PriceUpdateService.forceUpdatePrices();

      // Then reload assets to get the latest data
      await loadAssets(false);
    } catch (error) {
      console.error('Failed to refresh assets:', error);
      const apiError = handleApiError(error);
      Alert.alert('Refresh Failed', apiError.userMessage);
    } finally {
      updateState({ refreshing: false });
    }
  }, [updateState, loadAssets]);

  // Debounce the refresh function to prevent rapid successive calls
  const refreshAssets = useCallback(
    async () => {
      const debouncedFn = debounce(refreshAssetsInternal, 1000);
      debouncedFn();
    },
    [refreshAssetsInternal]
  );

  const createNewAsset = useCallback(
    async (assetData: CreateAssetRequest) => {
      try {
        await assetsApi.create(assetData);

        // Reload assets after creation
        await loadAssets(false);

        Alert.alert('Success', 'Asset added successfully!');
      } catch (error) {
        console.error('Failed to create asset:', error);
        const apiError = handleApiError(error);
        Alert.alert('Error', apiError.userMessage);
        throw error;
      }
    },
    [loadAssets]
  );

  const updateExistingAsset = useCallback(
    async (assetId: string, assetData: Partial<Asset>) => {
      try {
        // Transform Asset partial to UpdateAssetRequest
        const updateData: any = {};
        if ('name' in assetData && assetData.name) updateData.name = assetData.name;
        if ('quantity' in assetData) updateData.quantity = (assetData as any).quantity;
        if ('averagePurchasePrice' in assetData) {
          updateData.averagePurchasePrice = (assetData as any).averagePurchasePrice;
        }
        if ('currentPrice' in assetData) {
          updateData.currentPrice = (assetData as any).currentPrice;
        }

        await assetsApi.update(assetId, updateData);

        // Reload assets after update
        await loadAssets(false);

        Alert.alert('Success', 'Asset updated successfully!');
      } catch (error) {
        console.error('Failed to update asset:', error);
        const apiError = handleApiError(error);
        Alert.alert('Error', apiError.userMessage);
        throw error;
      }
    },
    [loadAssets]
  );

  const deleteExistingAsset = useCallback(
    async (assetId: string) => {
      try {
        await assetsApi.delete(assetId);

        // Reload assets after deletion
        await loadAssets(false);

        Alert.alert('Success', 'Asset deleted successfully!');
      } catch (error) {
        console.error('Failed to delete asset:', error);
        const apiError = handleApiError(error);
        Alert.alert('Error', apiError.userMessage);
        throw error;
      }
    },
    [loadAssets]
  );

  const bulkImportAssets = useCallback(
    async (assets: ParsedAssetData[]) => {
      try {
        const validAssets = assets.filter(
          (asset) => asset.quantity > 0 && asset.averagePurchasePrice > 0
        );
        const invalidCount = assets.length - validAssets.length;

        // Create assets one by one
        for (const assetData of validAssets) {
          const createRequest: CreateAssetRequest = {
            assetType: assetData.assetType,
            name: assetData.name,
            symbol: assetData.symbol,
            quantity: assetData.quantity,
            purchasePrice: assetData.averagePurchasePrice,
          };

          await assetsApi.create(createRequest);
        }

        // Reload assets after bulk import
        await loadAssets(false);

        let successMessage = `${validAssets.length} assets imported successfully!`;
        if (invalidCount > 0) {
          successMessage += `\n${invalidCount} assets were skipped due to zero quantity or price.`;
        }
        Alert.alert('Import Complete', successMessage);
      } catch (error) {
        console.error('Failed to import assets:', error);
        const apiError = handleApiError(error);
        Alert.alert('Import Failed', apiError.userMessage);
        throw error;
      }
    },
    [loadAssets]
  );

  const updatePhysicalAssetValue = useCallback(
    async (assetId: string, newMarketPrice: number) => {
      try {
        // Update the asset with new market price
        await assetsApi.update(assetId, { currentPrice: newMarketPrice });

        // Reload assets after update
        await loadAssets(false);

        Alert.alert('Success', 'Asset value updated successfully!');
      } catch (error) {
        console.error('Failed to update asset value:', error);
        const apiError = handleApiError(error);
        Alert.alert('Error', apiError.userMessage);
        throw error;
      }
    },
    [loadAssets]
  );

  const getFilteredAssets = useCallback(
    (filter: string): Asset[] => {
      if (filter === 'all') {
        return state.assets;
      }

      if (filter === 'tradeable') {
        return state.assets.filter((asset) =>
          ['stock', 'etf', 'bond', 'crypto'].includes(asset.assetType)
        );
      }

      if (filter === 'physical') {
        return state.assets.filter((asset) =>
          ['gold', 'silver', 'commodity'].includes(asset.assetType)
        );
      }

      return state.assets.filter((asset) => asset.assetType === filter);
    },
    [state.assets]
  );

  const getTotalPortfolioValue = useCallback((): number => {
    return state.assets.reduce((total, asset) => total + asset.totalValue, 0);
  }, [state.assets]);

  const getTotalGainLoss = useCallback((): {
    amount: number;
    percentage: number;
  } => {
    const totalGainLoss = state.assets.reduce(
      (total, asset) => total + asset.totalGainLoss,
      0
    );
    const totalValue = getTotalPortfolioValue();
    const totalInvested = totalValue - totalGainLoss;
    const percentage =
      totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    return { amount: totalGainLoss, percentage };
  }, [state.assets, getTotalPortfolioValue]);

  const getAssetTypeCount = useCallback(
    (assetType: AssetType): number => {
      return state.assets.filter((asset) => asset.assetType === assetType)
        .length;
    },
    [state.assets]
  );

  const getAssetById = useCallback(
    (assetId: string): Asset | undefined => {
      return state.assets.find((asset) => asset.id === assetId);
    },
    [state.assets]
  );

  // Auto-refresh assets on app focus or at intervals
  useEffect(() => {
    const abortController = new AbortController();

    loadAssets();

    // Optimize cache on app launch
    InvestmentCache.optimizeMemory();

    // Initialize price update service
    const handlePriceUpdate = (updatedAssets: Asset[]) => {
      updateState({
        assets: updatedAssets,
        lastUpdated: new Date().toISOString(),
      });

      // Cache the updated assets
      InvestmentCache.cacheAssets(updatedAssets);
    };

    PriceUpdateService.initialize(handlePriceUpdate);

    return () => {
      abortController.abort();
      PriceUpdateService.destroy();
    };
  }, [loadAssets, updateState]);

  // Update market status based on current time
  useEffect(() => {
    const updateMarketStatus = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();

      // Simple market hours logic (9 AM to 4 PM, Monday to Friday)
      const isWeekday = day >= 1 && day <= 5;
      const isMarketHours = hour >= 9 && hour < 16;

      const newStatus: MarketStatus =
        isWeekday && isMarketHours ? 'open' : 'closed';

      if (newStatus !== state.marketStatus) {
        updateState({ marketStatus: newStatus });
      }
    };

    updateMarketStatus();

    // Update market status every minute
    const statusInterval = setInterval(updateMarketStatus, 60 * 1000);

    return () => clearInterval(statusInterval);
  }, [state.marketStatus, updateState]);

  return {
    ...state,
    loadAssets,
    refreshAssets,
    createNewAsset,
    updateExistingAsset,
    deleteExistingAsset,
    bulkImportAssets,
    updatePhysicalAssetValue,
    getFilteredAssets,
    getTotalPortfolioValue,
    getTotalGainLoss,
    getAssetTypeCount,
    getAssetById,
  };
};
