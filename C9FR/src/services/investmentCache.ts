import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset, CandlestickData } from '../types';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface ChartCacheItem {
  data: CandlestickData[];
  timestamp: number;
  expiresAt: number;
  symbol: string;
  timeframe: string;
}

class InvestmentCache {
  private static readonly CACHE_PREFIX = 'investment_cache_';
  private static readonly CHART_CACHE_PREFIX = 'chart_cache_';
  private static readonly ASSETS_CACHE_KEY = 'assets_data';
  
  // Cache durations in milliseconds
  private static readonly ASSETS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly CHART_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly PRICE_CACHE_DURATION = 1 * 60 * 1000; // 1 minute for prices

  private static getCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  private static getChartCacheKey(symbol: string, timeframe: string): string {
    return `${this.CHART_CACHE_PREFIX}${symbol}_${timeframe}`;
  }

  private static isExpired(expiresAt: number): boolean {
    return Date.now() > expiresAt;
  }

  // Generic cache methods
  private static async setCache<T>(key: string, data: T, duration: number): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + duration,
      };
      
      await AsyncStorage.setItem(this.getCacheKey(key), JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }

  private static async getCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(this.getCacheKey(key));
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      if (this.isExpired(cacheItem.expiresAt)) {
        await this.removeCache(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  }

  private static async removeCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.getCacheKey(key));
    } catch (error) {
      console.error('Failed to remove cache:', error);
    }
  }

  // Assets caching
  static async cacheAssets(assets: Asset[]): Promise<void> {
    await this.setCache(this.ASSETS_CACHE_KEY, assets, this.ASSETS_CACHE_DURATION);
    
    // Also cache individual assets for selective updates
    for (const asset of assets) {
      await this.setCache(`asset_${asset.id}`, asset, this.ASSETS_CACHE_DURATION);
    }
  }

  static async getCachedAssets(): Promise<Asset[] | null> {
    return await this.getCache<Asset[]>(this.ASSETS_CACHE_KEY);
  }

  static async getCachedAsset(assetId: string): Promise<Asset | null> {
    return await this.getCache<Asset>(`asset_${assetId}`);
  }

  static async updateCachedAsset(asset: Asset): Promise<void> {
    await this.setCache(`asset_${asset.id}`, asset, this.ASSETS_CACHE_DURATION);
    
    // Update the main assets cache if it exists
    const cachedAssets = await this.getCachedAssets();
    if (cachedAssets) {
      const updatedAssets = cachedAssets.map(a => a.id === asset.id ? asset : a);
      await this.setCache(this.ASSETS_CACHE_KEY, updatedAssets, this.ASSETS_CACHE_DURATION);
    }
  }

  static async clearAssetsCache(): Promise<void> {
    await this.removeCache(this.ASSETS_CACHE_KEY);
    
    // Clear individual asset caches
    const keys = await AsyncStorage.getAllKeys();
    const assetKeys = keys.filter(key => key.includes('asset_'));
    await AsyncStorage.multiRemove(assetKeys);
  }

  // Chart data caching
  static async cacheChartData(
    symbol: string, 
    timeframe: string, 
    data: CandlestickData[]
  ): Promise<void> {
    try {
      const cacheItem: ChartCacheItem = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.CHART_CACHE_DURATION,
        symbol,
        timeframe,
      };
      
      const key = this.getChartCacheKey(symbol, timeframe);
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Failed to cache chart data:', error);
    }
  }

  static async getCachedChartData(
    symbol: string, 
    timeframe: string
  ): Promise<CandlestickData[] | null> {
    try {
      const key = this.getChartCacheKey(symbol, timeframe);
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const cacheItem: ChartCacheItem = JSON.parse(cached);
      
      if (this.isExpired(cacheItem.expiresAt)) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Failed to get cached chart data:', error);
      return null;
    }
  }

  static async clearChartCache(symbol?: string): Promise<void> {
    try {
      if (symbol) {
        // Clear cache for specific symbol
        const timeframes = ['daily', 'weekly', 'monthly'];
        for (const timeframe of timeframes) {
          const key = this.getChartCacheKey(symbol, timeframe);
          await AsyncStorage.removeItem(key);
        }
      } else {
        // Clear all chart cache
        const keys = await AsyncStorage.getAllKeys();
        const chartKeys = keys.filter(key => key.startsWith(this.CHART_CACHE_PREFIX));
        await AsyncStorage.multiRemove(chartKeys);
      }
    } catch (error) {
      console.error('Failed to clear chart cache:', error);
    }
  }

  // Price caching for real-time updates
  static async cachePrices(prices: Record<string, number>): Promise<void> {
    await this.setCache('prices', prices, this.PRICE_CACHE_DURATION);
  }

  static async getCachedPrices(): Promise<Record<string, number> | null> {
    return await this.getCache<Record<string, number>>('prices');
  }

  // Cache management
  static async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith(this.CACHE_PREFIX) || key.startsWith(this.CHART_CACHE_PREFIX)
      );
      
      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return 0;
    }
  }

  static async clearExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith(this.CACHE_PREFIX) || key.startsWith(this.CHART_CACHE_PREFIX)
      );
      
      const expiredKeys: string[] = [];
      
      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          try {
            const cacheItem = JSON.parse(cached);
            if (this.isExpired(cacheItem.expiresAt)) {
              expiredKeys.push(key);
            }
          } catch (parseError) {
            // If we can't parse it, consider it expired
            expiredKeys.push(key);
          }
        }
      }
      
      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys);
        console.log(`Cleared ${expiredKeys.length} expired cache items`);
      }
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }

  static async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith(this.CACHE_PREFIX) || key.startsWith(this.CHART_CACHE_PREFIX)
      );
      
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`Cleared ${cacheKeys.length} cache items`);
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  // Data compression utilities
  static compressData<T>(data: T): string {
    try {
      // Simple JSON compression by removing unnecessary whitespace
      return JSON.stringify(data);
    } catch (error) {
      console.error('Failed to compress data:', error);
      return JSON.stringify(data);
    }
  }

  static decompressData<T>(compressedData: string): T | null {
    try {
      return JSON.parse(compressedData);
    } catch (error) {
      console.error('Failed to decompress data:', error);
      return null;
    }
  }

  // Memory optimization
  static async optimizeMemory(): Promise<void> {
    try {
      // Clear expired cache
      await this.clearExpiredCache();
      
      // Check cache size and clear if too large (> 10MB)
      const cacheSize = await this.getCacheSize();
      const maxCacheSize = 10 * 1024 * 1024; // 10MB
      
      if (cacheSize > maxCacheSize) {
        console.log(`Cache size (${cacheSize} bytes) exceeds limit, clearing old data`);
        
        // Clear chart cache older than 7 days
        const keys = await AsyncStorage.getAllKeys();
        const chartKeys = keys.filter(key => key.startsWith(this.CHART_CACHE_PREFIX));
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        const oldKeys: string[] = [];
        for (const key of chartKeys) {
          const cached = await AsyncStorage.getItem(key);
          if (cached) {
            try {
              const cacheItem = JSON.parse(cached);
              if (cacheItem.timestamp < sevenDaysAgo) {
                oldKeys.push(key);
              }
            } catch (parseError) {
              oldKeys.push(key);
            }
          }
        }
        
        if (oldKeys.length > 0) {
          await AsyncStorage.multiRemove(oldKeys);
          console.log(`Cleared ${oldKeys.length} old cache items`);
        }
      }
    } catch (error) {
      console.error('Failed to optimize memory:', error);
    }
  }
}

export default InvestmentCache;