/**
 * Mock Asset Data
 * 
 * This file contains mock data for assets used in development and testing.
 * Only loaded when __DEV__ is true.
 */

import { Asset, TradableAsset, PhysicalAsset } from '../types';

export const mockTradableAssets: TradableAsset[] = [
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
    aiAnalysis: 'Strong buy recommendation based on solid fundamentals and growth potential.',
    riskLevel: 'medium',
    recommendation: 'buy',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    sector: 'Technology',
    logoUrl: 'https://logo.clearbit.com/apple.com',
    volume: '1.2M',
    marketCap: 2800000000000,
    growthRate: 12.5,
  },
  {
    id: '2',
    name: 'Microsoft Corporation',
    symbol: 'MSFT',
    assetType: 'stock',
    exchange: 'NASDAQ',
    currency: 'USD',
    quantity: 5,
    averagePurchasePrice: 300,
    currentPrice: 350,
    totalValue: 1750,
    dailyChange: 10,
    dailyChangePercent: 2.94,
    totalGainLoss: 250,
    totalGainLossPercent: 16.67,
    chartData: [],
    lastUpdated: '2024-01-15T10:00:00Z',
    aiAnalysis: 'Strong hold recommendation with steady growth trajectory.',
    riskLevel: 'low',
    recommendation: 'hold',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    sector: 'Technology',
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    volume: '800K',
    marketCap: 2600000000000,
    growthRate: 10.2,
  },
  {
    id: '3',
    name: 'Bitcoin',
    symbol: 'BTC',
    assetType: 'crypto',
    exchange: 'Coinbase',
    currency: 'USD',
    quantity: 0.5,
    averagePurchasePrice: 40000,
    currentPrice: 45000,
    totalValue: 22500,
    dailyChange: 1000,
    dailyChangePercent: 2.27,
    totalGainLoss: 2500,
    totalGainLossPercent: 12.5,
    chartData: [],
    lastUpdated: '2024-01-15T10:00:00Z',
    aiAnalysis: 'High volatility asset with potential for significant gains.',
    riskLevel: 'high',
    recommendation: 'hold',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    sector: 'Cryptocurrency',
    volume: '2.5M',
    marketCap: 850000000000,
    growthRate: 25.0,
  },
];

export const mockPhysicalAssets: PhysicalAsset[] = [
  {
    id: '4',
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
    aiAnalysis: 'Good hedge against inflation with stable value.',
    riskLevel: 'low',
    recommendation: 'hold',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '5',
    name: 'Silver Bars',
    assetType: 'silver',
    quantity: 100,
    unit: 'ounces',
    purchasePrice: 25,
    currentMarketPrice: 27,
    totalValue: 2700,
    totalGainLoss: 200,
    totalGainLossPercent: 8.0,
    manuallyUpdated: true,
    lastUpdated: '2024-01-15T10:00:00Z',
    aiAnalysis: 'Stable precious metal investment with moderate growth.',
    riskLevel: 'low',
    recommendation: 'hold',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

export const mockAssets: Asset[] = [
  ...mockTradableAssets,
  ...mockPhysicalAssets,
];

// Only export mock data in development
export const getAssetMocks = (): Asset[] => {
  if (__DEV__) {
    return mockAssets;
  }
  return [];
};
