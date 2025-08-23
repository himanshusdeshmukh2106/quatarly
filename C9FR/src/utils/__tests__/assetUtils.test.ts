import {
  isTradableAsset,
  isPhysicalAsset,
  assetTypeUtils,
  assetFormatters,
  getCurrentPrice,
  getChangeValues,
  legacyInvestmentAdapter
} from '../assetUtils';
import { Asset, TradableAsset, PhysicalAsset } from '../../types';

// Mock assets for testing
const mockTradableAsset: TradableAsset = {
  id: '1',
  name: 'Apple Inc.',
  assetType: 'stock',
  totalValue: 15000,
  totalGainLoss: 1500,
  totalGainLossPercent: 10.5,
  aiAnalysis: 'Strong performance expected',
  riskLevel: 'medium',
  recommendation: 'buy',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  lastUpdated: '2023-01-01T00:00:00Z',
  symbol: 'AAPL',
  exchange: 'NASDAQ',
  currency: 'USD',
  quantity: 100,
  averagePurchasePrice: 140,
  currentPrice: 150,
  dailyChange: 5,
  dailyChangePercent: 3.4,
  chartData: [],
  volume: '45.2M',
  marketCap: 2850000000000,
  peRatio: 28.45,
  growthRate: 12.5
};

const mockPhysicalAsset: PhysicalAsset = {
  id: '2',
  name: 'Gold Holdings',
  assetType: 'gold',
  totalValue: 5000,
  totalGainLoss: -200,
  totalGainLossPercent: -3.8,
  aiAnalysis: 'Stable store of value',
  riskLevel: 'low',
  recommendation: 'hold',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  lastUpdated: '2023-01-01T00:00:00Z',
  quantity: 100,
  unit: 'grams',
  purchasePrice: 52,
  currentMarketPrice: 50,
  manuallyUpdated: true
};

describe('assetUtils', () => {
  describe('Type Guards', () => {
    test('isTradableAsset correctly identifies tradable assets', () => {
      expect(isTradableAsset(mockTradableAsset)).toBe(true);
      expect(isTradableAsset(mockPhysicalAsset)).toBe(false);
    });

    test('isPhysicalAsset correctly identifies physical assets', () => {
      expect(isPhysicalAsset(mockPhysicalAsset)).toBe(true);
      expect(isPhysicalAsset(mockTradableAsset)).toBe(false);
    });
  });

  describe('Asset Type Utils', () => {
    test('getDisplayUnit returns correct units', () => {
      expect(assetTypeUtils.getDisplayUnit(mockTradableAsset)).toBe('shares');
      expect(assetTypeUtils.getDisplayUnit(mockPhysicalAsset)).toBe('grams');
    });

    test('getSymbolOrAbbreviation returns symbol for tradable assets', () => {
      expect(assetTypeUtils.getSymbolOrAbbreviation(mockTradableAsset)).toBe('AAPL');
    });
  });

  describe('Asset Formatters', () => {
    test('formatCurrency formats correctly', () => {
      expect(assetFormatters.formatCurrency(100, 'USD')).toBe('$100.00');
      expect(assetFormatters.formatCurrency(100, 'INR')).toBe('₹100.00');
    });

    test('formatPerformanceChange formats correctly', () => {
      expect(assetFormatters.formatPerformanceChange(100, 10.5)).toBe('↑ 10.50%');
      expect(assetFormatters.formatPerformanceChange(-100, -5.2)).toBe('↓ 5.20%');
    });
  });

  describe('Utility Functions', () => {
    test('getCurrentPrice returns correct price', () => {
      expect(getCurrentPrice(mockTradableAsset)).toBe(150);
      expect(getCurrentPrice(mockPhysicalAsset)).toBe(50);
    });

    test('getChangeValues returns correct values', () => {
      const result = getChangeValues(mockTradableAsset);
      expect(result.change).toBe(1500);
      expect(result.changePercent).toBe(10.5);
    });
  });

  describe('Legacy Investment Adapter', () => {
    test('isLegacyInvestment correctly identifies legacy objects', () => {
      const legacyObj = {
        price: 100,
        changePercent: 5,
        insight: 'Good investment'
      };
      expect(legacyInvestmentAdapter.isLegacyInvestment(legacyObj)).toBe(true);
      expect(legacyInvestmentAdapter.isLegacyInvestment(mockTradableAsset)).toBe(false);
    });
  });
});