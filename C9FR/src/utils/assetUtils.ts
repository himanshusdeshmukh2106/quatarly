/**
 * Asset Utilities
 * Helper functions for asset data transformation and validation
 */

import { Asset, TradableAsset } from '../types';
import { FINANCIAL_MULTIPLIERS } from './constants';

/**
 * Type guard to check if an asset is tradable
 */
export const isTradableAsset = (asset: Asset): asset is TradableAsset => {
  return ['stock', 'etf', 'bond', 'crypto'].includes(asset.assetType);
};

/**
 * Convert investment data to Asset format for detail screen
 */
export const convertInvestmentToAsset = (investment: any): Asset => {
  if (!investment || !investment.id || !investment.name) {
    throw new Error('Invalid investment data: missing required fields');
  }

  return {
    id: investment.id,
    name: investment.name,
    assetType: 'stock' as const,
    symbol: investment.symbol,
    exchange: 'NSE',
    currency: 'INR',
    quantity: FINANCIAL_MULTIPLIERS.DEFAULT_QUANTITY,
    averagePurchasePrice: investment.price * FINANCIAL_MULTIPLIERS.AVERAGE_PURCHASE_MULTIPLIER,
    currentPrice: investment.price,
    totalValue: investment.price * FINANCIAL_MULTIPLIERS.DEFAULT_QUANTITY,
    dailyChange: investment.change,
    dailyChangePercent: investment.changePercent,
    totalGainLoss: investment.change * FINANCIAL_MULTIPLIERS.DEFAULT_QUANTITY,
    totalGainLossPercent: investment.changePercent,
    chartData: [],
    lastUpdated: new Date().toISOString(),
    aiAnalysis: investment.insight,
    riskLevel: 'medium' as const,
    recommendation: investment.changePercent > 0 ? 'buy' as const : 'hold' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    logoUrl: undefined,
    sector: undefined,
    marketCap: parseMarketCap(investment.marketCap),
    volume: investment.volume,
    peRatio: investment.peRatio,
    growthRate: investment.dividendYield,
  };
};

/**
 * Parse market cap string to number
 */
const parseMarketCap = (marketCapStr: string): number => {
  if (!marketCapStr) return 0;
  
  const cleanStr = marketCapStr.replace(/[₹,]/g, '');
  const multipliers: Record<string, number> = {
    'T': FINANCIAL_MULTIPLIERS.TRILLION,
    'B': FINANCIAL_MULTIPLIERS.BILLION,
    'Cr': FINANCIAL_MULTIPLIERS.CRORE,
    'L': FINANCIAL_MULTIPLIERS.LAKH,
    'K': FINANCIAL_MULTIPLIERS.THOUSAND,
  };
  
  for (const [suffix, multiplier] of Object.entries(multipliers)) {
    if (cleanStr.includes(suffix)) {
      return parseFloat(cleanStr.replace(suffix, '')) * multiplier;
    }
  }
  
  return parseFloat(cleanStr) || 0;
};

/**
 * Validate asset data
 */
export const validateAsset = (asset: any): asset is Asset => {
  if (!asset) return false;
  
  const requiredFields = ['id', 'name', 'assetType', 'totalValue', 'lastUpdated'];
  return requiredFields.every(field => asset[field] !== undefined && asset[field] !== null);
};

/**
 * Calculate 52-week range
 */
export const calculate52WeekRange = (currentValue: number): { low: number; high: number } => {
  return {
    low: currentValue * FINANCIAL_MULTIPLIERS.YEAR_RANGE_LOW,
    high: currentValue * FINANCIAL_MULTIPLIERS.YEAR_RANGE_HIGH,
  };
};

/**
 * Calculate day range
 */
export const calculateDayRange = (currentPrice: number): { low: number; high: number } => {
  return {
    low: currentPrice * FINANCIAL_MULTIPLIERS.DAY_RANGE_LOW,
    high: currentPrice * FINANCIAL_MULTIPLIERS.DAY_RANGE_HIGH,
  };
};
