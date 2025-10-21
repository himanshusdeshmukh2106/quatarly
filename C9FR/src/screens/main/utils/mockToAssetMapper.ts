/**
 * Mock Investment to Asset Mapper
 * 
 * Converts mock investment data to Asset type for AssetDetailScreen
 */

import { Asset, TradableAsset } from '../../../types';
import { MockInvestment } from './mockData';

export const mockInvestmentToAsset = (investment: MockInvestment): TradableAsset => {
  const now = new Date().toISOString();
  
  return {
    id: investment.id,
    userId: 'mock-user',
    name: investment.name,
    assetType: 'stock',
    totalValue: investment.price * 100, // Assume 100 shares for demo
    totalGainLoss: investment.change * 100,
    totalGainLossPercent: investment.changePercent,
    lastUpdated: now,
    
    // TradableAsset specific fields
    symbol: investment.symbol,
    quantity: 100, // Mock quantity
    currentPrice: investment.price,
    averagePurchasePrice: investment.price - investment.change,
    currency: 'USD',
    exchange: 'NASDAQ',
    
    // Optional financial metrics
    marketCap: parseMarketCap(investment.marketCap),
    peRatio: investment.peRatio,
    dividendYield: investment.dividendYield,
    growthRate: investment.growthRate,
    volume: investment.volume,
    
    // Additional data
    aiAnalysis: investment.insight,
    logoUrl: undefined,
    sector: undefined,
    recommendation: investment.changePercent > 2 ? 'buy' : investment.changePercent < -2 ? 'sell' : 'hold',
    riskLevel: Math.abs(investment.changePercent) > 5 ? 'high' : Math.abs(investment.changePercent) > 2 ? 'medium' : 'low',
    
    // Daily changes
    dailyChange: investment.change,
    dailyChangePercent: investment.changePercent,
  };
};

/**
 * Parse market cap string to number
 * Example: "2.85T" -> 2850000000000
 */
const parseMarketCap = (marketCapStr: string): number => {
  const value = parseFloat(marketCapStr);
  const multiplier = marketCapStr.slice(-1);
  
  switch (multiplier) {
    case 'T':
      return value * 1e12;
    case 'B':
      return value * 1e9;
    case 'M':
      return value * 1e6;
    case 'K':
      return value * 1e3;
    default:
      return value;
  }
};
