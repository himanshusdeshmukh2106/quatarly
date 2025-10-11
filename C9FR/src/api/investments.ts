/**
 * Investments API Module
 * 
 * Handles investment-related API calls.
 * Note: Currently investments and assets use the same backend endpoint.
 * This module provides investment-specific naming and types.
 */

import { assetsApi } from './assets';
import {
  Investment,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
} from '../types';

/**
 * Portfolio summary response
 */
export interface PortfolioSummaryResponse {
  total_value: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  daily_change: number;
  daily_change_percent: number;
  asset_count: number;
  top_performers: Array<{
    id: string;
    name: string;
    symbol: string;
    gain_loss_percent: number;
  }>;
  worst_performers: Array<{
    id: string;
    name: string;
    symbol: string;
    gain_loss_percent: number;
  }>;
}

/**
 * Investments API
 * 
 * Wraps the assets API with investment-specific naming
 */
export const investmentsApi = {
  /**
   * Fetch all investments
   * 
   * @returns Array of investments
   */
  fetchAll: async (): Promise<Investment[]> => {
    return assetsApi.fetchAll() as Promise<Investment[]>;
  },

  /**
   * Fetch a single investment by ID
   * 
   * @param id - Investment ID
   * @returns Investment details
   */
  fetchById: async (id: string): Promise<Investment> => {
    return assetsApi.fetchById(id) as Promise<Investment>;
  },

  /**
   * Create a new investment
   * 
   * @param investmentData - Investment creation data
   * @returns Created investment
   */
  create: async (
    investmentData: CreateInvestmentRequest
  ): Promise<Investment> => {
    return assetsApi.create(investmentData as any) as Promise<Investment>;
  },

  /**
   * Update an existing investment
   * 
   * @param id - Investment ID
   * @param investmentData - Updated investment data
   * @returns Updated investment
   */
  update: async (
    id: string,
    investmentData: UpdateInvestmentRequest
  ): Promise<Investment> => {
    return assetsApi.update(id, investmentData) as Promise<Investment>;
  },

  /**
   * Delete an investment
   * 
   * @param id - Investment ID
   */
  delete: async (id: string): Promise<void> => {
    return assetsApi.delete(id);
  },

  /**
   * Fetch portfolio summary
   * 
   * @returns Portfolio summary
   */
  fetchPortfolioSummary: async (): Promise<PortfolioSummaryResponse> => {
    const response = await assetsApi.fetchAll();
    
    // Calculate summary from assets
    const totalValue = response.reduce(
      (sum, asset) => sum + (asset.totalValue || 0),
      0
    );
    const totalGainLoss = response.reduce(
      (sum, asset) => sum + (asset.totalGainLoss || 0),
      0
    );
    const dailyChange = response.reduce(
      (sum, asset) => sum + ((asset as any).dailyChange || 0),
      0
    );

    const totalGainLossPercent =
      totalValue > 0 ? (totalGainLoss / totalValue) * 100 : 0;
    const dailyChangePercent =
      totalValue > 0 ? (dailyChange / totalValue) * 100 : 0;

    // Sort by gain/loss percent
    const sorted = [...response].sort(
      (a, b) =>
        (b.totalGainLossPercent || 0) - (a.totalGainLossPercent || 0)
    );

    return {
      total_value: totalValue,
      total_gain_loss: totalGainLoss,
      total_gain_loss_percent: totalGainLossPercent,
      daily_change: dailyChange,
      daily_change_percent: dailyChangePercent,
      asset_count: response.length,
      top_performers: sorted.slice(0, 3).map((asset) => ({
        id: asset.id,
        name: asset.name,
        symbol: (asset as any).symbol || '',
        gain_loss_percent: asset.totalGainLossPercent || 0,
      })),
      worst_performers: sorted.slice(-3).reverse().map((asset) => ({
        id: asset.id,
        name: asset.name,
        symbol: (asset as any).symbol || '',
        gain_loss_percent: asset.totalGainLossPercent || 0,
      })),
    };
  },

  /**
   * Refresh investment prices
   * 
   * @returns Refresh result
   */
  refreshPrices: async () => {
    return assetsApi.refreshPrices();
  },

  /**
   * Enrich investment data
   * 
   * @param id - Investment ID
   * @returns Enriched investment
   */
  enrichData: async (id: string): Promise<Investment> => {
    return assetsApi.enrichData(id) as Promise<Investment>;
  },

  /**
   * Fetch chart data for an investment
   * 
   * @param symbol - Investment symbol
   * @param timeframe - Chart timeframe
   * @returns Chart data
   */
  fetchChartData: async (symbol: string, timeframe: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    return assetsApi.fetchChartData(symbol, timeframe);
  },
};
