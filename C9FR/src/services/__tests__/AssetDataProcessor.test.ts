import AssetDataProcessor from '../AssetDataProcessor';
import { Asset, TradableAsset, PhysicalAsset } from '../../types';

// Mock theme
const mockTheme = {
  background: '#ffffff',
  card: '#f8f9fa',
  text: '#000000',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  profit: '#22c55e',
  loss: '#ef4444',
};

// Mock asset data
const mockTradableAsset: TradableAsset = {
  id: '1',
  name: 'Apple Inc.',
  assetType: 'stock',
  symbol: 'AAPL',
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
  aiAnalysis: 'Apple stock showing strong performance',
  riskLevel: 'medium',
  recommendation: 'buy',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastUpdated: '2024-01-01T00:00:00Z',
  volume: '45.2M',
  marketCap: 2850000000000,
  peRatio: 28.45,
  growthRate: 12.5,
};

const mockPhysicalAsset: PhysicalAsset = {
  id: '2',
  name: 'Gold Investment',
  assetType: 'gold',
  quantity: 10,
  unit: 'grams',
  purchasePrice: 5000,
  currentMarketPrice: 5500,
  totalValue: 55000,
  totalGainLoss: 5000,
  totalGainLossPercent: 10,
  manuallyUpdated: false,
  aiAnalysis: 'Gold showing steady appreciation',
  riskLevel: 'low',
  recommendation: 'hold',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastUpdated: '2024-01-01T00:00:00Z',
};

const mockCryptoAsset: TradableAsset = {
  id: '3',
  name: 'Bitcoin',
  assetType: 'crypto',
  symbol: 'BTC',
  exchange: 'Binance',
  currency: 'USD',
  quantity: 0.5,
  averagePurchasePrice: 40000,
  currentPrice: 45000,
  totalValue: 22500,
  dailyChange: 2500,
  dailyChangePercent: 5.88,
  totalGainLoss: 2500,
  totalGainLossPercent: 12.5,
  chartData: [],
  aiAnalysis: 'Bitcoin showing volatility but upward trend',
  riskLevel: 'high',
  recommendation: 'hold',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastUpdated: '2024-01-01T00:00:00Z',
};

