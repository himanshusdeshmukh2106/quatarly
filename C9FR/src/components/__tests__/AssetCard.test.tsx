import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AssetCard from '../AssetCard';
import { ThemeContext } from '../../context/ThemeContext';
import { Asset, TradableAsset, PhysicalAsset } from '../../types';

// Mock theme
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

const mockTradableAsset: TradableAsset = {
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
  chartData: [],
  aiAnalysis: 'Strong buy recommendation',
  riskLevel: 'medium',
  recommendation: 'buy',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastUpdated: '2024-01-01T00:00:00Z',
  logoUrl: 'https://example.com/aapl-logo.png',
  sector: 'Technology',
  marketCap: 2000000000,
  dividendYield: 2.5,
};

const mockPhysicalAsset: PhysicalAsset = {
  id: '2',
  name: 'Gold Holdings',
  assetType: 'gold',
  quantity: 100,
  unit: 'grams',
  purchasePrice: 50,
  currentMarketPrice: 55,
  totalValue: 5500,
  totalGainLoss: 500,
  totalGainLossPercent: 10,
  aiAnalysis: 'Good hedge against inflation',
  riskLevel: 'low',
  recommendation: 'hold',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastUpdated: '2024-01-01T00:00:00Z',
  purity: '24K',
  storage: 'Bank vault',
  certificate: 'CERT123',
  manuallyUpdated: true,
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={{ theme: mockTheme, isDarkMode: false, toggleTheme: jest.fn() }}>
      {component}
    </ThemeContext.Provider>
  );
};

describe('AssetCard', () => {
  describe('TradableAsset rendering', () => {
    it('renders tradeable asset correctly', () => {
      const { getByText } = renderWithTheme(
        <AssetCard asset={mockTradableAsset} />
      );

      expect(getByText('AAPL')).toBeTruthy();
      expect(getByText('Apple Inc.')).toBeTruthy();
      expect(getByText('Technology')).toBeTruthy();
      expect(getByText('$1,600')).toBeTruthy();
      expect(getByText('10 shares')).toBeTruthy();
    });

    it('displays performance metrics correctly', () => {
      const { getByText } = renderWithTheme(
        <AssetCard asset={mockTradableAsset} />
      );

      expect(getByText('$160')).toBeTruthy(); // Current price
      expect(getByText('$5 (+3.20%)')).toBeTruthy(); // Daily change
      expect(getByText('$100 (+6.67%)')).toBeTruthy(); // Total P&L
    });

    it('displays recommendation and risk badges', () => {
      const { getByText } = renderWithTheme(
        <AssetCard asset={mockTradableAsset} />
      );

      expect(getByText('BUY')).toBeTruthy();
      expect(getByText('MEDIUM RISK')).toBeTruthy();
    });

    it('handles press events', () => {
      const onPressMock = jest.fn();
      const onLongPressMock = jest.fn();

      const { getByTestId } = renderWithTheme(
        <AssetCard 
          asset={mockTradableAsset} 
          onPress={onPressMock}
          onLongPress={onLongPressMock}
          testID="asset-card"
        />
      );

      const card = getByTestId('asset-card');
      fireEvent.press(card);
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('PhysicalAsset rendering', () => {
    it('renders physical asset correctly', () => {
      const { getByText } = renderWithTheme(
        <AssetCard asset={mockPhysicalAsset} />
      );

      expect(getByText('Gold Holdings')).toBeTruthy();
      expect(getByText('100 grams')).toBeTruthy();
      expect(getByText('Purity: 24K')).toBeTruthy();
      expect(getByText('₹5,500')).toBeTruthy();
    });

    it('displays physical asset specific information', () => {
      const { getByText } = renderWithTheme(
        <AssetCard asset={mockPhysicalAsset} />
      );

      expect(getByText('Storage: Bank vault')).toBeTruthy();
      expect(getByText('Cert: CERT123')).toBeTruthy();
      expect(getByText('Manually updated')).toBeTruthy();
    });

    it('displays performance metrics for physical assets', () => {
      const { getByText } = renderWithTheme(
        <AssetCard asset={mockPhysicalAsset} />
      );

      expect(getByText('₹50/grams')).toBeTruthy(); // Purchase price
      expect(getByText('₹55/grams')).toBeTruthy(); // Market price
      expect(getByText('₹500 (+10.00%)')).toBeTruthy(); // Total P&L
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByLabelText } = renderWithTheme(
        <AssetCard asset={mockTradableAsset} />
      );

      // The insights button should have accessibility label
      expect(getByLabelText('AI Insights')).toBeTruthy();
    });

    it('supports screen reader navigation', () => {
      const { getByRole } = renderWithTheme(
        <AssetCard asset={mockTradableAsset} />
      );

      // The main card should be accessible
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    it('handles missing optional data gracefully', () => {
      const assetWithMissingData: TradableAsset = {
        ...mockTradableAsset,
        logoUrl: undefined,
        sector: undefined,
        marketCap: undefined,
        dividendYield: undefined,
      };

      const { getByText } = renderWithTheme(
        <AssetCard asset={assetWithMissingData} />
      );

      expect(getByText('AAPL')).toBeTruthy();
      expect(getByText('Apple Inc.')).toBeTruthy();
    });

    it('handles zero values correctly', () => {
      const assetWithZeroValues: TradableAsset = {
        ...mockTradableAsset,
        dailyChange: 0,
        dailyChangePercent: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
      };

      const { getByText } = renderWithTheme(
        <AssetCard asset={assetWithZeroValues} />
      );

      expect(getByText('$0 (0.00%)')).toBeTruthy();
    });
  });

  describe('Formatting', () => {
    it('formats currency correctly for different currencies', () => {
      const inrAsset: TradableAsset = {
        ...mockTradableAsset,
        currency: 'INR',
        currentPrice: 12000,
        totalValue: 120000,
      };

      const { getByText } = renderWithTheme(
        <AssetCard asset={inrAsset} />
      );

      expect(getByText('₹120,000')).toBeTruthy();
    });

    it('formats large numbers with proper separators', () => {
      const largeValueAsset: TradableAsset = {
        ...mockTradableAsset,
        totalValue: 1234567,
        marketCap: 2000000000000,
      };

      const { getByText } = renderWithTheme(
        <AssetCard asset={largeValueAsset} />
      );

      expect(getByText('$1,234,567')).toBeTruthy();
    });
  });
});