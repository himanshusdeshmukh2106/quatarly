import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TradableAssetCard from '../TradableAssetCard';
import { ThemeContext } from '../../context/ThemeContext';
import { TradableAsset } from '../../types';

// Mock the CandlestickChart component
jest.mock('../CandlestickChart', () => {
  return jest.fn(({ data, onTouch }) => {
    const MockedCandlestickChart = require('react-native').View;
    return (
      <MockedCandlestickChart testID="candlestick-chart">
        {data && data.length > 0 && (
          <MockedCandlestickChart testID="chart-data" />
        )}
      </MockedCandlestickChart>
    );
  });
});

// Mock the PriceChart component
jest.mock('../PriceChart', () => {
  return jest.fn(() => {
    const MockedPriceChart = require('react-native').View;
    return <MockedPriceChart testID="price-chart" />;
  });
});

const mockTheme = {
  background: '#FFFFFF',
  card: '#F8F9FA',
  cardElevated: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#8B5CF6',
  accentMuted: '#C4B5FD',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  borderMuted: '#F3F4F6',
  surfaceVariant: '#F1F5F9',
  onSurface: '#475569',
  onSurfaceVariant: '#64748B',
  outline: '#CBD5E1',
  outlineVariant: '#E2E8F0',
  inverseSurface: '#334155',
  inverseOnSurface: '#F1F5F9',
  inversePrimary: '#93C5FD',
  shadow: '#000000',
  scrim: '#000000',
  surfaceTint: '#3B82F6',
  emergency: '#DC2626',
};

const mockStockAsset: TradableAsset = {
  id: '1',
  name: 'Apple Inc.',
  assetType: 'stock',
  symbol: 'AAPL',
  exchange: 'NASDAQ',
  currency: 'USD',
  quantity: 10,
  averagePurchasePrice: 150,
  currentPrice: 160,
  totalValue: 1600,
  dailyChange: 5,
  dailyChangePercent: 3.2,
  totalGainLoss: 100,
  totalGainLossPercent: 6.67,
  chartData: [
    {
      date: '2024-01-01',
      open: 155,
      high: 165,
      low: 150,
      close: 160,
      volume: 1000000,
      timestamp: 1704067200000,
    },
  ],
  aiAnalysis: 'Strong buy recommendation',
  riskLevel: 'medium',
  recommendation: 'buy',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastUpdated: '2024-01-01T00:00:00Z',
  logoUrl: 'https://example.com/aapl-logo.png',
  sector: 'Technology',
  marketCap: 2000000000,
  growthRate: 12.5,
};

const mockBondAsset: TradableAsset = {
  ...mockStockAsset,
  id: '2',
  name: 'US Treasury Bond',
  assetType: 'bond',
  symbol: 'UST10Y',
  yieldToMaturity: 4.5,
  maturityDate: '2034-01-01',
  growthRate: undefined,
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={{ theme: mockTheme, isDarkMode: false, toggleTheme: jest.fn() }}>
      {component}
    </ThemeContext.Provider>
  );
};

