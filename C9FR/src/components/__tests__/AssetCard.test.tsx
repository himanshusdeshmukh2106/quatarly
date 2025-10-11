import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AssetCard from '../AssetCard';
import { ThemeContext } from '../../context/ThemeContext';
import { Asset, TradableAsset, PhysicalAsset } from '../../types';

// Mock theme - matching full theme interface
const mockTheme = {
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundTertiary: '#F1F5F9',
  card: '#F8F9FA',
  cardElevated: '#FFFFFF',
  cardGlass: 'rgba(255, 255, 255, 0.8)',
  text: '#1F2937',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  borderMuted: '#F3F4F6',
  borderLight: '#F9FAFB',
  divider: '#E5E7EB',
  primary: '#3B82F6',
  primaryLight: '#DBEAFE',
  primaryDark: '#1E40AF',
  accent: '#8B5CF6',
  accentMuted: '#C4B5FD',
  success: '#10B981',
  successMuted: '#D1FAE5',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  warningLight: '#FFFBEB',
  error: '#EF4444',
  errorMuted: '#FEE2E2',
  errorLight: '#FEF2F2',
  info: '#3B82F6',
  infoMuted: '#DBEAFE',
  infoLight: '#EFF6FF',
  profit: '#059669',
  loss: '#EF4444',
  neutral: '#6B7280',
  investment: '#2563EB',
  savings: '#059669',
  debt: '#EF4444',
  insurance: '#7C3AED',
  education: '#EA580C',
  travel: '#0891B2',
  emergency: '#BE123C',
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 40, '3xl': 48, '4xl': 56, '5xl': 64 },
  typography: { 
    fontFamily: { primary: 'System', mono: 'Monospace' }, 
    fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48 }, 
    fontWeight: { light: '300', regular: '400', medium: '500', semibold: '600', bold: '700', extrabold: '800' }, 
    lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 } 
  },
  borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999 },
  shadows: { 
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }, 
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }, 
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }, 
    xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 } 
  },
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
  growthRate: 12.5,
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
  manuallyUpdated: true,
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={{ theme: mockTheme as any, isDarkMode: false, toggleTheme: jest.fn() }}>
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
      expect(getByText('₹5,500')).toBeTruthy();
    });

    it('displays physical asset specific information', () => {
      const { getByText } = renderWithTheme(
        <AssetCard asset={mockPhysicalAsset} />
      );

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
      const { getAllByRole } = renderWithTheme(
        <AssetCard asset={mockTradableAsset} />
      );

      // The main card and insights button should be accessible
      const buttons = getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('handles missing optional data gracefully', () => {
      const assetWithMissingData: TradableAsset = {
        ...mockTradableAsset,
        logoUrl: undefined,
        sector: undefined,
        marketCap: undefined,
        growthRate: undefined,
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

      const { getAllByText } = renderWithTheme(
        <AssetCard asset={assetWithZeroValues} />
      );

      // Should show $0 (+0.00%) for both Daily Change and Total P&L
      const zeroValues = getAllByText('$0 (+0.00%)');
      expect(zeroValues.length).toBe(2);
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