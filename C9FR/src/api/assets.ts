/**
 * Assets API Module
 * 
 * Handles all asset-related API calls including:
 * - Fetch assets
 * - Create asset
 * - Update asset
 * - Delete asset
 * - Fetch chart data
 * - Refresh prices
 */

import { apiClient } from './client';
import {
  Asset,
  TradableAsset,
  PhysicalAsset,
  CreateAssetRequest,
  ChartTimeframe,
} from '../types';

/**
 * Update asset request data
 */
export interface UpdateAssetRequest {
  name?: string;
  quantity?: number;
  averagePurchasePrice?: number;
  currentPrice?: number;
  notes?: string;
}

/**
 * Chart data response
 */
export interface ChartDataResponse {
  symbol: string;
  timeframe: ChartTimeframe;
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

/**
 * Price refresh response
 */
export interface PriceRefreshResponse {
  success: boolean;
  updated_count: number;
  message: string;
}

/**
 * Assets API
 * 
 * Note: Currently uses /investments/ endpoint as /assets/ endpoint is not implemented
 */
export const assetsApi = {
  /**
   * Fetch all assets for the authenticated user
   * 
   * @returns Array of assets
   */
  fetchAll: async (): Promise<Asset[]> => {
    // Use investments endpoint for now
    const response = await apiClient.get<any[]>('/investments/');

    // Transform investments response to assets format
    return response.data.map((investment: any) => {
      return {
        id: investment.id.toString(),
        name: investment.name,
        symbol: investment.symbol,
        assetType: investment.asset_type,
        exchange: investment.exchange,
        currency: investment.currency,
        quantity: parseFloat(investment.quantity),
        averagePurchasePrice: parseFloat(investment.average_purchase_price),
        currentPrice: parseFloat(investment.current_price),
        totalValue: parseFloat(investment.total_value),
        dailyChange: parseFloat(investment.daily_change),
        dailyChangePercent: parseFloat(investment.daily_change_percent),
        totalGainLoss: parseFloat(investment.total_gain_loss),
        totalGainLossPercent: parseFloat(investment.total_gain_loss_percent),
        chartData: investment.chart_data || [],
        lastUpdated: investment.last_updated,
        aiAnalysis:
          investment.ai_analysis ||
          'AI analysis will be generated for this asset.',
        riskLevel: investment.risk_level || 'medium',
        recommendation: investment.recommendation || 'hold',
        logoUrl: investment.logo_url,
        sector: investment.sector,
        volume: investment.volume || '1.2M',
        marketCap: investment.market_cap
          ? parseFloat(investment.market_cap)
          : undefined,
        growthRate: investment.growth_rate
          ? parseFloat(investment.growth_rate)
          : undefined,
        createdAt: investment.created_at,
        updatedAt: investment.updated_at,
      } as TradableAsset;
    });
  },

  /**
   * Fetch a single asset by ID
   * 
   * @param id - Asset ID
   * @returns Asset details
   */
  fetchById: async (id: string): Promise<Asset> => {
    const response = await apiClient.get<any>(`/investments/${id}/`);
    const investment = response.data;

    return {
      id: investment.id.toString(),
      name: investment.name,
      symbol: investment.symbol,
      assetType: investment.asset_type,
      exchange: investment.exchange,
      currency: investment.currency,
      quantity: parseFloat(investment.quantity),
      averagePurchasePrice: parseFloat(investment.average_purchase_price),
      currentPrice: parseFloat(investment.current_price),
      totalValue: parseFloat(investment.total_value),
      dailyChange: parseFloat(investment.daily_change),
      dailyChangePercent: parseFloat(investment.daily_change_percent),
      totalGainLoss: parseFloat(investment.total_gain_loss),
      totalGainLossPercent: parseFloat(investment.total_gain_loss_percent),
      chartData: investment.chart_data || [],
      lastUpdated: investment.last_updated,
      aiAnalysis:
        investment.ai_analysis ||
        'AI analysis will be generated for this asset.',
      riskLevel: investment.risk_level || 'medium',
      recommendation: investment.recommendation || 'hold',
      logoUrl: investment.logo_url,
      sector: investment.sector,
      volume: investment.volume || '1.2M',
      marketCap: investment.market_cap
        ? parseFloat(investment.market_cap)
        : undefined,
      growthRate: investment.growth_rate
        ? parseFloat(investment.growth_rate)
        : undefined,
      createdAt: investment.created_at,
      updatedAt: investment.updated_at,
    } as TradableAsset;
  },

  /**
   * Create a new asset
   * 
   * @param assetData - Asset creation data
   * @returns Created asset
   */
  create: async (assetData: CreateAssetRequest): Promise<Asset> => {
    // Only support tradeable assets for now
    if (!['stock', 'etf', 'bond', 'crypto'].includes(assetData.assetType)) {
      throw new Error(
        'Physical assets are not yet supported. Please use investments for tradeable assets only.'
      );
    }

    // Transform frontend request to investments format
    const investmentData = {
      symbol: assetData.symbol,
      name: assetData.name,
      asset_type: assetData.assetType,
      quantity: assetData.quantity,
      average_purchase_price: assetData.purchasePrice,
      exchange: assetData.exchange,
      currency: assetData.currency || 'USD',
    };

    const response = await apiClient.post<any>(
      '/investments/',
      investmentData
    );
    const investment = response.data;

    return {
      id: investment.id.toString(),
      name: investment.name,
      symbol: investment.symbol,
      assetType: investment.asset_type,
      exchange: investment.exchange,
      currency: investment.currency,
      quantity: parseFloat(investment.quantity),
      averagePurchasePrice: parseFloat(investment.average_purchase_price),
      currentPrice: parseFloat(investment.current_price),
      totalValue: parseFloat(investment.total_value),
      dailyChange: parseFloat(investment.daily_change || 0),
      dailyChangePercent: parseFloat(investment.daily_change_percent || 0),
      totalGainLoss: parseFloat(investment.total_gain_loss || 0),
      totalGainLossPercent: parseFloat(investment.total_gain_loss_percent || 0),
      chartData: investment.chart_data || [],
      lastUpdated: investment.last_updated,
      aiAnalysis:
        investment.ai_analysis ||
        'AI analysis will be generated for this asset.',
      riskLevel: investment.risk_level || 'medium',
      recommendation: investment.recommendation || 'hold',
      logoUrl: investment.logo_url,
      sector: investment.sector,
      volume: investment.volume,
      marketCap: investment.market_cap
        ? parseFloat(investment.market_cap)
        : undefined,
      growthRate: investment.growth_rate
        ? parseFloat(investment.growth_rate)
        : undefined,
      createdAt: investment.created_at,
      updatedAt: investment.updated_at,
    } as TradableAsset;
  },

  /**
   * Update an existing asset
   * 
   * @param id - Asset ID
   * @param assetData - Updated asset data
   * @returns Updated asset
   */
  update: async (
    id: string,
    assetData: UpdateAssetRequest
  ): Promise<Asset> => {
    // Transform to investments format
    const investmentData: any = {};
    if (assetData.name) investmentData.name = assetData.name;
    if (assetData.quantity) investmentData.quantity = assetData.quantity;
    if (assetData.averagePurchasePrice) {
      investmentData.average_purchase_price = assetData.averagePurchasePrice;
    }
    if (assetData.currentPrice) {
      investmentData.current_price = assetData.currentPrice;
    }

    const response = await apiClient.patch<any>(
      `/investments/${id}/`,
      investmentData
    );
    const investment = response.data;

    return {
      id: investment.id.toString(),
      name: investment.name,
      symbol: investment.symbol,
      assetType: investment.asset_type,
      exchange: investment.exchange,
      currency: investment.currency,
      quantity: parseFloat(investment.quantity),
      averagePurchasePrice: parseFloat(investment.average_purchase_price),
      currentPrice: parseFloat(investment.current_price),
      totalValue: parseFloat(investment.total_value),
      dailyChange: parseFloat(investment.daily_change),
      dailyChangePercent: parseFloat(investment.daily_change_percent),
      totalGainLoss: parseFloat(investment.total_gain_loss),
      totalGainLossPercent: parseFloat(investment.total_gain_loss_percent),
      chartData: investment.chart_data || [],
      lastUpdated: investment.last_updated,
      aiAnalysis: investment.ai_analysis,
      riskLevel: investment.risk_level,
      recommendation: investment.recommendation,
      logoUrl: investment.logo_url,
      sector: investment.sector,
      volume: investment.volume,
      marketCap: investment.market_cap
        ? parseFloat(investment.market_cap)
        : undefined,
      growthRate: investment.growth_rate
        ? parseFloat(investment.growth_rate)
        : undefined,
      createdAt: investment.created_at,
      updatedAt: investment.updated_at,
    } as TradableAsset;
  },

  /**
   * Delete an asset
   * 
   * @param id - Asset ID
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/investments/${id}/`);
  },

  /**
   * Fetch chart data for an asset
   * 
   * @param symbol - Asset symbol
   * @param timeframe - Chart timeframe
   * @returns Chart data
   */
  fetchChartData: async (
    symbol: string,
    timeframe: ChartTimeframe = 'daily'
  ): Promise<ChartDataResponse> => {
    const response = await apiClient.get<ChartDataResponse>(
      `/investments/chart/${symbol}/`,
      {
        params: { timeframe },
      }
    );
    return response.data;
  },

  /**
   * Refresh prices for all assets
   * 
   * @returns Refresh result
   */
  refreshPrices: async (): Promise<PriceRefreshResponse> => {
    const response = await apiClient.post<PriceRefreshResponse>(
      '/investments/refresh-prices/'
    );
    return response.data;
  },

  /**
   * Enrich asset data (fetch additional market data)
   * 
   * @param id - Asset ID
   * @returns Enriched asset
   */
  enrichData: async (id: string): Promise<Asset> => {
    const response = await apiClient.post<any>(
      `/investments/${id}/enrich-data/`
    );
    const investment = response.data;

    return {
      id: investment.id.toString(),
      name: investment.name,
      symbol: investment.symbol,
      assetType: investment.asset_type,
      exchange: investment.exchange,
      currency: investment.currency,
      quantity: parseFloat(investment.quantity),
      averagePurchasePrice: parseFloat(investment.average_purchase_price),
      currentPrice: parseFloat(investment.current_price),
      totalValue: parseFloat(investment.total_value),
      dailyChange: parseFloat(investment.daily_change),
      dailyChangePercent: parseFloat(investment.daily_change_percent),
      totalGainLoss: parseFloat(investment.total_gain_loss),
      totalGainLossPercent: parseFloat(investment.total_gain_loss_percent),
      chartData: investment.chart_data || [],
      lastUpdated: investment.last_updated,
      aiAnalysis: investment.ai_analysis,
      riskLevel: investment.risk_level,
      recommendation: investment.recommendation,
      logoUrl: investment.logo_url,
      sector: investment.sector,
      volume: investment.volume,
      marketCap: investment.market_cap
        ? parseFloat(investment.market_cap)
        : undefined,
      growthRate: investment.growth_rate
        ? parseFloat(investment.growth_rate)
        : undefined,
      createdAt: investment.created_at,
      updatedAt: investment.updated_at,
    } as TradableAsset;
  },
};
