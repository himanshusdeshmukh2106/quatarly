import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import PriceUpdateService from '../priceUpdateService';
import * as api from '../api';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock API functions
jest.mock('../api', () => ({
  refreshAssetPrices: jest.fn(),
  fetchDailyPrices: jest.fn(),
}));

// Mock AppState
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(),
  },
}));

describe('PriceUpdateService', () => {
  const mockOnPriceUpdate = jest.fn();
  const mockAssets = [
    {
      id: '1',
      name: 'Apple Inc.',
      symbol: 'AAPL',
      assetType: 'stock',
      totalValue: 1750,
      totalGainLoss: 250,
      totalGainLossPercent: 16.67,
      lastUpdated: '2024-01-15T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    
    // Reset the service state
    PriceUpdateService.destroy();
  });

  afterEach(() => {
    jest.useRealTimers();
    PriceUpdateService.destroy();
  });

  describe('initialization', () => {
    it('initializes correctly with callback', () => {
      expect(() => {
        PriceUpdateService.initialize(mockOnPriceUpdate);
      }).not.toThrow();
    });

    it('sets up app state listener on initialization', () => {
      PriceUpdateService.initialize(mockOnPriceUpdate);
      expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('price updates', () => {
    beforeEach(() => {
      (api.refreshAssetPrices as jest.Mock).mockResolvedValue(mockAssets);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    });

    it('forces price update correctly', async () => {
      PriceUpdateService.initialize(mockOnPriceUpdate);
      
      await PriceUpdateService.forceUpdatePrices();
      
      expect(api.refreshAssetPrices).toHaveBeenCalledTimes(1);
      expect(mockOnPriceUpdate).toHaveBeenCalledWith(mockAssets);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'lastPriceUpdate',
        expect.any(String)
      );
    });

    it('handles API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (api.refreshAssetPrices as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      PriceUpdateService.initialize(mockOnPriceUpdate);
      
      await PriceUpdateService.forceUpdatePrices();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Price update failed:', expect.any(Error));
      expect(mockOnPriceUpdate).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('implements retry logic on failure', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      (api.refreshAssetPrices as jest.Mock)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockAssets);
      
      PriceUpdateService.initialize(mockOnPriceUpdate);
      
      // Start the update
      const updatePromise = PriceUpdateService.forceUpdatePrices();
      
      // Fast-forward timers to trigger retry
      jest.advanceTimersByTime(2000);
      
      await updatePromise;
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Retrying price update')
      );
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('market status', () => {
    it('correctly identifies market open status', () => {
      // Mock a weekday during market hours (Tuesday 10 AM)
      const mockDate = new Date('2024-01-16T10:00:00Z'); // Tuesday
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      const status = PriceUpdateService.getMarketStatus();
      
      expect(status.isOpen).toBe(true);
      expect(status.nextClose).toBeDefined();
      expect(status.nextOpen).toBeUndefined();
      
      (global.Date as any).mockRestore();
    });

    it('correctly identifies market closed status', () => {
      // Mock a weekend (Saturday)
      const mockDate = new Date('2024-01-13T10:00:00Z'); // Saturday
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      const status = PriceUpdateService.getMarketStatus();
      
      expect(status.isOpen).toBe(false);
      expect(status.nextOpen).toBeDefined();
      expect(status.nextClose).toBeUndefined();
      
      (global.Date as any).mockRestore();
    });

    it('correctly identifies after-hours status', () => {
      // Mock a weekday after market hours (Tuesday 6 PM)
      const mockDate = new Date('2024-01-16T18:00:00Z'); // Tuesday 6 PM
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      const status = PriceUpdateService.getMarketStatus();
      
      expect(status.isOpen).toBe(false);
      expect(status.nextOpen).toBeDefined();
      
      (global.Date as any).mockRestore();
    });
  });

  describe('update scheduling', () => {
    it('should update prices if never updated before', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      // Mock current time
      const mockNow = new Date('2024-01-16T10:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockNow as any);
      
      PriceUpdateService.initialize(mockOnPriceUpdate);
      
      // Fast-forward to trigger initial check
      jest.advanceTimersByTime(2000);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(api.refreshAssetPrices).toHaveBeenCalled();
      
      (global.Date as any).mockRestore();
    });

    it('should update prices if last update was more than 1 hour ago', async () => {
      const oneHourAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(oneHourAgo);
      
      PriceUpdateService.initialize(mockOnPriceUpdate);
      
      // Fast-forward to trigger initial check
      jest.advanceTimersByTime(2000);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(api.refreshAssetPrices).toHaveBeenCalled();
    });

    it('should not update prices if recently updated', async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(fiveMinutesAgo);
      
      // Mock current time as not market hours
      const mockNow = new Date('2024-01-16T20:00:00Z'); // 8 PM
      jest.spyOn(global, 'Date').mockImplementation(() => mockNow as any);
      
      PriceUpdateService.initialize(mockOnPriceUpdate);
      
      // Fast-forward to trigger initial check
      jest.advanceTimersByTime(2000);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(api.refreshAssetPrices).not.toHaveBeenCalled();
      
      (global.Date as any).mockRestore();
    });
  });

  describe('configuration', () => {
    it('allows configuration updates', () => {
      const newConfig = {
        updateInterval: 10 * 60 * 1000, // 10 minutes
        maxRetries: 5,
        retryDelay: 3000,
      };
      
      PriceUpdateService.configure(newConfig);
      
      const config = PriceUpdateService.getConfig();
      expect(config.updateInterval).toBe(newConfig.updateInterval);
      expect(config.maxRetries).toBe(newConfig.maxRetries);
      expect(config.retryDelay).toBe(newConfig.retryDelay);
    });

    it('merges partial configuration updates', () => {
      const originalConfig = PriceUpdateService.getConfig();
      
      PriceUpdateService.configure({
        updateInterval: 15 * 60 * 1000, // 15 minutes
      });
      
      const updatedConfig = PriceUpdateService.getConfig();
      expect(updatedConfig.updateInterval).toBe(15 * 60 * 1000);
      expect(updatedConfig.maxRetries).toBe(originalConfig.maxRetries);
      expect(updatedConfig.retryDelay).toBe(originalConfig.retryDelay);
    });
  });

  describe('specific symbol updates', () => {
    it('updates specific symbols correctly', async () => {
      const mockPriceUpdates = [
        { symbol: 'AAPL', price: 175, change: 5, changePercent: 2.94 },
        { symbol: 'GOOGL', price: 2800, change: -10, changePercent: -0.36 },
      ];
      
      (api.fetchDailyPrices as jest.Mock).mockResolvedValue(mockPriceUpdates);
      
      const result = await PriceUpdateService.updateSpecificSymbols(['AAPL', 'GOOGL']);
      
      expect(api.fetchDailyPrices).toHaveBeenCalledWith(['AAPL', 'GOOGL'], null);
      expect(result).toEqual(mockPriceUpdates);
    });

    it('handles errors in specific symbol updates', async () => {
      (api.fetchDailyPrices as jest.Mock).mockRejectedValue(new Error('Symbol not found'));
      
      await expect(
        PriceUpdateService.updateSpecificSymbols(['INVALID'])
      ).rejects.toThrow('Symbol not found');
    });
  });

  describe('cleanup', () => {
    it('cleans up resources on destroy', () => {
      PriceUpdateService.initialize(mockOnPriceUpdate);
      
      expect(() => {
        PriceUpdateService.destroy();
      }).not.toThrow();
    });

    it('stops periodic updates on destroy', () => {
      PriceUpdateService.initialize(mockOnPriceUpdate);
      
      // Verify timers are set
      expect(jest.getTimerCount()).toBeGreaterThan(0);
      
      PriceUpdateService.destroy();
      
      // Timers should be cleared
      expect(jest.getTimerCount()).toBe(0);
    });
  });
});