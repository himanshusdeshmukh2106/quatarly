import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAssets } from '../useAssets';
import { assetsApi } from '../../api/assets';
import { handleApiError } from '../../utils/errors';
import { ApiError } from '../../utils/errors/ApiError';
import InvestmentCache from '../../services/investmentCache';
import PriceUpdateService from '../../services/priceUpdateService';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('../../api/assets', () => ({
  assetsApi: {
    fetchAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    refreshPrices: jest.fn(),
  },
}));

jest.mock('../../utils/errors', () => ({
  handleApiError: jest.fn((error) => {
    if (error instanceof Error) {
      return new (require('../../utils/errors/ApiError').ApiError)(
        error.message,
        500,
        'ERROR',
        error.message || 'An error occurred'
      );
    }
    return error;
  }),
}));

jest.mock('../../services/investmentCache', () => ({
  getCachedAssets: jest.fn(),
  cacheAssets: jest.fn(),
  optimizeMemory: jest.fn(),
}));

jest.mock('../../services/priceUpdateService', () => ({
  initialize: jest.fn(),
  destroy: jest.fn(),
  forceUpdatePrices: jest.fn(),
}));

jest.mock('../../utils/debounce', () => ({
  debounce: jest.fn((fn) => fn),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockAssets = [
  {
    id: '1',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    assetType: 'stock',
    exchange: 'NASDAQ',
    currency: 'USD',
    quantity: 10,
    averagePurchasePrice: 150,
    currentPrice: 175,
    totalValue: 1750,
    dailyChange: 5,
    dailyChangePercent: 2.94,
    totalGainLoss: 250,
    totalGainLossPercent: 16.67,
    chartData: [],
    lastUpdated: '2024-01-15T10:00:00Z',
    aiAnalysis: 'Strong buy recommendation',
    riskLevel: 'medium',
    recommendation: 'buy',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    sector: 'Technology',
  },
  {
    id: '2',
    name: 'Gold Coins',
    assetType: 'gold',
    quantity: 5,
    unit: 'ounces',
    purchasePrice: 1800,
    currentMarketPrice: 1950,
    totalValue: 9750,
    totalGainLoss: 750,
    totalGainLossPercent: 8.33,
    manuallyUpdated: true,
    lastUpdated: '2024-01-15T10:00:00Z',
    aiAnalysis: 'Good hedge against inflation',
    riskLevel: 'low',
    recommendation: 'hold',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

describe('useAssets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('mock-token');
    (InvestmentCache.getCachedAssets as jest.Mock).mockResolvedValue(null);
    (assetsApi.fetchAll as jest.Mock).mockResolvedValue(mockAssets);
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useAssets());

    expect(result.current.assets).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.refreshing).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.marketStatus).toBe('closed');
    expect(result.current.lastUpdated).toBe(null);
  });

  it('loads assets successfully', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.assets).toEqual(mockAssets);
    expect(result.current.error).toBe(null);
    expect(assetsApi.fetchAll).toHaveBeenCalled();
    expect(InvestmentCache.cacheAssets).toHaveBeenCalledWith(mockAssets);
  });

  it('uses cached assets when available', async () => {
    (InvestmentCache.getCachedAssets as jest.Mock).mockResolvedValue(mockAssets);

    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.assets).toEqual(mockAssets);
    // Should still fetch fresh data in background
    expect(assetsApi.fetchAll).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Failed to fetch assets';
    (assetsApi.fetchAll as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.assets).toEqual([]);
  });

  it('falls back to cached data on API error', async () => {
    (InvestmentCache.getCachedAssets as jest.Mock).mockResolvedValue(mockAssets);
    (assetsApi.fetchAll as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.assets).toEqual(mockAssets);
    expect(result.current.error).toBe(null); // No error shown when cached data is available
  });

  it('refreshes assets correctly', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refreshAssets();
    });

    expect(PriceUpdateService.forceUpdatePrices).toHaveBeenCalled();
  });

  it('creates new asset successfully', async () => {
    const { result } = renderHook(() => useAssets());
    const newAssetData = {
      assetType: 'stock' as const,
      name: 'Microsoft',
      symbol: 'MSFT',
      quantity: 5,
      purchasePrice: 300,
    };

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createNewAsset(newAssetData);
    });

    expect(assetsApi.create).toHaveBeenCalledWith(newAssetData);
    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Asset added successfully!');
  });

  it('handles asset creation errors', async () => {
    const { result } = renderHook(() => useAssets());
    const errorMessage = 'Failed to create asset';
    (assetsApi.create as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.createNewAsset({
          assetType: 'stock',
          name: 'Test',
          quantity: 1,
          purchasePrice: 100,
        });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(Alert.alert).toHaveBeenCalledWith('Error', errorMessage);
  });

  it('updates existing asset successfully', async () => {
    const { result } = renderHook(() => useAssets());
    const updatedData = { name: 'Updated Asset Name' };

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateExistingAsset('1', updatedData);
    });

    expect(assetsApi.update).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Updated Asset Name' }));
    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Asset updated successfully!');
  });

  it('deletes existing asset successfully', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteExistingAsset('1');
    });

    expect(assetsApi.delete).toHaveBeenCalledWith('1');
    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Asset deleted successfully!');
  });

  it('bulk imports assets successfully', async () => {
    const { result } = renderHook(() => useAssets());
    const parsedAssets = [
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        quantity: 2,
        averagePurchasePrice: 800,
        assetType: 'stock' as const,
        confidence: 0.95,
      },
    ];

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Reset the mock to ensure clean state
    (assetsApi.create as jest.Mock).mockResolvedValue(mockAssets[0]);

    await act(async () => {
      await result.current.bulkImportAssets(parsedAssets);
    });

    expect(assetsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        assetType: 'stock',
        name: 'Tesla Inc.',
        symbol: 'TSLA',
        quantity: 2,
        purchasePrice: 800,
      })
    );
    expect(Alert.alert).toHaveBeenCalledWith('Import Complete', '1 assets imported successfully!');
  });

  it('filters assets correctly', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Test 'all' filter
    expect(result.current.getFilteredAssets('all')).toEqual(mockAssets);

    // Test 'tradeable' filter
    const tradeableAssets = result.current.getFilteredAssets('tradeable');
    expect(tradeableAssets).toHaveLength(1);
    expect(tradeableAssets[0].assetType).toBe('stock');

    // Test 'physical' filter
    const physicalAssets = result.current.getFilteredAssets('physical');
    expect(physicalAssets).toHaveLength(1);
    expect(physicalAssets[0].assetType).toBe('gold');

    // Test specific asset type filter
    const stockAssets = result.current.getFilteredAssets('stock');
    expect(stockAssets).toHaveLength(1);
    expect(stockAssets[0].assetType).toBe('stock');
  });

  it('calculates total portfolio value correctly', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const totalValue = result.current.getTotalPortfolioValue();
    expect(totalValue).toBe(1750 + 9750); // Sum of both assets
  });

  it('calculates total gain/loss correctly', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const gainLoss = result.current.getTotalGainLoss();
    expect(gainLoss.amount).toBe(250 + 750); // Sum of both assets' gain/loss
    expect(gainLoss.percentage).toBeCloseTo(9.52, 1); // Calculated percentage
  });

  it('counts asset types correctly', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getAssetTypeCount('stock')).toBe(1);
    expect(result.current.getAssetTypeCount('gold')).toBe(1);
    expect(result.current.getAssetTypeCount('crypto')).toBe(0);
  });

  it('finds asset by ID correctly', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const asset = result.current.getAssetById('1');
    expect(asset).toEqual(mockAssets[0]);

    const nonExistentAsset = result.current.getAssetById('999');
    expect(nonExistentAsset).toBeUndefined();
  });

  it('initializes price update service', async () => {
    renderHook(() => useAssets());

    await waitFor(() => {
      expect(PriceUpdateService.initialize).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  it('cleans up price update service on unmount', () => {
    const { unmount } = renderHook(() => useAssets());

    unmount();

    expect(PriceUpdateService.destroy).toHaveBeenCalled();
  });

  it('updates physical asset value correctly', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updatePhysicalAssetValue('2', 2000);
    });

    expect(assetsApi.update).toHaveBeenCalledWith('2', { currentPrice: 2000 });
    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Asset value updated successfully!');
  });
});
