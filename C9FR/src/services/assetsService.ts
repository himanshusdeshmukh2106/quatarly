import { apiClient } from './apiClient';
import { Asset, TradableAsset, PhysicalAsset, CreateAssetRequest, PriceUpdate, ChartTimeframe, CandlestickData } from '../types';

/**
 * Assets API Service
 * Handles all asset-related API calls
 */
export class AssetsService {
  /**
   * Fetch all assets for the authenticated user
   */
  static async fetchAssets(): Promise<Asset[]> {
    try {
      const response = await apiClient.get('/assets/');
      return response.data;
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  }

  /**
   * Create a new asset
   */
  static async createAsset(assetData: CreateAssetRequest): Promise<Asset> {
    try {
      const response = await apiClient.post('/assets/', assetData);
      return response.data;
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  }

  /**
   * Update an existing asset
   */
  static async updateAsset(assetId: string, assetData: Partial<Asset>): Promise<Asset> {
    try {
      const response = await apiClient.patch(`/assets/${assetId}/`, assetData);
      return response.data;
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  }

  /**
   * Delete an asset
   */
  static async deleteAsset(assetId: string): Promise<void> {
    try {
      await apiClient.delete(`/assets/${assetId}/`);
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  }

  /**
   * Fetch price updates for tradable assets
   */
  static async fetchPriceUpdates(symbols: string[]): Promise<PriceUpdate[]> {
    try {
      const response = await apiClient.post('/assets/price-updates/', { symbols });
      return response.data;
    } catch (error) {
      console.error('Error fetching price updates:', error);
      throw error;
    }
  }

  /**
   * Fetch candlestick chart data for a tradable asset
   */
  static async fetchCandlestickData(
    symbol: string, 
    timeframe: ChartTimeframe = '1D'
  ): Promise<CandlestickData[]> {
    try {
      const response = await apiClient.get(`/assets/${symbol}/candlestick/`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching candlestick data:', error);
      throw error;
    }
  }

  /**
   * Update physical asset market price
   */
  static async updatePhysicalAssetPrice(
    assetId: string, 
    newMarketPrice: number
  ): Promise<PhysicalAsset> {
    try {
      const response = await apiClient.patch(`/assets/${assetId}/`, {
        marketPrice: newMarketPrice
      });
      return response.data;
    } catch (error) {
      console.error('Error updating physical asset price:', error);
      throw error;
    }
  }

  /**
   * Bulk import assets
   */
  static async bulkImportAssets(assets: CreateAssetRequest[]): Promise<Asset[]> {
    try {
      const response = await apiClient.post('/assets/bulk-import/', { assets });
      return response.data;
    } catch (error) {
      console.error('Error bulk importing assets:', error);
      throw error;
    }
  }

  /**
   * Get asset suggestions based on query
   */
  static async getAssetSuggestions(query: string): Promise<any[]> {
    try {
      const response = await apiClient.get('/assets/suggestions/', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching asset suggestions:', error);
      throw error;
    }
  }

  /**
   * Validate asset symbol
   */
  static async validateAssetSymbol(symbol: string, exchange?: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/assets/validate-symbol/', {
        symbol,
        exchange
      });
      return response.data.valid;
    } catch (error) {
      console.error('Error validating asset symbol:', error);
      return false;
    }
  }
}

// Export individual functions for backward compatibility
export const fetchAssets = AssetsService.fetchAssets;
export const createAsset = AssetsService.createAsset;
export const updateAsset = AssetsService.updateAsset;
export const deleteAsset = AssetsService.deleteAsset;
export const fetchPriceUpdates = AssetsService.fetchPriceUpdates;
export const fetchCandlestickData = AssetsService.fetchCandlestickData;
export const updatePhysicalAssetPrice = AssetsService.updatePhysicalAssetPrice;
export const bulkImportAssets = AssetsService.bulkImportAssets;
export const getAssetSuggestions = AssetsService.getAssetSuggestions;
export const validateAssetSymbol = AssetsService.validateAssetSymbol;