describe('TradableAssetCard', () => {
  describe('Stock Asset Rendering', () => {
    it('renders stock asset information correctly', () => {
      const { getByText } = renderWithTheme(
        <TradableAssetCard asset={mockStockAsset} />
      );

      expect(getByText('AAPL')).toBeTruthy();
      expect(getByText('Apple Inc.')).toBeTruthy();
      expect(getByText('Technology')).toBeTruthy();
      expect(getByText('$1,600')).toBeTruthy();
      expect(getByText('10 shares')).toBeTruthy();
    });

    it('displays chart for stock assets', () => {
      const { getByTestId } = renderWithTheme(
        <TradableAssetCard asset={mockStockAsset} showChart={true} />
      );

      expect(getByTestId('candlestick-chart')).toBeTruthy();
      expect(getByTestId('chart-data')).toBeTruthy();
    });

    it('displays stock-specific information', () => {
      const { getByText } = renderWithTheme(
        <TradableAssetCard asset={mockStockAsset} />
      );

      expect(getByText('Growth Rate')).toBeTruthy();
      expect(getByText('12.5%')).toBeTruthy();
      expect(getByText('Market Cap')).toBeTruthy();
      expect(getByText('$2,000,000,000')).toBeTruthy();
    });

    it('handles timeframe selection', () => {
      const { getByText } = renderWithTheme(
        <TradableAssetCard asset={mockStockAsset} />
      );

      const dailyButton = getByText('1D');
      const weeklyButton = getByText('1W');
      const monthlyButton = getByText('1M');

      expect(dailyButton).toBeTruthy();
      expect(weeklyButton).toBeTruthy();
      expect(monthlyButton).toBeTruthy();

      fireEvent.press(weeklyButton);
      // The weekly button should be selected (this would be tested with style changes)
    });
  });

  describe('Bond Asset Rendering', () => {
    it('renders bond asset information correctly', () => {
      const { getByText } = renderWithTheme(
        <TradableAssetCard asset={mockBondAsset} />
      );

      expect(getByText('UST10Y')).toBeTruthy();
      expect(getByText('US Treasury Bond')).toBeTruthy();
    });

    it('displays bond-specific information', () => {
      const { getByText } = renderWithTheme(
        <TradableAssetCard asset={mockBondAsset} />
      );

      expect(getByText('Yield to Maturity')).toBeTruthy();
      expect(getByText('4.50%')).toBeTruthy();
      expect(getByText('Maturity Date')).toBeTruthy();
      expect(getByText('1/1/2034')).toBeTruthy();
    });

    it('uses PriceChart for bond assets', () => {
      const { getByTestId } = renderWithTheme(
        <TradableAssetCard asset={mockBondAsset} showChart={true} />
      );

      expect(getByTestId('price-chart')).toBeTruthy();
    });
  });

  describe('Chart Functionality', () => {
    it('hides chart when showChart is false', () => {
      const { queryByTestId } = renderWithTheme(
        <TradableAssetCard asset={mockStockAsset} showChart={false} />
      );

      expect(queryByTestId('candlestick-chart')).toBeFalsy();
    });

    it('shows no chart message when data is unavailable', () => {
      const assetWithoutChart = { ...mockStockAsset, chartData: [] };
      const { getByText } = renderWithTheme(
        <TradableAssetCard asset={assetWithoutChart} />
      );

      expect(getByText('Chart data unavailable')).toBeTruthy();
    });

    it('handles chart touch interactions', () => {
      const onInsightsMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <TradableAssetCard 
          asset={mockStockAsset} 
          onInsightsPress={onInsightsMock}
        />
      );

      // Chart touch would be handled by the mocked component
      expect(getByTestId('candlestick-chart')).toBeTruthy();
    });
  });

  describe('Performance Display', () => {
    it('displays positive performance in green', () => {
      const { getByText } = renderWithTheme(
        <TradableAssetCard asset={mockStockAsset} />
      );

      // The component should display positive values (styling would be tested separately)
      expect(getByText('$5 (+3.20%)')).toBeTruthy();
      expect(getByText('$100 (+6.67%)')).toBeTruthy();
    });

    it('displays negative performance in red', () => {
      const negativeAsset: TradableAsset = {
        ...mockStockAsset,
        dailyChange: -5,
        dailyChangePercent: -3.2,
        totalGainLoss: -100,
        totalGainLossPercent: -6.67,
      };

      const { getByText } = renderWithTheme(
        <TradableAssetCard asset={negativeAsset} />
      );

      expect(getByText('$-5 (-3.20%)')).toBeTruthy();
      expect(getByText('$-100 (-6.67%)')).toBeTruthy();
    });
  });

  describe('Interaction Handling', () => {
    it('handles press events', () => {
      const onPressMock = jest.fn();
      const onLongPressMock = jest.fn();
      const onInsightsMock = jest.fn();

      const { getByTestId } = renderWithTheme(
        <TradableAssetCard 
          asset={mockStockAsset}
          onPress={onPressMock}
          onLongPress={onLongPressMock}
          onInsightsPress={onInsightsMock}
          testID="tradable-asset-card"
        />
      );

      const card = getByTestId('tradable-asset-card');
      fireEvent.press(card);
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('handles insights button press', () => {
      const onInsightsMock = jest.fn();

      const { getByText } = renderWithTheme(
        <TradableAssetCard 
          asset={mockStockAsset}
          onInsightsPress={onInsightsMock}
        />
      );

      const insightsButton = getByText('AI Insights');
      fireEvent.press(insightsButton);
      expect(onInsightsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Currency Formatting', () => {
    it('formats USD currency correctly', () => {
      const { getByText } = renderWithTheme(
        <TradableAssetCard asset={mockStockAsset} />
      );

      expect(getByText('$1,600')).toBeTruthy();
      expect(getByText('$160')).toBeTruthy();
      expect(getByText('$150')).toBeTruthy();
    });

    it('formats INR currency correctly', () => {
      const inrAsset: TradableAsset = {
        ...mockStockAsset,
        currency: 'INR',
        currentPrice: 12000,
        totalValue: 120000,
        averagePurchasePrice: 11000,
      };

      const { getByText } = renderWithTheme(
        <TradableAssetCard asset={inrAsset} />
      );

      expect(getByText('₹120,000')).toBeTruthy();
      expect(getByText('₹12,000')).toBeTruthy();
      expect(getByText('₹11,000')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels for interactive elements', () => {
      const { getByLabelText } = renderWithTheme(
        <TradableAssetCard asset={mockStockAsset} />
      );

      expect(getByLabelText('AI Insights')).toBeTruthy();
    });

    it('supports screen reader navigation', () => {
      const { getByRole } = renderWithTheme(
        <TradableAssetCard asset={mockStockAsset} />
      );

      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('handles missing optional data gracefully', () => {
      const minimalAsset: TradableAsset = {
        id: '1',
        name: 'Test Asset',
        assetType: 'stock',
        symbol: 'TEST',
        exchange: 'NYSE',
        currency: 'USD',
        quantity: 1,
        averagePurchasePrice: 100,
        currentPrice: 105,
        totalValue: 105,
        dailyChange: 5,
        dailyChangePercent: 5,
        totalGainLoss: 5,
        totalGainLossPercent: 5,
        chartData: [],
        aiAnalysis: 'Test analysis',
        riskLevel: 'medium',
        recommendation: 'hold',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
      };

      const { getByText } = renderWithTheme(
        <TradableAssetCard asset={minimalAsset} />
      );

      expect(getByText('TEST')).toBeTruthy();
      expect(getByText('Test Asset')).toBeTruthy();
    });
  });
});