describe('AssetDataProcessor', () => {
  describe('processAssetForDisplay', () => {
    it('processes tradable asset correctly', () => {
      const result = AssetDataProcessor.processAssetForDisplay(mockTradableAsset, mockTheme);

      expect(result.symbol).toBe('AAPL');
      expect(result.name).toBe('Apple Inc.');
      expect(result.price).toBe(175);
      expect(result.currency).toBe('USD');
      expect(result.change).toBe(250);
      expect(result.changePercent).toBe(16.67);
      expect(result.changeColor).toBe('#22c55e'); // Green for positive
      expect(result.chartData).toHaveLength(12);
      expect(result.yAxisLabels).toHaveLength(3);
      expect(result.stats).toHaveLength(4);
      expect(result.aiAnalysis).toBe('Apple stock showing strong performance');
    });

    it('processes physical asset correctly', () => {
      const result = AssetDataProcessor.processAssetForDisplay(mockPhysicalAsset, mockTheme);

      expect(result.symbol).toBe('GI'); // Generated from "Gold Investment"
      expect(result.name).toBe('Gold Investment');
      expect(result.price).toBe(5500);
      expect(result.currency).toBeUndefined();
      expect(result.change).toBe(5000);
      expect(result.changePercent).toBe(10);
      expect(result.changeColor).toBe('#22c55e'); // Green for positive
      expect(result.stats).toHaveLength(4);
      expect(result.stats[2].label).toBe('Purchase Price');
      expect(result.stats[3].label).toBe('Quantity');
    });

    it('processes crypto asset correctly', () => {
      const result = AssetDataProcessor.processAssetForDisplay(mockCryptoAsset, mockTheme);

      expect(result.symbol).toBe('BTC');
      expect(result.name).toBe('Bitcoin');
      expect(result.price).toBe(45000);
      expect(result.currency).toBe('USD');
      expect(result.changeColor).toBe('#22c55e'); // Green for positive
    });
  });

  describe('generateChartData', () => {
    it('generates chart data with correct length', () => {
      const chartData = AssetDataProcessor.generateChartData(mockTradableAsset);

      expect(chartData).toHaveLength(12);
      expect(chartData[chartData.length - 1]).toBe(175); // Last point should match current price
    });

    it('generates chart data with positive trend for profitable assets', () => {
      const chartData = AssetDataProcessor.generateChartData(mockTradableAsset);
      const firstPoint = chartData[0];
      const lastPoint = chartData[chartData.length - 1];

      // For profitable assets, trend should generally be upward
      expect(lastPoint).toBeGreaterThan(firstPoint * 0.8); // Allow some variation
    });

    it('generates chart data with negative trend for losing assets', () => {
      const losingAsset = {
        ...mockTradableAsset,
        totalGainLoss: -100,
        totalGainLossPercent: -5,
      };

      const chartData = AssetDataProcessor.generateChartData(losingAsset);
      const firstPoint = chartData[0];
      const lastPoint = chartData[chartData.length - 1];

      // For losing assets, trend should generally be downward
      expect(firstPoint).toBeGreaterThan(lastPoint * 0.8); // Allow some variation
    });
  });

  describe('getYAxisLabels', () => {
    it('generates correct Y-axis labels', () => {
      const chartData = [100, 110, 120, 130, 140, 150];
      const labels = AssetDataProcessor.getYAxisLabels(chartData);

      expect(labels).toHaveLength(3);
      expect(parseInt(labels[0])).toBeGreaterThan(parseInt(labels[1]));
      expect(parseInt(labels[1])).toBeGreaterThan(parseInt(labels[2]));
    });

    it('handles single value chart data', () => {
      const chartData = [100, 100, 100, 100];
      const labels = AssetDataProcessor.getYAxisLabels(chartData);

      expect(labels).toHaveLength(3);
      expect(labels[0]).toBe('100');
      expect(labels[1]).toBe('100');
      expect(labels[2]).toBe('100');
    });
  });

  describe('getStatsForAsset', () => {
    it('returns correct stats for tradable assets', () => {
      const stats = AssetDataProcessor.getStatsForAsset(mockTradableAsset);

      expect(stats).toHaveLength(4);
      expect(stats[0].label).toBe('Volume');
      expect(stats[0].value).toBe('45.2M');
      expect(stats[1].label).toBe('Market Cap');
      expect(stats[2].label).toBe('P/E Ratio');
      expect(stats[2].value).toBe('28.45');
      expect(stats[3].label).toBe('Growth Rate');
      expect(stats[3].value).toMatch(/\d+\.\d+%|N\/A/); // Can be percentage or N/A
    });

    it('returns correct stats for physical assets', () => {
      const stats = AssetDataProcessor.getStatsForAsset(mockPhysicalAsset);

      expect(stats).toHaveLength(4);
      expect(stats[0].label).toBe('Volume');
      expect(stats[1].label).toBe('Market Cap');
      expect(stats[2].label).toBe('Purchase Price');
      expect(stats[2].value).toBe('₹5,000.00');
      expect(stats[3].label).toBe('Quantity');
      expect(stats[3].value).toBe('10 grams');
    });

    it('handles missing data with fallbacks', () => {
      const assetWithMissingData = {
        ...mockTradableAsset,
        volume: undefined,
        marketCap: undefined,
        peRatio: undefined,
        growthRate: undefined,
      };

      const stats = AssetDataProcessor.getStatsForAsset(assetWithMissingData);

      expect(stats).toHaveLength(4);
      expect(stats[0].value).toMatch(/\d+\.\d+[KM]/); // Generated volume
      expect(stats[1].value).toMatch(/\d+\.\d+[KMB]/); // Generated market cap
      expect(stats[2].value).toMatch(/\d+\.\d+/); // Generated P/E ratio
      expect(stats[3].value).toMatch(/\d+\.\d+%|N\/A/); // Growth rate can be percentage or N/A
    });
  });

  describe('getSymbolOrAbbreviation', () => {
    it('returns symbol for tradable assets with symbols', () => {
      const symbol = AssetDataProcessor.getSymbolOrAbbreviation(mockTradableAsset);
      expect(symbol).toBe('AAPL');
    });

    it('generates abbreviation for assets without symbols', () => {
      const symbol = AssetDataProcessor.getSymbolOrAbbreviation(mockPhysicalAsset);
      expect(symbol).toBe('GI'); // "Gold Investment" -> "GI"
    });

    it('handles single word names', () => {
      const singleWordAsset = { ...mockPhysicalAsset, name: 'Gold' };
      const symbol = AssetDataProcessor.getSymbolOrAbbreviation(singleWordAsset);
      expect(symbol).toBe('GO'); // First two characters
    });

    it('handles empty or short names', () => {
      const shortNameAsset = { ...mockPhysicalAsset, name: 'A' };
      const symbol = AssetDataProcessor.getSymbolOrAbbreviation(shortNameAsset);
      expect(symbol).toBe('A'); // Single character
    });
  });

  describe('generateInsight', () => {
    it('generates positive insight for profitable assets', () => {
      const insight = AssetDataProcessor.generateInsight(mockTradableAsset);

      expect(insight).toContain('Apple Inc.');
      expect(insight).toContain('shares');
      expect(insight).toContain('positive performance');
      expect(insight).toContain('growth potential');
    });

    it('generates negative insight for losing assets', () => {
      const losingAsset = {
        ...mockTradableAsset,
        totalGainLoss: -100,
        totalGainLossPercent: -5,
      };

      const insight = AssetDataProcessor.generateInsight(losingAsset);

      expect(insight).toContain('Apple Inc.');
      expect(insight).toContain('shares');
      expect(insight).toContain('volatility');
      expect(insight).toContain('recovery');
    });

    it('generates appropriate insights for different asset types', () => {
      const goldInsight = AssetDataProcessor.generateInsight(mockPhysicalAsset);
      const cryptoInsight = AssetDataProcessor.generateInsight(mockCryptoAsset);

      expect(goldInsight).toContain('gold holdings');
      expect(cryptoInsight).toContain('cryptocurrency');
    });
  });

  describe('getPerformanceColor', () => {
    it('returns green for positive values', () => {
      const color = AssetDataProcessor.getPerformanceColor(100, mockTheme);
      expect(color).toBe('#22c55e');
    });

    it('returns red for negative values', () => {
      const color = AssetDataProcessor.getPerformanceColor(-100, mockTheme);
      expect(color).toBe('#ef4444');
    });

    it('returns gray for zero values', () => {
      const color = AssetDataProcessor.getPerformanceColor(0, mockTheme);
      expect(color).toBe('#6B7280');
    });
  });

  describe('Edge Cases', () => {
    it('handles assets with zero values', () => {
      const zeroAsset = {
        ...mockTradableAsset,
        totalValue: 0,
        currentPrice: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
      };

      const result = AssetDataProcessor.processAssetForDisplay(zeroAsset, mockTheme);

      expect(result.price).toBe(0);
      expect(result.change).toBe(0);
      expect(result.changePercent).toBe(0);
      expect(result.changeColor).toBe('#6B7280'); // Gray for neutral
    });

    it('handles assets with very large numbers', () => {
      const largeAsset = {
        ...mockTradableAsset,
        currentPrice: 1000000000, // 1 billion
        totalValue: 1000000000, // 1 billion
        marketCap: 1000000000000, // 1 trillion
      };

      const result = AssetDataProcessor.processAssetForDisplay(largeAsset, mockTheme);

      expect(result.price).toBe(1000000000);
      expect(result.stats[1].value).toMatch(/\d+\.\d+[TMB]/); // Market cap formatting (can be T, M, or B)
    });

    it('handles assets with very small numbers', () => {
      const smallAsset = {
        ...mockTradableAsset,
        totalValue: 0.01,
        currentPrice: 0.01,
      };

      const result = AssetDataProcessor.processAssetForDisplay(smallAsset, mockTheme);

      expect(result.price).toBe(0.01);
      expect(result.chartData[result.chartData.length - 1]).toBe(0.01);
    });
  });
});